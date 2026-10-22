/**
 * ConceptClear AI - Student Tests Section Controller
 * Coordinates the 3 examination tabs: Upcoming, Available, and Completed tests,
 * enforcing backend validation rules, attempt restrictions, and result summaries.
 */

window.__handlesSubjectChange = true;

let activeTab = 'available';

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'student') {
    window.location.href = '/student-login.html';
    return;
  }

  // Bind Tab Clickers
  document.querySelectorAll('.test-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.test-nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab');
      renderTestTabContent();
    });
  });

  window.addEventListener('conceptclear_subject_changed', (e) => {
    loadTestsCatalog(e.detail.subject);
  });

  await loadTestsCatalog(getActiveSubject());
});

let catalogCache = { upcoming: [], available: [], completed: [] };

async function loadTestsCatalog(subject) {
  try {
    const subj = subject || getActiveSubject();
    const data = await fetchWithAuth(`/tests/student-catalog?subject=${encodeURIComponent(subj)}`);
    catalogCache = data;
    renderTestTabContent();
  } catch (err) {
    console.error('Error loading tests catalog:', err);
    showToast('Failed to load examination catalog.', 'error');
  }
}

function renderTestTabContent() {
  const container = document.getElementById('tests-tab-viewport');
  if (!container) return;

  const tests = catalogCache[activeTab] || [];

  if (tests.length === 0) {
    let emptyMsg = "No tests available right now.";
    let subMsg = "Your teacher has not scheduled an available test for you yet. Check back later.";

    if (activeTab === 'upcoming') {
      emptyMsg = "No upcoming tests on the horizon.";
      subMsg = "All scheduled tests will appear here once configured by your instructor.";
    } else if (activeTab === 'completed') {
      emptyMsg = "No completed test attempts yet.";
      subMsg = "Start an available test to measure your concept mastery!";
    }

    container.innerHTML = `
      <div class="empty-state card" style="padding: 3.5rem 1.5rem;">
        <div class="empty-state-icon"><i data-lucide="clipboard-list" style="width: 28px; height: 28px;"></i></div>
        <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--navy-900);">${emptyMsg}</h3>
        <p style="font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem; color: var(--text-secondary); line-height: 1.5;">${subMsg}</p>
        ${activeTab !== 'available' ? `<button class="btn btn-primary btn-sm" onclick="switchTab('available')">View Available Tests</button>` : ''}
      </div>
    `;
    renderLucideIcons();
    return;
  }

  container.innerHTML = `
    <div class="grid grid-2" style="gap: 1.5rem;">
      ${tests.map(t => renderSingleTestCard(t)).join('')}
    </div>
  `;
  renderLucideIcons();
}

