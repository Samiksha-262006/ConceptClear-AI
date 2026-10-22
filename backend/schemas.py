from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
import datetime

# --- Auth Schemas ---
class StudentRegister(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str
    academic_level: str = "Class 10"
    preferred_language: str = "en" # "en", "hi", "mr"

class TeacherRegister(BaseModel):
    full_name: str
    email: str
    password: str
    confirm_password: str
    school: str
    subject_taught: str = "Mathematics"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    academic_level: Optional[str] = None
    preferred_language: str = "en"
    school: Optional[str] = None
    subject_taught: Optional[str] = None
    is_approved: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_language: Optional[str] = None
    academic_level: Optional[str] = None
    school: Optional[str] = None

# --- Concept & Mastery Schemas ---
class ConceptOut(BaseModel):
    id: int
    slug: str
    name: str
    category: str
    description: Optional[str] = None
    difficulty: int
    prerequisites: List[str]
    order_index: int
    mastery_status: Optional[str] = "not_assessed" # mastered, needs_practice, learning_gap, not_assessed
    estimated_mastery: Optional[float] = 0.0
    attempts_count: Optional[int] = 0

    class Config:
        from_attributes = True

class OptionOut(BaseModel):
    id: str
    text: str
    # Note: is_correct and misconception_tag are withheld during tests/quizzes until evaluation!

class QuestionOut(BaseModel):
    id: int
    concept_slug: str
    question_text: str
    options: List[OptionOut]
    difficulty_level: int
    marks: float

class QuestionAnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: Optional[str] = None
    selected_option: Optional[str] = None
    time_spent_seconds: Optional[int] = 0

class DiagnosisResult(BaseModel):
    is_correct: bool
    correct_option_id: str
    explanation: str
    concept_slug: str
    updated_mastery: float
    detected_misconception: Optional[Dict[str, Any]] = None
    prerequisite_gap: Optional[Dict[str, Any]] = None
    recommended_lesson: Optional[Dict[str, Any]] = None

# --- Test Schemas ---
class QuestionCreate(BaseModel):
    question_text: str
    concept_slug: str
    options: List[Dict[str, Any]] # [{"id": "A", "text": "...", "is_correct": true, "misconception_tag": "..."}]
    correct_option_id: str
    marks: float = 1.0
    difficulty_level: int = 1
    explanation: Optional[str] = None

class TestCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    subject: str = "Mathematics"
    target_class: str = "Class 10"
    duration_minutes: int = 30
    total_marks: float = 10.0
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    is_published: bool = True
    enable_tab_monitoring: bool = True
    tab_switch_threshold: int = 3
    allow_retake: bool = False
    release_results: bool = True
    question_ids: Optional[List[int]] = None
    new_questions: Optional[List[QuestionCreate]] = None

class TestUpdate(BaseModel):
    title: Optional[str] = None
    instructions: Optional[str] = None
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    duration_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    is_cancelled: Optional[bool] = None
    enable_tab_monitoring: Optional[bool] = None
    tab_switch_threshold: Optional[int] = None
    release_results: Optional[bool] = None

class TestStudentView(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    subject: str
    target_class: str
    duration_minutes: int
    total_marks: float
    start_time: datetime.datetime
    end_time: datetime.datetime
    status: str # "upcoming", "available", "completed", "expired"
    has_attempted: bool = False
    attempt_id: Optional[int] = None
    score: Optional[float] = None
    percentage: Optional[float] = None
    is_flagged: Optional[bool] = False

    class Config:
        from_attributes = True

class TestAttemptStartOut(BaseModel):
    attempt_id: int
    test_id: int
    title: str
    instructions: Optional[str]
    duration_minutes: int
    time_remaining_seconds: int
    enable_tab_monitoring: bool
    tab_switch_threshold: int
    questions: List[Dict[str, Any]]
    saved_answers: Dict[str, Any]
    tab_switch_count: int

class SaveAnswerRequest(BaseModel):
    question_id: int
    selected_option_id: Optional[str] = None
    marked_for_review: Optional[bool] = False
    time_spent: Optional[int] = 0

class TabSwitchEventRequest(BaseModel):
    event_type: str # "visibility_hidden", "window_blur"
    timestamp: Optional[str] = None

class SubmitTestRequest(BaseModel):
    answers: Dict[str, Any]

# --- Tutor Schemas ---
class TutorChatRequest(BaseModel):
    message: str
    concept_slug: Optional[str] = None
    language: Optional[str] = "en" # "en", "hi", "mr"

class TutorChatResponse(BaseModel):
    reply: str
    concept_slug: Optional[str] = None
    detected_gap: Optional[str] = None
    step_by_step_example: Optional[List[str]] = None
    real_life_analogy: Optional[str] = None
    practice_prompt: Optional[str] = None
    language: str
