import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setSession, clearSession } from '../api/client';
import { I18N } from '../utils/i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getUser());
  const [language, setLanguageState] = useState(() => localStorage.getItem('conceptclear_lang') || 'en');
  const [subject, setSubjectState] = useState(() => localStorage.getItem('conceptclear_subject') || 'Mathematics');
  const [toasts, setToasts] = useState([]);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      showToast('Session expired. Please log in again.', 'warning');
      navigate('/student-login');
    };
    window.addEventListener('conceptclear_unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('conceptclear_unauthorized', handleUnauthorized);
    };
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('conceptclear_lang', lang);
  };

  const setSubject = (subj) => {
    setSubjectState(subj);
    localStorage.setItem('conceptclear_subject', subj);
    window.dispatchEvent(new CustomEvent('conceptclear_subject_changed', { detail: { subject: subj } }));
  };

  const login = (newToken, newUser) => {
    setSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    if (newUser.preferred_language) {
      setLanguage(newUser.preferred_language);
    }
  };

  const logout = () => {
    const wasTeacher = user?.role === 'teacher';
    clearSession();
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
    navigate(wasTeacher ? '/teacher-login' : '/student-login');
  };

  const showToast = (message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const t = (key) => {
    const dict = I18N[language] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        role: user?.role || null,
        language,
        setLanguage,
        subject,
        setSubject,
        toasts,
        showToast,
        login,
        logout,
        currentPath,
        navigate,
        t
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