function renderSingleTestCard(t) {
  if (activeTab === 'available') {
    return `
      <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--success-green);">
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <span class="badge badge-mastered">Available Now</span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${t.subject}</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-main);">${t.title}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
            ${t.description || 'Comprehensive benchmark testing conceptual understanding and procedural fluency.'}
          </p>
          <div class="flex items-center gap-4" style="font-size: 0.825rem; color: var(--navy-900); font-weight: 600; margin-bottom: 1.5rem;">
            <span>⏱️ ${t.duration_minutes} Minutes</span>
            <span>🎯 ${t.total_marks} Total Marks</span>
            ${t.negative_marking > 0 ? `<span style="color: var(--danger-red);">⚠️ -${t.negative_marking} Neg. Mark</span>` : ''}
          </div>
          ${t.enable_tab_monitoring ? `
            <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 0.775rem; color: #92400E; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.45rem;">
              <i data-lucide="shield-alert" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
              Tab-switch and focus monitoring active.
            </div>
          ` : ''}
        </div>
        <a href="/test-attempt.html?id=${t.id}" class="btn btn-primary" style="width: 100%;">
          <i data-lucide="play" style="width: 16px; height: 16px;"></i> ${t.in_progress ? 'Resume Examination' : 'Start Test'}
        </a>
      </div>
    `;
  } else if (activeTab === 'upcoming') {
    const startDate = new Date(t.start_time);
    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary-blue);">
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <span class="badge badge-primary">Scheduled</span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${t.subject}</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-main);">${t.title}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.25rem;">
            ${t.description || 'Upcoming examination configured by instructor.'}
          </p>
          <div style="background: var(--bg-primary); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
            🗓️ <strong>Scheduled Start:</strong> ${startDate.toLocaleString()}
          </div>
        </div>
        <button class="btn btn-secondary" disabled style="opacity: 0.7; cursor: not-allowed; width: 100%;">
          <i data-lucide="lock" style="width: 16px; height: 16px;"></i> Locked Until Start Time
        </button>
      </div>
    `;
  } else {
    // Completed tab
    return `
      <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--text-muted);">
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <span class="badge badge-unassessed">Completed</span>
            <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">${t.subject}</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.75rem; color: var(--text-main);">${t.title}</h3>
          <div style="background-color: var(--primary-blue-light); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Score Achieved</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-blue);">${t.score} / ${t.total_marks}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Accuracy</div>
              <div style="font-size: 1.5rem; font-weight: 800; color: ${t.percentage >= 60 ? 'var(--success-green)' : 'var(--warning-amber)'};">${t.percentage}%</div>
            </div>
          </div>
          ${t.is_flagged ? `
            <div style="background-color: var(--danger-red-light); color: var(--danger-red); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 0.775rem; font-weight: 600; margin-bottom: 1rem;">
              ⚠️ Flagged for excessive tab-switching (${t.tab_switch_count} violations recorded)
            </div>
          ` : ''}
        </div>
        <button class="btn btn-secondary" onclick="viewAttemptResult(${t.attempt_id})" style="width: 100%;">
          <i data-lucide="eye" style="width: 16px; height: 16px;"></i> Review Questions & Feedback
        </button>
      </div>
    `;
  }
}

function switchTab(tabKey) {
  document.querySelectorAll('.test-nav-tab').forEach(t => {
    if (t.getAttribute('data-tab') === tabKey) {
      t.click();
    }
  });
}

async function viewAttemptResult(attemptId) {
  try {
    const data = await fetchWithAuth(`/tests/attempt/${attemptId}`);
    const modal = document.getElementById('review-modal');
    const titleEl = document.getElementById('review-modal-title');
    const bodyEl = document.getElementById('review-modal-body');

    if (!modal || !bodyEl) return;

    titleEl.textContent = `Attempt Review: ${data.test_title}`;
    
    bodyEl.innerHTML = `
      <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-primary); border-radius: var(--radius-md); display: flex; justify-content: space-between;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Score:</span>
          <div style="font-weight: 800; font-size: 1.25rem; color: var(--primary-blue);">${data.score} / ${data.total_marks} (${data.percentage}%)</div>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Time Spent:</span>
          <div style="font-weight: 700; font-size: 1rem;">${Math.floor(data.time_spent_seconds / 60)}m ${data.time_spent_seconds % 60}s</div>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-secondary);">Tab Switches:</span>
          <div style="font-weight: 700; font-size: 1rem; color: ${data.tab_switch_count > 0 ? 'var(--danger-red)' : 'var(--success-green)'};">${data.tab_switch_count}</div>
        </div>
      </div>
      ${!data.results_released ? `
        <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: #92400E;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #FDE68A; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem;">
            <i data-lucide="lock" style="width: 24px; height: 24px; color: #B45309;"></i>
          </div>
          <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.5rem; color: #78350F;">Examination Answers & Mistakes Withheld</h4>
          <p style="font-size: 0.875rem; line-height: 1.5; max-width: 480px; margin: 0 auto 0.5rem;">
            Your responses and overall score have been securely saved. Under formal examination protocol, question-by-question correctness, mistakes, and solutions are withheld until the instructor reviews and releases results.
          </p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${(data.questions || []).map((q, idx) => `
            <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; background: #FFFFFF;">
              <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.9rem;">Question ${idx + 1}</span>
                <span class="badge ${q.is_correct ? 'badge-mastered' : 'badge-gap'}">${q.is_correct ? 'Correct' : 'Incorrect'}</span>
              </div>
              <div style="font-weight: 600; margin-bottom: 0.75rem;">${q.question_text}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                Your Answer: <strong>Option ${q.chosen_option || 'None'}</strong> | 
                ${q.correct_option_id ? `Correct Answer: <strong style="color: var(--success-green);">Option ${q.correct_option_id}</strong>` : 'Answer withheld by instructor.'}
              </div>
              ${q.explanation ? `
                <div style="background: #F8FAFC; padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--navy-900);">
                  💡 <strong>Explanation:</strong> ${q.explanation}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    `;

    modal.classList.add('active');
    renderLucideIcons();
  } catch (err) {
    showToast('Failed to load attempt review: ' + err.message, 'error');
  }
}
