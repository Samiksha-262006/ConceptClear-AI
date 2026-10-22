import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Brain, Users, Mail, Lock, Building, BookMarked } from 'lucide-react';

export function TeacherRegister() {
  const { login, navigate, showToast } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    school: '',
    subject: 'Mathematics'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.registerTeacher(formData);
      login(data.access_token, data.user);
      showToast('Teacher account created successfully!', 'success');
      navigate('/teacher-dashboard');
    } catch (err) {
      console.error('Teacher registration error:', err);
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left Banner */}
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
          <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="#FFFFFF" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>ConceptClear AI</span>
        </div>

        <div>
          <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', marginBottom: '1rem' }}>
            Educator Verification
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            Gain real-time classroom intelligence.
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Set proctored exams, detect browser tab switches, and identify prerequisite roadblocks before high-stakes exams.
          </p>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Free educator onboarding &bull; Unlimited student attempts
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            Educator Registration 👩‍🏫
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Join educators discovering and solving learning bottlenecks.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name & Title</label>
              <input
                type="text"
                name="full_name"
                className="form-input"
                placeholder="Dr. Sunita Rao"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institution / School Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="sunita@school.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">School / Institution</label>
                <input
                  type="text"
                  name="school"
                  className="form-input"
                  placeholder="Delhi Public School"
                  value={formData.school}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Subject</label>
                <select
                  name="subject"
                  className="form-select"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirm_password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {loading ? 'Registering Educator...' : 'Register Teacher Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <span
              onClick={() => navigate('/teacher-login')}
              style={{ color: 'var(--secondary-violet)', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
