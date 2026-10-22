"""
ConceptClear AI - Multilingual AI Tutor Engine
Provides personalized pedagogical dialogue, step-by-step worked examples,
real-world analogies, and remedial guidance in English, Hindi, and Marathi.
Includes rich rule-based fallback and optional LLM API integration.
"""

import os
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import models
from knowledge_graph import concept_graph

# Curated Multilingual Knowledge Base for Math Concepts
TUTOR_KNOWLEDGE_BASE = {
    "fractions": {
        "en": {
            "title": "Mastering Fractions & Adding with Like Denominators",
            "concept_summary": "A fraction represents equal parts of a whole. The bottom number (denominator) tells you how many equal slices make up the whole, while the top number (numerator) tells you how many slices you have.",
            "real_life_analogy": "Imagine ordering two pizzas. One is cut into 2 giant halves, and the other into 4 regular quarters. You can't just count '2 slices' and call it 2/6 pizza! You must slice the half into 2 quarters first so all slices are identical in size.",
            "step_by_step_example": [
                "Problem: Calculate 1/2 + 1/4",
                "Step 1: Notice denominators 2 and 4 are different.",
                "Step 2: Find the Least Common Denominator (LCD). The LCM of 2 and 4 is 4.",
                "Step 3: Convert 1/2 to an equivalent fraction with denominator 4: (1 × 2) / (2 × 2) = 2/4.",
                "Step 4: Now add the numerators while keeping denominator identical: 2/4 + 1/4 = (2 + 1) / 4 = 3/4.",
                "Result: 3/4."
            ],
            "common_gap_warning": "Warning: Never add denominators directly (1/2 + 1/4 ≠ 2/6). Slices cannot change size just because you add them!",
            "practice_prompt": "Try calculating: What is 2/3 + 1/6? Remember to convert 2/3 first!"
        },
        "hi": {
            "title": "भिन्न और समान हर के साथ जोड़ना",
            "concept_summary": "भिन्न किसी पूरी वस्तु के बराबर हिस्सों को दर्शाती है। हर (नीचे की संख्या) कुल बराबर हिस्से बताती है, और अंश (ऊपर की संख्या) बताती है कि आपके पास कितने हिस्से हैं।",
            "real_life_analogy": "सोचिए कि आपके पास एक पिज़्ज़ा के 2 बड़े टुकड़े हैं और दूसरे के 4 छोटे। आप उन्हें बिना बराबर आकार किए सीधे नहीं जोड़ सकते। पहले दोनों को समान आकार के टुकड़ों में बदलना होगा।",
            "step_by_step_example": [
                "समस्या: 1/2 + 1/4 का मान निकालें",
                "चरण 1: हर 2 और 4 अलग-अलग हैं।",
                "चरण 2: लघुत्तम समापवर्त्य (LCM) खोजें। 2 और 4 का LCM 4 है।",
                "चरण 3: 1/2 को समतुल्य भिन्न में बदलें: (1 × 2) / (2 × 2) = 2/4.",
                "चरण 4: अंशों को जोड़ें और हर को वही रखें: 2/4 + 1/4 = 3/4.",
                "परिणाम: 3/4."
            ],
            "common_gap_warning": "सावधानी: अंश और हर को सीधे कभी न जोड़ें (1/2 + 1/4 ≠ 2/6)।",
            "practice_prompt": "हल करने का प्रयास करें: 2/3 + 1/6 क्या होगा?"
        },
        "mr": {
            "title": "अपूर्णांक आणि समान छेदांची बेरीज",
            "concept_summary": "अपूर्णांक म्हणजे संपूर्ण वस्तूचे समान भाग. छेद एकूण समान भाग दाखवतो, आणि अंश आपल्याकडे किती भाग आहेत ते दाखवतो.",
            "real_life_analogy": "कल्पना करा एका पिझ्झाचे 2 मोठे तुकडे आणि दुसऱ्याचे 4 लहान तुकडे आहेत. तुकड्यांचा आकार समान केल्याशिवाय तुम्ही त्यांची बेरीज करू शकत नाही.",
            "step_by_step_example": [
                "उदा: 1/2 + 1/4 ची बेरीज करा",
                "पायरी 1: छेद 2 आणि 4 वेगळे आहेत.",
                "पायरी 2: लसावि (LCM) काढा. 2 आणि 4 चा लसावि 4 आहे.",
                "पायरी 3: 1/2 चे रूपांतर करा: (1 × 2) / (2 × 2) = 2/4.",
                "पायरी 4: अंशांची बेरीज करा आणि छेद समान ठेवा: 2/4 + 1/4 = 3/4.",
                "उत्तर: 3/4."
            ],
            "common_gap_warning": "महत्त्वाचे: छेद थेट जोडू नका (1/2 + 1/4 ≠ 2/6).",
            "practice_prompt": "प्रयत्न करा: 2/3 + 1/6 चे उत्तर काय येईल?"
        }
    },
    "linear-equations": {
        "en": {
            "title": "Solving Linear Equations: Balancing the Scales",
            "concept_summary": "A linear equation is like a balanced scale. Whatever operation you apply to one side, you must apply the exact same operation to the other side to keep it equal.",
            "real_life_analogy": "Think of a balance scale. If you have a mystery box plus a 5kg weight on the left side, and a 12kg weight on the right side, you remove 5kg from BOTH sides to find the weight of the box.",
            "step_by_step_example": [
                "Problem: Solve 2x + 5 = 17",
                "Step 1: Isolate the variable term (2x). Subtract 5 from both sides: 2x + 5 - 5 = 17 - 5.",
                "Step 2: Simplify: 2x = 12.",
                "Step 3: Eliminate the coefficient. Divide both sides by 2: (2x)/2 = 12/2.",
                "Step 4: Solve: x = 6.",
                "Check: 2(6) + 5 = 12 + 5 = 17. Correct!"
            ],
            "common_gap_warning": "Warning: When moving +5 across the equals sign, remember to subtract it. Do not add it on both sides!",
            "practice_prompt": "Practice question: Solve 3x - 4 = 11. What is the value of x?"
        },
        "hi": {
            "title": "रैखिक समीकरण हल करना: तराजू का संतुलन",
            "concept_summary": "रैखिक समीकरण एक संतुलित तराजू की तरह होता है। दोनों पक्षों को बराबर रखने के लिए जो संक्रिया एक तरफ करते हैं, वही दूसरी तरफ भी करनी होगी।",
            "real_life_analogy": "यदि तराजू के एक पलड़े पर एक अज्ञात डिब्बा और 5 किलो का वजन है, और दूसरे पर 17 किलो, तो डिब्बे का वजन जानने के लिए दोनों तरफ से 5 किलो घटाएं।",
            "step_by_step_example": [
                "समस्या: हल करें 2x + 5 = 17",
                "चरण 1: दोनों पक्षों से 5 घटाएं: 2x = 12.",
                "चरण 2: दोनों पक्षों को 2 से भाग दें: x = 6.",
                "जाँच: 2(6) + 5 = 17. सही!"
            ],
            "common_gap_warning": "चिन्ह बदलना याद रखें जब पद बराबर के दूसरी तरफ जाता है।",
            "practice_prompt": "हल करें: 3x - 4 = 11. x का मान क्या है?"
        },
        "mr": {
            "title": "रेषीय समीकरणे सोडवणे: तराजूचे संतुलन",
            "concept_summary": "रेषीय समीकरण म्हणजे समतोल तराजू. एका बाजूवर जी क्रिया कराल तीच दुसऱ्या बाजूवर करणे बंधनकारक आहे.",
            "real_life_analogy": "एका पारड्यात एक पेटी आणि 5 किलो वजन आहे, दुसऱ्यात 17 किलो. पेटीचे वजन काढण्यासाठी दोन्ही पारड्यांतून 5 किलो कमी करा.",
            "step_by_step_example": [
                "उदा: 2x + 5 = 17 सोडवा",
                "पायरी 1: दोन्ही बाजूंमधून 5 वजा करा: 2x = 12.",
                "पायरी 2: दोन्ही बाजूंना 2 ने भागा: x = 6.",
                "पडताळा: 2(6) + 5 = 17. अचूक!"
            ],
            "common_gap_warning": "पक्ष बदलताना चिन्ह बदलणे विसरू नका.",
            "practice_prompt": "सोडवा: 3x - 4 = 11. x ची किंमत काढा."
        }
    },
    "basic-algebra": {
        "en": {
            "title": "Basic Algebra: Variables and Like Terms",
            "concept_summary": "Algebra uses letters (variables) to represent unknown values. Only 'like terms' (terms with identical variable parts and powers) can be added or subtracted together.",
            "real_life_analogy": "If you have 3 apples and 2 bananas, you don't say you have 5 'applenanas'. You have 3a + 2b. Only apples combine with apples!",
            "step_by_step_example": [
                "Problem: Simplify 4x + 7 + 3x - 2",
                "Step 1: Group like terms: (4x + 3x) + (7 - 2).",
                "Step 2: Add coefficients of x: 4 + 3 = 7, so 7x.",
                "Step 3: Combine constants: 7 - 2 = 5.",
                "Result: 7x + 5."
            ],
            "common_gap_warning": "Never combine numbers without variables with variable terms (e.g., 7x + 5 is NOT 12x).",
            "practice_prompt": "Simplify: 5y + 4 + 2y - 1"
        },
        "hi": {
            "title": "बीजगणित: चर और सजातीय पद",
            "concept_summary": "बीजगणित में अज्ञात मानों के लिए अक्षरों (चरों) का उपयोग किया जाता है। केवल समान चरों वाले पदों को ही जोड़ा या घटाया जा सकता है।",
            "real_life_analogy": "3 सेब और 2 केले मिलकर 5 सेब-केले नहीं बनते। वे अलग ही रहते हैं: 3x + 2y.",
            "step_by_step_example": [
                "सरल करें: 4x + 7 + 3x - 2",
                "चरण 1: सजातीय पदों को एक साथ रखें: (4x + 3x) + (7 - 2).",
                "चरण 2: x वाले पदों को जोड़ें: 7x.",
                "चरण 3: अचर पदों को जोड़ें: 5.",
                "परिणाम: 7x + 5."
            ],
            "common_gap_warning": "7x + 5 को कभी 12x न लिखें!",
            "practice_prompt": "सरल करें: 5y + 4 + 2y - 1"
        },
        "mr": {
            "title": "मूलभूत बीजगणित: चल आणि सजातीय पदे",
            "concept_summary": "बीजगणितात अज्ञात संख्यांसाठी अक्षरांचा (चल) वापर केला जातो. फक्त समान चल असलेली पदे एकत्र जोडता येतात.",
            "real_life_analogy": "3 आंबे आणि 2 चिकू मिळून 5 आंबचिकू होत नाहीत. ते वेगळेच राहतात.",
            "step_by_step_example": [
                "सोपे रूप द्या: 4x + 7 + 3x - 2",
                "पायरी 1: सजातीय पदे जवळ घ्या: (4x + 3x) + (7 - 2).",
                "पायरी 2: चलांची बेरीज: 7x.",
                "पायरी 3: संख्यांची बेरीज: 5.",
                "उत्तर: 7x + 5."
            ],
            "common_gap_warning": "7x + 5 म्हणजे 12x होत नाही!",
            "practice_prompt": "सोपे रूप द्या: 5y + 4 + 2y - 1"
        }
    },
    "quadratic-equations": {
        "en": {
            "title": "Quadratic Equations: Factoring and Finding Roots",
            "concept_summary": "A quadratic equation involves a variable squared (ax² + bx + c = 0). Because squaring either a positive or negative number produces a positive, quadratics generally have two roots.",
            "real_life_analogy": "When you throw a basketball, its flight path is a parabola. It reaches floor level at two points: when it leaves your hands and when it lands.",
            "step_by_step_example": [
                "Problem: Solve x² - 5x + 6 = 0",
                "Step 1: Find two numbers that multiply to +6 and add up to -5.",
                "Step 2: The numbers are -2 and -3, because (-2)(-3) = 6 and (-2) + (-3) = -5.",
                "Step 3: Write factored form: (x - 2)(x - 3) = 0.",
                "Step 4: Set each factor to zero: x - 2 = 0 => x = 2, and x - 3 = 0 => x = 3.",
                "Roots: x = 2 and x = 3."
            ],
            "common_gap_warning": "Remember both positive and negative solutions when taking square roots (e.g., if x² = 16, x = +4 and x = -4).",
            "practice_prompt": "Find the roots of: x² - 7x + 12 = 0"
        },
        "hi": {
            "title": "द्विघात समीकरण: गुणनखंड और मूल",
            "concept_summary": "द्विघात समीकरण ax² + bx + c = 0 के रूप में होता है। इसमें चर की अधिकतम घात 2 होती है और सामान्यतः इसके दो मूल होते हैं।",
            "real_life_analogy": "जब गेंद हवा में फेंकी जाती है, तो उसका परवलयाकार मार्ग ज़मीन को दो बार छूता है।",
            "step_by_step_example": [
                "हल करें: x² - 5x + 6 = 0",
                "चरण 1: ऐसी दो संख्याएँ खोजें जिनका गुणनफल +6 और योग -5 हो: (-2 और -3).",
                "चरण 2: गुणनखंड लिखें: (x - 2)(x - 3) = 0.",
                "चरण 3: मूल निकालें: x = 2 और x = 3."
            ],
            "common_gap_warning": "वर्गमूल लेते समय दोनों (+ और -) चिन्ह याद रखें।",
            "practice_prompt": "मूल ज्ञात करें: x² - 7x + 12 = 0"
        },
        "mr": {
            "title": "वर्ग समीकरणे: अवयव पद्धत आणि मुळे",
            "concept_summary": "वर्ग समीकरणामध्ये चलाचा सर्वोच्च घातांक 2 असतो (ax² + bx + c = 0). त्याला सहसा दोन मुळे असतात.",
            "real_life_analogy": "उंच फेकलेला चेंडू हवेत कमान करून जमिनीवर दोन वेळा येतो.",
            "step_by_step_example": [
                "सोडवा: x² - 5x + 6 = 0",
                "पायरी 1: गुणाकार +6 आणि बेरीज -5 असणाऱ्या दोन संख्या शोधा: (-2 आणि -3).",
                "पायरी 2: अवयव पाडा: (x - 2)(x - 3) = 0.",
                "पायरी 3: मुळे: x = 2 आणि x = 3."
            ],
            "common_gap_warning": "वर्गमूळ घेताना धन आणि ऋण दोन्ही चिन्हे लक्षात ठेवा.",
            "practice_prompt": "मुळे काढा: x² - 7x + 12 = 0"
        }
    }
}

