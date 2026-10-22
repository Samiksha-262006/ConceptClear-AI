import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConceptMap } from '../components/ConceptMap';

export function ConceptMapPage() {
  const { role } = useAuth();
  const [isClassroomMode, setIsClassroomMode] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
          Prerequisite Concept Dependency Graph 🗺️
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
          {isClassroomMode
            ? 'Aggregated classroom mastery across all registered students & curriculum topics.'
            : 'Explore mathematics, physics, and computer science concepts as a connected DAG with live Bayesian mastery.'}
        </p>
      </div>

      <ConceptMap
        isClassroomMode={isClassroomMode}
        onToggleClassroomMode={() => setIsClassroomMode(!isClassroomMode)}
      />
    </div>
  );
}
