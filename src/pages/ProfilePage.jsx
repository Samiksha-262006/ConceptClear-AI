import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Globe, Shield, BookMarked, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, role, language, setLanguage, subject, setSubject, logout, showToast, t } = useAuth();

  const handleLangChange = (lang) => {
    setLanguage(lang);
    showToast('Language updated successfully!', 'success');
  };

  const isTeacher = role === 'teacher';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          Account & Preferences ⚙️
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Manage your account settings, multilingual preferences, and curriculum subjects.
        </p>
      </div>

      {/* User Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
        <div className="avatar-letter" style={{ width: 64, height: 64, fontSize: '1.6rem' }}>
          {(user?.full_name || 'U').charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {user?.full_name}
            </h2>
            <span className="badge badge-primary">
              {isTeacher ? 'Verified Educator' : 'Active Student'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {user?.email}
          </p>
          <div style={{ fontSize: '0.825rem', color: 'var(--navy-900)', fontWeight: 600 }}>
            {isTeacher ? `School: ${user?.school || 'School of Mathematics'}` : `Level: ${user?.academic_level || 'Class 10'}`}
          </div>
        </div>
      </div>

      {/* Multilingual Selector Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <Globe size={20} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Language Preference
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Select the UI and AI Tutor language for explanations, worked examples, and analogies.
        </p>

        <div className="grid grid-3" style={{ gap: '1rem' }}>
          {[
            { code: 'en', label: 'English', desc: 'Global English terms & formulas' },
            { code: 'hi', label: 'हिन्दी (Hindi)', desc: 'हिंदी व्याख्या व उदाहरण' },
            { code: 'mr', label: 'मराठी (Marathi)', desc: 'मराठी विश्लेषण व स्पष्टीकरण' }
          ].map((item) => {
            const isSelected = language === item.code;
            return (
              <div
                key={item.code}
                onClick={() => handleLangChange(item.code)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--primary-blue-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--primary-blue)' : 'var(--navy-900)', marginBottom: '0.25rem' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Preference Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
          <BookMarked size={20} color="var(--secondary-violet)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            Primary Subject Pathway
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Switching your subject re-indexes the concept dependency graph, lessons, and tests.
        </p>

        <div className="grid grid-3" style={{ gap: '1rem' }}>
          {['Mathematics', 'Physics', 'Computer Science'].map((s) => {
            const isSelected = subject === s;
            return (
              <div
                key={s}
                onClick={() => setSubject(s)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--secondary-violet)' : 'var(--border-color)'}`,
                  background: isSelected ? 'var(--secondary-violet-light)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isSelected ? 'var(--secondary-violet)' : 'var(--navy-900)' }}>
                  {s}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-danger" onClick={logout}>
          <LogOut size={16} /> Logout from ConceptClear AI
        </button>
      </div>
    </div>
  );
}
