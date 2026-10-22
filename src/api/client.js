/**
 * ConceptClear AI - Unified API Client (React Edition)
 * Handles authentication bearer headers, token refresh, and all backend endpoints.
 */

const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('conceptclear_token');
}

export function getUser() {
  const u = localStorage.getItem('conceptclear_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem('conceptclear_token', token);
  localStorage.setItem('conceptclear_user', JSON.stringify(user));
  if (user.preferred_language) {
    localStorage.setItem('conceptclear_lang', user.preferred_language);
  }
}

export function clearSession() {
  localStorage.removeItem('conceptclear_token');
  localStorage.removeItem('conceptclear_user');
}

export async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    clearSession();
    window.dispatchEvent(new CustomEvent('conceptclear_unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return await response.json();
}

// --- AUTH API ---
export const authApi = {
  login: (email, password) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  loginStudent: async (email, password) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.user?.role !== 'student') {
      throw new Error('This account is registered as an educator. Please use the Teacher Login portal.');
    }
    return data;
  },

  registerStudent: (data) =>
    fetchWithAuth('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  loginTeacher: async (email, password) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.user?.role !== 'teacher') {
      throw new Error('This account is registered as a student. Please use the Student Login portal.');
    }
    return data;
  },

  registerTeacher: (data) =>
    fetchWithAuth('/auth/register/teacher', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => fetchWithAuth('/auth/me')
};

// --- CONCEPTS & KNOWLEDGE GRAPH API ---
export const conceptsApi = {
  getConcepts: (subject = 'Mathematics') => 
    fetchWithAuth(`/concepts?subject=${encodeURIComponent(subject)}`),

  getConceptMap: (subject = 'Mathematics') => 
    fetchWithAuth(`/concepts/map?subject=${encodeURIComponent(subject)}`),

  getClassroomMap: () => 
    fetchWithAuth('/concepts/classroom-map'),

  getBottlenecks: () => 
    fetchWithAuth('/concepts/bottlenecks')
};

// --- LEARNING & AI TUTOR API ---
export const learningApi = {
  getLesson: (conceptSlug) => 
    fetchWithAuth(`/learning/lesson/${conceptSlug}`),

  getAdaptiveQuestion: (conceptSlug) => 
    fetchWithAuth(`/learning/adaptive-question/${conceptSlug}`),

  submitPracticeAnswer: (payload) => 
    fetchWithAuth('/learning/practice/submit', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  chatTutor: (payload) => 
    fetchWithAuth('/learning/tutor/chat', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

// --- TESTS & PROCTORING API ---
export const testsApi = {
  getStudentCatalog: (subject = 'Mathematics') => 
    fetchWithAuth(`/tests/student-catalog?subject=${encodeURIComponent(subject)}`),

  startTest: (testId) => 
    fetchWithAuth(`/tests/start/${testId}`, { method: 'POST' }),

  saveAnswer: (testId, payload) => 
    fetchWithAuth(`/tests/${testId}/save-answer`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  logProctoringEvent: (testId, payload) => 
    fetchWithAuth(`/tests/${testId}/log-event`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  submitTest: (testId, payload) => 
    fetchWithAuth(`/tests/submit/${testId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getAttemptReview: (attemptId) => 
    fetchWithAuth(`/tests/attempts/${attemptId}/review`)
};

// --- TEACHER MANAGEMENT API ---
export const teacherApi = {
  getTests: () => fetchWithAuth('/teacher/tests'),
  getStudents: () => fetchWithAuth('/teacher/students'),

  createTest: (payload) => 
    fetchWithAuth('/teacher/tests', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getTestSubmissions: (testId) => 
    fetchWithAuth(`/teacher/tests/${testId}/submissions`),

  updateTest: (testId, payload) => 
    fetchWithAuth(`/teacher/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  cancelTest: (testId) => 
    fetchWithAuth(`/teacher/tests/${testId}`, { method: 'DELETE' }),

  getExportCsvUrl: (testId) => `/api/teacher/tests/${testId}/export-csv`
};

// --- ANALYTICS API ---
export const analyticsApi = {
  getStudentOverview: () => fetchWithAuth('/analytics/student/overview'),
  getTeacherOverview: () => fetchWithAuth('/analytics/teacher/overview')
};
