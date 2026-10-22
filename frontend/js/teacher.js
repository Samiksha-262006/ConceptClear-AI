/**
 * ConceptClear AI - Teacher Dashboard & Test Management Controller
 * Handles classroom learning-gap matrices, proctoring audit trails,
 * test creation, scheduled window configuration, and CSV export.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'teacher') {
    window.location.href = '/teacher-login.html';
    return;
  }

  // Populate Teacher Profile Header
  const nameEl = document.getElementById('teacher-display-name');
  if (nameEl) nameEl.textContent = user.full_name;
  const schoolEl = document.getElementById('teacher-display-school');
  if (schoolEl) schoolEl.textContent = user.school || 'Mathematics Department';
  const avatarEl = document.getElementById('teacher-avatar-letter');
  if (avatarEl) avatarEl.textContent = (user.full_name || 'T').charAt(0).toUpperCase();

  try {
    await loadTeacherAnalytics();
    await loadTeacherTests();
    initTestCreationModal();
  } catch (err) {
    console.error('Failed to load teacher metrics:', err);
    showToast('Failed to load classroom analytics.', 'error');
  }
});

async function loadTeacherAnalytics() {
  const data = await fetchWithAuth('/analytics/teacher/overview');

  // KPI Stats
  const studEl = document.getElementById('val-total-students');
  if (studEl) studEl.textContent = data.total_students;

  const schedEl = document.getElementById('val-tests-scheduled');
  if (schedEl) schedEl.textContent = data.tests_scheduled;

  const compEl = document.getElementById('val-tests-completed');
  if (compEl) compEl.textContent = data.tests_completed;

  const avgEl = document.getElementById('val-class-avg');
  if (avgEl) avgEl.textContent = `${data.average_class_performance}%`;

  // Concepts Requiring Attention
  const attentionContainer = document.getElementById('attention-concepts-list');
  if (attentionContainer) {
    if (!data.concepts_needing_attention || data.concepts_needing_attention.length === 0) {
      attentionContainer.innerHTML = '<p class="text-secondary" style="font-size: 0.85rem;">All curriculum concepts have healthy class-wide mastery!</p>';
    } else {
      attentionContainer.innerHTML = data.concepts_needing_attention.map(c => `
        <div class="concept-item-card" style="border-left: 3px solid var(--danger-red);">
          <div class="concept-item-left">
            <span class="status-dot dot-red"></span>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${c.name}</div>
              <div style="font-size: 0.775rem; color: var(--danger-red); font-weight: 600;">
                ${c.students_with_gaps} student(s) with identified prerequisite gaps
              </div>
            </div>
          </div>
          <span class="badge badge-gap">${c.avg_mastery}% Avg</span>
        </div>
      `).join('');
    }
  }

  // Students Needing Support Table
  const supportTable = document.getElementById('struggling-students-table');
  if (supportTable) {
    if (!data.students_needing_support || data.students_needing_support.length === 0) {
      supportTable.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 1.5rem; color: var(--text-secondary);">No students currently flagged for learning interventions.</td></tr>';
    } else {
      supportTable.innerHTML = data.students_needing_support.map(s => `
        <tr>
          <td style="font-weight: 600;">${s.name}</td>
          <td style="color: var(--text-secondary);">${s.academic_level}</td>
          <td>
            <span class="badge ${s.avg_mastery < 50 ? 'badge-gap' : 'badge-practice'}">${s.avg_mastery}%</span>
          </td>
          <td style="color: var(--danger-red); font-weight: 500; font-size: 0.85rem;">${s.primary_issue}</td>
          <td>
            <span class="badge ${s.flagged_tests > 0 ? 'badge-gap' : 'badge-unassessed'}">
              ${s.flagged_tests > 0 ? `⚠️ ${s.flagged_tests} Flagged` : 'Clean'}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  // Prevalent Misconceptions Histogram List
  const miscList = document.getElementById('top-misconceptions-list');
  if (miscList && data.top_classroom_misconceptions) {
    miscList.innerHTML = data.top_classroom_misconceptions.map(m => `
      <div style="padding: 0.85rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 0.65rem; background: #FFFFFF;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.35rem;">
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">${m.name}</span>
          <span class="badge badge-gap">${m.frequency} Occurrence(s)</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">
          Remedial Recommendation: <span style="color: var(--primary-blue); font-weight: 500;">${m.remedial_lesson}</span>
        </div>
      </div>
    `).join('');
  }

  renderLucideIcons();
}

async function loadTeacherTests() {
  const tableBody = document.getElementById('teacher-tests-table-body');
  if (!tableBody) return;

  try {
    const tests = await fetchWithAuth('/teacher/tests');
    if (!tests || tests.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-secondary);">No exams created yet. Click "Schedule New Test" to begin.</td></tr>';
      return;
    }

    const now = new Date();
    tableBody.innerHTML = tests.map(t => {
      const start = new Date(t.start_time);
      const end = new Date(t.end_time);

      let statusBadge = '<span class="badge badge-unassessed">Draft</span>';
      if (t.is_cancelled) {
        statusBadge = '<span class="badge badge-gap">Cancelled</span>';
      } else if (now < start) {
        statusBadge = '<span class="badge badge-practice">Scheduled</span>';
      } else if (now >= start && now <= end) {
        statusBadge = '<span class="badge badge-mastered">Active</span>';
      } else {
        statusBadge = '<span class="badge badge-unassessed">Expired</span>';
      }

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-main);">${t.title}</div>
            <div style="font-size: 0.775rem; color: var(--text-secondary);">${t.subject} &bull; ${t.target_class}</div>
          </td>
          <td>${t.duration_minutes} mins</td>
          <td>${t.total_marks}</td>
          <td>${statusBadge}</td>
          <td>
            <div style="font-weight: 600;">${t.attempts_count} Submitted</div>
            ${t.flagged_attempts_count > 0 ? `<div style="font-size: 0.75rem; color: var(--danger-red); font-weight: 600;">⚠️ ${t.flagged_attempts_count} Flagged Tab-Switch</div>` : ''}
          </td>
          <td>
            <div class="flex items-center gap-2">
              <button class="btn btn-secondary btn-sm" onclick="viewTestParticipation(${t.id})">
                <i data-lucide="eye" style="width: 14px; height: 14px;"></i> Audit
              </button>
              <button class="btn btn-outline-primary btn-sm" onclick="exportCsv(${t.id})">
                <i data-lucide="download" style="width: 14px; height: 14px;"></i> CSV
              </button>
              ${!t.is_cancelled ? `
                <button class="btn btn-danger btn-sm" onclick="cancelTest(${t.id})">
                  <i data-lucide="x-circle" style="width: 14px; height: 14px;"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
    renderLucideIcons();
  } catch (err) {
    console.error('Error fetching teacher tests:', err);
  }
}

function initTestCreationModal() {
  const modal = document.getElementById('create-test-modal');
  const openBtn = document.getElementById('btn-open-create-test');
  const closeBtn = document.getElementById('btn-close-create-test');
  const form = document.getElementById('create-test-form');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      // Set sensible defaults: start now, end in 2 days
      const now = new Date();
      const end = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      const startField = document.getElementById('test-start-time');
      const endField = document.getElementById('test-end-time');
      if (startField) startField.value = now.toISOString().slice(0, 16);
      if (endField) endField.value = end.toISOString().slice(0, 16);

      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Scheduling...';

      const title = document.getElementById('test-title').value.trim();
      const subject = document.getElementById('test-subject').value;
      const target_class = document.getElementById('test-target-class').value;
      const duration_minutes = parseInt(document.getElementById('test-duration').value, 10);
      const total_marks = parseFloat(document.getElementById('test-total-marks').value);
      const negative_marking = parseFloat(document.getElementById('test-negative-marks').value);
      const start_time = new Date(document.getElementById('test-start-time').value).toISOString();
      const end_time = new Date(document.getElementById('test-end-time').value).toISOString();
      const instructions = document.getElementById('test-instructions').value;
      const enable_tab_monitoring = document.getElementById('test-enable-proctoring').checked;
      const tab_switch_threshold = parseInt(document.getElementById('test-proctor-threshold').value, 10) || 3;
      const release_results = document.getElementById('test-release-results') ? document.getElementById('test-release-results').checked : false;

      try {
        await fetchWithAuth('/teacher/tests', {
          method: 'POST',
          body: JSON.stringify({
            title,
            subject,
            target_class,
            duration_minutes,
            total_marks,
            negative_marking,
            start_time,
            end_time,
            instructions,
            is_published: true,
            enable_tab_monitoring,
            tab_switch_threshold,
            allow_retake: false,
            release_results: release_results,
            question_ids: [1, 2, 3, 4, 5]
          })
        });

        showToast('New examination successfully created and scheduled!', 'success');
        modal.classList.remove('active');
        form.reset();
        await loadTeacherTests();
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Schedule Test';
      }
    });
  }
}

async function viewTestParticipation(testId) {
  try {
    const data = await fetchWithAuth(`/teacher/tests/${testId}/attempts`);
    const modal = document.getElementById('audit-modal');
    const titleEl = document.getElementById('audit-modal-title');
    const bodyEl = document.getElementById('audit-modal-body');

    if (!modal || !bodyEl) return;

    titleEl.textContent = `Audit Report: ${data.test.title}`;
    
    if (!data.attempts || data.attempts.length === 0) {
      bodyEl.innerHTML = '<div class="empty-state"><p>No students have submitted attempts for this examination yet.</p></div>';
    } else {
      bodyEl.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left; color: var(--text-secondary);">
              <th style="padding: 0.5rem;">Student</th>
              <th style="padding: 0.5rem;">Score</th>
              <th style="padding: 0.5rem;">Tab Switches</th>
              <th style="padding: 0.5rem;">Status</th>
              <th style="padding: 0.5rem;">Event Timeline</th>
            </tr>
          </thead>
          <tbody>
            ${data.attempts.map(a => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.75rem 0.5rem; font-weight: 600;">
                  ${a.student_name}
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${a.student_email}</div>
                </td>
                <td style="padding: 0.75rem 0.5rem;">
                  <span style="font-weight: 700; color: var(--primary-blue);">${a.score} / ${a.total_marks}</span>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${a.percentage}%</div>
                </td>
                <td style="padding: 0.75rem 0.5rem;">
                  <span class="badge ${a.tab_switch_count >= 3 ? 'badge-gap' : (a.tab_switch_count > 0 ? 'badge-practice' : 'badge-mastered')}">
                    ${a.tab_switch_count} Switches
                  </span>
                </td>
                <td style="padding: 0.75rem 0.5rem;">
                  <span class="badge ${a.is_flagged ? 'badge-gap' : 'badge-mastered'}">
                    ${a.is_flagged ? 'FLAGGED FOR REVIEW' : 'Normal'}
                  </span>
                </td>
                <td style="padding: 0.75rem 0.5rem; font-size: 0.75rem; color: var(--text-secondary);">
                  ${(a.monitoring_events && a.monitoring_events.length > 0) ? 
                    a.monitoring_events.map(e => `<div>⚠️ ${e.type} @ ${new Date(e.timestamp).toLocaleTimeString()}</div>`).join('')
                    : 'No focus violations'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    modal.classList.add('active');
    renderLucideIcons();
  } catch (err) {
    showToast('Failed to fetch test audit trail: ' + err.message, 'error');
  }
}

function exportCsv(testId) {
  const token = getToken();
  window.location.href = `${API_BASE}/teacher/tests/${testId}/export-csv?token=${token}`;
}

async function cancelTest(testId) {
  if (!confirm('Are you sure you want to cancel this scheduled test? Students will no longer be able to attempt it.')) {
    return;
  }
  try {
    await fetchWithAuth(`/teacher/tests/${testId}`, { method: 'DELETE' });
    showToast('Test cancelled.', 'info');
    await loadTeacherTests();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
