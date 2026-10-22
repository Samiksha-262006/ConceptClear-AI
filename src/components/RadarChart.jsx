import React, { useState } from 'react';

export function RadarChart({ concepts = [], size = 320 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!concepts || concepts.length === 0) {
    return (
      <div style={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        No concept diagnostic data available yet.
      </div>
    );
  }

  const center = size / 2;
  const radius = size * 0.38;
  const count = concepts.length;
  const angleStep = (2 * Math.PI) / count;

  // Levels for concentric polygon grid (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (valueRatio, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build data points string
  const dataPoints = concepts.map((c, i) => {
    const ratio = Math.max(0.05, Math.min(1, (c.mastery || 0) / 100));
    return getCoordinates(ratio, i);
  });

  const polygonPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        {/* Concentric Grid Rings */}
        {levels.map((level, lvlIdx) => {
          const ringPoints = Array.from({ length: count }).map((_, i) => {
            const p = getCoordinates(level, i);
            return `${p.x},${p.y}`;
          }).join(' ');

          return (
            <polygon
              key={lvlIdx}
              points={ringPoints}
              fill="transparent"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis Spokes */}
        {concepts.map((_, i) => {
          const outer = getCoordinates(1.0, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Area Fill */}
        <polygon
          points={polygonPath}
          fill="rgba(79, 70, 229, 0.2)"
          stroke="#4F46E5"
          strokeWidth="2.5"
          style={{ transition: 'all 0.5s ease' }}
        />

        {/* Vertex Dots */}
        {dataPoints.map((pt, i) => {
          const c = concepts[i];
          const isHovered = hoveredPoint === i;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? 6 : 4}
              fill="#4F46E5"
              stroke="#FFFFFF"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          );
        })}

        {/* Concept Labels Outside Axis */}
        {concepts.map((c, i) => {
          const labelCoord = getCoordinates(1.18, i);
          return (
            <text
              key={i}
              x={labelCoord.x}
              y={labelCoord.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans"
              fill="var(--navy-900)"
            >
              {c.name?.length > 12 ? `${c.name.slice(0, 10)}..` : c.name}
            </text>
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hoveredPoint !== null && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'var(--navy-900)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {concepts[hoveredPoint].name}: {Math.round(concepts[hoveredPoint].mastery || 0)}%
        </div>
      )}
    </div>
  );
}
