"""
ConceptClear AI - Secure Examination & Proctoring Engine
Enforces server-side time gates, prevents answer leaks, monitors tab-switching/focus events,
handles session resume, and performs secure backend-only grading with BKT mastery feedback.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import csv
import io
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models
import schemas
from learning_engine import learning_engine
from misconception_detector import detector
class TestEngine:
    def create_test(self, db: Session, teacher_id: int, data: schemas.TestCreate) -> models.Test:
        st = data.start_time or datetime.utcnow()
        et = data.end_time or (st + timedelta(days=7))
        if et <= st:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test end time must be after start time."
            )

        q_ids = list(data.question_ids or [])

        # If teacher authored new custom questions inline, create them in database
        if data.new_questions:
            for nq in data.new_questions:
                q_model = models.Question(
                    concept_slug=nq.concept_slug,
                    question_text=nq.question_text,
                    options=nq.options,
                    correct_option_id=nq.correct_option_id,
                    difficulty_level=nq.difficulty_level,
                    marks=nq.marks,
                    explanation=nq.explanation
                )
                db.add(q_model)
                db.flush()
                q_ids.append(q_model.id)

        test = models.Test(
            teacher_id=teacher_id,
            title=data.title,
            description=data.description,
            instructions=data.instructions,
            subject=data.subject,
            target_class=data.target_class,
            duration_minutes=data.duration_minutes,
            total_marks=data.total_marks,
            start_time=st,
            end_time=et,
            is_published=data.is_published,
            is_cancelled=False,
            enable_tab_monitoring=data.enable_tab_monitoring,
            tab_switch_threshold=data.tab_switch_threshold,
            allow_retake=data.allow_retake,
            release_results=data.release_results,
            question_ids=q_ids
        )
        db.add(test)
        db.commit()
        db.refresh(test)
        return test

    def get_student_tests_catalog(self, db: Session, student: models.User, subject: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
        """
        Partitions tests into Upcoming, Available, and Completed tabs with server-side validation.
        Optionally filters by subject (Mathematics, Physics, Computer Science).
        """
        now = datetime.utcnow()
        # Query tests
        query = db.query(models.Test).filter(models.Test.is_cancelled == False)
        if subject and subject.lower() != "all":
            query = query.filter(models.Test.subject.ilike(subject))
            
        tests = query.order_by(models.Test.start_time.asc()).all()

        upcoming = []
        available = []
        completed = []

        for t in tests:
            # Enforce that tests open strictly for that academic session only
            if t.target_class and t.target_class.strip().lower() != "all classes":
                if not student.academic_level or t.target_class.strip().lower() != student.academic_level.strip().lower():
                    continue

            # Query existing attempts
            attempt = db.query(models.TestAttempt).filter(
                models.TestAttempt.test_id == t.id,
                models.TestAttempt.student_id == student.id
            ).order_by(models.TestAttempt.id.desc()).first()

            has_completed = attempt and attempt.status in ["completed", "flagged"]
            in_progress = attempt and attempt.status == "in_progress"

            base_info = {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "instructions": t.instructions,
                "subject": t.subject,
                "target_class": t.target_class,
                "duration_minutes": t.duration_minutes,
                "total_marks": t.total_marks,
                "negative_marking": t.negative_marking,
                "start_time": t.start_time.isoformat(),
                "end_time": t.end_time.isoformat(),
                "enable_tab_monitoring": t.enable_tab_monitoring,
                "release_results": t.release_results,
                "has_attempted": bool(attempt),
                "attempt_id": attempt.id if attempt else None
            }

            if has_completed:
                base_info["status"] = "completed"
                base_info["score"] = attempt.score
                base_info["percentage"] = attempt.percentage
                base_info["submitted_at"] = attempt.submit_time.isoformat() if attempt.submit_time else None
                base_info["is_flagged"] = attempt.is_flagged
                base_info["tab_switch_count"] = attempt.tab_switch_count
                completed.append(base_info)
            elif now < t.start_time:
                base_info["status"] = "upcoming"
                upcoming.append(base_info)
            elif t.start_time <= now <= t.end_time:
                if t.is_published:
                    base_info["status"] = "available"
                    base_info["in_progress"] = in_progress
                    available.append(base_info)
                else:
                    base_info["status"] = "unpublished"
            else:
                # Past end time without completion
                if in_progress:
                    # Expired while doing test
                    base_info["status"] = "expired"
                    completed.append(base_info)

        return {
            "upcoming": upcoming,
            "available": available,
            "completed": completed
        }

    def start_or_resume_test(self, db: Session, student: models.User, test_id: int) -> Dict[str, Any]:
        """
        Enforces server-side eligibility and returns questions WITHOUT answers.
        Restores in-progress attempt if already started.
        """
        test = db.query(models.Test).filter(models.Test.id == test_id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found.")

        if test.is_cancelled:
            raise HTTPException(status_code=400, detail="This test has been cancelled by the teacher.")

        if not test.is_published:
            raise HTTPException(status_code=403, detail="This test has not been published yet.")

        now = datetime.utcnow()
        if now < test.start_time:
            raise HTTPException(
                status_code=403,
                detail=f"This test is not yet active. Scheduled start: {test.start_time.strftime('%Y-%m-%d %H:%M:%S UTC')}."
            )

        if now > test.end_time:
            raise HTTPException(
                status_code=403,
                detail="The deadline for this test has already passed."
            )

        # Enforce that tests open strictly for enrolled academic session / class
        if test.target_class and test.target_class.strip().lower() != "all classes":
            if not student.academic_level or test.target_class.strip().lower() != student.academic_level.strip().lower():
                raise HTTPException(
                    status_code=403,
                    detail=f"This examination is scheduled strictly for {test.target_class}. You are enrolled in {student.academic_level or 'an unassigned class'}."
                )

        # Check existing attempts
        attempt = db.query(models.TestAttempt).filter(
            models.TestAttempt.test_id == test.id,
            models.TestAttempt.student_id == student.id
        ).order_by(models.TestAttempt.id.desc()).first()

        if attempt and attempt.status in ["completed", "flagged"]:
            if not test.allow_retake:
                raise HTTPException(
                    status_code=403,
                    detail="You have already submitted this test. Retakes are not permitted."
                )

        # If no active attempt or retake allowed, create fresh attempt
        if not attempt or attempt.status in ["completed", "flagged"]:
            attempt = models.TestAttempt(
                test_id=test.id,
                student_id=student.id,
                start_time=now,
                total_marks=test.total_marks,
                status="in_progress",
                answers={},
                tab_switch_count=0,
                monitoring_events=[]
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)

        # Calculate remaining time in seconds based on server timestamp
        elapsed_seconds = int((now - attempt.start_time).total_seconds())
        test_duration_seconds = test.duration_minutes * 60
        time_until_deadline = int((test.end_time - now).total_seconds())

        remaining_seconds = max(0, min(test_duration_seconds - elapsed_seconds, time_until_deadline))

        # Fetch sanitized questions
        questions_data = []
        if test.question_ids:
            q_list = db.query(models.Question).filter(models.Question.id.in_(test.question_ids)).all()
            # Preserve original order
            q_map = {q.id: q for q in q_list}
            for q_id in test.question_ids:
                if q_id in q_map:
                    q = q_map[q_id]
                    # Sanitize options: omit is_correct and explanation!
                    sanitized_options = [
                        {"id": opt.get("id"), "text": opt.get("text")}
                        for opt in q.options
                    ]
                    questions_data.append({
                        "id": q.id,
                        "concept_slug": q.concept_slug,
                        "question_text": q.question_text,
                        "options": sanitized_options,
                        "marks": q.marks,
                        "difficulty_level": q.difficulty_level
                    })

        return {
            "attempt_id": attempt.id,
            "test_id": test.id,
            "title": test.title,
            "instructions": test.instructions,
            "duration_minutes": test.duration_minutes,
            "time_remaining_seconds": remaining_seconds,
            "enable_tab_monitoring": test.enable_tab_monitoring,
            "tab_switch_threshold": test.tab_switch_threshold,
            "questions": questions_data,
            "saved_answers": attempt.answers or {},
            "tab_switch_count": attempt.tab_switch_count
        }

    def save_single_answer(self, db: Session, attempt_id: int, student_id: int, data: schemas.SaveAnswerRequest) -> Dict[str, Any]:
        """Safely saves student answer keystroke / option selection in real-time."""
        attempt = db.query(models.TestAttempt).filter(
            models.TestAttempt.id == attempt_id,
            models.TestAttempt.student_id == student_id,
            models.TestAttempt.status == "in_progress"
        ).first()

        if not attempt:
            raise HTTPException(status_code=404, detail="Active attempt not found.")

        current_answers = dict(attempt.answers or {})
        current_answers[str(data.question_id)] = {
            "selected_option": data.selected_option_id,
            "marked_for_review": data.marked_for_review,
            "time_spent": data.time_spent
        }
        attempt.answers = current_answers
        db.commit()
        return {"status": "saved", "question_id": data.question_id}

    def record_tab_switch_event(self, db: Session, attempt_id: int, student_id: int, event_type: str) -> Dict[str, Any]:
        """Records visibility change or focus loss event during exam."""
        attempt = db.query(models.TestAttempt).filter(
            models.TestAttempt.id == attempt_id,
            models.TestAttempt.student_id == student_id,
            models.TestAttempt.status == "in_progress"
        ).first()

        if not attempt:
            raise HTTPException(status_code=404, detail="Active attempt not found.")

        attempt.tab_switch_count += 1
        test = attempt.test

        now_str = datetime.utcnow().isoformat()
        current_events = list(attempt.monitoring_events or [])
        current_events.append({
            "timestamp": now_str,
            "type": event_type,
            "warning_number": attempt.tab_switch_count
        })
        attempt.monitoring_events = current_events

        # Check threshold
        threshold = test.tab_switch_threshold if test else 3
        if attempt.tab_switch_count >= threshold:
            attempt.is_flagged = True

        db.commit()

        # Warning messages
        if attempt.tab_switch_count == 1:
            warning_msg = "Warning 1: You switched away from the test. Please remain on the test page."
        elif attempt.tab_switch_count == 2:
            warning_msg = "Warning 2: Another tab switch has been detected. Please continue your test without switching tabs."
        else:
            warning_msg = f"Warning {attempt.tab_switch_count}: Additional focus changes have been recorded. Your teacher may review this activity."

        return {
            "tab_switch_count": attempt.tab_switch_count,
            "warning_message": warning_msg,
            "is_flagged": attempt.is_flagged
        }

    def submit_test(self, db: Session, attempt_id: int, student_id: int, submission_answers: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Evaluates student attempt on the server, calculates score, updates BKT mastery."""
        attempt = db.query(models.TestAttempt).filter(
            models.TestAttempt.id == attempt_id,
            models.TestAttempt.student_id == student_id
        ).first()

        if not attempt:
            raise HTTPException(status_code=404, detail="Attempt not found.")

        if attempt.status in ["completed", "flagged"]:
            return {
                "message": "Attempt was already submitted.",
                "score": attempt.score,
                "total_marks": attempt.total_marks,
                "percentage": attempt.percentage
            }

        test = attempt.test
        merged_answers = dict(attempt.answers or {})
        if submission_answers:
            for q_id_str, val in submission_answers.items():
                if isinstance(val, dict):
                    merged_answers[str(q_id_str)] = val
                else:
                    merged_answers[str(q_id_str)] = {"selected_option": val, "marked_for_review": False}

        # Calculate scores question-by-question
        total_earned = 0.0
        max_marks = test.total_marks or 0.0
        q_results = []

        if test.question_ids:
            questions = db.query(models.Question).filter(models.Question.id.in_(test.question_ids)).all()
            for q in questions:
                ans_entry = merged_answers.get(str(q.id), {})
                chosen = ans_entry.get("selected_option") if isinstance(ans_entry, dict) else ans_entry
                is_correct = (chosen == q.correct_option_id)

                if is_correct:
                    total_earned += q.marks
                elif chosen: # wrong answer
                    if test.negative_marking > 0:
                        total_earned -= test.negative_marking
                    # Analyze misconception
                    detector.analyze_response(db, student_id, q, chosen)

                # Update BKT mastery
                if chosen:
                    learning_engine.record_quiz_attempt(db, student_id, q.concept_slug, is_correct)

                q_results.append({
                    "question_id": q.id,
                    "concept_slug": q.concept_slug,
                    "is_correct": is_correct,
                    "chosen_option": chosen,
                    "correct_option": q.correct_option_id if test.release_results else None,
                    "explanation": q.explanation if test.release_results else None
                })

        now = datetime.utcnow()
        attempt.submit_time = now
        attempt.time_spent_seconds = int((now - attempt.start_time).total_seconds())
        attempt.score = max(0.0, round(total_earned, 2))
        attempt.total_marks = max_marks
        attempt.percentage = round((attempt.score / max_marks) * 100, 1) if max_marks > 0 else 0.0
        attempt.answers = merged_answers
        attempt.status = "flagged" if attempt.is_flagged else "completed"

        db.commit()
        db.refresh(attempt)

        return {
            "attempt_id": attempt.id,
            "score": attempt.score,
            "total_marks": attempt.total_marks,
            "percentage": attempt.percentage,
            "time_spent_seconds": attempt.time_spent_seconds,
            "tab_switch_count": attempt.tab_switch_count,
            "is_flagged": attempt.is_flagged,
            "results_released": test.release_results,
            "question_evaluations": q_results if test.release_results else []
        }

    def export_test_results_csv(self, db: Session, test_id: int) -> str:
        """Exports classroom test performance to CSV string."""
        test = db.query(models.Test).filter(models.Test.id == test_id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Test not found.")

        attempts = db.query(models.TestAttempt).filter(
            models.TestAttempt.test_id == test_id
        ).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Student ID", "Student Name", "Email", "Academic Level",
            "Score", "Total Marks", "Percentage", "Time Spent (s)",
            "Tab Switches", "Status", "Flagged for Review", "Submitted At"
        ])

        for a in attempts:
            writer.writerow([
                a.student.id,
                a.student.full_name,
                a.student.email,
                a.student.academic_level or "N/A",
                a.score,
                a.total_marks,
                f"{a.percentage}%",
                a.time_spent_seconds,
                a.tab_switch_count,
                a.status,
                "YES" if a.is_flagged else "NO",
                a.submit_time.strftime("%Y-%m-%d %H:%M:%S") if a.submit_time else "In Progress"
            ])

        return output.getvalue()

test_engine = TestEngine()
