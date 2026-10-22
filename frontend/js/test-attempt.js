/**
 * ConceptClear AI - Live Examination & Tab-Switch Proctoring Engine
 * Controls examination timer, real-time incremental auto-save, question navigation palette,
 * and the Page Visibility API / window focus alert monitoring system.
 */

let examData = null;
let currentQuestionIndex = 0;
let remainingSeconds = 0;
let timerInterval = null;
let answersState = {}; // { qId: { selected_option: 'A', marked_for_review: false, time_spent: 0 } }
let tabSwitchCount = 0;
let isSubmitting = false;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user || user.role !== 'student') {
    window.location.href = '/student-login.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const testId = params.get('id');
  if (!testId) {
    showToast('Invalid test identification parameter.', 'error');
    setTimeout(() => { window.location.href = '/tests.html'; }, 1000);
    return;
  }

  try {
    await initExam(testId);
    setupProctoringListeners();
    renderLucideIcons();
  } catch (err) {
    console.error('Failed to start test:', err);
    showToast(err.message, 'error');
    setTimeout(() => { window.location.href = '/tests.html'; }, 1500);
  }
});

async function initExam(testId) {
  const data = await fetchWithAuth(`/tests/start/${testId}`, { method: 'POST' });
  examData = data;
  remainingSeconds = data.time_remaining_seconds;
  tabSwitchCount = data.tab_switch_count || 0;
  answersState = data.saved_answers || {};

  // Title and Proctoring Indicators
  const titleEl = document.getElementById('exam-title-display');
  if (titleEl) titleEl.textContent = data.title;

  updateProctoringUI();

  // Initialize Palette and Current Question
  renderQuestionPalette();
  displayQuestion(0);

  // Start Timer Tick
  startCountdownTimer();
}

function startCountdownTimer() {
  const timerDisplay = document.getElementById('exam-timer-display');
  
  function updateTimerText() {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "00:00:00";
      showToast('Time expired! Automatically submitting your examination.', 'warning');
      submitExam(true);
      return;
    }

    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;

    const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerDisplay.textContent = formatted;

    if (remainingSeconds <= 300) {
      // Under 5 minutes warning
      document.querySelector('.exam-timer-box').classList.add('exam-timer-warning');
    }

    remainingSeconds--;
  }

  updateTimerText();
  timerInterval = setInterval(updateTimerText, 1000);
}

// --- Question Navigation & Display ---

function displayQuestion(index) {
  if (!examData || !examData.questions || index < 0 || index >= examData.questions.length) {
    return;
  }

  currentQuestionIndex = index;
  const q = examData.questions[index];
  const qIdStr = String(q.id);

  // Update Question Header Pill
  const numberPill = document.getElementById('q-number-pill');
  if (numberPill) numberPill.textContent = `Question ${index + 1} of ${examData.questions.length}`;

  const marksPill = document.getElementById('q-marks-pill');
  if (marksPill) marksPill.textContent = `${q.marks} Mark(s)`;

  // Update Question Text
  const textEl = document.getElementById('q-text-content');
  if (textEl) textEl.textContent = q.question_text;

  // Render Options
  const optionsList = document.getElementById('q-options-container');
  const savedAns = answersState[qIdStr] ? answersState[qIdStr].selected_option : null;

  optionsList.innerHTML = q.options.map(opt => `
    <div class="option-choice-card ${savedAns === opt.id ? 'selected' : ''}" onclick="selectExamOption('${opt.id}', this)">
      <div class="option-letter-badge">${opt.id}</div>
      <div class="option-text-label">${opt.text}</div>
    </div>
  `).join('');

  // Update Review Checkbox
  const reviewCheck = document.getElementById('q-review-check');
  if (reviewCheck) {
    reviewCheck.checked = Boolean(answersState[qIdStr] && answersState[qIdStr].marked_for_review);
  }

  // Update Navigation Buttons State
  const prevBtn = document.getElementById('btn-prev-question');
  const nextBtn = document.getElementById('btn-next-question');
  if (prevBtn) prevBtn.disabled = (index === 0);
  if (nextBtn) {
    if (index === examData.questions.length - 1) {
      nextBtn.innerHTML = 'Review & Submit <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>';
    } else {
      nextBtn.innerHTML = 'Next Question <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>';
    }
  }

  renderQuestionPalette();
  renderLucideIcons();
}

function selectExamOption(optId, el) {
  const q = examData.questions[currentQuestionIndex];
  const qIdStr = String(q.id);

  document.querySelectorAll('#q-options-container .option-choice-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');

  if (!answersState[qIdStr]) {
    answersState[qIdStr] = { selected_option: null, marked_for_review: false, time_spent: 0 };
  }
  answersState[qIdStr].selected_option = optId;

  // Real-time incremental auto-save
  saveCurrentAnswerToServer();
  renderQuestionPalette();
}

function toggleMarkForReview() {
  const q = examData.questions[currentQuestionIndex];
  const qIdStr = String(q.id);
  const reviewCheck = document.getElementById('q-review-check');

  if (!answersState[qIdStr]) {
    answersState[qIdStr] = { selected_option: null, marked_for_review: false, time_spent: 0 };
  }
  answersState[qIdStr].marked_for_review = reviewCheck.checked;

  saveCurrentAnswerToServer();
  renderQuestionPalette();
}

async function saveCurrentAnswerToServer() {
  if (!examData) return;
  const q = examData.questions[currentQuestionIndex];
  const qIdStr = String(q.id);
  const ans = answersState[qIdStr];

  try {
    await fetchWithAuth(`/tests/save-answer/${examData.attempt_id}`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: q.id,
        selected_option_id: ans.selected_option,
        marked_for_review: ans.marked_for_review
      })
    });
  } catch (e) {
    console.warn('Silent save warning:', e);
  }
}

