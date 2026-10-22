"""
ConceptClear AI - Misconception Detection Engine
Analyzes student quiz & test distractor choices, correlates recurring cognitive errors,
determines probabilistic confidence, and traces prerequisite root-cause learning gaps.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
import models
from knowledge_graph import concept_graph

# Catalog of cognitive misconceptions across mathematics
MISCONCEPTION_CATALOG = {
    "MIS_FRAC_ADD_NUM_DEN": {
        "code": "MIS_FRAC_ADD_NUM_DEN",
        "name": "Direct Addition of Numerators and Denominators",
        "description": "Student adds numerators together and denominators together without finding a common denominator (e.g. 1/2 + 1/4 = 2/6).",
        "concept_slug": "fractions",
        "prerequisite_gap_slug": "basic-arithmetic",
        "remedial_lesson": "Visualizing Fractions: Why common parts are required before combining slices.",
        "explanation_en": "You may have added the top numbers and bottom numbers straight across. In fractions, denominators represent the size of each piece, so they must be equal (using a common denominator) before adding.",
        "explanation_hi": "आपने अंश और हर को सीधे जोड़ दिया हो सकता है। भिन्नों में, हर टुकड़ों के आकार को दर्शाता है, इसलिए जोड़ने से पहले एक समान हर (लघुत्तम समापवर्त्य) खोजना ज़रूरी है।",
        "explanation_mr": "तुम्ही कदाचित अंश आणि छेद थेट एकत्र जोडले असावेत. अपूर्णांकांमध्ये, छेद तुकड्यांचा आकार दर्शवतो, म्हणून बेरीज करण्यापूर्वी समान छेद मिळवणे आवश्यक आहे।"
    },
    "MIS_FRAC_CROSS_MULT_ADD": {
        "code": "MIS_FRAC_CROSS_MULT_ADD",
        "name": "Cross-Multiplication in Fraction Addition",
        "description": "Confusing fraction division or proportion rules with fraction addition.",
        "concept_slug": "fractions",
        "prerequisite_gap_slug": "basic-arithmetic",
        "remedial_lesson": "Fractions Arithmetic: Addition vs Multiplication Rules.",
        "explanation_en": "It looks like you cross-multiplied or confused division procedures with addition. Remember to find the Least Common Multiple (LCM) for the denominators.",
        "explanation_hi": "ऐसा लगता है कि आपने क्रॉस-मल्टीप्लिकेशन को जोड़ने के साथ मिला दिया। हरों के लिए लघुत्तम समापवर्त्य (LCM) खोजें।",
        "explanation_mr": "असे दिसते की तुम्ही क्रॉस-गुणाकार नियमांचा वापर बेरजेत केला. छेदांचा लसावि (LCM) काढणे लक्षात ठेवा."
    },
    "MIS_ALG_SIGN_FLIP": {
        "code": "MIS_ALG_SIGN_FLIP",
        "name": "Sign Inversion Error in Equation Balancing",
        "description": "Failing to flip the sign when transposing a term across the equals sign (e.g., x + 5 = 12 -> x = 12 + 5).",
        "concept_slug": "linear-equations",
        "prerequisite_gap_slug": "basic-algebra",
        "remedial_lesson": "Balancing Equations: The Golden Rule of Doing the Same to Both Sides.",
        "explanation_en": "When transposing a positive or negative term across the equals sign, its sign must reverse because you are performing the inverse operation on both sides.",
        "explanation_hi": "जब आप बराबर के निशान के पार किसी पद को ले जाते हैं, तो उसका चिन्ह उलटना चाहिए क्योंकि आप दोनों पक्षों पर विपरीत संक्रिया कर रहे हैं।",
        "explanation_mr": "जेव्हा तुम्ही बरोबर चिन्हाच्या पलीकडे एखादे पद हलवता, तेव्हा त्याचे चिन्ह बदलले पाहिजे कारण तुम्ही दोन्ही बाजूंना उलट क्रिया करत आहात."
    },
    "MIS_ALG_LIKE_TERMS_CONCAT": {
        "code": "MIS_ALG_LIKE_TERMS_CONCAT",
        "name": "Treating Unlike Algebraic Terms as Combinable",
        "description": "Combining variables with constants or different powers (e.g. 2x + 3 = 5x).",
        "concept_slug": "basic-algebra",
        "prerequisite_gap_slug": "basic-arithmetic",
        "remedial_lesson": "Algebraic Like Terms: Apples vs Oranges in Mathematics.",
        "explanation_en": "Terms with different variables or powers cannot be added into a single term. Think of 2x as 2 apples and 3 as 3 coins — they cannot simply become 5 apples.",
        "explanation_hi": "असमान पदों या चरों को सीधे नहीं जोड़ा जा सकता। 2x को 2 सेब और 3 को 3 सिक्के समझें — वे 5 सेब नहीं बन सकते।",
        "explanation_mr": "भिन्न चले किंवा पदे थेट जोडता येत नाहीत. 2x म्हणजे 2 सफरचंद आणि 3 म्हणजे 3 नाणी समजा - ते 5 सफरचंद होऊ शकत नाहीत."
    },
    "MIS_DEC_PLACE_VALUE_IGNORED": {
        "code": "MIS_DEC_PLACE_VALUE_IGNORED",
        "name": "Treating Decimals as Whole Numbers after Dot",
        "description": "Believing 0.45 is greater than 0.7 because 45 > 7.",
        "concept_slug": "decimals",
        "prerequisite_gap_slug": "basic-arithmetic",
        "remedial_lesson": "Decimal Place Value: Tenths, Hundredths, and Number Line Positioning.",
        "explanation_en": "You may be comparing the digits after the decimal as if they were whole numbers. Remember: 0.7 is 70 hundredths, which is larger than 0.45 (45 hundredths).",
        "explanation_hi": "दशमलव के बाद के अंकों को पूरी संख्या की तरह न देखें। याद रखें: 0.7 असल में 0.70 है, जो 0.45 से बड़ा है।",
        "explanation_mr": "दशांश चिन्हानंतरच्या अंकांना पूर्ण संख्येसारखे मानू नका. 0.7 म्हणजे 0.70, जे 0.45 पेक्षा मोठे आहे."
    },
    "MIS_QUAD_SQUARE_ROOT_SIGN": {
        "code": "MIS_QUAD_SQUARE_ROOT_SIGN",
        "name": "Ignoring Negative Root in Quadratic Solutions",
        "description": "Forgetting that x^2 = 25 has two roots: +5 and -5.",
        "concept_slug": "quadratic-equations",
        "prerequisite_gap_slug": "linear-equations",
        "remedial_lesson": "Quadratic Roots: Why both positive and negative roots satisfy the equation.",
        "explanation_en": "Quadratic equations typically have two solutions. When taking the square root of both sides, don't forget the negative root, because (-5) * (-5) = 25.",
        "explanation_hi": "द्विघात समीकरणों के आमतौर पर दो हल होते हैं। वर्गमूल लेते समय ऋणात्मक मूल को न भूलें, क्योंकि (-5) * (-5) = 25 होता है।",
        "explanation_mr": "वर्ग समीकरणांना साधारणपणे दोन उत्तरे असतात. वर्गमूळ घेताना ऋण मूळ विसरू नका, कारण (-5) * (-5) = 25."
    },
    "MIS_RATIO_ADDITIVE_SCALING": {
        "code": "MIS_RATIO_ADDITIVE_SCALING",
        "name": "Additive Reasoning in Proportions Instead of Multiplicative",
        "description": "Adding the same amount to both sides of a ratio instead of multiplying by a scale factor.",
        "concept_slug": "ratios",
        "prerequisite_gap_slug": "fractions",
        "remedial_lesson": "Ratio Scaling: Multiplicative Thinking in Proportions.",
        "explanation_en": "Ratios require multiplicative scaling rather than additive changes. To keep the ratio constant, multiply or divide both quantities by the same factor.",
        "explanation_hi": "अनुपात को स्थिर रखने के लिए गुणात्मक परिवर्तन की आवश्यकता होती है, न कि केवल जोड़ने की।",
        "explanation_mr": "गुणोत्तर स्थिर ठेवण्यासाठी समान पटीने गुणाकार किंवा भागाकार करावा लागतो."
    },
    # Physics Misconceptions
    "MIS_PHYS_FORCE_MOTION": {
        "code": "MIS_PHYS_FORCE_MOTION",
        "name": "Belief that Motion Requires Continuous Net Force",
        "description": "Aristotelian belief that constant velocity requires an active forward net force.",
        "concept_slug": "newtons-laws",
        "prerequisite_gap_slug": "kinematics-motion",
        "remedial_lesson": "Newton's First Law: Inertia and Equilibrium.",
        "explanation_en": "According to Newton's First Law, an object in motion stays in motion with constant velocity unless acted upon by a net external force. No force is required to keep it moving!",
        "explanation_hi": "न्यूटन के प्रथम नियम के अनुसार, वस्तु निरंतर गति में रहती है जब तक कि उस पर कोई बाहरी असंतुलित बल न लगे।",
        "explanation_mr": "न्यूटनच्या पहिल्या नियमानुसार, बाह्य असंतुलित बल कार्य करत नाही तोपर्यंत वस्तूची गती कायम राहते."
    },
    "MIS_PHYS_ACCEL_VELOCITY": {
        "code": "MIS_PHYS_ACCEL_VELOCITY",
        "name": "Equating Zero Instantaneous Velocity with Zero Acceleration",
        "description": "Believing that when velocity reaches 0 (e.g., peak of vertical trajectory), acceleration is also 0.",
        "concept_slug": "kinematics-motion",
        "prerequisite_gap_slug": "kinematics-motion",
        "remedial_lesson": "Instantaneous Velocity vs Gravitational Acceleration.",
        "explanation_en": "At the peak of a vertical projectile, velocity instantaneously passes through zero, but gravity continues accelerating the object downward at 9.8 m/s².",
        "explanation_hi": "ऊर्ध्वाधर उड़ान के उच्चतम बिंदु पर वेग शून्य होता है, लेकिन गुरुत्वाकर्षण त्वरण (9.8 m/s²) निरंतर नीचे की ओर कार्य करता है।",
        "explanation_mr": "उंच फेकलेल्या वस्तूचा सर्वोच्च बिंदूवर वेग शून्य होतो, पण गुरुत्वीय प्रवेग सतत खाली कार्य करत असतो."
    },
    # Computer Science Misconceptions
    "MIS_CS_ASSIGN_VS_EQUAL": {
        "code": "MIS_CS_ASSIGN_VS_EQUAL",
        "name": "Confusing Assignment (=) with Equality Comparison (==)",
        "description": "Using single equals sign in boolean condition or treating assignment as bidirectional algebraic equality.",
        "concept_slug": "cs-conditionals",
        "prerequisite_gap_slug": "cs-variables",
        "remedial_lesson": "Variable Assignment vs Boolean Equality in Programming.",
        "explanation_en": "In programming, '=' assigns the right-hand value into the left-hand memory variable. '==' compares two expressions and returns True or False.",
        "explanation_hi": "प्रोग्रामिंग में '=' मान असाइन करता है, जबकि '==' तुलना करके True या False देता है।",
        "explanation_mr": "प्रोग्रामिंगमध्ये '=' मूल्य साठवतो, तर '==' तुलना करून True किंवा False देतो."
    },
    "MIS_CS_OFF_BY_ONE_LOOP": {
        "code": "MIS_CS_OFF_BY_ONE_LOOP",
        "name": "Off-by-One Iteration Boundary Error",
        "description": "Assuming range(n) or index loop runs up to and includes n rather than n-1.",
        "concept_slug": "cs-loops",
        "prerequisite_gap_slug": "cs-conditionals",
        "remedial_lesson": "Loop Invariants & Zero-Indexed Range Bounds.",
        "explanation_en": "Standard range(n) produces indices from 0 up to n-1 (total n elements). It stops immediately before reaching n.",
        "explanation_hi": "range(n) 0 से n-1 तक चलता है, इसमें n शामिल नहीं होता।",
        "explanation_mr": "range(n) 0 पासून n-1 पर्यंत चालतो, n चा समावेश नसतो."
    }
}

class MisconceptionDetector:
    def __init__(self):
        self.catalog = MISCONCEPTION_CATALOG

    def analyze_response(
        self,
        db: Session,
        student_id: int,
        question: models.Question,
        chosen_option_id: str,
        user_lang: str = "en"
    ) -> Dict[str, Any]:
        """
        Evaluates a submitted option against distractors.
        Returns detailed diagnosis, confidence level, and prerequisite link.
        """
        is_correct = (chosen_option_id == question.correct_option_id)
        
        # Locate chosen option data
        selected_option = None
        for opt in question.options:
            if opt.get("id") == chosen_option_id:
                selected_option = opt
                break

        if is_correct:
            return {
                "is_correct": True,
                "confidence": "High",
                "misconception_detected": None,
                "explanation": question.explanation or "Great job! That is the correct solution."
            }

        # It is incorrect: inspect distractor metadata
        misconception_code = selected_option.get("misconception_tag") if selected_option else None
        
        if not misconception_code or misconception_code not in self.catalog:
            # Fallback general misconception
            return {
                "is_correct": False,
                "confidence": "Low",
                "misconception_detected": {
                    "code": "MIS_GENERAL_COMPUTATION",
                    "name": "Computational or Conceptual Oversight",
                    "explanation": selected_option.get("explanation") if selected_option else "Incorrect answer. Review the steps and re-check your calculations.",
                    "status_label": "Possible oversight",
                    "confidence_score": "Low (1 occurrence)"
                },
                "prerequisite_gap": None,
                "recommended_lesson": None
            }

        misc_info = self.catalog[misconception_code]

        # Query past logs to assess recurring frequency for this student
        past_logs_count = db.query(models.MisconceptionLog).filter(
            models.MisconceptionLog.student_id == student_id,
            models.MisconceptionLog.misconception_code == misconception_code
        ).count()

        # Determine cautious confidence label
        if past_logs_count == 0:
            confidence = "Low"
            status_label = "Possible misconception (Initial observation)"
        elif past_logs_count == 1:
            confidence = "Medium"
            status_label = "Likely misconception (Repeated pattern)"
        else:
            confidence = "High"
            status_label = "Persistent misconception (Confirmed pattern)"

        # Log this event in the database
        new_log = models.MisconceptionLog(
            student_id=student_id,
            concept_slug=question.concept_slug,
            question_id=question.id,
            misconception_code=misconception_code,
            chosen_option_id=chosen_option_id,
            confidence=confidence,
            context=f"Chosen option {chosen_option_id} for question #{question.id}"
        )
        db.add(new_log)
        db.commit()

        # Look up localized explanation
        exp_field = f"explanation_{user_lang}"
        explanation_text = misc_info.get(exp_field) or misc_info.get("explanation_en")

        # Determine prerequisite gap
        prereq_slug = misc_info.get("prerequisite_gap_slug")
        prereq_concept = None
        if prereq_slug:
            prereq_node = concept_graph.nodes.get(prereq_slug)
            if prereq_node:
                prereq_concept = {
                    "slug": prereq_slug,
                    "name": prereq_node["name"],
                    "category": prereq_node["category"],
                    "description": prereq_node["description"]
                }

        return {
            "is_correct": False,
            "confidence": confidence,
            "misconception_detected": {
                "code": misc_info["code"],
                "name": misc_info["name"],
                "description": misc_info["description"],
                "explanation": explanation_text,
                "status_label": status_label,
                "confidence_score": f"{confidence} ({past_logs_count + 1} occurrences)",
                "remedial_lesson": misc_info.get("remedial_lesson")
            },
            "prerequisite_gap": prereq_concept,
            "recommended_lesson": {
                "concept_slug": prereq_slug or question.concept_slug,
                "title": f"Targeted Review: {misc_info['name']}",
                "lesson_url": f"/learn.html?concept={prereq_slug or question.concept_slug}"
            }
        }

detector = MisconceptionDetector()
