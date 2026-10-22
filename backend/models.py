import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'student' or 'teacher'
    academic_level = Column(String(100), nullable=True)           # e.g., "Class 10", "Grade 9"
    preferred_language = Column(String(10), default="en")        # "en", "hi", "mr"
    school = Column(String(255), nullable=True)                  # For teachers / students
    subject_taught = Column(String(255), nullable=True)          # For teachers
    is_approved = Column(Boolean, default=False)                 # Teachers need approval, students auto-true
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    mastery_records = relationship("StudentMastery", back_populates="student", cascade="all, delete-orphan")
    test_attempts = relationship("TestAttempt", back_populates="student", cascade="all, delete-orphan")
    tests_created = relationship("Test", back_populates="teacher", cascade="all, delete-orphan")
    misconception_logs = relationship("MisconceptionLog", back_populates="student", cascade="all, delete-orphan")


class Concept(Base):
    __tablename__ = "concepts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False) # e.g. "fractions"
    name = Column(String(255), nullable=False)
    subject = Column(String(100), default="Mathematics", index=True) # Mathematics, Physics, Computer Science
    category = Column(String(100), default="Foundations")
    description = Column(Text, nullable=True)
    difficulty = Column(Integer, default=1) # 1: beginner, 2: intermediate, 3: advanced
    prerequisites = Column(JSON, default=list) # List of concept slugs
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(100), default="Mathematics", index=True)
    concept_slug = Column(String(100), index=True, nullable=False)
    question_text = Column(Text, nullable=False)
    # options format: [{"id": "A", "text": "...", "is_correct": bool, "misconception_tag": "...", "explanation": "..."}]
    options = Column(JSON, nullable=False)
    correct_option_id = Column(String(10), nullable=False)
    difficulty_level = Column(Integer, default=1) # 1, 2, 3
    marks = Column(Float, default=1.0)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Misconception(Base):
    __tablename__ = "misconceptions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, index=True, nullable=False) # e.g. "MIS_FRAC_ADD_NUM_DEN"
    concept_slug = Column(String(100), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    explanation_en = Column(Text, nullable=False)
    explanation_hi = Column(Text, nullable=True)
    explanation_mr = Column(Text, nullable=True)
    remedial_lesson = Column(Text, nullable=True)
    prerequisite_gap_slug = Column(String(100), nullable=True) # Underlying concept that must be revised


class StudentMastery(Base):
    __tablename__ = "student_mastery"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_slug = Column(String(100), index=True, nullable=False)
    estimated_mastery = Column(Float, default=0.20) # 0.0 to 1.0 (BKT P(L))
    p_transit = Column(Float, default=0.15)         # P(T) transition probability
    p_slip = Column(Float, default=0.10)            # P(S) slip probability
    p_guess = Column(Float, default=0.25)           # P(G) guess probability
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="mastery_records")


class MisconceptionLog(Base):
    __tablename__ = "misconception_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concept_slug = Column(String(100), index=True, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    misconception_code = Column(String(100), nullable=False)
    chosen_option_id = Column(String(10), nullable=False)
    confidence = Column(String(50), default="Low") # "Low", "Medium", "High"
    context = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="misconception_logs")


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    subject = Column(String(100), default="Mathematics")
    target_class = Column(String(100), nullable=False, default="Class 10")
    duration_minutes = Column(Integer, default=30)
    total_marks = Column(Float, default=10.0)
    negative_marking = Column(Float, default=0.0)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    is_published = Column(Boolean, default=False)
    is_cancelled = Column(Boolean, default=False)
    enable_tab_monitoring = Column(Boolean, default=True)
    tab_switch_threshold = Column(Integer, default=3)
    allow_retake = Column(Boolean, default=False)
    release_results = Column(Boolean, default=True)
    # List of question IDs or embedded questions: [1, 2, 3]
    question_ids = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    teacher = relationship("User", back_populates="tests_created")
    attempts = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    submit_time = Column(DateTime, nullable=True)
    time_spent_seconds = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    total_marks = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    status = Column(String(50), default="in_progress") # in_progress, completed, expired, flagged
    # answers format: {"question_id_str": {"selected_option": "A", "time_spent": 12, "marked_for_review": false}}
    answers = Column(JSON, default=dict)
    tab_switch_count = Column(Integer, default=0)
    # monitoring_events format: [{"timestamp": "...", "type": "visibility_hidden" | "window_blur", "warning_num": 1}]
    monitoring_events = Column(JSON, default=list)
    teacher_feedback = Column(Text, nullable=True)
    is_flagged = Column(Boolean, default=False)

    test = relationship("Test", back_populates="attempts")
    student = relationship("User", back_populates="test_attempts")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    concept_slug = Column(String(100), unique=True, index=True, nullable=False)
    subject = Column(String(100), default="Mathematics", index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    content_markdown = Column(Text, nullable=False)
    steps_json = Column(JSON, default=list) # Multi-step interactive lesson pages
    examples_json = Column(JSON, default=list)
    practice_quiz_json = Column(JSON, default=list)
    real_life_analogy_en = Column(Text, nullable=True)
    real_life_analogy_hi = Column(Text, nullable=True)
    real_life_analogy_mr = Column(Text, nullable=True)
    key_takeaways = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
