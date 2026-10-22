import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { testsApi } from '../api/client';
import {
  Clock,
  ShieldAlert,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  X
} from 'lucide-react';

export function TestAttemptPage() {
  const { navigate, showToast } = useAuth();
  const [examData, setExamData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [answersState, setAnswersState] = useState({}); // { qId: { selected_option, marked_for_review } }
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarningModal, setShowTabWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const testIdRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      showToast('Missing test parameter.', 'error');
      navigate('/tests');
      return;
    }
    testIdRef.current = id;
    initExam(id);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initExam = async (id) => {
    setLoading(true);
    try {
      const data = await testsApi.startTest(id);
      setExamData(data);
      setRemainingSeconds(data.time_remaining_seconds || 1800);
      setTabSwitchCount(data.tab_switch_count || 0);
      setAnswersState(data.saved_answers || {});
      startTimer();
    } catch (err) {
      console.error('Failed to start test:', err);
      showToast(err.message || 'Failed to start examination.', 'error');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpired = () => {
    showToast('Time expired! Submitting your examination automatically.', 'warning');
    handleSubmitExam(true);
  };

  // Setup Page Visibility API & Window Blur Monitoring
  useEffect(() => {
    if (!examData) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordProctoringViolation('TAB_SWITCH_PAGE_HIDDEN');
      }
    };

    const handleWindowBlur = () => {
      recordProctoringViolation('WINDOW_BLUR');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examData]);

  const recordProctoringViolation = async (reason) => {
    if (!testIdRef.current || submitResult) return;

    setTabSwitchCount((prev) => {
      const newCount = prev + 1;
      // Log to server
      testsApi.logProctoringEvent(testIdRef.current, {
        event_type: 'TAB_SWITCH',
        reason,
        tab_switch_count: newCount,
        timestamp: new Date().toISOString()
      }).catch(err => console.error('Failed to log proctoring violation:', err));

      return newCount;
    });

    setShowTabWarningModal(true);
  };

  const handleSelectOption = async (optionKey) => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;

    const currentEntry = answersState[currentQ.id] || {};
    const updated = {
      ...answersState,
      [currentQ.id]: {
        ...currentEntry,
        selected_option: optionKey
      }
    };
    setAnswersState(updated);

    // Auto-save to backend
    try {
      await testsApi.saveAnswer(testIdRef.current, {
        question_id: currentQ.id,
        selected_option: optionKey,
        marked_for_review: currentEntry.marked_for_review || false
      });
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
    }
  };

  const handleToggleMarkReview = async () => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;

    const currentEntry = answersState[currentQ.id] || {};
    const newMarked = !currentEntry.marked_for_review;
    const updated = {
      ...answersState,
      [currentQ.id]: {
        ...currentEntry,
        marked_for_review: newMarked
      }
    };
    setAnswersState(updated);

    try {
      await testsApi.saveAnswer(testIdRef.current, {
        question_id: currentQ.id,
        selected_option: currentEntry.selected_option || null,
        marked_for_review: newMarked
      });
    } catch (err) {
      console.error('Failed to update review flag:', err);
    }
  };

  const handleClearChoice = async () => {
    if (!examData || !examData.questions) return;
    const currentQ = examData.questions[currentIndex];
    if (!currentQ) return;

    const currentEntry = answersState[currentQ.id] || {};
    const updated = {
      ...answersState,
      [currentQ.id]: {
        ...currentEntry,
        selected_option: null
      }
    };
    setAnswersState(updated);

    try {
      await testsApi.saveAnswer(testIdRef.current, {
        question_id: currentQ.id,
        selected_option: null,
        marked_for_review: currentEntry.marked_for_review || false
      });
    } catch (err) {
      console.error('Failed to clear answer:', err);
    }
  };

  const handleSubmitExam = async (force = false) => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await testsApi.submitTest(testIdRef.current, {
        answers: answersState,
        tab_switch_count: tabSwitchCount
      });
      setSubmitResult(res);
      setShowSubmitModal(false);
      showToast('Examination submitted successfully!', 'success');
    } catch (err) {
      console.error('Failed to submit exam:', err);
      showToast(err.message || 'Failed to submit examination.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary-blue)" style={{ margin: '0 auto 1.5rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
          Entering Proctored Examination Suite...
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>Configuring real-time monitoring and loading question palette.</p>
      </div>
    );
  }

  // Format Timer
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = remainingSeconds <= 300;

  const questions = examData?.questions || [];
  const currentQ = questions[currentIndex];
  const currentSaved = currentQ ? answersState[currentQ.id] || {} : {};

  // Count answered vs unanswered
  const answeredCount = questions.filter(q => answersState[q.id]?.selected_option).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="exam-viewport" style={{ margin: '-2rem', padding: '0 0 3rem' }}>
      {/* Sticky Exam Header */}
      <header className="exam-header">
        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the exam? Your answers so far have been auto-saved.')) {
                navigate('/tests');
              }
            }}
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <span className="exam-title-badge">{examData?.title}</span>
        </div>

        {/* Live Countdown Timer */}
        <div className={`exam-timer-box ${isTimeCritical ? 'exam-timer-warning' : ''}`}>
          <Clock size={18} />
          <span>{timeFormatted}</span>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowSubmitModal(true)}>
          <Send size={14} /> Submit Exam
        </button>
      </header>

      {/* Proctoring Warning Banner */}
      <div className="proctoring-banner">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} color="#F87171" />
          <span>
            <strong>Proctoring Active:</strong> Tab switching, minimizing, or window unfocusing is monitored and logged.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge" style={{ background: tabSwitchCount > 0 ? '#FEE2E2' : '#DCFCE7', color: tabSwitchCount > 0 ? '#DC2626' : '#15803D' }}>
            {tabSwitchCount > 0 ? `⚠️ ${tabSwitchCount} Tab Switches Recorded` : '🛡️ Clean Proctoring Status'}
          </span>
        </div>
      </div>

      {/* Main Exam Workspace */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          {/* Left: Question Box */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
            {currentQ && (
              <>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Marks: {currentQ.points || 1}
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleToggleMarkReview}
                    style={{
                      color: currentSaved.marked_for_review ? 'var(--secondary-violet)' : 'var(--text-secondary)',
                      borderColor: currentSaved.marked_for_review ? 'var(--secondary-violet)' : 'var(--border-color)',
                      background: currentSaved.marked_for_review ? 'var(--secondary-violet-light)' : '#FFFFFF'
                    }}
                  >
                    <Bookmark size={14} /> {currentSaved.marked_for_review ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                </div>

                {/* Question Statement */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1.6, marginBottom: '2rem' }}>
                  {currentQ.question_text}
                </h3>

                {/* Question Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                  {[
                    { key: 'A', text: currentQ.option_a },
                    { key: 'B', text: currentQ.option_b },
                    { key: 'C', text: currentQ.option_c },
                    { key: 'D', text: currentQ.option_d },
                  ].filter(o => o.text).map((opt) => {
                    const isSelected = currentSaved.selected_option === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`question-option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectOption(opt.key)}
                      >
                        <div className="option-badge">{opt.key}</div>
                        <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                          {opt.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation and Clear Action */}
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearChoice}
                    disabled={!currentSaved.selected_option}
                  >
                    Clear Choice
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      className="btn btn-secondary"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(prev => prev - 1)}
                    >
                      <ArrowLeft size={16} /> Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button className="btn btn-success" onClick={() => setShowSubmitModal(true)}>
                        <Send size={16} /> Finalize Exam
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Question Palette & Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1rem' }}>
                Question Palette
              </h4>

              {/* Palette Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {questions.map((q, idx) => {
                  const state = answersState[q.id] || {};
                  const isCurrent = currentIndex === idx;
                  const isAnswered = !!state.selected_option;
                  const isFlagged = !!state.marked_for_review;

                  let btnClass = 'palette-btn';
                  if (isCurrent) btnClass += ' active';
                  if (isFlagged) btnClass += ' flagged';
                  else if (isAnswered) btnClass += ' answered';

                  return (
                    <button
                      key={q.id}
                      className={btnClass}
                      onClick={() => setCurrentIndex(idx)}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 14, height: 14, background: 'var(--primary-blue)', borderRadius: 3 }} />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 14, height: 14, background: '#EDE9FE', border: '1px solid #8B5CF6', borderRadius: 3 }} />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: 14, height: 14, background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 3 }} />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
              </div>
            </div>

            {/* Auto-Save & Proctoring Box */}
            <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--success-green)', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <CheckCircle2 size={16} /> Auto-saving responses in real time
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Your progress is synced with the server. If your browser closes accidentally, you can resume until the timer runs out.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switch Warning Modal */}
      {showTabWarningModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px', borderLeft: '6px solid var(--danger-red)' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--danger-red)', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Proctoring Alert: Tab Switch Detected</h3>
            </div>

            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              You switched away from the test window. This event (<strong>Incident #{tabSwitchCount}</strong>) has been recorded in your examination audit trail.
            </p>

            <div style={{ background: 'var(--danger-red-light)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#7F1D1D' }}>
              ⚠️ Exceeding the teacher's tab-switch threshold will automatically flag your submission for academic review.
            </div>

            <button
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={() => setShowTabWarningModal(false)}
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
              Submit Your Examination?
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
              Please confirm your answers before final grading:
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>Answered Questions:</span>
                <span style={{ fontWeight: 800, color: 'var(--success-green)' }}>{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>Unanswered Questions:</span>
                <span style={{ fontWeight: 800, color: unansweredCount > 0 ? 'var(--danger-red)' : 'var(--text-secondary)' }}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '0.9rem' }}>Proctoring Alerts:</span>
                <span style={{ fontWeight: 800, color: tabSwitchCount > 0 ? 'var(--danger-red)' : 'var(--success-green)' }}>
                  {tabSwitchCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowSubmitModal(false)}>
                Resume Test
              </button>
              <button
                className="btn btn-primary flex-1"
                disabled={submitting}
                onClick={() => handleSubmitExam(false)}
              >
                {submitting ? 'Grading...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Result Summary Modal */}
      {submitResult && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px', textAlign: 'center', padding: '2.5rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={36} color="var(--success-green)" />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Examination Completed!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Your responses have been graded and cognitive distractor analysis has updated your mastery.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Score</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                  {submitResult.score} / {submitResult.total_marks}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Percentage</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: submitResult.percentage >= 60 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                  {Math.round(submitResult.percentage)}%
                </div>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/tests')}>
              Back to Examination Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
