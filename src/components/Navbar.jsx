import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Globe, BookMarked, User } from 'lucide-react';

export function Navbar({ onToggleSidebar, title, subtitle }) {
  const { user, subject, setSubject, language, setLanguage, navigate, t } = useAuth();

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          style={{ display: 'none', padding: '0.4rem' }}
          id="mobile-nav-toggle"
        >
          <Menu size={18} />
        </button>
        <div className="topbar-greeting">
          <h2>{title || t('dashboard')}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Subject Selector */}
        <div className="flex items-center gap-2">
          <BookMarked size={16} color="var(--primary-blue)" />
          <select
            className="form-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              borderColor: 'var(--primary-blue)',
              minWidth: '150px'
            }}
          >
            <option value="Mathematics">📐 Mathematics</option>
            <option value="Physics">⚡ Physics</option>
            <option value="Computer Science">💻 Computer Science</option>
          </select>
        </div>

        {/* Global Language Selector */}
        <div className="flex items-center gap-2">
          <Globe size={16} color="var(--secondary-violet)" />
          <select
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              minWidth: '110px'
            }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="hi">🇮🇳 हिन्दी</option>
            <option value="mr">🚩 मराठी</option>
          </select>
        </div>

        {/* User Avatar Button */}
        {user ? (
          <div
            onClick={() => navigate('/profile')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-primary)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div className="avatar-letter" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
              {(user.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
              {user.full_name?.split(' ')[0]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student-login')}>
              Log in
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/student-register')}>
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
