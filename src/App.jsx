import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLogin } from './pages/StudentLogin';
import { TeacherLogin } from './pages/TeacherLogin';
import { StudentRegister } from './pages/StudentRegister';
import { TeacherRegister } from './pages/TeacherRegister';
import { StudentDashboard } from './pages/StudentDashboard';
import { ConceptMapPage } from './pages/ConceptMapPage';
import { LearnPage } from './pages/LearnPage';
import { TestsPage } from './pages/TestsPage';
import { TestAttemptPage } from './pages/TestAttemptPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  const { currentPath, isAuthenticated, role, navigate, t } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Normalize path without query params or .html extension
  const cleanPath = currentPath.split('?')[0].replace('.html', '').toLowerCase() || '/';

  // Standalone Auth & Landing Pages (No Dashboard Shell)
  if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/index') {
    return (
      <>
        <LandingPage />
        <ToastContainer />
      </>
    );
  }

  if (cleanPath === '/student-login' || cleanPath === '/login') {
    return (
      <>
        <StudentLogin />
        <ToastContainer />
      </>
    );
  }

  if (cleanPath === '/teacher-login') {
    return (
      <>
        <TeacherLogin />
        <ToastContainer />
      </>
    );
  }

  if (cleanPath === '/student-register' || cleanPath === '/register') {
    return (
      <>
        <StudentRegister />
        <ToastContainer />
      </>
    );
  }

  if (cleanPath === '/teacher-register') {
    return (
      <>
        <TeacherRegister />
        <ToastContainer />
      </>
    );
  }

  // Full Screen Proctored Exam View
  if (cleanPath === '/test-attempt') {
    return (
      <>
        <TestAttemptPage />
        <ToastContainer />
      </>
    );
  }

  // Route Guards for Protected Dashboard Shell
  if (!isAuthenticated) {
    return (
      <>
        <StudentLogin />
        <ToastContainer />
      </>
    );
  }

  // Render Page Content inside Dashboard Shell
  const renderPageContent = () => {
    switch (cleanPath) {
      case '/student-dashboard':
        return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
      case '/teacher-dashboard':
        return <TeacherDashboard />;
      case '/concept-map':
        return <ConceptMapPage />;
      case '/learn':
        return <LearnPage />;
      case '/tests':
        return <TestsPage />;
      case '/analytics':
        return <AnalyticsPage />;
      case '/profile':
        return <ProfilePage />;
      default:
        return role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Collapsible Mobile & Desktop Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={
            cleanPath === '/student-dashboard'
              ? (role === 'teacher' ? 'Classroom & Student Cohort Dashboard' : 'Student Learning Dashboard')
              : cleanPath === '/teacher-dashboard'
              ? 'Classroom & Student Cohort Dashboard'
              : cleanPath === '/concept-map'
              ? 'Interactive Concept Map'
              : cleanPath === '/learn'
              ? 'Interactive Lessons'
              : cleanPath === '/tests'
              ? 'Examination Catalog'
              : cleanPath === '/analytics'
              ? 'Deep Learning Analytics'
              : cleanPath === '/profile'
              ? 'User Profile & Preferences'
              : 'ConceptClear AI'
          }
          subtitle={t('tagline')}
        />

        <main className="dashboard-content">
          {renderPageContent()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
export default App;
