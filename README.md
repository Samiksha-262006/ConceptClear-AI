# ConceptClear AI
> **"Understand the gap. Master the concept."**
> AI-Powered Personalised Learning Through Learning-Gap Detection

Built for the **Prometheus Hackathon**.

---

## 🌟 Executive Summary & Problem Statement

Traditional educational platforms treat student mistakes superficially: an answer is simply marked "correct" or "incorrect", with a generic score percentage displayed. This ignores the cognitive reality of learning: **students rarely make random mistakes.** 

Instead, errors almost always trace back to:
1. **Specific cognitive misconceptions** (e.g. adding fraction numerators and denominators straight across: $\frac{1}{2} + \frac{1}{4} = \frac{2}{6}$).
2. **Unmastered prerequisite concepts** (e.g. failing Linear Equations not because of algebra, but because of a hidden arithmetic fraction-addition gap).

**ConceptClear AI** is a complete, full-stack, responsive educational platform that:
- **Identifies the likely root cause of student mistakes** through cognitive distractor analysis.
- **Traces prerequisite bottlenecks** through a NetworkX-powered concept dependency graph.
- **Dynamically tracks latent concept mastery** using Bayesian Knowledge Tracing (BKT).
- **Adapts practice difficulty and recommends prerequisite lessons** in real time.
- **Provides a conversational AI Tutor** with real-world analogies, worked examples, and English, Hindi, and Marathi multilingual support.
- **Delivers a time-gated Examination Suite** with **Tab-Switch & Focus-Loss Alert Monitoring** using the browser Page Visibility API.
- **Empowers teachers with classroom-wide learning-gap heatmaps** and audit trails.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide React, Custom CSS Design System, SVG Dynamic Dependency DAG, Google Fonts (Plus Jakarta Sans & Inter) |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | SQLite (zero-config local storage, structured for 1-click migration to PostgreSQL) |
| **AI & Learning Analytics** | Distractor-Cognitive Pattern Matcher, Bayesian Knowledge Tracing (BKT: $P(L_0), P(T), P(S), P(G)$), NetworkX Concept DAG, Multilingual AI Tutor Engine |
| **Proctoring** | Page Visibility API + Window Blur tracking with real-time server persistence |
| **Authentication** | PBKDF2-HMAC-SHA256 salted password hashing, JWT bearer tokens, role-based route guards |

---

## 📂 Project Architecture

