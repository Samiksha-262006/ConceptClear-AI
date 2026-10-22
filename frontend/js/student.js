/**
 * ConceptClear AI - Student Dashboard Controller
 * Orchestrates mastery KPI calculations, Chart.js weekly progress,
 * strong/weak concept cards, prerequisite bottleneck alerts, and active tests.
 */

let weeklyChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'student') {
    window.location.href = '/student-login.html';
    return;
  }

  // Populate user header
  const nameEl = document.getElementById('student-display-name');
  if (nameEl) nameEl.textContent = user.full_name;
  const avatarEl = document.getElementById('student-avatar-letter');
  if (avatarEl) avatarEl.textContent = (user.full_name || 'S').charAt(0).toUpperCase();

  try {
    await loadStudentOverview();
    await loadStudentRecommendations();
    await loadUpcomingTests();
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    showToast('Failed to load student dashboard metrics.', 'error');
  }
});

async function loadStudentOverview() {
  const data = await fetchWithAuth('/analytics/student/overview');
  
  // Set Stat Values
  const masteryEl = document.getElementById('val-overall-mastery');
  if (masteryEl) masteryEl.textContent = `${data.overall_mastery}%`;

  const testsEl = document.getElementById('val-tests-completed');
  if (testsEl) testsEl.textContent = data.tests_completed;

  const streakEl = document.getElementById('val-streak-days');
  if (streakEl) streakEl.textContent = `${data.learning_streak_days} Days`;

  const scoreEl = document.getElementById('val-avg-score');
  if (scoreEl) scoreEl.textContent = `${data.average_test_score}%`;

  // Animate SVG Mastery Circle Ring (Circumference: 2 * PI * 48 ≈ 301.6)
  const circleBar = document.getElementById('mastery-svg-bar');
  if (circleBar) {
    const circumference = 301.6;
    const offset = circumference - (data.overall_mastery / 100) * circumference;
    circleBar.style.strokeDasharray = `${circumference}`;
    circleBar.style.strokeDashoffset = `${offset}`;
  }

  // Render Strongest Concepts
  const strongContainer = document.getElementById('strong-concepts-list');
  if (strongContainer) {
    if (!data.strongest_concepts || data.strongest_concepts.length === 0) {
      strongContainer.innerHTML = '<p class="text-secondary" style="font-size: 0.85rem;">Take a diagnostic quiz to reveal your strengths.</p>';
    } else {
      strongContainer.innerHTML = data.strongest_concepts.map(c => `
        <div class="concept-item-card">
          <div class="concept-item-left">
            <span class="status-dot dot-green"></span>
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">${c.name}</div>
              <div style="font-size: 0.775rem; color: var(--text-secondary);">${c.category}</div>
            </div>
          </div>
          <span class="badge badge-mastered">${c.mastery}%</span>
        </div>
      `).join('');
    }
  }

  // Render Concepts Needing Improvement (Learning Gaps)
  const weakContainer = document.getElementById('weak-concepts-list');
  if (weakContainer) {
    if (!data.concepts_needing_improvement || data.concepts_needing_improvement.length === 0) {
      weakContainer.innerHTML = '<p class="text-secondary" style="font-size: 0.85rem;">No significant learning gaps detected!</p>';
    } else {
      weakContainer.innerHTML = data.concepts_needing_improvement.map(c => {
        const isGap = c.mastery < 40 && c.mastery > 0;
        const badgeClass = isGap ? 'badge-gap' : (c.mastery >= 40 ? 'badge-practice' : 'badge-unassessed');
        const dotClass = isGap ? 'dot-red' : (c.mastery >= 40 ? 'dot-amber' : 'dot-grey');
        const statusLabel = isGap ? 'Learning Gap' : (c.mastery >= 40 ? 'Needs Practice' : 'Not Assessed');

        return `
          <div class="concept-item-card">
            <div class="concept-item-left">
              <span class="status-dot ${dotClass}"></span>
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">${c.name}</div>
                <div style="font-size: 0.775rem; color: var(--text-secondary);">${c.category}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${badgeClass}">${statusLabel}</span>
              <a href="/learn.html?concept=${c.slug}" class="btn btn-outline-primary btn-sm">Learn</a>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Weekly Chart with Chart.js
  renderWeeklyChart(data.weekly_progress);
  renderLucideIcons();
}

function renderWeeklyChart(weeklyData) {
  const ctx = document.getElementById('weeklyProgressChart');
  if (!ctx || !window.Chart) return;

  const labels = weeklyData.map(d => d.day);
  const values = weeklyData.map(d => d.value);

  if (weeklyChart) {
    weeklyChart.destroy();
  }

  weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Concept Mastery Progress (%)',
        data: values,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#4F46E5',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F172A',
          titleFont: { family: 'Plus Jakarta Sans', weight: '700' },
          bodyFont: { family: 'Inter' },
          padding: 10,
          cornerRadius: 8
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: '#F1F5F9' },
          ticks: { color: '#64748B', font: { family: 'Inter' }, callback: v => `${v}%` }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { family: 'Inter' } }
        }
      }
    }
  });
}

async function loadStudentRecommendations() {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  try {
    const subj = getActiveSubject();
    const recs = await fetchWithAuth(`/learn/recommendations?subject=${encodeURIComponent(subj)}`);
    if (!recs || recs.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>You are all caught up in ${subj}! Explore other subjects or check the concept map.</p></div>`;
      return;
    }

    container.innerHTML = recs.map(r => `
      <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${r.priority === 'HIGH' ? 'var(--danger-red)' : 'var(--primary-blue)'};">
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
            <span class="badge ${r.priority === 'HIGH' ? 'badge-gap' : 'badge-practice'}">${r.priority === 'HIGH' ? 'Root Gap' : 'Target Practice'}</span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${r.current_mastery}% Mastered</span>
          </div>
          <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem;">${r.concept_name}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">${r.reason}</p>
        </div>
        <a href="${r.action_url}" class="btn ${r.priority === 'HIGH' ? 'btn-danger' : 'btn-primary'} btn-sm">
          <i data-lucide="book-open" style="width: 16px; height: 16px;"></i> ${r.action_label}
        </a>
      </div>
    `).join('');
    renderLucideIcons();
  } catch (err) {
    console.error('Error fetching recommendations:', err);
  }
}

async function loadUpcomingTests() {
  const container = document.getElementById('upcoming-tests-container');
  if (!container) return;

  try {
    const catalog = await fetchWithAuth('/tests/student-catalog');
    const available = catalog.available || [];
    const upcoming = catalog.upcoming || [];

    const activeList = [...available, ...upcoming];

    if (activeList.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem;">
          <div class="empty-state-icon"><i data-lucide="calendar" style="width: 24px; height: 24px;"></i></div>
          <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">No Tests Scheduled</h4>
          <p style="font-size: 0.825rem; color: var(--text-secondary);">Your teacher has not scheduled an exam for your class yet.</p>
        </div>
      `;
      renderLucideIcons();
      return;
    }

    container.innerHTML = activeList.slice(0, 3).map(t => {
      const isAvailable = t.status === 'available';
      return `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid ${isAvailable ? 'var(--success-green)' : 'var(--primary-blue)'};">
          <div class="flex items-center justify-between" style="margin-bottom: 0.4rem;">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${t.title}</div>
            <span class="badge ${isAvailable ? 'badge-mastered' : 'badge-unassessed'}">${isAvailable ? 'Active Now' : 'Upcoming'}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            <span>⏱️ ${t.duration_minutes} mins</span> &bull; <span>🎯 ${t.total_marks} Marks</span>
          </div>
          ${isAvailable ? `
            <a href="/test-attempt.html?id=${t.id}" class="btn btn-primary btn-sm" style="width: 100%;">
              <i data-lucide="play" style="width: 14px; height: 14px;"></i> Start Examination
            </a>
          ` : `
            <div style="font-size: 0.75rem; color: var(--text-muted);">Starts: ${new Date(t.start_time).toLocaleString()}</div>
          `}
        </div>
      `;
    }).join('');
    renderLucideIcons();
  } catch (err) {
    console.error('Error fetching student tests:', err);
  }
}
