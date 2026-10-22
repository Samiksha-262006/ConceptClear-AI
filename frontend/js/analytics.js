/**
 * ConceptClear AI - Comprehensive Learning-Gap Analytics Controller
 * Renders Chart.js Radar Charts, BKT mastery probability bars,
 * misconception confidence histories, and root-cause bottleneck breakdowns.
 */

let radarChart = null;
let bktBarChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user) {
    window.location.href = '/student-login.html';
    return;
  }

  try {
    const data = await fetchWithAuth('/analytics/student/overview');
    renderRadarChart(data.concepts_breakdown);
    renderBktBarChart(data.concepts_breakdown);
    renderMisconceptionTimeline(data.recent_misconceptions);
    renderDetailedBreakdownTable(data.concepts_breakdown);
    renderLucideIcons();
  } catch (err) {
    console.error('Failed to load learning analytics:', err);
    showToast('Failed to load deep analytics.', 'error');
  }
});

function renderRadarChart(concepts) {
  const ctx = document.getElementById('analyticsRadarChart');
  if (!ctx || !window.Chart) return;

  const labels = concepts.map(c => c.name);
  const scores = concepts.map(c => c.mastery);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Concept Mastery (%)',
        data: scores,
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4F46E5',
        borderWidth: 2.5,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, color: '#94A3B8' },
          grid: { color: '#E2E8F0' },
          pointLabels: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
            color: '#1E293B'
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderBktBarChart(concepts) {
  const ctx = document.getElementById('analyticsBarChart');
  if (!ctx || !window.Chart) return;

  const labels = concepts.map(c => c.name);
  const scores = concepts.map(c => c.mastery);
  const colors = concepts.map(c => {
    if (c.mastery >= 75) return '#16A34A'; // Green
    if (c.mastery >= 40) return '#F59E0B'; // Amber
    return '#DC2626'; // Red
  });

  if (bktBarChart) bktBarChart.destroy();

  bktBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Bayesian Mastery Probability (%)',
        data: scores,
        backgroundColor: colors,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterLabel: (ctx) => {
              const val = ctx.raw;
              if (val >= 75) return 'Status: Demonstrated Understanding';
              if (val >= 40) return 'Status: Needs Practice';
              return 'Status: Significant Learning Gap Detected';
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: '#F1F5F9' },
          ticks: { callback: v => `${v}%` }
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Inter', size: 10 } }
        }
      }
    }
  });
}

function renderMisconceptionTimeline(logs) {
  const container = document.getElementById('misconceptions-timeline');
  if (!container) return;

  if (!logs || logs.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No recurring misconceptions recorded yet. Keep practicing!</p></div>';
    return;
  }

  container.innerHTML = logs.map(l => `
    <div style="border-left: 3px solid var(--danger-red); padding-left: 1rem; margin-bottom: 1.25rem; position: relative;">
      <div style="position: absolute; left: -6px; top: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--danger-red);"></div>
      <div class="flex items-center justify-between" style="margin-bottom: 0.25rem;">
        <span style="font-weight: 700; color: var(--navy-900); font-size: 0.95rem;">${l.concept_name}</span>
        <span class="badge ${l.confidence === 'High' ? 'badge-gap' : 'badge-practice'}">${l.confidence} Confidence</span>
      </div>
      <div style="font-size: 0.825rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
        Detected Code: <code>${l.code}</code> &bull; ${l.timestamp}
      </div>
    </div>
  `).join('');
}

function renderDetailedBreakdownTable(concepts) {
  const tableBody = document.getElementById('concepts-breakdown-table');
  if (!tableBody) return;

  tableBody.innerHTML = concepts.map(c => {
    let badgeClass = 'badge-unassessed';
    let label = 'Not Assessed';
    if (c.mastery >= 75) { badgeClass = 'badge-mastered'; label = 'Demonstrated Understanding'; }
    else if (c.mastery >= 40) { badgeClass = 'badge-practice'; label = 'Needs Practice'; }
    else if (c.mastery > 0) { badgeClass = 'badge-gap'; label = 'Significant Learning Gap'; }

    return `
      <tr>
        <td style="font-weight: 700; color: var(--navy-900);">${c.name}</td>
        <td style="color: var(--text-secondary);">${c.category}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="flex: 1; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${c.mastery}%; background: ${c.mastery >= 75 ? 'var(--success-green)' : (c.mastery >= 40 ? 'var(--warning-amber)' : 'var(--danger-red)')};"></div>
            </div>
            <span style="font-weight: 700; font-size: 0.85rem; width: 45px;">${c.mastery}%</span>
          </div>
        </td>
        <td><span class="badge ${badgeClass}">${label}</span></td>
        <td>
          <a href="/learn.html?concept=${c.slug}" class="btn btn-outline-primary btn-sm">
            Review <i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i>
          </a>
        </td>
      </tr>
    `;
  }).join('');
}