```
conceptclear-ai/
├── frontend/
│   ├── index.html               # High-converting SaaS landing page
│   ├── student-login.html       # Student sign-in with 1-click demo button
│   ├── student-register.html    # Student registration with grade & language
│   ├── teacher-login.html       # Teacher sign-in with 1-click demo button
│   ├── teacher-register.html    # Teacher registration with verification notice
│   ├── student-dashboard.html   # Mastery ring, Chart.js streak, recommendations
│   ├── teacher-dashboard.html   # Test scheduler, classroom heatmaps, audit modal
│   ├── learn.html               # Interactive lesson viewer, worked examples & AI Tutor
│   ├── concept-map.html         # Interactive SVG dependency graph & detail drawer
│   ├── tests.html               # Student test catalog (Upcoming, Available, Completed)
│   ├── test-attempt.html        # Proctored exam room with tab-switch alert system
│   ├── analytics.html           # Radar charts, BKT probability bars, misconception log
│   ├── profile.html             # Account settings & language preference switcher
│   ├── css/
│   │   ├── style.css            # Master design system & CSS custom properties
│   │   ├── auth.css             # Split-screen auth styling & password reveal
│   │   ├── dashboard.css        # Sidebar, topbar, KPI cards, SVG mastery ring
│   │   └── test.css             # Examination layout, question palette, warning modal
│   └── js/
│       ├── app.js               # Auth helpers, fetchWithAuth, toasts, i18n dictionary
│       ├── auth.js              # Auth form submissions & quick demo fillers
│       ├── student.js           # Student KPIs, Chart.js progress, active tests
│       ├── teacher.js           # Teacher analytics, test creation, audit modal, CSV
│       ├── learning.js          # Lessons reader, AI Tutor chat, adaptive quiz
│       ├── tests.js             # Tests catalog tabs & review modal
│       ├── test-attempt.js      # Countdown timer, auto-save, Page Visibility alerts
│       └── analytics.js         # Radar chart, BKT chart, misconception history
├── backend/
│   ├── main.py                  # FastAPI app, route controllers, static file mounting
│   ├── database.py              # SQLAlchemy engine & SQLite session provider
│   ├── models.py                # Database models (User, Concept, Test, Attempt, etc.)
│   ├── schemas.py               # Pydantic request & response validation schemas
│   ├── auth.py                  # Password hashing & JWT token generation
│   ├── knowledge_graph.py       # NetworkX concept dependency DAG & bottleneck finder
│   ├── learning_engine.py       # Bayesian Knowledge Tracing & adaptive question selector
│   ├── misconception_detector.py# Distractor pattern analyzer & evidence confidence tiers
│   ├── test_engine.py           # Time-gating, server grading, tab-switch monitoring
│   ├── analytics.py             # Student mastery summaries & classroom aggregations
│   ├── tutor_engine.py          # Multilingual AI Tutor with rule-based fallback
│   ├── seed_data.py             # Comprehensive question bank & demo account seeder
│   └── requirements.txt         # Python package dependencies
├── .env.example                 # Environment configuration template
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

---

## 🔑 Pre-Configured Demo Credentials (Instant Hackathon Evaluation)

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Verified Teacher** | `teacher@conceptclear.ai` | `Teacher@123` | Schedule exams, set tab-switch thresholds, export CSV, inspect classroom-wide concept gaps |
| **Demo Student** | `student@conceptclear.ai` | `Student@123` | Class 10 student with pre-seeded diagnostic attempts, active tests, and concept mastery |

*Note: 1-click **"Auto-Fill"** buttons are available on both login pages for effortless judging!*

---

## 🧠 AI & Cognitive Analytics Methodology

### 1. Distractor Misconception Diagnosis
Every question in the question bank has each incorrect distractor mapped to a specific cognitive misconception code:
- `MIS_FRAC_ADD_NUM_DEN`: Direct addition of numerators and denominators without finding a common denominator ($\frac{1}{2} + \frac{1}{4} = \frac{2}{6}$).
- `MIS_ALG_SIGN_FLIP`: Forgetting to invert sign during term transposition across the equals sign ($x + 5 = 12 \rightarrow x = 12 + 5$).
- `MIS_ALG_LIKE_TERMS_CONCAT`: Treating unlike terms as combinable ($2x + 3 = 5x$).
- `MIS_DEC_PLACE_VALUE_IGNORED`: Treating digits after a decimal point as whole numbers ($0.45 > 0.7$).
- `MIS_QUAD_SQUARE_ROOT_SIGN`: Omitting negative root when taking square roots ($x^2 = 25 \rightarrow x = 5$ only).
- `MIS_RATIO_ADDITIVE_SCALING`: Using additive instead of multiplicative scaling in proportions.

**Evidence Levels:**
- 1 occurrence: *"Possible misconception (Initial observation)"* — Low confidence.
- 2 occurrences: *"Likely misconception (Repeated pattern)"* — Medium confidence.
- 3+ occurrences: *"Persistent misconception (Confirmed pattern)"* — High confidence.

### 2. Bayesian Knowledge Tracing (BKT)
Student mastery is updated after each quiz response using the standard Bayesian update equations:

$$P(L_t | \text{correct}) = \frac{P(L_t)(1 - S)}{P(L_t)(1 - S) + (1 - P(L_t))G}$$

$$P(L_t | \text{incorrect}) = \frac{P(L_t)S}{P(L_t)S + (1 - P(L_t))(1 - G)}$$

Accounting for learning transition to the next opportunity:
$$P(L_{t+1}) = P(L_t | \text{obs}) + (1 - P(L_t | \text{obs})) \cdot T$$

Where:
- $P(L_0) = 0.20$ (Prior belief of initial mastery)
- $T = 0.15$ (Probability of learning transit per exercise)
- $S = 0.10$ (Slip probability — knowing the concept but making a careless error)
- $G = 0.25$ (Guess probability — guessing correctly without mastery)

### 3. Concept Dependency Graph & NetworkX
Concepts form a Directed Acyclic Graph (DAG):
`Basic Arithmetic` $\rightarrow$ `Fractions` $\rightarrow$ `Basic Algebra` $\rightarrow$ `Linear Equations` $\rightarrow$ `Quadratic Equations`
`Basic Arithmetic` $\rightarrow$ `Decimals` $\rightarrow$ `Ratios`

When a student struggles on an advanced topic (e.g. Linear Equations), `find_root_cause_bottleneck()` performs a reverse topological traversal through all ancestral prerequisites to detect the foundational gap (e.g., Fractions mastery $< 45\%$) and directs the student to the root remedial lesson!

---

## 🛡️ Examination Proctoring & Tab-Switch Alert System

During tests on `test-attempt.html`:
1. The system displays a clear notice: *"Test monitoring is active. Switching tabs or leaving the test window may be recorded."*
2. Uses the **Page Visibility API** (`document.visibilityState === 'hidden'`) and `window.blur` events.
3. Every focus loss triggers:
   - Live backend event log (`POST /api/tests/tab-switch/{attempt_id}`) with timestamp.
   - On-screen warning modal:
     - **Warning 1:** *"Warning 1: You switched away from the test. Please remain on the test page."*
     - **Warning 2:** *"Warning 2: Another tab switch has been detected. Please continue your test without switching tabs."*
     - **Warning 3+:** *"Additional focus changes have been recorded. Your teacher may review this activity."*
   - Automatic flagging if violations meet the teacher-configured threshold.
4. The teacher dashboard provides an audit log detailing every student's timestamped focus changes and enables CSV export.

---

## 🚀 Running the Application Locally

### 1. Start the FastAPI Application
From the workspace root directory:
```powershell
C:\Users\LENOVO\python311\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

### 2. Access the Application
Open your browser and navigate to:
```
http://127.0.0.1:8000/
```
The FastAPI backend serves the frontend static pages directly:
- **Landing Page:** `http://127.0.0.1:8000/`
- **Student Login:** `http://127.0.0.1:8000/student-login.html`
- **Student Dashboard:** `http://127.0.0.1:8000/student-dashboard.html`
- **Teacher Login:** `http://127.0.0.1:8000/teacher-login.html`
- **Teacher Dashboard:** `http://127.0.0.1:8000/teacher-dashboard.html`
- **Learn & AI Tutor:** `http://127.0.0.1:8000/learn.html`
- **Concept Map:** `http://127.0.0.1:8000/concept-map.html`
- **Tests Catalog:** `http://127.0.0.1:8000/tests.html`
- **Learning Analytics:** `http://127.0.0.1:8000/analytics.html`
