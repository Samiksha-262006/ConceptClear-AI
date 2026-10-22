import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { testsApi } from '../api/client';
import {
  FileText,
  Clock,
  ShieldCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';

export function TestsPage() {
  const { subject, navigate, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'upcoming' | 'completed'
  const [catalog, setCatalog] = useState({ available: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, [subject]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await testsApi.getStudentCatalog(subject);
      setCatalog(data);
    } catch (err) {
      console.error('Failed to load tests catalog:', err);
      showToast('Failed to load tests catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = async (attemptId) => {
    setReviewLoading(true);
    try {
      const data = await testsApi.getAttemptReview(attemptId);
      setReviewAttempt(data);
    } catch (err) {
      console.error('Failed to load test attempt review:', err);
      showToast(err.message || 'Review not available yet.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const list = catalog[activeTab] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          Examination & Assessment Center 📝
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Proctored curriculum tests with active tab-switch detection and cognitive misconception diagnosis.
        </p>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', maxWidth: '480px' }}>
        <button
          className="btn"
          onClick={() => setActiveTab('available')}
          style={{
            flex: 1,
            background: activeTab === 'available' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'available' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          Available ({catalog.available?.length || 0})
        </button>

        <button
          className="btn"
          onClick={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            background: activeTab === 'upcoming' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'upcoming' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          Upcoming ({catalog.upcoming?.length || 0})
        </button>

        <button
          className="btn"
          onClick={() => setActiveTab('completed')}
          style={{
            flex: 1,
            background: activeTab === 'completed' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'completed' ? '#FFFFFF' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          Completed ({catalog.completed?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={36} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading examinations...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <FileText size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            No {activeTab} tests found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {activeTab === 'available'
              ? 'Your teacher has not assigned any pending tests in this subject right now.'
              : activeTab === 'upcoming'
              ? 'No future examinations are scheduled at this time.'
              : 'You have not completed any test attempts in this subject yet.'}
          </p>
          {activeTab !== 'available' && (
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('available')}>
              View Available Tests
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          {list.map((item) => (
            <div
              key={item.id || item.attempt_id}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}
            >
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.65rem' }}>
                  <span className="badge badge-primary">{item.subject || subject}</span>
                  <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} />
                    <span>{item.duration_minutes} Mins</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {item.instructions || 'Proctored evaluation with tab-switch alert tracking.'}
                </p>

                <div className="flex items-center gap-4" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <span>🎯 {item.total_marks || 10} Total Marks</span>
                  <span>❓ {item.questions_count || 5} Questions</span>
                  {item.enable_tab_monitoring && (
                    <span style={{ color: 'var(--secondary-violet)', fontWeight: 600 }}>
                      🛡️ Proctoring Active
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {activeTab === 'available' && (
                  <>
                    <span className="badge badge-practice">Open Now</span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/test-attempt?id=${item.id}`)}
                    >
                      Start Test <ArrowRight size={14} />
                    </button>
                  </>
                )}

                {activeTab === 'upcoming' && (
                  <>
                    <span className="badge badge-unassessed">
                      Starts: {item.start_time ? new Date(item.start_time).toLocaleDateString() : 'Upcoming'}
                    </span>
                    <button className="btn btn-secondary btn-sm" disabled>
                      Not Started Yet
                    </button>
                  </>
                )}

                {activeTab === 'completed' && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${item.percentage >= 60 ? 'badge-mastered' : 'badge-gap'}`}>
                        Score: {item.score}/{item.total_marks} ({Math.round(item.percentage)}%)
                      </span>
                      {item.tab_switch_count > 0 && (
                        <span className="badge badge-gap" style={{ fontSize: '0.7rem' }}>
                          ⚠️ {item.tab_switch_count} Tab Switches
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleOpenReview(item.attempt_id)}
                    >
                      <Eye size={14} /> Review
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewAttempt && (
        <div className="modal-backdrop" onClick={() => setReviewAttempt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary">Test Review</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                  {reviewAttempt.test_title}
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setReviewAttempt(null)}
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Score Strip */}
            <div
              style={{
                background: 'var(--bg-primary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {reviewAttempt.score} / {reviewAttempt.total_marks}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Percentage</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: reviewAttempt.percentage >= 60 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                  {Math.round(reviewAttempt.percentage)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tab Switches</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: reviewAttempt.tab_switch_count > 0 ? 'var(--danger-red)' : 'var(--success-green)' }}>
                  {reviewAttempt.tab_switch_count}
                </div>
              </div>
            </div>

            {/* Question Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {reviewAttempt.questions?.map((q, idx) => {
                const isCorrect = q.is_correct;
                return (
                  <div
                    key={idx}
                    style={{
                      border: `1px solid ${isCorrect ? 'var(--success-green-border)' : 'var(--danger-red-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      background: isCorrect ? 'var(--success-green-light)' : 'var(--danger-red-light)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Question #{idx + 1}</span>
                      <span className={`badge ${isCorrect ? 'badge-mastered' : 'badge-gap'}`}>
                        {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                      {q.question_text}
                    </p>

                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>
                        Your Answer: <strong>{q.student_answer || 'Skipped'}</strong>
                      </div>
                      <div>
                        Correct Answer: <strong>{q.correct_option}</strong>
                      </div>
                      {q.misconception_explanation && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#FFFFFF', borderRadius: '6px', color: 'var(--danger-red)' }}>
                          <strong>Detected Misconception:</strong> {q.misconception_explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