class AITutorEngine:
    def __init__(self):
        self.kb = TUTOR_KNOWLEDGE_BASE

    def chat(
        self,
        db: Session,
        student: models.User,
        user_message: str,
        concept_slug: Optional[str] = None,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates tailored tutor explanations considering student's learning gaps,
        detected misconceptions, and language preference (en, hi, mr).
        """
        lang = language or student.preferred_language or "en"
        if lang not in ["en", "hi", "mr"]:
            lang = "en"

        # Determine target concept
        slug = concept_slug
        if not slug:
            # Check recent misconception log
            recent_misc = db.query(models.MisconceptionLog).filter(
                models.MisconceptionLog.student_id == student.id
            ).order_by(models.MisconceptionLog.timestamp.desc()).first()
            if recent_misc:
                slug = recent_misc.concept_slug
            else:
                slug = "fractions"

        # Check knowledge base for matching concept
        concept_data = self.kb.get(slug, self.kb.get("fractions"))
        lang_data = concept_data.get(lang, concept_data.get("en"))

        # Look up recent misconception for targeted pedagogical feedback
        recent_log = db.query(models.MisconceptionLog).filter(
            models.MisconceptionLog.student_id == student.id,
            models.MisconceptionLog.concept_slug == slug
        ).order_by(models.MisconceptionLog.timestamp.desc()).first()

        gap_note = None
        if recent_log:
            from misconception_detector import MISCONCEPTION_CATALOG
            cat = MISCONCEPTION_CATALOG.get(recent_log.misconception_code, {})
            gap_note = cat.get(f"explanation_{lang}") or cat.get("explanation_en") or cat.get("name")

        # Compose tutor response
        msg_lower = user_message.lower()
        if "example" in msg_lower or "उदाहरण" in msg_lower or "step" in msg_lower:
            reply_text = f"Here is a clear step-by-step example for **{lang_data['title']}**:\n\n"
            reply_text += "\n".join(f"- {s}" for s in lang_data["step_by_step_example"])
            reply_text += f"\n\n💡 **Tip**: {lang_data['common_gap_warning']}"
        elif "real life" in msg_lower or "analogy" in msg_lower or "कथा" in msg_lower or "वास्तविक" in msg_lower:
            reply_text = f"**Real-World Perspective** 🌍:\n\n{lang_data['real_life_analogy']}\n\n{lang_data['concept_summary']}"
        elif "practice" in msg_lower or "quiz" in msg_lower or "प्रश्न" in msg_lower or "सराव" in msg_lower:
            reply_text = f"Ready for practice? 🎯\n\n{lang_data['practice_prompt']}\n\nTake your time to write down the steps!"
        else:
            # Comprehensive overview
            reply_text = f"Hello {student.full_name}! 👋 Let's master **{lang_data['title']}** together.\n\n"
            if gap_note:
                reply_text += f"🔍 **Targeted Note for You**: {gap_note}\n\n"
            reply_text += f"**Core Idea**: {lang_data['concept_summary']}\n\n"
            reply_text += f"🍕 **Analogy**: {lang_data['real_life_analogy']}\n\n"
            reply_text += f"⚠️ **Watch Out**: {lang_data['common_gap_warning']}"

        return {
            "reply": reply_text,
            "concept_slug": slug,
            "detected_gap": gap_note,
            "step_by_step_example": lang_data.get("step_by_step_example"),
            "real_life_analogy": lang_data.get("real_life_analogy"),
            "practice_prompt": lang_data.get("practice_prompt"),
            "language": lang
        }

tutor_engine = AITutorEngine()
