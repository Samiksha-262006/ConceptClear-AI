import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/client';
import { RadarChart } from '../components/RadarChart';
import {
  LineChart,
  Brain,
  AlertTriangle,
  TrendingUp,
  Award,
  ArrowRight,
  Loader2,
  Table
} from 'lucide-react';

export function AnalyticsPage() {
  const { navigate, showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getStudentOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load deep analytics:', err);
      showToast('Failed to load learning analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={36} color="var(--primary-blue)" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Calculating cognitive analytics & Bayesian tracing models...</p>
      </div>
    );
  }

  const concepts = data?.concepts_breakdown || [];
  const misconceptions = data?.recent_misconceptions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          Deep Learning Analytics & Knowledge Tracing 📊
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          Probabilistic mastery tracking across concepts via Bayesian Knowledge Tracing (BKT) and cognitive misconception detection.
        </p>
      </div>

      {/* Two Column Grid: Radar Chart + BKT Probability Bars */}
      <div className="grid grid-2" style={{ gap: '1.5rem' }}>
        {/* Radar Chart Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <span className="badge badge-primary">Multidimensional Competency</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
              Concept Mastery Radar
            </h3>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <RadarChart concepts={concepts} size={300} />
          </div>
        </div>

        {/* BKT Probability Bars */}
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-mastered">Bayesian Probabilities</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
              Latent Knowledge Tracing ($P(L_t)$)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '320px', overflowY: 'auto' }}>
            {concepts.map((c, idx) => {
              const mastery = Math.round(c.mastery || 0);
              let barColor = 'var(--danger-red)';
              if (mastery >= 75) barColor = 'var(--success-green)';
              else if (mastery >= 40) barColor = 'var(--warning-amber)';

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{c.name}</span>
                    <span style={{ fontWeight: 800, color: barColor }}>{mastery}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${mastery}%`,
                        backgroundColor: barColor,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Misconceptions History Timeline */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Cognitive Misconception Detection History 🔍
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Identified distractor error patterns categorized by evidence confidence tiers.
            </p>
          </div>
          <span className="badge badge-gap">{misconceptions.length} Patterns Flagged</span>
        </div>

        {misconceptions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No persistent cognitive misconceptions detected! Your problem-solving logic aligns with standard foundational models.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {misconceptions.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ maxWidth: '640px' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                    <span className="badge badge-gap">Code: {m.code || 'MIS_ERROR'}</span>
                    <span className="badge badge-unassessed">Confidence: {m.confidence_tier || 'Medium'}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
                    {m.name || m.description}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Root Cause: {m.explanation || 'Distractor pattern triggered across multiple assessment questions.'}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/learn?concept=${m.concept_slug || 'fractions'}`)}
                >
                  Remedial Lesson &rarr;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Concepts Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1rem' }}>
          Curriculum Concepts Breakdown
        </h3>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Concept</th>
                <th>Category</th>
                <th>Mastery Level</th>
                <th>Diagnostic Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {concepts.map((c, idx) => {
                const isMastered = c.mastery >= 75;
                const isGap = c.mastery < 40;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{c.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 800 }}>{Math.round(c.mastery)}%</span>
                        <div style={{ width: 80, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.round(c.mastery)}%`,
                              backgroundColor: isMastered
                                ? 'var(--success-green)'
                                : isGap
                                ? 'var(--danger-red)'
                                : 'var(--warning-amber)',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${isMastered ? 'badge-mastered' : isGap ? 'badge-gap' : 'badge-practice'}`}>
                        {isMastered ? 'Mastered' : isGap ? 'Learning Gap' : 'Needs Practice'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/learn?concept=${c.slug}`)}
                      >
                        Study & Practice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