function navigateQuestion(delta) {
  if (delta === 1 && currentQuestionIndex === examData.questions.length - 1) {
    openSubmitConfirmModal();
    return;
  }
  displayQuestion(currentQuestionIndex + delta);
}

// --- Question Navigation Palette ---

function renderQuestionPalette() {
  const container = document.getElementById('palette-numbers-container');
  if (!container || !examData || !examData.questions) return;

  container.innerHTML = examData.questions.map((q, idx) => {
    const qIdStr = String(q.id);
    const ans = answersState[qIdStr];
    const isCurrent = (idx === currentQuestionIndex);
    const isAnswered = ans && ans.selected_option;
    const isReview = ans && ans.marked_for_review;

    let classes = 'palette-number-btn';
    if (isCurrent) classes += ' current';
    if (isReview) classes += ' review';
    else if (isAnswered) classes += ' answered';

    return `
      <button class="${classes}" onclick="displayQuestion(${idx})">
        ${idx + 1}
      </button>
    `;
  }).join('');
}

// --- Tab-Switch & Focus Alert Proctoring System ---

function setupProctoringListeners() {
  if (!examData || !examData.enable_tab_monitoring) return;

  let lastEventTime = 0;

  async function handleFocusViolation(eventType) {
    if (isSubmitting) return;

    // Debounce rapid double-fires (e.g. visibility and blur triggering concurrently)
    const now = Date.now();
    if (now - lastEventTime < 1200) return;
    lastEventTime = now;

    try {
      const res = await fetchWithAuth(`/tests/tab-switch/${examData.attempt_id}`, {
        method: 'POST',
        body: JSON.stringify({
          event_type: eventType,
          timestamp: new Date().toISOString()
        })
      });

      tabSwitchCount = res.tab_switch_count;
      updateProctoringUI();

      // Trigger Visible Warning Modal
      showTabSwitchAlertModal(res.warning_message, res.tab_switch_count);
    } catch (err) {
      console.error('Failed to log proctoring violation:', err);
    }
  }

  // 1. Page Visibility API
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      handleFocusViolation('visibility_hidden');
    }
  });

  // 2. Window Blur Event
  window.addEventListener('blur', () => {
    handleFocusViolation('window_blur');
  });
}

function updateProctoringUI() {
  const countEl = document.getElementById('proctor-switch-count');
  if (countEl) countEl.textContent = `${tabSwitchCount} Switches`;

  const statusEl = document.getElementById('proctor-status-text');
  if (statusEl) {
    if (examData && tabSwitchCount >= (examData.tab_switch_threshold || 3)) {
      statusEl.textContent = 'Flagged for Review';
      statusEl.style.color = '#EF4444';
    } else {
      statusEl.textContent = 'Active Monitoring';
    }
  }
}

function showTabSwitchAlertModal(warningMessage, count) {
  const modal = document.getElementById('tab-warning-modal');
  const countPill = document.getElementById('tab-warning-count-pill');
  const textEl = document.getElementById('tab-warning-text');

  if (!modal) return;

  countPill.textContent = `Tab Switch Violation #${count}`;
  textEl.textContent = warningMessage;
  modal.style.display = 'flex';
  renderLucideIcons();
}

function dismissTabWarningModal() {
  const modal = document.getElementById('tab-warning-modal');
  if (modal) modal.style.display = 'none';
}

// --- Submit Examination ---

function openSubmitConfirmModal() {
  const modal = document.getElementById('submit-confirm-modal');
  if (!modal || !examData) return;

  let answeredCount = 0;
  let reviewCount = 0;

  examData.questions.forEach(q => {
    const ans = answersState[String(q.id)];
    if (ans && ans.selected_option) answeredCount++;
    if (ans && ans.marked_for_review) reviewCount++;
  });

  const total = examData.questions.length;
  const unansweredCount = total - answeredCount;

  document.getElementById('modal-answered-count').textContent = answeredCount;
  document.getElementById('modal-unanswered-count').textContent = unansweredCount;
  document.getElementById('modal-review-count').textContent = reviewCount;

  modal.classList.add('active');
}

function closeSubmitConfirmModal() {
  const modal = document.getElementById('submit-confirm-modal');
  if (modal) modal.classList.remove('active');
}

async function submitExam(isAuto = false) {
  if (isSubmitting) return;
  isSubmitting = true;
  clearInterval(timerInterval);

  const submitBtn = document.getElementById('btn-confirm-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting answers...';
  }

  try {
    const result = await fetchWithAuth(`/tests/submit/${examData.attempt_id}`, {
      method: 'POST',
      body: JSON.stringify({ answers: answersState })
    });

    closeSubmitConfirmModal();

    // Show Results Summary Modal
    const resultsModal = document.getElementById('exam-results-modal');
    if (resultsModal) {
      document.getElementById('result-score-val').textContent = `${result.score} / ${result.total_marks}`;
      document.getElementById('result-pct-val').textContent = `${result.percentage}%`;
      document.getElementById('result-switches-val').textContent = result.tab_switch_count;
      document.getElementById('result-flagged-val').textContent = result.is_flagged ? 'YES (Flagged)' : 'NO (Normal)';
      
      resultsModal.classList.add('active');
      renderLucideIcons();
    } else {
      showToast('Test submitted successfully!', 'success');
      setTimeout(() => { window.location.href = '/tests.html'; }, 1500);
    }
  } catch (err) {
    showToast('Failed to submit test: ' + err.message, 'error');
    isSubmitting = false;
  }
}
