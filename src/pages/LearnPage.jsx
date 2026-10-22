import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { conceptsApi, learningApi } from '../api/client';
import { TutorChat } from '../components/TutorChat';
import { AdaptiveQuiz } from '../components/AdaptiveQuiz';
import {
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Bot,
  BrainCircuit,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';

export function LearnPage() {
  const { subject, showToast } = useAuth();
  const [concepts, setConcepts] = useState([]);
  const [activeConceptSlug, setActiveConceptSlug] = useState('fractions');
  const [lesson, setLesson] = useState(null);
  const [activeStep, setActiveStep] = useState(0); // 0 to 4
  const [loading, setLoading] = useState(true);

  // Check URL query parameter for active concept
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('concept')) {
      setActiveConceptSlug(params.get('concept'));
    }
  }, []);

  // Fetch concepts for the active subject
  useEffect(() => {
    loadConcepts();
  }, [subject]);

  // Load lesson when active concept changes
  useEffect(() => {
    if (activeConceptSlug) {
      loadLessonContent(activeConceptSlug);
    }
  }, [activeConceptSlug]);

  const loadConcepts = async () => {
    try {
      const data = await conceptsApi.getConcepts(subject);
      setConcepts(data);
      if (data.length > 0 && !data.some(c => c.slug === activeConceptSlug)) {
        setActiveConceptSlug(data[0].slug);
      }
    } catch (err) {
      console.error('Failed to load concepts for subject:', err);
    }
  };

  const loadLessonContent = async (slug) => {
    setLoading(true);
    setActiveStep(0);
    try {
      const data = await learningApi.getLesson(slug);
      setLesson(data);
    } catch (err) {
      console.error('Failed to load lesson:', err);
      showToast('Failed to load lesson: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Core Concept', icon: BookOpen },
    { title: 'Misconception Warning', icon: AlertTriangle },
    { title: 'Worked Examples', icon: Lightbulb },
    { title: 'AI Interactive Tutor', icon: Bot },
    { title: 'Adaptive Practice', icon: BrainCircuit },
  ];

  const currentConceptObj = concepts.find(c => c.slug === activeConceptSlug) || { name: activeConceptSlug };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Controls Header */}
      <div className="card" style={{ padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
            Interactive Multi-Step Lesson
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {lesson?.concept_name || currentConceptObj.name}
          </h1>
        </div>

        {/* Concept Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
            Switch Topic:
          </span>
          <select
            className="form-select"
            value={activeConceptSlug}
            onChange={(e) => setActiveConceptSlug(e.target.value)}
            style={{ fontWeight: 600, minWidth: '180px' }}
          >
            {concepts.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep === idx;
          const isDone = activeStep > idx;

          return (
            <button
              key={idx}
              className="btn"
              onClick={() => setActiveStep(idx)}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.65rem 0.85rem',
                fontSize: '0.825rem',
                background: isActive ? 'var(--primary-blue)' : isDone ? 'var(--primary-blue-light)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : isDone ? 'var(--primary-blue)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Icon size={16} />
              <span>
                {idx + 1}. {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Lesson Content Step Viewport */}
      {loading ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={36} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading interactive lesson modules...</p>
        </div>
      ) : (
        <div>
          {/* STEP 1: Core Concept */}
          {activeStep === 0 && (
            <div className="card" style={{ padding: '2.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <span className="badge badge-primary">Step 1 of 5</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Conceptual Foundations</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1rem' }}>
                What is {lesson?.concept_name}?
              </h2>

              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                {lesson?.overview || lesson?.description || 'Understanding this mathematical structure provides the foundation for subsequent problem solving.'}
              </p>

              {lesson?.core_rules && lesson.core_rules.length > 0 && (
                <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                    Fundamental Principles & Rules:
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {lesson.core_rules.map((rule, idx) => (
                      <li key={idx} style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Common Misconception Warning */}
          {activeStep === 1 && (
            <div className="card" style={{ padding: '2.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <span className="badge badge-gap">Step 2 of 5</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--danger-red)', fontWeight: 600 }}>Cognitive Trap Alert</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1rem' }}>
                The Trap: {lesson?.misconception_name || 'Common Cognitive Pitfall'}
              </h2>

              <div
                style={{
                  background: 'var(--danger-red-light)',
                  border: '1px solid var(--danger-red-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="flex items-center gap-2" style={{ color: 'var(--danger-red)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <AlertTriangle size={20} />
                  <span>Why so many students get this wrong:</span>
                </div>
                <p style={{ color: '#7F1D1D', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {lesson?.misconception_explanation ||
                    'Students frequently try to apply intuitive whole-number shortcuts or forget prerequisite rules like common denominators and sign changes.'}
                </p>
              </div>

              <div style={{ background: 'var(--success-green-light)', border: '1px solid var(--success-green-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--success-green)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={20} />
                  <span>The Correct Mental Model:</span>
                </div>
                <p style={{ color: '#14532D', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {lesson?.misconception_remedy ||
                    'Always check foundational prerequisite constraints before applying formulas. Take time to verify terms on each side of the equation.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Worked Examples */}
          {activeStep === 2 && (
            <div className="card" style={{ padding: '2.5rem' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                <span className="badge badge-practice">Step 3 of 5</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Guided Walkthrough</span>
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
                Worked Examples & Step-by-Step Solutions
              </h2>

              {lesson?.worked_examples && lesson.worked_examples.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {lesson.worked_examples.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.5rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                          Example #{idx + 1}: {ex.problem}
                        </span>
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          Solution Steps:
                        </div>
                        <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-line', color: 'var(--navy-900)', lineHeight: 1.6 }}>
                          {ex.steps || ex.solution}
                        </p>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--success-green)', fontWeight: 600 }}>
                        Key Takeaway: {ex.takeaway || 'Notice how prerequisite rules were systematically applied.'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Example: Simplify $\frac{1}{2} + \frac{1}{4}$. Find the Lowest Common Denominator ($4$), convert $\frac{1}{2}$ to $\frac{2}{4}$, then sum: $\frac{2+1}{4} = \frac{3}{4}$.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: AI Interactive Tutor */}
          {activeStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem 1.5rem' }}>
                <span className="badge badge-primary">Step 4 of 5</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                  Ask the Multilingual AI Tutor
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Stuck on this concept? Ask questions in English, Hindi, or Marathi to get custom analogies and step-by-step breakdowns.
                </p>
              </div>

              <TutorChat
                conceptSlug={activeConceptSlug}
                conceptTitle={lesson?.concept_name || activeConceptSlug}
              />
            </div>
          )}

          {/* STEP 5: Adaptive Diagnostic Practice Quiz */}
          {activeStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1rem 1.5rem' }}>
                <span className="badge badge-mastered">Step 5 of 5</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
                  Adaptive Practice with Distractor Gap Detection
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Solve practice questions. If you pick an incorrect option, our cognitive distractor engine explains the root misconception and adjusts your BKT mastery.
                </p>
              </div>

              <AdaptiveQuiz
                conceptSlug={activeConceptSlug}
                onMasteryUpdate={(newMastery) => {
                  showToast(`Mastery updated to ${Math.round(newMastery)}%!`, 'success');
                }}
              />
            </div>
          )}

          {/* Step Bottom Navigation Controls */}
          <div
            className="card"
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
            >
              <ArrowLeft size={16} /> Previous Step
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Step {activeStep + 1} of {steps.length}
            </span>

            {activeStep < steps.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={() => showToast('Lesson completed! Keep up the great work!', 'success')}
              >
                <CheckCircle2 size={16} /> Finished Lesson
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
