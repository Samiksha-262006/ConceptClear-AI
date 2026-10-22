import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, testsApi } from '../api/client';
import { MasteryRing } from '../components/MasteryRing';
import {
  Flame,
  Award,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Network,
  Loader2
} from 'lucide-react';

export function StudentDashboard() {
  const { user, subject, navigate, showToast, t } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [subject]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewData, catalogData] = await Promise.all([
        analyticsApi.getStudentOverview(),
        testsApi.getStudentCatalog(subject)
      ]);
      setAnalytics(overviewData);
      setTests(catalogData.available || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      showToast('Failed to load student dashboard metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={36} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
        <p>Loading your personalized mastery overview...</p>
      </div>
    );
  }

  const overallMastery = analytics?.overall_mastery || 0;
  const testsCompleted = analytics?.tests_completed || 0;
  const streakDays = analytics?.learning_streak_days || 1;
  const avgScore = analytics?.average_test_score || 0;

  // Prerequisite bottleneck alert
  const primaryGap = analytics?.concepts_needing_improvement?.find(c => c.mastery < 45);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, #1E1B4B 60%, var(--primary-blue) 100%)',
          color: '#FFFFFF',
          border: 'none',
          padding: '2rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ maxWidth: '620px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>
              Academic Level: {user?.academic_level || 'Class 10'}
            </span>
            <span className="badge" style={{ background: 'rgba(22, 163, 74, 0.3)', color: '#86EFAC' }}>
              🔥 {streakDays} Day Learning Streak
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Welcome back, {user?.full_name?.split(' ')[0]}! 🎓
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Your cognitive learning graph has been analyzed. We've detected concept bottlenecks and updated your
            recommended practice pathway.
          </p>

          <div className="flex items-center gap-3" style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/concept-map')}>
              <Network size={16} /> View Prerequisite Map
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/learn')}
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.25)' }}
            >
              <BookOpen size={16} /> Continue Lessons
            </button>
          </div>
        </div>

        {/* Live Mastery Ring */}
        <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '1.5rem 2rem', borderRadius: '16px', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
          <MasteryRing percentage={overallMastery} size={130} strokeWidth={11} label="Mastery" />
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-4" style={{ gap: '1.25rem' }}>
        <div className="kpi-card">
          <div>
            <div className="kpi-label">{t('overallMastery')}</div>
            <div className="kpi-value">{overallMastery}%</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--primary-blue-light)' }}>
            <Award size={24} color="var(--primary-blue)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">{t('testsCompleted')}</div>
            <div className="kpi-value">{testsCompleted}</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--secondary-violet-light)' }}>
            <FileText size={24} color="var(--secondary-violet)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">{t('learningStreak')}</div>
            <div className="kpi-value">{streakDays} Days</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--warning-amber-light)' }}>
            <Flame size={24} color="var(--warning-amber)" />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">{t('averageScore')}</div>
            <div className="kpi-value">{avgScore}%</div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--success-green-light)' }}>
            <Sparkles size={24} color="var(--success-green)" />
          </div>
        </div>
      </div>

      {/* Prerequisite Remediation Alert Card */}
      {primaryGap && (
        <div
          className="card"
          style={{
            borderLeft: '5px solid var(--danger-red)',
            background: 'var(--danger-red-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.25rem 1.75rem'
          }}
        >
          <div className="flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="var(--danger-red)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--danger-red)', fontSize: '1rem' }}>
                Foundational Bottleneck Detected: {primaryGap.name} ({primaryGap.mastery}%)
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Failing advanced equations often stems from this root gap. Reviewing this foundational concept will unlock higher scores!
              </div>
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => navigate(`/learn?concept=${primaryGap.slug || 'fractions'}`)}
          >
            Start Remedial Lesson &rarr;
          </button>
        </div>
      )}

      {/* Two Column Grid: Strengths vs Gaps */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Strongest Concepts */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Strongest Concepts 🌟
            </h3>
            <span className="badge badge-mastered">Mastered</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.strongest_concepts && analytics.strongest_concepts.length > 0 ? (
              analytics.strongest_concepts.map((c, idx) => (
                <div key={idx} className="concept-item-card">
                  <div className="flex items-center gap-3">
                    <span className="status-dot dot-green"></span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.category}</div>
                    </div>
                  </div>
                  <span className="badge badge-mastered">{Math.round(c.mastery)}%</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Complete diagnostic tests to reveal your strongest topics!
              </p>
            )}
          </div>
        </div>

        {/* Concepts Needing Improvement */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Identified Learning Gaps ⚠️
            </h3>
            <span className="badge badge-gap">Requires Focus</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics?.concepts_needing_improvement && analytics.concepts_needing_improvement.length > 0 ? (
              analytics.concepts_needing_improvement.map((c, idx) => {
                const isGap = c.mastery < 40;
                return (
                  <div key={idx} className="concept-item-card">
                    <div className="flex items-center gap-3">
                      <span className={`status-dot ${isGap ? 'dot-red' : 'dot-amber'}`}></span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${isGap ? 'badge-gap' : 'badge-practice'}`}>
                        {Math.round(c.mastery)}%
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => navigate(`/learn?concept=${c.slug}`)}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No critical learning gaps detected. Great job!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Tests Strip */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Assigned Proctored Examinations 📝
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tests configured by your teacher with active tab-switch monitoring.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tests')}>
            View All Tests &rarr;
          </button>
        </div>

        {tests.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No pending tests assigned right now. Keep practicing!
          </div>
        ) : (
          <div className="grid grid-2" style={{ gap: '1rem' }}>
            {tests.slice(0, 2).map((t) => (
              <div
                key={t.id}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: '#FFFFFF'
                }}
              >
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{t.subject || 'Mathematics'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      ⏱️ {t.duration_minutes} Mins
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
                    {t.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {t.instructions || 'Answer all questions carefully. Tab monitoring is active.'}
                  </p>
                </div>

                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.825rem', color: '#64748B' }}>
                    {t.total_marks || 10} Marks &bull; {t.questions_count || 5} Questions
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/test-attempt?id=${t.id}`)}
                  >
                    Start Test &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
