import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session

# Local imports
from database import engine, Base, get_db
import models
import schemas
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_student, require_teacher
)
from knowledge_graph import concept_graph
from learning_engine import learning_engine
from misconception_detector import detector
from test_engine import test_engine
from analytics import analytics_engine
from tutor_engine import tutor_engine
from seed_data import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto-seed initial knowledge base and test data
with next(get_db()) as db_session:
    seed_database(db_session)

app = FastAPI(
    title="ConceptClear AI API",
    description="AI-Powered Personalised Learning Through Learning-Gap Detection",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# ==========================================================
# AUTHENTICATION ENDPOINTS
# ==========================================================

@app.post("/api/auth/register/student", response_model=schemas.TokenResponse)
def register_student(data: schemas.StudentRegister, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    student = models.User(
        email=data.email.lower(),
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="student",
        academic_level=data.academic_level,
        preferred_language=data.preferred_language,
        is_approved=True
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Initialize student mastery records for all math concepts
    for slug in concept_graph.nodes.keys():
        learning_engine.get_or_create_mastery(db, student.id, slug)

    token = create_access_token({"sub": str(student.id), "role": student.role, "email": student.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": student.id,
            "email": student.email,
            "full_name": student.full_name,
            "role": student.role,
            "academic_level": student.academic_level,
            "preferred_language": student.preferred_language
        }
    }

@app.post("/api/auth/register/teacher")
def register_teacher(data: schemas.TeacherRegister, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    existing = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Official email is already registered.")

    # In production or strict mode, teachers require administrative approval
    auto_approve = os.getenv("AUTO_APPROVE_TEACHERS", "false").lower() == "true"
    teacher = models.User(
        email=data.email.lower(),
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="teacher",
        school=data.school,
        subject_taught=data.subject_taught,
        is_approved=auto_approve
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    if not auto_approve:
        return {
            "message": "Registration successful! Your teacher account is pending administrative verification. For demo/evaluation purposes, use the pre-configured teacher account: teacher@conceptclear.ai / Teacher@123.",
            "is_approved": False
        }

    token = create_access_token({"sub": str(teacher.id), "role": teacher.role, "email": teacher.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": teacher.id,
            "email": teacher.email,
            "full_name": teacher.full_name,
            "role": teacher.role,
            "school": teacher.school,
            "subject_taught": teacher.subject_taught,
            "is_approved": teacher.is_approved
        }
    }

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if user.role == "teacher" and not user.is_approved:
        raise HTTPException(
            status_code=403,
            detail="Your teacher account is pending approval by administration. Use teacher@conceptclear.ai (Password: Teacher@123) for instant hackathon evaluation."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "academic_level": user.academic_level,
            "preferred_language": user.preferred_language,
            "school": user.school,
            "subject_taught": user.subject_taught,
            "is_approved": user.is_approved
        }
    }

@app.get("/api/auth/me")
def get_me(user: models.User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "academic_level": user.academic_level,
        "preferred_language": user.preferred_language,
        "school": user.school,
        "subject_taught": user.subject_taught,
        "is_approved": user.is_approved
    }

@app.put("/api/auth/profile")
def update_profile(data: schemas.ProfileUpdate, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.full_name:
        user.full_name = data.full_name
    if data.preferred_language:
        user.preferred_language = data.preferred_language
    if data.academic_level:
        user.academic_level = data.academic_level
    if data.school:
        user.school = data.school
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully.", "user": user}

# ==========================================================
# CONCEPTS & KNOWLEDGE GRAPH ENDPOINTS
# ==========================================================

@app.get("/api/concepts")
def list_concepts(subject: Optional[str] = Query(None), user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    masteries = db.query(models.StudentMastery).filter(models.StudentMastery.student_id == user.id).all()
    mastery_map = {m.concept_slug: m for m in masteries}

    concepts = concept_graph.get_concepts_by_subject(subject)
    result = []
    for c in concepts:
        slug = c["slug"]
        m_rec = mastery_map.get(slug)
        score = m_rec.estimated_mastery if m_rec else 0.0
        attempts = m_rec.total_attempts if m_rec else 0

        status_str = "not_assessed"
        if attempts > 0:
            if score >= 0.75:
                status_str = "mastered"
            elif score >= 0.40:
                status_str = "needs_practice"
            else:
                status_str = "learning_gap"

        result.append({
            "id": c.get("order", 1),
            "slug": slug,
            "name": c["name"],
            "subject": c.get("subject", "Mathematics"),
            "category": c["category"],
            "description": c["description"],
            "difficulty": c["difficulty"],
            "prerequisites": c["prerequisites"],
            "order_index": c["order"],
            "estimated_mastery": round(score * 100, 1),
            "mastery_status": status_str,
            "attempts_count": attempts
        })
    return result

@app.get("/api/concepts/map")
def get_concept_map_visualization(subject: Optional[str] = Query("Mathematics"), user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Outputs graph nodes and links with student's mastery color codes for concept-map.html filtered by subject."""
    masteries = db.query(models.StudentMastery).filter(models.StudentMastery.student_id == user.id).all()
    mastery_map = {m.concept_slug: m.estimated_mastery for m in masteries}
    return concept_graph.export_graph_for_visualization(mastery_map, subject=subject)

@app.get("/api/concepts/classroom-map")
def get_classroom_concept_map(teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    """Teacher aggregate concept graph view."""
    all_masteries = db.query(models.StudentMastery).all()
    slug_scores: Dict[str, List[float]] = {}
    for m in all_masteries:
        slug_scores.setdefault(m.concept_slug, []).append(m.estimated_mastery)

    avg_map = {slug: (sum(scores) / len(scores)) for slug, scores in slug_scores.items() if scores}
    return concept_graph.export_graph_for_visualization(avg_map)

@app.get("/api/concepts/{slug}")
def get_concept_detail(slug: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = concept_graph.nodes.get(slug)
    if not c:
        raise HTTPException(status_code=404, detail="Concept not found.")

    m_rec = db.query(models.StudentMastery).filter(
        models.StudentMastery.student_id == user.id,
        models.StudentMastery.concept_slug == slug
    ).first()

    prereq_details = [concept_graph.nodes[p] for p in c["prerequisites"] if p in concept_graph.nodes]
    downstream_details = [concept_graph.nodes[d] for d in concept_graph.get_downstream_dependents(slug) if d in concept_graph.nodes]

    # Check root cause bottleneck
    all_masteries = {m.concept_slug: m.estimated_mastery for m in db.query(models.StudentMastery).filter(models.StudentMastery.student_id == user.id).all()}
    root_bottleneck = concept_graph.find_root_cause_bottleneck(slug, all_masteries)

    return {
        "concept": c,
        "estimated_mastery": round((m_rec.estimated_mastery * 100), 1) if m_rec else 0.0,
        "total_attempts": m_rec.total_attempts if m_rec else 0,
        "prerequisites": prereq_details,
        "downstream_concepts": downstream_details,
        "root_cause_bottleneck": concept_graph.nodes.get(root_bottleneck) if root_bottleneck else None
    }

# ==========================================================
# LESSONS, ADAPTIVE PRACTICE & MISCONCEPTION DETECTION
# ==========================================================

@app.get("/api/learning/lesson/{concept_slug}")
@app.get("/api/learn/lesson/{concept_slug}")
def get_lesson(concept_slug: str, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.concept_slug == concept_slug).first()
    if not lesson:
        c_meta = concept_graph.nodes.get(concept_slug, {"name": concept_slug, "description": "Educational module"})
        return {
            "concept_slug": concept_slug,
            "title": f"Mastering {c_meta.get('name')}",
            "summary": c_meta.get("description", "Key conceptual principles and practice exercises."),
            "content_markdown": f"### Understanding {c_meta.get('name')}\nReview core rules and formulas before attempting diagnostic tests.",
            "examples_json": [],
            "real_life_analogy_en": "Mathematics principles connect like building blocks."
        }
    return lesson

@app.get("/api/learning/adaptive-question/{concept_slug}")
@app.get("/api/learn/adaptive-question/{concept_slug}")
def get_adaptive_question(concept_slug: str, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Dynamically delivers question calibrated to student's current BKT mastery level."""
    q = learning_engine.select_next_question(db, student.id, concept_slug)
    if not q:
        raise HTTPException(status_code=404, detail="No questions available for this concept yet.")

    # Sanitize options for practice attempt
    sanitized_options = [{"id": opt["id"], "text": opt["text"]} for opt in q.options]
    return {
        "id": q.id,
        "concept_slug": q.concept_slug,
        "question_text": q.question_text,
        "options": sanitized_options,
        "marks": q.marks,
        "difficulty_level": q.difficulty_level
    }

@app.post("/api/learn/evaluate-answer", response_model=schemas.DiagnosisResult)
def evaluate_practice_answer(data: schemas.QuestionAnswerSubmit, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Evaluates student choice, runs Misconception Detector, updates BKT mastery probability."""
    question = db.query(models.Question).filter(models.Question.id == data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    chosen_opt = data.selected_option_id or data.selected_option or ""
    # Misconception analysis
    analysis = detector.analyze_response(
        db=db,
        student_id=student.id,
        question=question,
        chosen_option_id=chosen_opt,
        user_lang=student.preferred_language or "en"
    )

    # Bayesian Knowledge Tracing update
    bkt_result = learning_engine.record_quiz_attempt(
        db=db,
        student_id=student.id,
        concept_slug=question.concept_slug,
        is_correct=analysis["is_correct"]
    )

    return {
        "is_correct": analysis["is_correct"],
        "correct_option_id": question.correct_option_id,
        "explanation": question.explanation or "Standard step explanation.",
        "concept_slug": question.concept_slug,
        "updated_mastery": bkt_result["new_mastery"],
        "detected_misconception": analysis.get("misconception_detected"),
        "prerequisite_gap": analysis.get("prerequisite_gap"),
        "recommended_lesson": analysis.get("recommended_lesson")
    }

@app.get("/api/learn/recommendations")
def get_recommendations(subject: Optional[str] = Query(None), student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    return learning_engine.get_student_recommendations(db, student.id, subject=subject)

# ==========================================================
# PERSONALIZED AI TUTOR
# ==========================================================

@app.post("/api/learning/tutor/chat")
@app.post("/api/tutor/chat", response_model=schemas.TutorChatResponse)
def tutor_chat(data: schemas.TutorChatRequest, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    return tutor_engine.chat(
        db=db,
        student=student,
        user_message=data.message,
        concept_slug=data.concept_slug,
        language=data.language
    )

# ==========================================================
# TEST & EXAM MODULE (STUDENT & TEACHER)
# ==========================================================

@app.get("/api/tests/student-catalog")
def get_student_tests(subject: Optional[str] = Query(None), student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Lists Upcoming, Available, and Completed tests with strict server-side gating and optional subject filter."""
    return test_engine.get_student_tests_catalog(db, student, subject=subject)

@app.post("/api/tests/start/{test_id}")
def start_student_test(test_id: int, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Enforces server-side time gates, proctoring notice, and returns questions WITHOUT answers."""
    return test_engine.start_or_resume_test(db, student, test_id)

@app.post("/api/tests/save-answer/{attempt_id}")
def save_test_answer(attempt_id: int, data: schemas.SaveAnswerRequest, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    return test_engine.save_single_answer(db, attempt_id, student.id, data)

@app.post("/api/tests/tab-switch/{attempt_id}")
def record_tab_switch(attempt_id: int, data: schemas.TabSwitchEventRequest, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Records Page Visibility / Window Blur events, counts violations, and issues warnings."""
    return test_engine.record_tab_switch_event(db, attempt_id, student.id, data.event_type)

@app.post("/api/tests/submit/{attempt_id}")
def submit_student_test(attempt_id: int, data: Optional[schemas.SubmitTestRequest] = None, student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    """Server-side scoring, penalty deduction, and BKT mastery update."""
    submission_answers = data.answers if data else None
    return test_engine.submit_test(db, attempt_id, student.id, submission_answers)

@app.get("/api/tests/attempt/{attempt_id}")
def get_test_attempt_result(attempt_id: int, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempt = db.query(models.TestAttempt).filter(models.TestAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found.")

    # Guard: only attempt owner or teacher can view
    if user.role == "student" and attempt.student_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized attempt access.")

    test = attempt.test
    can_release = test.release_results or user.role == "teacher"

    q_data = []
    if test.question_ids:
        questions = db.query(models.Question).filter(models.Question.id.in_(test.question_ids)).all()
        q_map = {q.id: q for q in questions}
        for q_id in test.question_ids:
            if q_id in q_map:
                q = q_map[q_id]
                ans_entry = (attempt.answers or {}).get(str(q.id), {})
                chosen = ans_entry.get("selected_option") if isinstance(ans_entry, dict) else ans_entry
                q_data.append({
                    "id": q.id,
                    "concept_slug": q.concept_slug,
                    "question_text": q.question_text,
                    "options": q.options,
                    "chosen_option": chosen,
                    "correct_option_id": q.correct_option_id if can_release else None,
                    "is_correct": (chosen == q.correct_option_id) if can_release else None,
                    "explanation": q.explanation if can_release else None,
                    "marks": q.marks
                })

    return {
        "attempt_id": attempt.id,
        "test_title": test.title,
        "subject": test.subject,
        "score": attempt.score,
        "total_marks": attempt.total_marks,
        "percentage": attempt.percentage,
        "time_spent_seconds": attempt.time_spent_seconds,
        "status": attempt.status,
        "tab_switch_count": attempt.tab_switch_count,
        "is_flagged": attempt.is_flagged,
        "monitoring_events": attempt.monitoring_events,
        "results_released": can_release,
        "withheld_notice": "Formal Examination Mode: Individual question mistakes and answer keys are withheld by the instructor." if not can_release else None,
        "questions": q_data
    }

# --- Teacher Test Management Endpoints ---

@app.post("/api/teacher/tests")
def teacher_create_test(data: schemas.TestCreate, teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    test = test_engine.create_test(db, teacher.id, data)
    return {"message": "Test created and scheduled successfully.", "test_id": test.id}

@app.get("/api/teacher/tests")
def teacher_list_tests(teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    tests = db.query(models.Test).filter(models.Test.teacher_id == teacher.id).order_by(models.Test.created_at.desc()).all()
    out = []
    for t in tests:
        attempts_count = db.query(models.TestAttempt).filter(models.TestAttempt.test_id == t.id).count()
        flagged_count = db.query(models.TestAttempt).filter(models.TestAttempt.test_id == t.id, models.TestAttempt.is_flagged == True).count()
        out.append({
            "id": t.id,
            "title": t.title,
            "subject": t.subject,
            "target_class": t.target_class,
            "duration_minutes": t.duration_minutes,
            "total_marks": t.total_marks,
            "start_time": t.start_time.isoformat(),
            "end_time": t.end_time.isoformat(),
            "is_published": t.is_published,
            "is_cancelled": t.is_cancelled,
            "attempts_count": attempts_count,
            "flagged_attempts_count": flagged_count,
            "questions_count": len(t.question_ids or [])
        })
    return out

@app.get("/api/teacher/tests/{test_id}/attempts")
def teacher_get_test_attempts(test_id: int, teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.teacher_id == teacher.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    attempts = db.query(models.TestAttempt).filter(models.TestAttempt.test_id == test_id).all()
    results = []
    for a in attempts:
        results.append({
            "attempt_id": a.id,
            "student_id": a.student.id,
            "student_name": a.student.full_name,
            "student_email": a.student.email,
            "academic_level": a.student.academic_level,
            "score": a.score,
            "total_marks": a.total_marks,
            "percentage": a.percentage,
            "time_spent_seconds": a.time_spent_seconds,
            "status": a.status,
            "tab_switch_count": a.tab_switch_count,
            "is_flagged": a.is_flagged,
            "monitoring_events": a.monitoring_events,
            "submitted_at": a.submit_time.isoformat() if a.submit_time else None
        })
    return {"test": test, "attempts": results}

@app.put("/api/teacher/tests/{test_id}")
def teacher_update_test(test_id: int, data: schemas.TestUpdate, teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.teacher_id == teacher.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if data.title:
        test.title = data.title
    if data.instructions:
        test.instructions = data.instructions
    if data.start_time:
        test.start_time = data.start_time
    if data.end_time:
        test.end_time = data.end_time
    if data.duration_minutes:
        test.duration_minutes = data.duration_minutes
    if data.is_published is not None:
        test.is_published = data.is_published
    if data.is_cancelled is not None:
        test.is_cancelled = data.is_cancelled
    if data.enable_tab_monitoring is not None:
        test.enable_tab_monitoring = data.enable_tab_monitoring
    if data.tab_switch_threshold is not None:
        test.tab_switch_threshold = data.tab_switch_threshold
    if data.release_results is not None:
        test.release_results = data.release_results

    db.commit()
    return {"message": "Test updated successfully."}

@app.delete("/api/teacher/tests/{test_id}")
def teacher_cancel_test(test_id: int, teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    test = db.query(models.Test).filter(models.Test.id == test_id, models.Test.teacher_id == teacher.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")
    test.is_cancelled = True
    db.commit()
    return {"message": "Test cancelled."}

@app.get("/api/teacher/tests/{test_id}/export-csv")
def export_csv(test_id: int, teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    csv_content = test_engine.export_test_results_csv(db, test_id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=test_{test_id}_results.csv"}
    )

# ==========================================================
# ANALYTICS ENDPOINTS
# ==========================================================

@app.get("/api/analytics/student/overview")
def get_student_analytics(student: models.User = Depends(require_student), db: Session = Depends(get_db)):
    return analytics_engine.get_student_dashboard_overview(db, student)

@app.get("/api/analytics/teacher/overview")
def get_teacher_analytics(teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    return analytics_engine.get_teacher_class_analytics(db, teacher)

@app.get("/api/teacher/students")
def get_all_students(teacher: models.User = Depends(require_teacher), db: Session = Depends(get_db)):
    analytics = analytics_engine.get_teacher_class_analytics(db, teacher)
    return analytics.get("all_students", [])

# ==========================================================
# SYSTEM HEALTH & STATIC FRONTEND SERVING
# ==========================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "ConceptClear AI",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "SQLite (Migration Ready)",
        "modules": ["BKT_Mastery", "Distractor_Misconception_Engine", "NetworkX_Graph", "Exam_Proctoring"]
    }

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"

# Mount React production assets if dist exists
if DIST_DIR.exists() and (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

# Mount legacy static frontend directory if it exists
if FRONTEND_DIR.exists():
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")

# Serve SPA index at root and client routes
@app.get("/")
def serve_index():
    if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
        return FileResponse(DIST_DIR / "index.html")
    if FRONTEND_DIR.exists() and (FRONTEND_DIR / "index.html").exists():
        return FileResponse(FRONTEND_DIR / "index.html")
    return {"message": "ConceptClear AI Backend operational. Run `npm run dev` to launch the React frontend."}

@app.get("/{page_name}.html")
def serve_html_page(page_name: str):
    target = FRONTEND_DIR / f"{page_name}.html"
    if target.exists():
        return FileResponse(target)
    if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
        return FileResponse(DIST_DIR / "index.html")
    raise HTTPException(status_code=404, detail="Page not found.")

# Fallback for client-side React routes
@app.get("/{full_path:path}")
def serve_spa_fallback(full_path: str):
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="API endpoint not found.")
    if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
        return FileResponse(DIST_DIR / "index.html")
    raise HTTPException(status_code=404, detail="Page not found.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
