import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Sparkles,
  Network,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Cpu,
  GraduationCap,
  Users,
  Compass,
  FileCheck
} from 'lucide-react';

export function LandingPage() {
  const { navigate, login, showToast } = useAuth();

  const handleQuickDemoStudent = async () => {
    try {
      const data = await authApi.loginStudent('student@conceptclear.ai', 'Student@123');
      login(data.access_token, data.user);
      showToast('Logged in as Demo Student!', 'success');
      navigate('/student-dashboard');
    } catch {
      navigate('/student-login');
    }
  };

  const handleQuickDemoTeacher = async () => {
    try {
      const data = await authApi.loginTeacher('teacher@conceptclear.ai', 'Teacher@123');
      login(data.access_token, data.user);
      showToast('Logged in as Verified Teacher!', 'success');
      navigate('/teacher-dashboard');
    } catch {
      navigate('/teacher-login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Navigation Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 100
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
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-violet))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <Brain size={22} />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--navy-900)' }}>
            ConceptClear AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/teacher-login')}>
            Teacher Portal
          </button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/student-login')}>
            Student Sign In
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleQuickDemoStudent}>
            <Sparkles size={14} /> Instant Demo
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div
          className="inline-flex items-center gap-2"
          style={{
            padding: '0.4rem 1rem',
            background: 'var(--primary-blue-light)',
            color: 'var(--primary-blue)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            border: '1px solid rgba(79, 70, 229, 0.2)'
          }}
        >
          <Sparkles size={14} /> Built for Prometheus Hackathon 🏆
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            color: 'var(--navy-900)',
            lineHeight: 1.15,
            maxWidth: '900px',
            margin: '0 auto 1.5rem'
          }}
        >
          Understand the gap.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--primary-blue), var(--secondary-violet))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Master the concept.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}
        >
          Traditional quizzes just tell you if you're right or wrong. <strong>ConceptClear AI</strong> analyzes
          cognitive distractors, detects prerequisite bottlenecks, and dynamically updates your mastery using
          Bayesian Knowledge Tracing.
        </p>

        {/* Hero Actions */}
        <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={handleQuickDemoStudent}>
            <GraduationCap size={20} /> 1-Click Student Demo
          </button>
          <button className="btn btn-secondary btn-lg" onClick={handleQuickDemoTeacher}>
            <Users size={20} /> 1-Click Teacher Demo
          </button>
          <button className="btn btn-outline-primary btn-lg" onClick={() => navigate('/concept-map')}>
            <Network size={20} /> Explore Concept Map
          </button>
        </div>

        {/* Live Cognitive Comparison Banner */}
        <div
          className="card"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: '2rem',
            textAlign: 'left',
            background: 'linear-gradient(135deg, #0F172A, #1E1B4B)',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-primary" style={{ background: 'rgba(79, 70, 229, 0.4)', color: '#A5B4FC' }}>
              The Cognitive Difference
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Example: 1/2 + 1/4 = ?</span>
          </div>

          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ color: '#F87171', fontWeight: 700, marginBottom: '0.5rem' }}>❌ Generic Quizzes</div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                Marks "2/6" as simply <strong>INCORRECT</strong> with 0/1 marks. Gives no explanation of why the student erred.
              </p>
            </div>

            <div style={{ background: 'rgba(79, 70, 229, 0.15)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
              <div style={{ color: '#818CF8', fontWeight: 700, marginBottom: '0.5rem' }}>✨ ConceptClear AI</div>
              <p style={{ fontSize: '0.9rem', color: '#E0E7FF', lineHeight: 1.5 }}>
                Detects <code>MIS_FRAC_ADD_NUM_DEN</code> (adding numerators & denominators straight across).
                Diagnoses common-denominator gap and adjusts BKT probability!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 2rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
              Four Pillars of Intelligent Remediation
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
              Engineered with proven cognitive science and real-time algorithmic tracking.
            </p>
          </div>

          <div className="grid grid-4" style={{ gap: '1.5rem' }}>
            {/* Pillar 1 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--primary-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} color="var(--primary-blue)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Cognitive Distractor Diagnosis
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Every incorrect test option maps to a specific cognitive misconception code (e.g., sign transposition, like-term concatenation).
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--secondary-violet-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="var(--secondary-violet)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Bayesian Knowledge Tracing (BKT)
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tracks latent concept mastery probabilistically using prior mastery, learning transit, slip, and guess parameters.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--accent-cyan-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Network size={22} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                NetworkX Prerequisite DAG
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Directed acyclic concept graph performs reverse topological traversal to find unmastered root causes.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--danger-red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={22} color="var(--danger-red)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                Exam Tab-Switch Proctoring
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Built-in Page Visibility API alerts and logs tab switches, window blur events, and flags integrity breaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>ConceptClear AI — Built with React & FastAPI for the Prometheus Hackathon.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Demo credentials: student@conceptclear.ai (Student@123) / teacher@conceptclear.ai (Teacher@123)</p>
      </footer>
    </div>
  );
}
