"""
ConceptClear AI - Multi-Subject Seed Data Initializer
Populates database with Mathematics, Physics, and Computer Science concepts,
question bank with tagged cognitive distractors, multi-step interactive lessons with Next navigation,
demo accounts, and secure formal examination benchmarks.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import models
from auth import hash_password
from knowledge_graph import CONCEPT_NODES
from misconception_detector import MISCONCEPTION_CATALOG

QUESTIONS_SEED = [
    # ==================== MATHEMATICS ====================
    # --- Fractions ---
    {
        "subject": "Mathematics",
        "concept_slug": "fractions",
        "question_text": "What is the result of adding 1/2 + 1/4?",
        "options": [
            {"id": "A", "text": "2/6", "misconception_tag": "MIS_FRAC_ADD_NUM_DEN", "explanation": "Adding numerators (1+1=2) and denominators (2+4=6) directly ignores the piece sizes."},
            {"id": "B", "text": "3/4", "misconception_tag": None, "explanation": "Correct! Common denominator is 4: 2/4 + 1/4 = 3/4."},
            {"id": "C", "text": "1/6", "misconception_tag": "MIS_FRAC_CROSS_MULT_ADD", "explanation": "Cross-multiplying rules do not apply to addition."},
            {"id": "D", "text": "2/4", "misconception_tag": None, "explanation": "Incorrect fraction simplification."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "To add fractions with different denominators, find the LCM of 2 and 4 (which is 4). 1/2 becomes 2/4. Then 2/4 + 1/4 = 3/4."
    },
    {
        "subject": "Mathematics",
        "concept_slug": "fractions",
        "question_text": "Calculate: 2/3 - 1/6. What is the difference in simplest form?",
        "options": [
            {"id": "A", "text": "1/3", "misconception_tag": "MIS_FRAC_ADD_NUM_DEN", "explanation": "Subtracting top and bottom directly (2-1)/(3-6) is invalid."},
            {"id": "B", "text": "1/2", "misconception_tag": None, "explanation": "Correct! 4/6 - 1/6 = 3/6, which simplifies to 1/2."},
            {"id": "C", "text": "3/6", "misconception_tag": None, "explanation": "3/6 is correct before simplification, but not in simplest form."},
            {"id": "D", "text": "1/6", "misconception_tag": None, "explanation": "Incorrect numerator subtraction."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Convert 2/3 to 4/6. Subtract: 4/6 - 1/6 = 3/6 = 1/2."
    },

    # --- Basic Arithmetic ---
    {
        "subject": "Mathematics",
        "concept_slug": "basic-arithmetic",
        "question_text": "Evaluate using the correct order of operations: 8 + 6 ÷ 2 × 3",
        "options": [
            {"id": "A", "text": "21", "misconception_tag": "MIS_ARITH_LEFT_TO_RIGHT", "explanation": "Performing 8 + 6 = 14 first violates BODMAS/PEMDAS. Division and multiplication must precede addition."},
            {"id": "B", "text": "17", "misconception_tag": None, "explanation": "Correct! 6 ÷ 2 = 3. Then 3 × 3 = 9. Finally 8 + 9 = 17."},
            {"id": "C", "text": "9", "misconception_tag": None, "explanation": "Performed 2 x 3 = 6 first, then 6 / 6 = 1, then 8 + 1 = 9 (division and multiplication have equal precedence from left to right)."},
            {"id": "D", "text": "11", "misconception_tag": None, "explanation": "Arithmetic calculation error."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "Evaluate left to right for multiplication and division: 6 ÷ 2 = 3; 3 × 3 = 9. Then add: 8 + 9 = 17."
    },

    # --- Basic Algebra ---
    {
        "subject": "Mathematics",
        "concept_slug": "basic-algebra",
        "question_text": "Simplify the expression completely: 3x + 5 + 4x - 2",
        "options": [
            {"id": "A", "text": "10x", "misconception_tag": "MIS_ALG_LIKE_TERMS_CONCAT", "explanation": "Combining constants and variable terms into a single 10x is an invalid concatenation."},
            {"id": "B", "text": "7x + 3", "misconception_tag": None, "explanation": "Correct! (3x + 4x) = 7x and (5 - 2) = 3."},
            {"id": "C", "text": "7x + 7", "misconception_tag": "MIS_ALG_SIGN_FLIP", "explanation": "Added 5 and 2 instead of subtracting 2."},
            {"id": "D", "text": "12x - 2", "misconception_tag": None, "explanation": "Multiplied coefficients instead of adding."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "Group like terms: (3x + 4x) + (5 - 2) = 7x + 3."
    },
    {
        "subject": "Mathematics",
        "concept_slug": "basic-algebra",
        "question_text": "Which expression represents the distributive property applied to: 4(2x - 3)?",
        "options": [
            {"id": "A", "text": "8x - 3", "misconception_tag": "MIS_ALG_LIKE_TERMS_CONCAT", "explanation": "Only multiplied the first term by 4 and forgot to distribute 4 to the -3."},
            {"id": "B", "text": "8x - 12", "misconception_tag": None, "explanation": "Correct! 4 * 2x = 8x, and 4 * (-3) = -12."},
            {"id": "C", "text": "8x + 12", "misconception_tag": "MIS_ALG_SIGN_FLIP", "explanation": "Forgot that positive times negative yields a negative."},
            {"id": "D", "text": "6x - 7", "misconception_tag": None, "explanation": "Added 4 instead of multiplying."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Distribute 4: 4 * (2x) - 4 * (3) = 8x - 12."
    },

    # --- Linear Equations ---
    {
        "subject": "Mathematics",
        "concept_slug": "linear-equations",
        "question_text": "Solve for x in the equation: 3x - 7 = 14",
        "options": [
            {"id": "A", "text": "x = 7/3", "misconception_tag": "MIS_ALG_SIGN_FLIP", "explanation": "Subtracted 7 from 14 instead of adding 7 (14 - 7 = 7)."},
            {"id": "B", "text": "x = 7", "misconception_tag": None, "explanation": "Correct! 3x = 14 + 7 = 21, then x = 21/3 = 7."},
            {"id": "C", "text": "x = 21", "misconception_tag": None, "explanation": "Forgot to divide by coefficient 3."},
            {"id": "D", "text": "x = 5", "misconception_tag": None, "explanation": "Arithmetic error."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Add 7 to both sides: 3x = 21. Divide both sides by 3: x = 7."
    },
    {
        "subject": "Mathematics",
        "concept_slug": "linear-equations",
        "question_text": "Solve for y: 5y + 12 = 2y + 27",
        "options": [
            {"id": "A", "text": "y = 5", "misconception_tag": None, "explanation": "Correct! 5y - 2y = 27 - 12 => 3y = 15 => y = 5."},
            {"id": "B", "text": "y = 13", "misconception_tag": "MIS_ALG_SIGN_FLIP", "explanation": "Added 2y and 12 instead of subtracting them."},
            {"id": "C", "text": "y = 3", "misconception_tag": None, "explanation": "Calculation slip."},
            {"id": "D", "text": "y = 7", "misconception_tag": None, "explanation": "Incorrect division."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 3,
        "marks": 2.0,
        "explanation": "Subtract 2y: 3y + 12 = 27. Subtract 12: 3y = 15. Divide by 3: y = 5."
    },

    # --- Decimals ---
    {
        "subject": "Mathematics",
        "concept_slug": "decimals",
        "question_text": "Which comparison between decimals is TRUE?",
        "options": [
            {"id": "A", "text": "0.45 > 0.7", "misconception_tag": "MIS_DEC_PLACE_VALUE_IGNORED", "explanation": "Believing 45 is larger than 7 without considering tenths place (0.7 = 0.70)."},
            {"id": "B", "text": "0.7 > 0.45", "misconception_tag": None, "explanation": "Correct! 0.70 is greater than 0.45."},
            {"id": "C", "text": "0.08 > 0.8", "misconception_tag": "MIS_DEC_PLACE_VALUE_IGNORED", "explanation": "More digits after decimal does not mean larger value."},
            {"id": "D", "text": "0.45 = 0.4500", "misconception_tag": None, "explanation": "Although true, question asks which comparison of distinct values."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "0.7 equals 0.70. Comparing tenths: 7 tenths is greater than 4 tenths, so 0.7 > 0.45."
    },

    # --- Quadratic Equations ---
    {
        "subject": "Mathematics",
        "concept_slug": "quadratic-equations",
        "question_text": "What are all the real solutions to: x² - 25 = 0?",
        "options": [
            {"id": "A", "text": "x = 5 only", "misconception_tag": "MIS_QUAD_SQUARE_ROOT_SIGN", "explanation": "Ignoring the negative root: (-5)² is also 25!"},
            {"id": "B", "text": "x = 5 and x = -5", "misconception_tag": None, "explanation": "Correct! Taking square root gives ±√25 = ±5."},
            {"id": "C", "text": "x = 25 and x = -25", "misconception_tag": None, "explanation": "Forgot to take square root."},
            {"id": "D", "text": "x = 0 and x = 5", "misconception_tag": None, "explanation": "0 does not satisfy 0 - 25 = 0."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "x² = 25. Taking square root of both sides: x = ±5."
    },

    # --- Ratios ---
    {
        "subject": "Mathematics",
        "concept_slug": "ratios",
        "question_text": "The ratio of blue to red marbles is 3:5. If there are 15 red marbles, how many blue marbles are there?",
        "options": [
            {"id": "A", "text": "13", "misconception_tag": "MIS_RATIO_ADDITIVE_SCALING", "explanation": "Added 10 because 5 + 10 = 15, then 3 + 10 = 13. Ratios must be scaled multiplicatively!"},
            {"id": "B", "text": "9", "misconception_tag": None, "explanation": "Correct! Scale factor is 15 / 5 = 3. Blue = 3 * 3 = 9."},
            {"id": "C", "text": "10", "misconception_tag": None, "explanation": "Calculation error."},
            {"id": "D", "text": "25", "misconception_tag": None, "explanation": "Multiplied red marbles instead of scaling blue."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Scale factor = 15 / 5 = 3. Blue marbles = 3 * 3 = 9."
    },

    # ==================== PHYSICS ====================
    # --- Kinematics & Motion ---
    {
        "subject": "Physics",
        "concept_slug": "kinematics-motion",
        "question_text": "A ball is thrown straight upwards into the air. At the exact instant it reaches its maximum peak height, what are its instantaneous velocity and acceleration?",
        "options": [
            {"id": "A", "text": "Velocity = 0 m/s, Acceleration = 0 m/s²", "misconception_tag": "MIS_PHYS_ACCEL_VELOCITY", "explanation": "Equating zero instantaneous velocity with zero acceleration is incorrect; gravity never turns off!"},
            {"id": "B", "text": "Velocity = 0 m/s, Acceleration = 9.8 m/s² downward", "misconception_tag": None, "explanation": "Correct! Velocity stops instantaneously, but gravity continuously accelerates the ball downward at g = 9.8 m/s²."},
            {"id": "C", "text": "Velocity = 9.8 m/s upward, Acceleration = 0 m/s²", "misconception_tag": None, "explanation": "At the peak, velocity is zero, not 9.8 m/s."},
            {"id": "D", "text": "Velocity = -9.8 m/s, Acceleration = -9.8 m/s²", "misconception_tag": None, "explanation": "Incorrect instantaneous state."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "At maximum height, the vertical velocity momentarily reaches zero (v = 0). However, the Earth's gravitational pull continues exerting a downward acceleration of g = 9.8 m/s²."
    },
    {
        "subject": "Physics",
        "concept_slug": "kinematics-motion",
        "question_text": "A racing drone accelerates uniformly from rest (0 m/s) to 30 m/s in 6 seconds. What is its acceleration?",
        "options": [
            {"id": "A", "text": "5 m/s²", "misconception_tag": None, "explanation": "Correct! a = (v - u) / t = (30 - 0) / 6 = 5 m/s²."},
            {"id": "B", "text": "180 m/s²", "misconception_tag": None, "explanation": "Multiplied speed by time instead of dividing."},
            {"id": "C", "text": "24 m/s²", "misconception_tag": None, "explanation": "Subtracted time from speed."},
            {"id": "D", "text": "0.2 m/s²", "misconception_tag": None, "explanation": "Inverted the formula: t / v instead of v / t."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "Acceleration is rate of change of velocity: a = Δv / Δt = (30 - 0) / 6 = 5 m/s²."
    },

    # --- Newton's Laws & Forces ---
    {
        "subject": "Physics",
        "concept_slug": "newtons-laws",
        "question_text": "A hockey puck glides across a frictionless ice sheet at a steady velocity of 12 m/s in a straight line. What net external force is required to keep it moving at this speed?",
        "options": [
            {"id": "A", "text": "A constant forward force proportional to its velocity", "misconception_tag": "MIS_PHYS_FORCE_MOTION", "explanation": "Aristotelian fallacy: motion does NOT require a continuous net force. By Newton's 1st Law, inertia sustains uniform motion."},
            {"id": "B", "text": "0 N (Zero net force)", "misconception_tag": None, "explanation": "Correct! Newton's First Law states an object in motion remains in motion at constant velocity unless acted upon by a net force."},
            {"id": "C", "text": "A force equal to its weight (mg)", "misconception_tag": None, "explanation": "Weight acts vertically and is balanced by the normal force."},
            {"id": "D", "text": "12 N of forward thrust", "misconception_tag": None, "explanation": "Equating speed directly to force is physically invalid."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Newton's First Law (Law of Inertia): When net force is zero, velocity remains constant. No net force is needed to sustain constant motion."
    },
    {
        "subject": "Physics",
        "concept_slug": "newtons-laws",
        "question_text": "A 4 kg box rests on a frictionless table. If a horizontal force of 24 N is applied, what is its resulting acceleration?",
        "options": [
            {"id": "A", "text": "6 m/s²", "misconception_tag": None, "explanation": "Correct! Newton's 2nd Law: F = ma => a = F/m = 24 / 4 = 6 m/s²."},
            {"id": "B", "text": "96 m/s²", "misconception_tag": None, "explanation": "Multiplied force by mass instead of dividing."},
            {"id": "C", "text": "20 m/s²", "misconception_tag": None, "explanation": "Subtracted mass from force."},
            {"id": "D", "text": "0.167 m/s²", "misconception_tag": None, "explanation": "Divided mass by force."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "Using Newton's Second Law: a = F / m = 24 N / 4 kg = 6 m/s²."
    },

    # --- Work, Energy & Power ---
    {
        "subject": "Physics",
        "concept_slug": "work-energy",
        "question_text": "A student holds a heavy 15 kg crate stationary at shoulder height for 5 minutes without moving. How much mechanical work is done on the crate?",
        "options": [
            {"id": "A", "text": "0 Joules", "misconception_tag": None, "explanation": "Correct! Work = Force × Displacement × cos(θ). Since displacement is 0, mechanical work is 0 J."},
            {"id": "B", "text": "75 Joules", "misconception_tag": None, "explanation": "Multiplied 15 kg by 5 minutes."},
            {"id": "C", "text": "735 Joules", "misconception_tag": None, "explanation": "Calculated gravitational force (mg) but forgot displacement is zero."},
            {"id": "D", "text": "1500 Joules", "misconception_tag": None, "explanation": "Arbitrary power estimate."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Mechanical work is defined as W = F · d · cos(θ). Although biological muscles expend chemical energy to maintain tension, physical work on the crate is zero because displacement d = 0."
    },

    # --- Electric Circuits & Ohm's Law ---
    {
        "subject": "Physics",
        "concept_slug": "electric-circuits",
        "question_text": "In a closed DC circuit, a 12V battery is connected across a 6 Ohm resistor. What is the electric current flowing through the circuit?",
        "options": [
            {"id": "A", "text": "2 Amperes", "misconception_tag": None, "explanation": "Correct! Ohm's Law: I = V / R = 12 V / 6 Ω = 2 A."},
            {"id": "B", "text": "72 Amperes", "misconception_tag": None, "explanation": "Multiplied voltage by resistance instead of dividing."},
            {"id": "C", "text": "0.5 Amperes", "misconception_tag": None, "explanation": "Divided resistance by voltage."},
            {"id": "D", "text": "6 Amperes", "misconception_tag": None, "explanation": "Subtracted resistance from voltage."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "Ohm's Law states V = I · R. Rearranging for current: I = V / R = 12 / 6 = 2 Amperes."
    },

    # ==================== COMPUTER SCIENCE ====================
    # --- Variables & Data Types ---
    {
        "subject": "Computer Science",
        "concept_slug": "cs-variables",
        "question_text": "Consider the following code statements executed in sequence:\nx = 10\ny = x\nx = 25\nWhat is the value of variable y?",
        "options": [
            {"id": "A", "text": "10", "misconception_tag": None, "explanation": "Correct! Primitive variable assignment copies the value 10 into y at that moment; later reassigning x does not alter y."},
            {"id": "B", "text": "25", "misconception_tag": "MIS_CS_ASSIGN_VS_EQUAL", "explanation": "Treating assignment as a permanent algebraic equation rather than a one-time memory value transfer."},
            {"id": "C", "text": "35", "misconception_tag": None, "explanation": "Summed both values."},
            {"id": "D", "text": "None / Undefined", "misconception_tag": None, "explanation": "Variables are defined and in scope."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "In imperative programming, `y = x` copies the value (10) stored in `x` into memory location `y`. Reassigning `x = 25` changes only `x`."
    },

    # --- Conditionals & Logic ---
    {
        "subject": "Computer Science",
        "concept_slug": "cs-conditionals",
        "question_text": "Which operator is used to test whether two expressions have equal values, rather than assigning a value to a variable?",
        "options": [
            {"id": "A", "text": "=", "misconception_tag": "MIS_CS_ASSIGN_VS_EQUAL", "explanation": "Single '=' is the assignment operator. Equality comparison requires '=='."},
            {"id": "B", "text": "==", "misconception_tag": None, "explanation": "Correct! '==' evaluates whether left and right operands are equal, returning True or False."},
            {"id": "C", "text": "===", "misconception_tag": None, "explanation": "Triple equals is strictly identity in JS, but '==' is the general equality comparison."},
            {"id": "D", "text": ":=", "misconception_tag": None, "explanation": "Walrus assignment expression in Python."}
        ],
        "correct_option_id": "B",
        "difficulty_level": 1,
        "marks": 2.0,
        "explanation": "The single '=' symbol assigns values to variables. The double '==' operator evaluates boolean equivalence (returns True or False)."
    },
    {
        "subject": "Computer Science",
        "concept_slug": "cs-conditionals",
        "question_text": "What is the boolean result of evaluating: `not (8 > 4 and 3 > 9)`?",
        "options": [
            {"id": "A", "text": "True", "misconception_tag": None, "explanation": "Correct! (8 > 4) is True. (3 > 9) is False. True and False = False. not (False) = True."},
            {"id": "B", "text": "False", "misconception_tag": None, "explanation": "Evaluated the inner expression but forgot the outer 'not' inversion."},
            {"id": "C", "text": "Error", "misconception_tag": None, "explanation": "Expression is syntactically valid boolean logic."},
            {"id": "D", "text": "None", "misconception_tag": None, "explanation": "Boolean expression produces a boolean output."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "Inside parentheses: (8 > 4) is True, (3 > 9) is False. (True and False) is False. Applying 'not': not False = True."
    },

    # --- Loops & Iteration ---
    {
        "subject": "Computer Science",
        "concept_slug": "cs-loops",
        "question_text": "In Python, how many iterations does the loop `for i in range(5):` execute, and what is the last value of i?",
        "options": [
            {"id": "A", "text": "5 iterations; last value is 4", "misconception_tag": None, "explanation": "Correct! range(5) produces sequence [0, 1, 2, 3, 4] — exactly 5 items."},
            {"id": "B", "text": "6 iterations; last value is 5", "misconception_tag": "MIS_CS_OFF_BY_ONE_LOOP", "explanation": "Off-by-one boundary mistake: assuming range(n) includes n."},
            {"id": "C", "text": "4 iterations; last value is 4", "misconception_tag": None, "explanation": "Assumed 1-based indexing."},
            {"id": "D", "text": "5 iterations; last value is 5", "misconception_tag": None, "explanation": "0 to 5 would be 6 elements."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "`range(n)` begins at index 0 and terminates strictly before reaching n. Thus `range(5)` yields 0, 1, 2, 3, 4 (5 total iterations)."
    },

    # --- Functions & Scope ---
    {
        "subject": "Computer Science",
        "concept_slug": "cs-functions",
        "question_text": "What is the return value of a Python function that executes without reaching an explicit `return` statement?",
        "options": [
            {"id": "A", "text": "None", "misconception_tag": None, "explanation": "Correct! All Python functions return `None` by default when no return value is specified."},
            {"id": "B", "text": "0", "misconception_tag": None, "explanation": "C/C++ main return convention, not Python."},
            {"id": "C", "text": "False", "misconception_tag": None, "explanation": "None is the designated empty return sentinel, not False."},
            {"id": "D", "text": "undefined", "misconception_tag": None, "explanation": "JavaScript returns undefined, whereas Python returns None."}
        ],
        "correct_option_id": "A",
        "difficulty_level": 2,
        "marks": 2.0,
        "explanation": "In Python, procedures without a `return` statement implicitly return the special singleton value `None`."
    }
]

# Multi-Step Interactive Lessons Seed
LESSONS_SEED = [
    # ==================== MATHEMATICS ====================
    {
        "concept_slug": "basic-arithmetic",
        "subject": "Mathematics",
        "title": "Order of Operations & Arithmetic Foundations",
        "summary": "Master PEMDAS/BODMAS and signed number calculations with confidence.",
        "content_markdown": "### The Grammar of Mathematics\nArithmetic is the foundational language of all higher mathematics.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Core Principles & The Hierarchy of Operations",
                "badge": "Rules & Definitions",
                "content": "### Why Order Matters\nWithout a standardized order, `4 + 3 × 2` could equal either `14` (if you add first) or `10` (if you multiply first). The universal hierarchy ensures exactly one correct mathematical truth:\n\n1. **P / B**: Parentheses / Brackets first.\n2. **E / O**: Exponents / Orders (powers, roots).\n3. **MD**: Multiplication & Division (evaluated left-to-right).\n4. **AS**: Addition & Subtraction (evaluated left-to-right).",
                "key_takeaway": "Multiplication and Division ALWAYS happen before Addition and Subtraction, unless parentheses override them."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Building a House",
                "badge": "Intuitive Mental Model",
                "content": "### You Cannot Paint Before Bricks Are Laid\nImagine constructing a two-story home:\n- Putting up walls is like Parentheses (essential boundaries).\n- Installing windows and doors is Multiplication/Division.\n- Painting the siding and planting flowers is Addition/Subtraction.\n\nIf you try to paint before putting up walls, the paint splatters on dirt. That is why PEMDAS exists!",
                "key_takeaway": "Mathematical operations have structural dependencies just like construction blueprints."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nEvaluate: `18 - 3 × (4 + 2) ÷ 9`\n\n- **Step 1 (Parentheses)**: Solve `(4 + 2) = 6`.\n  Expression becomes: `18 - 3 × 6 ÷ 9`\n- **Step 2 (Multiplication & Division left-to-right)**:\n  `3 × 6 = 18`\n  Expression becomes: `18 - 18 ÷ 9`\n- **Step 3 (Division)**:\n  `18 ÷ 9 = 2`\n  Expression becomes: `18 - 2`\n- **Step 4 (Subtraction)**:\n  `18 - 2 = 16`.\n\n**Final Answer:** `16`.",
                "key_takeaway": "Work sequentially one operation at a time, rewriting the simplified expression at each line."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Mistakes to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Left-to-Right Blindspot\nA very common error is thinking Multiplication *must* happen before Division. In reality, **Multiplication and Division have EQUAL rank** — you evaluate whichever comes first from left to right!\n\n**Incorrect:** `12 ÷ 3 × 2` -> `12 ÷ 6 = 2` (WRONG!)\n**Correct:** `12 ÷ 3 × 2` -> `4 × 2 = 8` (CORRECT!)",
                "key_takeaway": "Equal rank operations (M/D and A/S) must strictly be processed from left to right."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have unlocked Arithmetic Foundations!\nYou understand operation hierarchy, parentheses overrides, and the left-to-right rule. You are now ready to tackle Fractions and Algebraic Expressions.",
                "key_takeaway": "Test your fluency with the adaptive practice questions below!"
            }
        ],
        "examples_json": [
            {"problem": "Evaluate: 4 + 3 × (8 - 2)", "solution": "Parentheses: 8 - 2 = 6. Multiplication: 3 × 6 = 18. Addition: 4 + 18 = 22."}
        ],
        "real_life_analogy_en": "Think of order of operations like building a house: you cannot paint the roof before laying the foundation bricks!",
        "real_life_analogy_hi": "यह एक घर बनाने जैसा है: आप नींव रखने से पहले छत पर पेंट नहीं कर सकते!",
        "real_life_analogy_mr": "हे घर बांधण्यासारखे आहे: पाया रचल्याशिवाय छताला रंग देता येत नाही!"
    },
    {
        "concept_slug": "fractions",
        "subject": "Mathematics",
        "title": "Fractions: Parts of a Whole and Common Denominators",
        "summary": "Learn why denominators must be harmonized before combining fractional slices.",
        "content_markdown": "### Understanding Numerators & Denominators\nA fraction `a/b` means you have divided a whole into `b` equal pieces, and you hold `a` of those pieces.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Core Principles & The Meaning of Denominators",
                "badge": "Rules & Definitions",
                "content": "### What Does a Fraction Really Mean?\nIn any fraction `a / b`:\n- **Denominator (`b`)**: Tells you **the size of the slices** (how many equal pieces make up one whole unit).\n- **Numerator (`a`)**: Tells you **how many slices you have**.\n\n#### The Golden Law of Addition:\nYou CANNOT add slices of different sizes! Before combining, you must slice them to the exact same size (a Common Denominator).",
                "key_takeaway": "The denominator is the unit of measure. You cannot combine different units without converting them first."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Slicing Pizzas & Currency",
                "badge": "Intuitive Mental Model",
                "content": "### Pizza Slices & Currency Conversion\nImagine you have:\n- 1 giant slice from a pizza cut into 2 halves (`1/2`).\n- 1 smaller slice from a pizza cut into 4 quarters (`1/4`).\n\nIf you say 'I have 2 slices', you are technically counting pieces, but you don't know how much pizza that is! If you cut the half into two quarters (`2/4`), you now have `2/4 + 1/4 = 3/4` of a pizza.\n\n*Just like exchanging Euros and Dollars into a common currency, denominators are the currency of fractions!*",
                "key_takeaway": "Never add denominators straight across. Harmonize them into a common size first."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nCalculate: `2/3 + 1/4`\n\n- **Step 1 (Find LCM of denominators 3 and 4)**:\n  Multiples of 3: 3, 6, 9, **12**, 15\n  Multiples of 4: 4, 8, **12**, 16\n  Common denominator = 12.\n- **Step 2 (Convert each fraction)**:\n  `2/3 × (4/4) = 8/12`\n  `1/4 × (3/3) = 3/12`\n- **Step 3 (Add the numerators)**:\n  `8/12 + 3/12 = (8 + 3) / 12 = 11/12`.\n\n**Final Answer:** `11/12`.",
                "key_takeaway": "Multiply numerator and denominator by the same factor so you multiply by 1 (preserving the value)."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### Trap: Direct Addition (The #1 Math Mistake!)\n`1/2 + 1/4 ≠ 2/6`!\n\nNotice that `2/6` simplifies to `1/3`. If you start with `1/2` a pizza and add more pizza (`1/4`), you cannot end up with less than you started with (`1/3`)! That proves adding denominators straight across violates reality.",
                "key_takeaway": "Always sanity check: the sum of two positive numbers must be greater than either number alone."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have mastered Fraction Arithmetic!\nKey takeaways:\n1. Keep denominators unchanged during addition once equal.\n2. Always simplify the final fraction to lowest terms.\n\nNow, test your skills on the adaptive diagnostic quiz below!",
                "key_takeaway": "Denominators stay the same; only numerators add."
            }
        ],
        "examples_json": [
            {"problem": "Calculate: 1/3 + 1/6", "solution": "LCM is 6. Convert 1/3 to 2/6. 2/6 + 1/6 = 3/6 = 1/2."}
        ],
        "real_life_analogy_en": "You cannot exchange 1 Euro and 1 Dollar directly without converting them to a common currency first. Denominators are the mathematical currency!",
        "real_life_analogy_hi": "समान मुद्रा में बदले बिना आप डॉलर और रुपये को सीधे नहीं जोड़ सकते। हर (Denominator) गणित की मुद्रा है!",
        "real_life_analogy_mr": "समान मूल्यात रूपांतरित केल्याशिवाय तुम्ही थेट हिशोब करू शकत नाही. छेद हे गणिताचे समान चलन आहे!"
    },
    {
        "concept_slug": "basic-algebra",
        "subject": "Mathematics",
        "title": "Basic Algebra: Expressions & Like Terms",
        "summary": "Bridge the gap from numbers to generalized variables and expressions.",
        "content_markdown": "### Variables are Placeholders\nLetters represent quantities that can vary or are currently unknown.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Variables, Coefficients & Like Terms",
                "badge": "Rules & Definitions",
                "content": "### The Anatomy of an Algebraic Term\nIn the term `5x`:\n- `5` is the **coefficient** (how many x's you have).\n- `x` is the **variable** (an unknown value).\n\n#### What are Like Terms?\nTerms that share the **exact same variable and exponent**:\n- `4x` and `9x` are like terms.\n- `3x²` and `5x` are **unlike terms** (different exponents).\n- `7x` and `7` are **unlike terms** (one has a variable, one is a constant).",
                "key_takeaway": "Only like terms can be combined through addition or subtraction."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Fruit Baskets",
                "badge": "Intuitive Mental Model",
                "content": "### Apples, Bananas and Coins\nImagine you have:\n`3 Apples + 2 Bananas + 4 Apples + 5 Coins`\n\nYou combine the apples: `3a + 4a = 7 Apples`.\nYou don't combine apples and bananas into 'apple-bananas'. And you certainly don't combine apples with dollar coins!\n\nAlgebra works the exact same way: `3a + 2b + 4a + 5 = 7a + 2b + 5`.",
                "key_takeaway": "Variables are distinct categories; never crush different variables together into one term."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nSimplify: `5(2x - 3) + 4x + 8`\n\n- **Step 1 (Distribute 5 across parentheses)**:\n  `5 × 2x = 10x`\n  `5 × (-3) = -15`\n  Expression becomes: `10x - 15 + 4x + 8`\n- **Step 2 (Group like variable terms)**:\n  `10x + 4x = 14x`\n- **Step 3 (Group constant terms)**:\n  `-15 + 8 = -7`\n\n**Final Answer:** `14x - 7`.",
                "key_takeaway": "Distribute multiplication across brackets before grouping like terms."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Concatenation Trap\nA frequent error is simplifying `3x + 4` into `7x`.\nNotice: If `x = 2`:\n`3(2) + 4 = 6 + 4 = 10`.\nIf you simplified to `7x`, you'd get `7(2) = 14`! Since 10 ≠ 14, this proves `3x + 4` cannot be joined into `7x`.",
                "key_takeaway": "A constant can never be added to a variable coefficient."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### Congratulations on mastering Like Terms!\nYou are now equipped to balance equations and isolate variables in Linear Equations.",
                "key_takeaway": "Practice your skills below with our AI question generator!"
            }
        ],
        "examples_json": [
            {"problem": "Simplify: 6a + 2b - a + 4b", "solution": "Group: (6a - a) + (2b + 4b) = 5a + 6b."}
        ],
        "real_life_analogy_en": "If you have 3 cats and 2 dogs, you do not have 5 'cat-dogs'. They remain 3c + 2d.",
        "real_life_analogy_hi": "3 बिल्लियाँ और 2 कुत्ते मिलकर 5 'बिल्ली-कुत्ते' नहीं बनते। वे अलग ही रहते हैं: 3b + 2k.",
        "real_life_analogy_mr": "3 मांजरी आणि 2 कुत्रे मिळून 5 एकत्र होत नाहीत. ते स्वतंत्रच राहतात."
    },
    {
        "concept_slug": "linear-equations",
        "subject": "Mathematics",
        "title": "Linear Equations: Balancing & Isolating Variables",
        "summary": "Discover how inverse operations maintain the truth of equality.",
        "content_markdown": "### The Law of the Equals Sign\nWhatever is done to the left side must be mirrored on the right side.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "The Golden Rule of the Equals Sign",
                "badge": "Rules & Definitions",
                "content": "### The Equals Sign is a Sacred Scale\nAn equation is a statement that the left side and right side have exactly the same numerical value.\n\nTo find what `x` is, our goal is **to isolate `x` completely alone on one side**.\n\nTo undo an operation, perform its **inverse**:\n- Undo `+` with `-`\n- Undo `-` with `+`\n- Undo `×` with `÷`\n- Undo `÷` with `×`",
                "key_takeaway": "Every change to the left side must be mirrored with an identical change to the right side."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: The Balance Scale",
                "badge": "Intuitive Mental Model",
                "content": "### The Two-Pan Balance Scale\nPicture an old-fashioned balance scale:\n- Left pan: 2 mystery gift boxes (`2x`) and 6 kg weights.\n- Right pan: 18 kg weights.\n\nThe scale is in perfect balance.\nIf you remove 6 kg from the left pan, the scale tips over! To keep balance, you must remove 6 kg from the right pan too (`18 - 6 = 12 kg`).\n\nNow 2 mystery boxes weigh 12 kg, so each box must weigh 6 kg!",
                "key_takeaway": "Equality is a state of equilibrium; inverse operations maintain balance."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nSolve for x: `4x - 9 = 23`\n\n- **Step 1 (Undo subtraction by adding 9 to both sides)**:\n  `4x - 9 + 9 = 23 + 9`\n  `4x = 32`\n- **Step 2 (Undo multiplication by dividing both sides by 4)**:\n  `4x / 4 = 32 / 4`\n  `x = 8`\n- **Step 3 (Verification / Check)**:\n  Substitute `x = 8`: `4(8) - 9 = 32 - 9 = 23` (Checks out!).\n\n**Final Answer:** `x = 8`.",
                "key_takeaway": "Always substitute your answer back into the original equation to verify."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Mistakes to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Sign Inversion Slip\nWhen moving a term across the equals sign, students often forget to reverse the sign:\n`x + 5 = 12` -> `x = 12 + 5 = 17` (WRONG!)\n`x = 12 - 5 = 7` (CORRECT!)\n\nRemember: You aren't just 'moving' the 5; you are subtracting 5 from both sides.",
                "key_takeaway": "Moving across the equals sign flips positive to negative and vice versa."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You are an Equation Master!\nYou know how to maintain balance and systematically isolate variables. Next up: Quadratic Equations and Parabolas.",
                "key_takeaway": "Ready for your diagnostic check below!"
            }
        ],
        "examples_json": [
            {"problem": "Solve: 4x + 8 = 24", "solution": "Subtract 8: 4x = 16. Divide by 4: x = 4."}
        ],
        "real_life_analogy_en": "Picture two kids balanced on a seesaw. If you hand 2kg to the left kid, you must hand 2kg to the right kid to stay level.",
        "real_life_analogy_hi": "शी-सॉ (झूला) पर संतुलन बनाए रखने के लिए दोनों तरफ बराबर वजन देना पड़ता है।",
        "real_life_analogy_mr": "झोपाळ्यावर समतोल राखण्यासाठी दोन्ही बाजूंना समान वजन ठेवावे लागते."
    },

    # ==================== PHYSICS ====================
    {
        "concept_slug": "kinematics-motion",
        "subject": "Physics",
        "title": "Kinematics: Velocity, Speed & Acceleration",
        "summary": "Master the quantitative description of motion along a straight line.",
        "content_markdown": "### The Language of Motion\nKinematics describes how objects move without worrying about why they move.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Core Definitions: Displacement, Velocity & Acceleration",
                "badge": "Mechanics Fundamentals",
                "content": "### Key Quantities\n- **Displacement (`Δx`)**: Change in position from start to finish (vector, can be negative).\n- **Velocity (`v`)**: Rate of change of position: `v = Δx / Δt` (has speed AND direction).\n- **Acceleration (`a`)**: Rate of change of velocity: `a = Δv / Δt` (in m/s²).\n\nAn object accelerates whenever its speed changes OR its direction changes!",
                "key_takeaway": "Acceleration is NOT how fast you are moving; it is how fast your velocity is CHANGING."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: The Car's Speedometer vs Accelerator",
                "badge": "Intuitive Mental Model",
                "content": "### Speedometer vs Gas Pedal\n- Your **speedometer** shows instantaneous speed (e.g. 60 km/h).\n- The **gas pedal** (accelerator) is what changes that number.\n\nEven when your car is stopped at a red light (`velocity = 0`), the moment you slam the gas pedal, you have maximum acceleration before you even move!",
                "key_takeaway": "Velocity and acceleration can be completely different values at the exact same instant."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nA rocket starts from rest (`u = 0 m/s`) and accelerates uniformly at `4 m/s²` for `5 seconds`. Calculate its final velocity and distance traveled.\n\n- **Step 1 (Final Velocity using v = u + at)**:\n  `v = 0 + (4)(5) = 20 m/s`.\n- **Step 2 (Distance using s = ut + 0.5at²)**:\n  `s = 0(5) + 0.5(4)(5²)`\n  `s = 0.5(4)(25) = 2(25) = 50 meters`.\n\n**Final Answer:** Velocity = 20 m/s; Distance = 50 meters.",
                "key_takeaway": "Identify known variables (u, v, a, t, s) and select the kinematic equation that contains your target variable."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Peak Height Velocity Trap\nWhen an object is thrown vertically upwards, at the apex:\n`v = 0 m/s` (it stops momentarily).\nStudents often mistakenly conclude: `acceleration = 0`.\n\n**Reality:** If acceleration were 0 at the top, the ball would freeze and float in the air forever! Gravity continues pulling at `9.8 m/s² downward`.",
                "key_takeaway": "Zero velocity does NOT mean zero acceleration."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have mastered 1D Kinematics!\nYou understand vectors, rate of change, and the kinematic equations. You are ready to explore Newton's Laws of Motion.",
                "key_takeaway": "Proceed to the practice quiz below to test your kinematic mastery."
            }
        ],
        "examples_json": [
            {"problem": "A car accelerates from 10 m/s to 30 m/s in 4s. Find acceleration.", "solution": "a = (30 - 10) / 4 = 20 / 4 = 5 m/s²."}
        ],
        "real_life_analogy_en": "Your speedometer tells you your velocity; your gas pedal controls your acceleration.",
        "real_life_analogy_hi": "स्पीडोमीटर गति बताता है और एक्सीलरेटर यह तय करता है कि गति कितनी तेज़ी से बदल रही है।",
        "real_life_analogy_mr": "स्पीडोमीटर वेग दर्शवतो तर प्रवेगक वेगातील बदलाचा दर ठरवतो."
    },
    {
        "concept_slug": "newtons-laws",
        "subject": "Physics",
        "title": "Newton's Laws & Forces: The Mechanics of Motion",
        "summary": "Understand inertia, F = ma, and why forces always occur in matched interaction pairs.",
        "content_markdown": "### The Foundations of Classical Mechanics\nSir Isaac Newton's three laws connect forces to observed motion.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "The Three Laws of Motion",
                "badge": "Rules & Definitions",
                "content": "### Newton's Three Pillars\n1. **First Law (Inertia)**: An object remains at rest or at constant velocity unless acted upon by a net external force.\n2. **Second Law (F = ma)**: Acceleration is directly proportional to net force and inversely proportional to mass: `F_net = m · a`.\n3. **Third Law (Action-Reaction)**: Whenever object A exerts a force on object B, object B exerts an equal and opposite force on object A.",
                "key_takeaway": "Net force causes acceleration, NOT velocity."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Riding a City Bus",
                "badge": "Intuitive Mental Model",
                "content": "### Why You Stumble When the Bus Brakes\nWhen standing inside a moving bus, your body moves at 40 km/h with the bus.\n- When the driver slams the brakes, the bus slows down, but your body wants to keep moving forward at 40 km/h!\n- No ghost pushed you forward; that is your own **inertia**.\n- Newton's First Law explains why seatbelts save lives.",
                "key_takeaway": "Inertia is the natural tendency of mass to resist any change in its velocity."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nA 1200 kg car accelerates at `2.5 m/s²`. If air resistance and friction opposing the car total `500 N`, what forward thrust must the engine produce?\n\n- **Step 1 (Calculate required net force)**:\n  `F_net = m · a = (1200 kg)(2.5 m/s²) = 3000 N`.\n- **Step 2 (Set up net force equation)**:\n  `F_net = F_engine - F_friction`\n  `3000 N = F_engine - 500 N`\n- **Step 3 (Solve for engine thrust)**:\n  `F_engine = 3000 + 500 = 3500 N`.\n\n**Final Answer:** `3500 N`.",
                "key_takeaway": "Always draw a free body diagram and equate F_net to m*a."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Aristotelian Fallacy (Force = Motion)\nMany students intuitively believe that to keep an object moving at constant speed, you must continually push it.\n\n**The Truth:** On Earth, things slow down only because of hidden friction and air resistance. In deep space or on frictionless ice, an object travels forever with `ZERO net force`!",
                "key_takeaway": "No force is required to sustain steady velocity; force is only required to CHANGE velocity."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have conquered Newton's Laws!\nYou can now model forces, predict accelerations, and decouple friction from true equilibrium.",
                "key_takeaway": "Test your grasp on force vectors with the interactive questions below."
            }
        ],
        "examples_json": [
            {"problem": "A 5kg block is pushed with 30N. Find acceleration.", "solution": "a = F/m = 30 / 5 = 6 m/s²."}
        ],
        "real_life_analogy_en": "You lurch forward on a braking bus not because a force pushes you, but because your body wants to keep moving at its previous speed.",
        "real_life_analogy_hi": "बस के अचानक रुकने पर आप आगे इसलिए झुकते हैं क्योंकि आपका शरीर अपनी पुरानी गति को बनाए रखना चाहता है (जड़त्व)।",
        "real_life_analogy_mr": "बस अचानक थांबल्यावर तुम्ही पुढे झुकता कारण तुमच्या शरीराचे जडत्व आधीचा वेग कायम ठेवू पाहते."
    },

    # ==================== COMPUTER SCIENCE ====================
    {
        "concept_slug": "cs-variables",
        "subject": "Computer Science",
        "title": "Variables, Data Types & Memory Storage",
        "summary": "Understand memory allocation, primitive types, and variable assignment.",
        "content_markdown": "### The Storage Cells of Code\nVariables store values in computer memory so programs can compute and transform data.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Memory Boxes and Data Types",
                "badge": "Programming Fundamentals",
                "content": "### What is a Variable?\nA variable is a labeled container in memory holding a specific value.\n\n#### Core Data Types:\n- **Integers (`int`)**: Whole numbers like `42`, `-7`.\n- **Floats (`float`)**: Decimal numbers like `3.1415`, `0.5`.\n- **Strings (`str`)**: Text enclosed in quotes like `\"Hello\"`.\n- **Booleans (`bool`)**: Binary truth values: `True` or `False`.",
                "key_takeaway": "Variables allow programs to dynamically store, update, and reuse data."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Labeled Storage Boxes",
                "badge": "Intuitive Mental Model",
                "content": "### Shoe Boxes with Sticky Notes\nImagine clear shoe boxes on a shelf:\n- You stick a label on one box reading `'score'`.\n- You drop a slip of paper inside with the number `100`.\n- Later, when the player earns points, you replace that slip of paper with `150`.\n\nThe label `'score'` never changes; only what is sitting inside the box changes!",
                "key_takeaway": "A variable name is just the label on the box; the value is what is currently inside."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nTrace memory values line by line:\n```python\na = 5\nb = 3\na = a + b\nb = a - b\n```\nWhat are the values of `a` and `b` at the end?\n\n- **Line 1**: `a` stores `5`.\n- **Line 2**: `b` stores `3`.\n- **Line 3**: `a = 5 + 3 = 8`. Now `a` stores `8`.\n- **Line 4**: `b = 8 - 3 = 5`. Now `b` stores `5`.\n\n**Final Result:** `a = 8`, `b = 5` (Notice this swapped b's original value!).",
                "key_takeaway": "Assignment evaluates the right-hand side first, then stores the result into the left variable."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Algebraic Equality Fallacy\nIn math, `x = x + 1` is an impossible equation (no number equals itself plus one).\n\nIn computer science, `=` is NOT equality; it is the **Assignment Operator**! It means: *'Take the current value of x, add 1 to it, and overwrite memory x with this new value'*.",
                "key_takeaway": "Always read '=' as 'becomes' or 'is assigned with', not 'is equal to'."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have mastered Variables and Types!\nYou can trace memory states and understand type systems. Up next: Conditionals and Control Flow.",
                "key_takeaway": "Take the diagnostic check below to solidify your variable comprehension."
            }
        ],
        "examples_json": [
            {"problem": "What is the type of 3.0 in Python?", "solution": "float (floating point decimal number)."}
        ],
        "real_life_analogy_en": "A variable is like a labeled shoebox in a closet; you can swap whatever item is inside at any time.",
        "real_life_analogy_hi": "वेरिएबल एक लेबल लगे डिब्बे जैसा है जिसमें आप जब चाहें अंदर का सामान बदल सकते हैं।",
        "real_life_analogy_mr": "व्हेरिएबल म्हणजे एका लेबल केलेल्या पेटीसारखे आहे, ज्यातील वस्तू तुम्ही कधीही बदलू शकता."
    },
    {
        "concept_slug": "cs-conditionals",
        "subject": "Computer Science",
        "title": "Conditionals & Logic: If-Else Branching",
        "summary": "Master boolean expressions, decision trees, and short-circuit evaluation.",
        "content_markdown": "### The Forks in the Road\nConditionals allow code to make decisions and execute different paths based on runtime data.",
        "steps_json": [
            {
                "step_number": 1,
                "title": "Boolean Logic and If-Elif-Else Branching",
                "badge": "Programming Fundamentals",
                "content": "### Decision Making in Code\nPrograms use conditional statements to choose which instructions to execute:\n```python\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelse:\n    grade = 'C'\n```\nBranches evaluate sequentially. The first condition that produces `True` executes its block, and all remaining branches are skipped!",
                "key_takeaway": "Code branches are mutually exclusive; once one condition is met, others are ignored."
            },
            {
                "step_number": 2,
                "title": "Real-World Analogy: Train Track Switches",
                "badge": "Intuitive Mental Model",
                "content": "### Train Railway Switches\nPicture a train approaching a rail junction:\n- If the switch is set to track A, the train diverts to Track A.\n- It cannot simultaneously travel down Track A and Track B.\n- `if-else` statements are the railway switches of software engineering.",
                "key_takeaway": "Conditionals redirect the execution path of the computer's instruction pointer."
            },
            {
                "step_number": 3,
                "title": "Step-by-Step Worked Problem",
                "badge": "Worked Solution",
                "content": "### Problem:\nEvaluate what this code prints:\n```python\nage = 16\nhas_permit = True\nif age >= 18:\n    print('Can drive solo')\nelif age >= 16 and has_permit:\n    print('Can drive with supervisor')\nelse:\n    print('Cannot drive')\n```\n\n- **Check 1 (`age >= 18`)**: `16 >= 18` is `False`. Branch skipped.\n- **Check 2 (`age >= 16 and has_permit`)**: `16 >= 16` is `True`. `has_permit` is `True`. `True and True` = `True`!\n- This block executes.\n\n**Output:** `'Can drive with supervisor'`.",
                "key_takeaway": "Combine logical conditions using `and` (both must be true) or `or` (at least one must be true)."
            },
            {
                "step_number": 4,
                "title": "Common Pitfalls & Misconceptions to Avoid",
                "badge": "Cognitive Traps",
                "content": "### The Double-Equals vs Single-Equals Trap\nIn programming:\n- `if x = 5:` -> **SYNTAX ERROR** (or accidental assignment)!\n- `if x == 5:` -> **CORRECT** comparison.\n\nSingle `=` writes data to memory; double `==` inspects data in memory.",
                "key_takeaway": "Never use single '=' inside an 'if' condition."
            },
            {
                "step_number": 5,
                "title": "Concept Mastery Check & Next Steps",
                "badge": "Checkpoint",
                "content": "### You have mastered Boolean Logic and Conditionals!\nYou understand branching and operator precedence. Next up: Loops and Iteration.",
                "key_takeaway": "Try the interactive diagnostic check below to test your conditional mastery."
            }
        ],
        "examples_json": [
            {"problem": "What is the result of not(True or False)?", "solution": "True or False is True. not True is False."}
        ],
        "real_life_analogy_en": "Conditionals are like train switches that guide the train down one specific track while locking off the others.",
        "real_life_analogy_hi": "कंडीशनल्स रेलवे ट्रैक के स्विच जैसे हैं जो ट्रेन को एक सही दिशा में मोड़ते हैं।",
        "real_life_analogy_mr": "कंडिशनल्स म्हणजे रेल्वेच्या ट्रॅकवरील स्विचसारखे आहेत जे गाडीला एका विशिष्ट मार्गावर नेतात."
    }
]

def seed_database(db: Session):
    """Executes idempotent multi-subject database seeding."""
    # 1. Seed Concepts across Math, Physics, and Computer Science
    for c_node in CONCEPT_NODES:
        existing = db.query(models.Concept).filter(models.Concept.slug == c_node["slug"]).first()
        if not existing:
            c = models.Concept(
                slug=c_node["slug"],
                name=c_node["name"],
                subject=c_node.get("subject", "Mathematics"),
                category=c_node["category"],
                description=c_node["description"],
                difficulty=c_node["difficulty"],
                prerequisites=c_node["prerequisites"],
                order_index=c_node["order"]
            )
            db.add(c)
        else:
            # Update subject and metadata if changed
            existing.subject = c_node.get("subject", "Mathematics")
            existing.name = c_node["name"]
            existing.category = c_node["category"]
            existing.description = c_node["description"]
            existing.difficulty = c_node["difficulty"]
            existing.prerequisites = c_node["prerequisites"]
            existing.order_index = c_node["order"]
    db.commit()

    # 2. Seed Misconceptions Catalog
    for code, m_data in MISCONCEPTION_CATALOG.items():
        existing = db.query(models.Misconception).filter(models.Misconception.code == code).first()
        if not existing:
            m = models.Misconception(
                code=code,
                concept_slug=m_data["concept_slug"],
                name=m_data["name"],
                description=m_data["description"],
                explanation_en=m_data["explanation_en"],
                explanation_hi=m_data.get("explanation_hi"),
                explanation_mr=m_data.get("explanation_mr"),
                remedial_lesson=m_data.get("remedial_lesson"),
                prerequisite_gap_slug=m_data.get("prerequisite_gap_slug")
            )
            db.add(m)
        else:
            existing.concept_slug = m_data["concept_slug"]
            existing.name = m_data["name"]
            existing.description = m_data["description"]
            existing.explanation_en = m_data["explanation_en"]
            existing.explanation_hi = m_data.get("explanation_hi")
            existing.explanation_mr = m_data.get("explanation_mr")
            existing.remedial_lesson = m_data.get("remedial_lesson")
            existing.prerequisite_gap_slug = m_data.get("prerequisite_gap_slug")
    db.commit()

    # 3. Seed Lessons with 5-Step Navigation
    for l_data in LESSONS_SEED:
        existing = db.query(models.Lesson).filter(models.Lesson.concept_slug == l_data["concept_slug"]).first()
        if not existing:
            l = models.Lesson(
                concept_slug=l_data["concept_slug"],
                subject=l_data.get("subject", "Mathematics"),
                title=l_data["title"],
                summary=l_data["summary"],
                content_markdown=l_data["content_markdown"],
                steps_json=l_data.get("steps_json", []),
                examples_json=l_data.get("examples_json", []),
                real_life_analogy_en=l_data.get("real_life_analogy_en"),
                real_life_analogy_hi=l_data.get("real_life_analogy_hi"),
                real_life_analogy_mr=l_data.get("real_life_analogy_mr")
            )
            db.add(l)
        else:
            existing.subject = l_data.get("subject", "Mathematics")
            existing.title = l_data["title"]
            existing.summary = l_data["summary"]
            existing.content_markdown = l_data["content_markdown"]
            existing.steps_json = l_data.get("steps_json", [])
            existing.examples_json = l_data.get("examples_json", [])
            existing.real_life_analogy_en = l_data.get("real_life_analogy_en")
            existing.real_life_analogy_hi = l_data.get("real_life_analogy_hi")
            existing.real_life_analogy_mr = l_data.get("real_life_analogy_mr")
    db.commit()

    # 4. Seed Questions
    saved_q_ids_by_subject = {"Mathematics": [], "Physics": [], "Computer Science": []}
    for q_data in QUESTIONS_SEED:
        q_subj = q_data.get("subject", "Mathematics")
        existing = db.query(models.Question).filter(
            models.Question.question_text == q_data["question_text"]
        ).first()
        if not existing:
            q = models.Question(
                subject=q_subj,
                concept_slug=q_data["concept_slug"],
                question_text=q_data["question_text"],
                options=q_data["options"],
                correct_option_id=q_data["correct_option_id"],
                difficulty_level=q_data["difficulty_level"],
                marks=q_data["marks"],
                explanation=q_data["explanation"]
            )
            db.add(q)
            db.flush()
            saved_q_ids_by_subject[q_subj].append(q.id)
        else:
            existing.subject = q_subj
            existing.concept_slug = q_data["concept_slug"]
            existing.options = q_data["options"]
            existing.correct_option_id = q_data["correct_option_id"]
            existing.difficulty_level = q_data["difficulty_level"]
            existing.marks = q_data["marks"]
            existing.explanation = q_data["explanation"]
            saved_q_ids_by_subject[q_subj].append(existing.id)
    db.commit()

    # 5. Seed Dev Teacher Account
    teacher = db.query(models.User).filter(models.User.email == "teacher@conceptclear.ai").first()
    if not teacher:
        teacher = models.User(
            email="teacher@conceptclear.ai",
            full_name="Dr. Sarah Jenkins",
            hashed_password=hash_password("Teacher@123"),
            role="teacher",
            academic_level="Class 10",
            preferred_language="en",
            school="Apex International Academy",
            subject_taught="Mathematics",
            is_approved=True
        )
        db.add(teacher)
        db.commit()
        db.refresh(teacher)

    # 6. Seed Demo Student Account
    student = db.query(models.User).filter(models.User.email == "student@conceptclear.ai").first()
    if not student:
        student = models.User(
            email="student@conceptclear.ai",
            full_name="Aarav Sharma",
            hashed_password=hash_password("Student@123"),
            role="student",
            academic_level="Class 10",
            preferred_language="en",
            school="Apex International Academy",
            is_approved=True
        )
        db.add(student)
        db.commit()
        db.refresh(student)

        # Realistic student mastery across subjects
        initial_masteries = {
            "basic-arithmetic": (0.85, 12, 11),
            "fractions": (0.35, 6, 2), # Root gap!
            "decimals": (0.78, 8, 7),
            "ratios": (0.60, 5, 3),
            "basic-algebra": (0.42, 7, 3),
            "linear-equations": (0.30, 5, 1),
            "quadratic-equations": (0.15, 2, 0),
            "kinematics-motion": (0.65, 8, 5),
            "newtons-laws": (0.35, 6, 2), # Physics gap!
            "work-energy": (0.50, 4, 2),
            "electric-circuits": (0.20, 3, 1),
            "cs-variables": (0.80, 10, 8),
            "cs-conditionals": (0.40, 6, 2), # CS gap!
            "cs-loops": (0.25, 4, 1),
            "cs-functions": (0.15, 2, 0)
        }
        for slug, (m_val, tot, corr) in initial_masteries.items():
            db.add(models.StudentMastery(
                student_id=student.id,
                concept_slug=slug,
                estimated_mastery=m_val,
                total_attempts=tot,
                correct_attempts=corr
            ))
        
        # Log sample past misconceptions to demonstrate learning-gap tracking
        math_q_ids = saved_q_ids_by_subject["Mathematics"]
        if math_q_ids:
            db.add(models.MisconceptionLog(
                student_id=student.id,
                concept_slug="fractions",
                question_id=math_q_ids[0],
                misconception_code="MIS_FRAC_ADD_NUM_DEN",
                chosen_option_id="A",
                confidence="Medium",
                context="Student answered 2/6 for 1/2 + 1/4"
            ))
        db.commit()

    # 7. Seed Multi-Subject Formal Tests (with release_results=False so mistakes are withheld!)
    now = datetime.utcnow()
    
    # Check or seed Mathematics Test
    math_test = db.query(models.Test).filter(models.Test.title == "Algebra & Fractions Diagnostic Benchmark").first()
    math_q_ids = saved_q_ids_by_subject["Mathematics"][:5] if saved_q_ids_by_subject["Mathematics"] else []
    if not math_test:
        math_test = models.Test(
            teacher_id=teacher.id,
            title="Algebra & Fractions Diagnostic Benchmark",
            description="Assesses core mastery across fractions, like terms, and linear balance equations.",
            instructions="Strictly proctored. Switching tabs or windows triggers audit logs. Mistake keys are withheld per examination policies.",
            subject="Mathematics",
            target_class="Class 10",
            duration_minutes=25,
            total_marks=10.0,
            negative_marking=0.5,
            start_time=now - timedelta(hours=2),
            end_time=now + timedelta(days=2),
            is_published=True,
            is_cancelled=False,
            enable_tab_monitoring=True,
            tab_switch_threshold=3,
            allow_retake=False,
            release_results=False, # Formal exam: mistakes withheld!
            question_ids=math_q_ids
        )
        db.add(math_test)
    else:
        math_test.release_results = False

    # Check or seed Physics Test
    phys_test = db.query(models.Test).filter(models.Test.title == "Newtonian Mechanics & Kinematics Assessment").first()
    phys_q_ids = saved_q_ids_by_subject["Physics"]
    if not phys_test:
        phys_test = models.Test(
            teacher_id=teacher.id,
            title="Newtonian Mechanics & Kinematics Assessment",
            description="Evaluates deep conceptual grasp of Newton's laws, instantaneous acceleration, and work-energy principles.",
            instructions="Proctored exam. Show clear logical deduction. Results and mistake breakdowns are withheld by the instructor.",
            subject="Physics",
            target_class="Class 10",
            duration_minutes=30,
            total_marks=10.0,
            negative_marking=0.0,
            start_time=now - timedelta(hours=1),
            end_time=now + timedelta(days=3),
            is_published=True,
            is_cancelled=False,
            enable_tab_monitoring=True,
            tab_switch_threshold=3,
            allow_retake=False,
            release_results=False, # Formal exam: mistakes withheld!
            question_ids=phys_q_ids
        )
        db.add(phys_test)
    else:
        phys_test.release_results = False

    # Check or seed Computer Science Test
    cs_test = db.query(models.Test).filter(models.Test.title == "Programming Logic & Control Flow Exam").first()
    cs_q_ids = saved_q_ids_by_subject["Computer Science"]
    if not cs_test:
        cs_test = models.Test(
            teacher_id=teacher.id,
            title="Programming Logic & Control Flow Exam",
            description="Benchmarks variables, boolean branching, equality operators, and iteration bounds.",
            instructions="Closed-book proctored examination. Answers and solutions are withheld until teacher review.",
            subject="Computer Science",
            target_class="Class 10",
            duration_minutes=20,
            total_marks=10.0,
            negative_marking=0.25,
            start_time=now - timedelta(minutes=30),
            end_time=now + timedelta(days=3),
            is_published=True,
            is_cancelled=False,
            enable_tab_monitoring=True,
            tab_switch_threshold=3,
            allow_retake=False,
            release_results=False, # Formal exam: mistakes withheld!
            question_ids=cs_q_ids
        )
        db.add(cs_test)
    else:
        cs_test.release_results = False

    db.commit()
