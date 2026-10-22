import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  FileText,
  Network,
  LineChart,
  User,
  Users,
  LogOut,
  GraduationCap
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, role, logout, currentPath, navigate, t } = useAuth();

  const isTeacher = role === 'teacher';

  const studentLinks = [
    { label: t('dashboard'), path: '/student-dashboard', icon: LayoutDashboard },
    { label: t('myLearning'), path: '/learn', icon: BookOpen },
    { label: t('takeTest'), path: '/tests', icon: FileText },
    { label: t('conceptMap'), path: '/concept-map', icon: Network },
    { label: t('analytics'), path: '/analytics', icon: LineChart },
    { label: t('profile'), path: '/profile', icon: User }
  ];

  const teacherLinks = [
    { label: 'Students & Test Hub', path: '/teacher-dashboard', icon: Users },
    { label: t('conceptMap'), path: '/concept-map', icon: Network },
    { label: t('profile'), path: '/profile', icon: User }
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div 
          className="sidebar-brand" 
          onClick={() => handleNav(isTeacher ? '/teacher-dashboard' : '/student-dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <div className="sidebar-brand-icon">
            <Brain size={18} />
          </div>
          <span>ConceptClear AI</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          return (
            <li key={item.path}>
              <div
                className={`sidebar-item-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            </li>
          );
        })}

        <li style={{ marginTop: 'auto' }}>
          <div
            className="sidebar-item-link"
            onClick={logout}
            style={{ color: '#F87171' }}
          >
            <LogOut size={18} />
            <span>{t('logout')}</span>
          </div>
        </li>
      </ul>

      {user && (
        <div className="sidebar-footer">
          <div className="user-mini-profile">
            <div className="avatar-letter">
              {(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'capitalize' }}>
                {isTeacher ? 'Verified Teacher' : `${user.academic_level || 'Student'}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
