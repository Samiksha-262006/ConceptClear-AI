import React, { useState, useEffect } from 'react';
import { learningApi } from '../api/client';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Loader2,
  RefreshCw,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

export function AdaptiveQuiz({ conceptSlug, onMasteryUpdate }) {
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestion();
  }, [conceptSlug]);

  const loadQuestion = async () => {
    setLoading(true);
    setResult(null);
    setSelectedOption(null);
    try {
      const q = await learningApi.getAdaptiveQuestion(conceptSlug || 'fractions');
      setQuestion(q);
    } catch (err) {
      console.error('Failed to load adaptive practice question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || submitting || !question) return;

    setSubmitting(true);
    try {
      const res = await learningApi.submitPracticeAnswer({
        question_id: question.id,
        selected_option: selectedOption,
        concept_slug: conceptSlug || 'fractions'
      });
      setResult(res);
      if (onMasteryUpdate && res.new_mastery !== undefined) {
        onMasteryUpdate(res.new_mastery);
      }
    } catch (err) {
      console.error('Failed to submit practice answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Generating adaptive practice question tailored to your BKT mastery...
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>No practice questions available for this concept right now.</p>
        <button className="btn btn-secondary btn-sm" onClick={loadQuestion} style={{ marginTop: '1rem' }}>
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  const options = [
    { key: 'A', text: question.option_a },
    { key: 'B', text: question.option_b },
    { key: 'C', text: question.option_c },
    { key: 'D', text: question.option_d },
  ].filter(o => o.text);

  return (
    <div className="card" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
      {/* Top Banner with Difficulty & BKT Badge */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary">
            <BrainCircuit size={13} /> Adaptive Diagnostic Practice
          </span>
          <span className="badge badge-unassessed">
            Difficulty: {question.difficulty_tier || 'Adaptive'}
          </span>
        </div>

        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Target: {question.concept_name || conceptSlug}
        </span>
      </div>

      {/* Question Text */}
      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: 'var(--navy-900)',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}
      >
        {question.question_text}
      </h3>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {options.map((opt) => {
          const isSelected = selectedOption === opt.key;
          let extraClass = '';
          if (result) {
            if (opt.key === question.correct_option) {
              extraClass = 'border-green';
            } else if (isSelected && !result.is_correct) {
              extraClass = 'border-red';
            }
          }

          return (
            <div
              key={opt.key}
              className={`question-option-card ${isSelected ? 'selected' : ''}`}
              style={{
                borderColor:
                  result && opt.key === question.correct_option
                    ? 'var(--success-green)'
                    : result && isSelected && !result.is_correct
                    ? 'var(--danger-red)'
                    : undefined,
                backgroundColor:
                  result && opt.key === question.correct_option
                    ? 'var(--success-green-light)'
                    : result && isSelected && !result.is_correct
                    ? 'var(--danger-red-light)'
                    : undefined,
              }}
              onClick={() => {
                if (!result) setSelectedOption(opt.key);
              }}
            >
              <div
                className="option-badge"
                style={{
                  backgroundColor:
                    result && opt.key === question.correct_option
                      ? 'var(--success-green)'
                      : result && isSelected && !result.is_correct
                      ? 'var(--danger-red)'
                      : undefined,
                  color: result ? '#FFFFFF' : undefined,
                }}
              >
                {opt.key}
              </div>
              <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>
                {opt.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit or Next Question Action */}
      {!result ? (
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!selectedOption || submitting}
          style={{ width: '100%' }}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Analyzing Cognitive Pattern...
            </>
          ) : (
            <>
              <CheckCircle2 size={16} /> Check Answer & Update Mastery
            </>
          )}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Result Alert Box */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: result.is_correct ? 'var(--success-green-light)' : 'var(--danger-red-light)',
              border: `1px solid ${result.is_correct ? 'var(--success-green-border)' : 'var(--danger-red-border)'}`,
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
              {result.is_correct ? (
                <>
                  <CheckCircle2 size={20} color="var(--success-green)" />
                  <span style={{ fontWeight: 800, color: 'var(--success-green)', fontSize: '1.05rem' }}>
                    Excellent! Answer is Correct
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle size={20} color="var(--danger-red)" />
                  <span style={{ fontWeight: 800, color: 'var(--danger-red)', fontSize: '1.05rem' }}>
                    Cognitive Misconception Detected!
                  </span>
                </>
              )}
            </div>

            {/* Misconception Deep Explanation */}
            {!result.is_correct && result.misconception && (
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.75rem',
                  border: '1px solid var(--danger-red-border)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--danger-red)', marginBottom: '0.35rem' }}>
                  Misconception: {result.misconception.name || result.misconception.code}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {result.misconception.explanation || result.explanation}
                </p>
                {result.misconception.remedial_tip && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                    💡 Remedial Tip: {result.misconception.remedial_tip}
                  </div>
                )}
              </div>
            )}

            {/* General explanation */}
            {result.is_correct && result.explanation && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {result.explanation}
              </p>
            )}

            {/* BKT Mastery Update Badge */}
            {result.new_mastery !== undefined && (
              <div
                className="flex items-center gap-2"
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <TrendingUp size={16} color="var(--primary-blue)" />
                <span>
                  Bayesian Estimated Mastery: <strong>{Math.round(result.new_mastery)}%</strong>{' '}
                  <span style={{ color: result.is_correct ? 'var(--success-green)' : 'var(--danger-red)' }}>
                    ({result.is_correct ? '+ learning transit' : '- updated prior'})
                  </span>
                </span>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={loadQuestion} style={{ width: '100%' }}>
            <ArrowRight size={16} /> Next Practice Question
          </button>
        </div>
      )}
    </div>
  );
}
