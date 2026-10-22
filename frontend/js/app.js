/**
 * ConceptClear AI - Universal Client Engine
 * Handles authentication headers, session management, toast alerts,
 * multilingual translations (English, Hindi, Marathi), and Lucide icons.
 */

const API_BASE = '/api';

// --- Authentication & Session Storage ---

function getToken() {
  return localStorage.getItem('conceptclear_token');
}

function getUser() {
  const u = localStorage.getItem('conceptclear_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem('conceptclear_token', token);
  localStorage.setItem('conceptclear_user', JSON.stringify(user));
  if (user.preferred_language) {
    localStorage.setItem('conceptclear_lang', user.preferred_language);
  }
}

function clearSession() {
  localStorage.removeItem('conceptclear_token');
  localStorage.removeItem('conceptclear_user');
}

function logout() {
  const user = getUser();
  const isTeacher = user && user.role === 'teacher';
  clearSession();
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = isTeacher ? '/teacher-login.html' : '/student-login.html';
  }, 400);
}

// --- Protected HTTP Client ---

async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      clearSession();
      // Only redirect if on a protected page
      const path = window.location.pathname;
      if (path.includes('dashboard') || path.includes('test') || path.includes('learn') || path.includes('analytics')) {
        showToast('Session expired. Please log in again.', 'warning');
        setTimeout(() => {
          window.location.href = path.includes('teacher') ? '/teacher-login.html' : '/student-login.html';
        }, 800);
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

// --- Animated Toast Notifications ---

function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: 'check-circle',
    error: 'alert-triangle',
    warning: 'alert-circle',
    info: 'info'
  };

  toast.innerHTML = `
    <i data-lucide="${iconMap[type] || 'info'}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
    <div style="flex: 1; font-size: 0.9rem; font-weight: 500;">${message}</div>
  `;

  container.appendChild(toast);
  renderLucideIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- Multilingual UI Dictionary (English, Hindi, Marathi) ---

const I18N = {
  en: {
    dashboard: "Dashboard",
    myLearning: "My Learning",
    takeTest: "Take a Test",
    aiTutor: "AI Tutor",
    conceptMap: "Concept Map",
    analytics: "Learning Analytics",
    profile: "Profile",
    logout: "Logout",
    welcome: "Welcome back",
    tagline: "Understand the gap. Master the concept.",
    overallMastery: "Overall Estimated Mastery",
    testsCompleted: "Tests Completed",
    streak: "Learning Streak",
    averageScore: "Average Score",
    startTest: "Start Test",
    reviewLesson: "Review Lesson"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    myLearning: "मेरी पढ़ाई",
    takeTest: "परीक्षा दें",
    aiTutor: "एआई ट्यूटर",
    conceptMap: "अवधारणा मानचित्र",
    analytics: "लर्निंग एनालिटिक्स",
    profile: "प्रोफ़ाइल",
    logout: "लॉग आउट",
    welcome: "वापसी पर स्वागत है",
    tagline: "कमी को समझें। अवधारणा में महारत हासिल करें।",
    overallMastery: "अनुमानित समग्र निपुणता",
    testsCompleted: "पूर्ण किए गए टेस्ट",
    streak: "लगातार अध्ययन दिवस",
    averageScore: "औसत अंक",
    startTest: "टेस्ट शुरू करें",
    reviewLesson: "पाठ दोहराएं"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    myLearning: "माझा अभ्यास",
    takeTest: "चाचणी द्या",
    aiTutor: "एआय ट्यूटर",
    conceptMap: "संकल्पना नकाशा",
    analytics: "अध्ययन विश्लेषण",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    welcome: "पुन्हा स्वागत आहे",
    tagline: "त्रुटी समजून घ्या. संकल्पना स्पष्ट करा.",
    overallMastery: "एकूण अंदाजित प्राविण्य",
    testsCompleted: "पूर्ण झालेल्या चाचण्या",
    streak: "सतत अभ्यासाचे दिवस",
    averageScore: "सरासरी गुण",
    startTest: "चाचणी सुरू करा",
    reviewLesson: "धडा पुन्हा अभ्यासा"
  }
};

function getStoredLang() {
  return localStorage.getItem('conceptclear_lang') || 'en';
}

function setStoredLang(lang) {
  localStorage.setItem('conceptclear_lang', lang);
  applyTranslations(lang);
}

function applyTranslations(lang) {
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

// --- Lucide Icons Safe Initializer ---

function renderLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// --- Mobile Sidebar Toggle ---

function initMobileSidebar() {
  const btn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// --- Multi-Subject Switcher Engine ---

const AVAILABLE_SUBJECTS = ['Mathematics', 'Physics', 'Computer Science'];

function getActiveSubject() {
  const s = localStorage.getItem('conceptclear_subject');
  return AVAILABLE_SUBJECTS.includes(s) ? s : 'Mathematics';
}

function setActiveSubject(subject) {
  if (AVAILABLE_SUBJECTS.includes(subject)) {
    localStorage.setItem('conceptclear_subject', subject);
    window.dispatchEvent(new CustomEvent('conceptclear_subject_changed', { detail: { subject } }));
  }
}

// Auto-run on document ready
document.addEventListener('DOMContentLoaded', () => {
  renderLucideIcons();
  initMobileSidebar();
  applyTranslations(getStoredLang());

  // Bind language selectors if present
  const langSelect = document.getElementById('lang-selector');
  if (langSelect) {
    langSelect.value = getStoredLang();
    langSelect.addEventListener('change', (e) => {
      setStoredLang(e.target.value);
    });
  }

  // Bind global subject selectors if present
  const subjectSelects = document.querySelectorAll('.global-subject-selector, #global-subject-selector');
  subjectSelects.forEach(select => {
    select.value = getActiveSubject();
    select.addEventListener('change', (e) => {
      setActiveSubject(e.target.value);
      // If page handles subject change listener, it will update; otherwise reload smoothly
      if (!window.__handlesSubjectChange) {
        window.location.reload();
      }
    });
  });
});
