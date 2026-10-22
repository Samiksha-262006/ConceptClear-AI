"""
ConceptClear AI - Bayesian Knowledge Tracing & Adaptive Learning Engine
Estimates latent concept mastery using standard BKT parameters (transit, slip, guess),
and dynamically selects questions calibrated to student skill level.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
import models
from knowledge_graph import concept_graph

# Standard Bayesian Knowledge Tracing Default Hyperparameters
DEFAULT_P_INIT = 0.20    # P(L0): Initial belief of prior knowledge
DEFAULT_P_TRANSIT = 0.15 # P(T): Probability student learns concept during practice
DEFAULT_P_SLIP = 0.10    # P(S): Probability student knows concept but slips
DEFAULT_P_GUESS = 0.25   # P(G): Probability student guesses correctly without mastery

class BayesianKnowledgeTracer:
    def update_mastery(self, p_curr: float, is_correct: bool, p_transit: float = DEFAULT_P_TRANSIT,
                       p_slip: float = DEFAULT_P_SLIP, p_guess: float = DEFAULT_P_GUESS) -> float:
        """
        Calculates posterior mastery probability given observation (correct/incorrect),
        and adds transit probability for prospective learning.
        """
        # Clamp prior to valid probability interval
        p_curr = max(0.01, min(0.99, p_curr))

        if is_correct:
            # P(L|correct) = [P(L)*(1-S)] / [P(L)*(1-S) + (1-P(L))*G]
            numerator = p_curr * (1.0 - p_slip)
            denominator = numerator + ((1.0 - p_curr) * p_guess)
        else:
            # P(L|incorrect) = [P(L)*S] / [P(L)*S + (1-P(L))*(1-G)]
            numerator = p_curr * p_slip
            denominator = numerator + ((1.0 - p_curr) * (1.0 - p_guess))

        if denominator == 0:
            p_posterior = p_curr
        else:
            p_posterior = numerator / denominator

        # Transition step: P(Lt+1) = P(Lt|obs) + (1 - P(Lt|obs)) * P(T)
        p_next = p_posterior + ((1.0 - p_posterior) * p_transit)

        # Bound within [0.05, 0.98] to reflect realistic educational uncertainty
        return round(max(0.05, min(0.98, p_next)), 4)


class AdaptiveLearningEngine:
    def __init__(self):
        self.bkt = BayesianKnowledgeTracer()

    def get_or_create_mastery(self, db: Session, student_id: int, concept_slug: str) -> models.StudentMastery:
        rec = db.query(models.StudentMastery).filter(
            models.StudentMastery.student_id == student_id,
            models.StudentMastery.concept_slug == concept_slug
        ).first()

        if not rec:
            rec = models.StudentMastery(
                student_id=student_id,
                concept_slug=concept_slug,
                estimated_mastery=DEFAULT_P_INIT,
                p_transit=DEFAULT_P_TRANSIT,
                p_slip=DEFAULT_P_SLIP,
                p_guess=DEFAULT_P_GUESS,
                total_attempts=0,
                correct_attempts=0
            )
            db.add(rec)
            db.commit()
            db.refresh(rec)
        return rec

    def record_quiz_attempt(
        self,
        db: Session,
        student_id: int,
        concept_slug: str,
        is_correct: bool
    ) -> Dict[str, Any]:
        """Updates student mastery using Bayesian Knowledge Tracing."""
        rec = self.get_or_create_mastery(db, student_id, concept_slug)
        old_mastery = rec.estimated_mastery

        new_mastery = self.bkt.update_mastery(
            p_curr=old_mastery,
            is_correct=is_correct,
            p_transit=rec.p_transit,
            p_slip=rec.p_slip,
            p_guess=rec.p_guess
        )

        rec.estimated_mastery = new_mastery
        rec.total_attempts += 1
        if is_correct:
            rec.correct_attempts += 1
        rec.last_updated = datetime.utcnow()
        db.commit()
        db.refresh(rec)

        return {
            "concept_slug": concept_slug,
            "old_mastery": round(old_mastery * 100, 1),
            "new_mastery": round(new_mastery * 100, 1),
            "mastery_delta": round((new_mastery - old_mastery) * 100, 1),
            "total_attempts": rec.total_attempts,
            "accuracy": round((rec.correct_attempts / rec.total_attempts) * 100, 1) if rec.total_attempts > 0 else 0
        }

    def select_next_question(
        self,
        db: Session,
        student_id: int,
        concept_slug: str,
        exclude_question_ids: Optional[List[int]] = None
    ) -> Optional[models.Question]:
        """
        Adaptive Question Selection:
        - If student mastery < 0.40 -> target Difficulty 1
        - If 0.40 <= mastery < 0.75 -> target Difficulty 2
        - If mastery >= 0.75 -> target Difficulty 3
        """
        exclude_ids = exclude_question_ids or []
        mastery_rec = self.get_or_create_mastery(db, student_id, concept_slug)
        mastery = mastery_rec.estimated_mastery

        if mastery < 0.40:
            target_diff = 1
        elif mastery < 0.75:
            target_diff = 2
        else:
            target_diff = 3

        # First try exact difficulty match
        query = db.query(models.Question).filter(
            models.Question.concept_slug == concept_slug,
            models.Question.difficulty_level == target_diff
        )
        if exclude_ids:
            query = query.filter(~models.Question.id.in_(exclude_ids))
        q = query.first()

        # If none found, fallback to any unattempted in concept
        if not q:
            query = db.query(models.Question).filter(models.Question.concept_slug == concept_slug)
            if exclude_ids:
                query = query.filter(~models.Question.id.in_(exclude_ids))
            q = query.first()

        # If all attempted, wrap around to any question in concept
        if not q:
            q = db.query(models.Question).filter(models.Question.concept_slug == concept_slug).first()

        return q

    def get_student_recommendations(self, db: Session, student_id: int, subject: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Generates personalized learning path recommendations:
        Checks for concepts with learning gaps or weak prerequisites first.
        Optionally filtered by subject (Mathematics, Physics, Computer Science).
        """
        masteries = db.query(models.StudentMastery).filter(
            models.StudentMastery.student_id == student_id
        ).all()
        mastery_map = {m.concept_slug: m.estimated_mastery for m in masteries}

        recommendations = []
        # Check topological concept sequence for the subject
        for slug in concept_graph.get_topological_learning_path(subject):
            c_meta = concept_graph.nodes.get(slug, {})
            score = mastery_map.get(slug, 0.0)

            # Check if this concept or any prerequisite has a learning gap
            root_bottleneck = concept_graph.find_root_cause_bottleneck(slug, mastery_map)

            if root_bottleneck and root_bottleneck != slug:
                bn_node = concept_graph.nodes.get(root_bottleneck, {})
                recommendations.append({
                    "concept_slug": root_bottleneck,
                    "concept_name": bn_node.get("name", root_bottleneck),
                    "priority": "HIGH",
                    "reason": f"Prerequisite gap blocking mastery of {c_meta.get('name', slug)}",
                    "current_mastery": round(mastery_map.get(root_bottleneck, 0.0) * 100, 1),
                    "action_url": f"/learn.html?concept={root_bottleneck}",
                    "action_label": "Review Prerequisite"
                })
            elif score < 0.50:
                recommendations.append({
                    "concept_slug": slug,
                    "concept_name": c_meta.get("name", slug),
                    "priority": "MEDIUM" if score > 0 else "NORMAL",
                    "reason": "Needs foundational practice" if score > 0 else "New concept on your curriculum path",
                    "current_mastery": round(score * 100, 1),
                    "action_url": f"/learn.html?concept={slug}",
                    "action_label": "Start Lesson"
                })

        # Return top 4 distinct recommendations
        seen = set()
        deduped = []
        for r in recommendations:
            if r["concept_slug"] not in seen:
                seen.add(r["concept_slug"])
                deduped.append(r)
            if len(deduped) >= 4:
                break
        return deduped

learning_engine = AdaptiveLearningEngine()
