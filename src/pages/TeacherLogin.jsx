import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Brain, Lock, Mail, Eye, EyeOff, Sparkles, Users } from 'lucide-react';

export function TeacherLogin() {
  const { login, navigate, showToast } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFillDemo = () => {
    setEmail('teacher@conceptclear.ai');
    setPassword('Teacher@123');
    showToast('Demo teacher credentials filled!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.loginTeacher(email, password);
      login(data.access_token, data.user);
      showToast('Welcome back, ' + data.user.full_name + '!', 'success');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error('Teacher login error:', err);
      showToast(err.message || 'Login failed. Check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Hero Panel */}
      <div
        className="auth-hero-panel"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #1E1B4B 0%, var(--navy-900) 50%, var(--secondary-violet) 100%)',
          color: '#FFFFFF',
          padding: '4rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div
          className="flex items-center gap-2"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--secondary-violet), var(--accent-cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Brain size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            ConceptClear AI
          </span>
        </div>

        <div>
          <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', marginBottom: '1rem' }}>
            Teacher & Educator Portal
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Empower every student with root-cause insights.
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '440px' }}>
            Schedule proctored examinations, monitor tab-switching integrity, and analyze classroom learning-gap matrices.
          </p>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Educational Integrity &bull; Tab-Switch Proctoring & Misconception Analytics
        </div>
      </div>

      {/* Right Form Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Teacher Sign In 👩‍🏫
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage curriculum tests, view classroom heatmaps, and download CSV reports.
            </p>
          </div>

          {/* Quick Demo Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleFillDemo}
            style={{
              width: '100%',
              marginBottom: '1.5rem',
              borderColor: 'var(--secondary-violet)',
              color: 'var(--secondary-violet)',
              background: 'var(--secondary-violet-light)'
            }}
          >
            <Sparkles size={16} /> Fill Demo Teacher Credentials (1-Click)
          </button>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="teacher@conceptclear.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Teacher'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Need a teacher account?{' '}
            <span
              onClick={() => navigate('/teacher-register')}
              style={{ color: 'var(--secondary-violet)', fontWeight: 600, cursor: 'pointer' }}
            >
              Register here
            </span>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
            Are you a student?{' '}
            <span
              onClick={() => navigate('/student-login')}
              style={{ color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}
            >
              Student Login &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
