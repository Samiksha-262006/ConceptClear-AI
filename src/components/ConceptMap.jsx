import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { conceptsApi } from '../api/client';
import {
  X,
  BookOpen,
  Users,
  User,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

export function ConceptMap({ isClassroomMode = false, onToggleClassroomMode }) {
  const { subject, navigate, showToast } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, [subject, isClassroomMode]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const data = isClassroomMode
        ? await conceptsApi.getClassroomMap()
        : await conceptsApi.getConceptMap(subject);
      setGraphData(data);
      // Auto-select first node if none selected or if current selection not in new data
      if (data.nodes && data.nodes.length > 0) {
        const found = selectedNode && data.nodes.find(n => n.id === selectedNode.id);
        setSelectedNode(found || data.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load concept graph:', err);
      showToast('Failed to load concept graph: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const nodeMap = {};
  graphData.nodes?.forEach(n => {
    nodeMap[n.id] = n;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Legend & Controls Bar */}
      <div className="card" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4" style={{ fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Legend:</span>
          <div className="flex items-center gap-2">
            <span className="status-dot dot-green"></span>
            <span><strong>Mastered</strong> (&ge; 75%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot dot-amber"></span>
            <span><strong>Needs Practice</strong> (40% - 74%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot dot-red"></span>
            <span><strong>Learning Gap</strong> (&lt; 40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot dot-grey"></span>
            <span><strong>Unassessed</strong></span>
          </div>
        </div>

        {onToggleClassroomMode && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={onToggleClassroomMode}
          >
            {isClassroomMode ? (
              <>
                <User size={14} /> Switch to My Personal Map
              </>
            ) : (
              <>
                <Users size={14} /> Switch to Classroom Aggregate
              </>
            )}
          </button>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div className="concept-canvas-container" style={{ position: 'relative', height: '620px' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
            <Sparkles className="animate-spin" size={24} color="var(--primary-blue)" />
            <span>Analyzing prerequisite dependency network...</span>
          </div>
        ) : (
          <svg
            id="concept-map-svg"
            width="100%"
            height="100%"
            viewBox="0 0 950 480"
            style={{ userSelect: 'none' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="25"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
              </marker>
            </defs>

            {/* Links Layer */}
            <g id="svg-links-layer">
              {graphData.links?.map((l, idx) => {
                const source = nodeMap[l.source];
                const target = nodeMap[l.target];
                if (!source || !target) return null;

                return (
                  <line
                    key={idx}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    className="graph-link"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </g>

            {/* Nodes Layer */}
            <g id="svg-nodes-layer">
              {graphData.nodes?.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <g
                    key={n.id}
                    className="node-group"
                    transform={`translate(${n.x}, ${n.y})`}
                    onClick={() => setSelectedNode(n)}
                  >
                    {/* Pulsing selection ring */}
                    {isSelected && (
                      <circle
                        r={34}
                        fill="transparent"
                        stroke="var(--primary-blue)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Outer Border Circle */}
                    <circle
                      r={26}
                      fill="#FFFFFF"
                      stroke={n.color || '#CBD5E1'}
                      strokeWidth={isSelected ? 6 : 4.5}
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.12))"
                    />

                    {/* Mastery percentage in center */}
                    <text
                      textAnchor="middle"
                      dy="5"
                      fontFamily="Plus Jakarta Sans"
                      fontWeight="800"
                      fontSize="12"
                      fill="#0F172A"
                    >
                      {Math.round(n.mastery || 0)}%
                    </text>

                    {/* Concept Title Label Below */}
                    <text
                      textAnchor="middle"
                      dy="45"
                      fontFamily="Inter"
                      fontWeight="600"
                      fontSize="12"
                      fill="#1E293B"
                    >
                      {n.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Side Detail Drawer */}
        <div className={`concept-drawer ${selectedNode ? 'open' : ''}`}>
          {selectedNode && (
            <>
              <div
                className="flex items-center justify-between"
                style={{
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span className="badge badge-primary">{selectedNode.category || 'General'}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedNode(null)}
                  style={{ border: 'none', padding: '0.25rem' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <h3
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: 'var(--navy-900)',
                    marginBottom: '0.5rem',
                  }}
                >
                  {selectedNode.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '1.5rem',
                  }}
                >
                  {selectedNode.description || 'Master key principles through step-by-step worked examples and diagnostic questions.'}
                </p>

                {/* Estimated Mastery Bar */}
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Estimated Mastery
                    </span>
                    <span
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: selectedNode.color || 'var(--primary-blue)',
                      }}
                    >
                      {Math.round(selectedNode.mastery || 0)}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(selectedNode.mastery || 0)}%`,
                        backgroundColor: selectedNode.color || 'var(--primary-blue)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Prerequisites list */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                      color: 'var(--navy-900)',
                    }}
                  >
                    Prerequisites
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 ? (
                      selectedNode.prerequisites.map((p, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: 'var(--bg-primary)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--navy-900)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <span className="status-dot dot-green" style={{ width: 6, height: 6 }}></span>
                          <span>{p.replace('-', ' ').toUpperCase()}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        None (Foundational Concept)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Jump to Lesson CTA */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/learn?concept=${selectedNode.id || selectedNode.slug}`)}
                >
                  <BookOpen size={16} /> Jump to Lesson & Practice
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
