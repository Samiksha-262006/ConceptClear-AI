import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { Brain, User, Mail, Lock, BookOpen, Globe } from 'lucide-react';

export function StudentRegister() {
  const { login, navigate, showToast } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    academic_level: 'Class 10',
    preferred_language: 'en'
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
      const data = await authApi.registerStudent(formData);
      login(data.access_token, data.user);
      showToast('Account created successfully!', 'success');
      navigate('/student-dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
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
          background: 'linear-gradient(135deg, var(--navy-900), var(--primary-blue))',
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            Start your personalized journey.
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Gain clarity on foundational mathematics, physics, and computer science concepts with adaptive AI tutor guidance.
          </p>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Free student registration &bull; Instant diagnostic evaluation
        </div>
      </div>

      {/* Right Form Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', backgroundColor: '#FFFFFF' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            Create Student Account 🚀
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Sign up to track your mastery across topics.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-input"
                placeholder="Aarav Sharma"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="aarav@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Level</label>
                <select
                  name="academic_level"
                  className="form-select"
                  value={formData.academic_level}
                  onChange={handleChange}
                >
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="College Undergraduate">College Undergrad</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Language</label>
                <select
                  name="preferred_language"
                  className="form-select"
                  value={formData.preferred_language}
                  onChange={handleChange}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="mr">मराठी (Marathi)</option>
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
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/student-login')}
              style={{ color: 'var(--primary-blue)', fontWeight: 600, cursor: 'pointer' }}
            >
              Log in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
