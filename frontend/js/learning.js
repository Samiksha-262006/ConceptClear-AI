/**
 * ConceptClear AI - Interactive Multi-Step Lesson Player & AI Tutor Controller
 * Implements 5-step paginated lesson navigation with Next/Previous controls,
 * dynamic subject/topic switcher, adaptive practice quiz, and contextual AI tutor.
 */

window.__handlesSubjectChange = true;

let currentConceptSlug = 'fractions';
let currentLessonData = null;
let currentStepIndex = 0;
let lessonSteps = [];
let currentPracticeQuestion = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user) {
    window.location.href = '/student-login.html';
    return;
  }

  // Parse URL query parameter for active concept
  const params = new URLSearchParams(window.location.search);
  if (params.has('concept')) {
    currentConceptSlug = params.get('concept');
  }

  // Bind Subject Switcher Dropdown
  const activeSubj = getActiveSubject();
  const subjSelect = document.getElementById('global-subject-selector');
  if (subjSelect) {
    subjSelect.value = activeSubj;
    subjSelect.addEventListener('change', async (e) => {
      setActiveSubject(e.target.value);
      await populateConceptsForSubject(e.target.value, true);
    });
  }

  // Listen for subject change event
  window.addEventListener('conceptclear_subject_changed', async (e) => {
    if (subjSelect) subjSelect.value = e.detail.subject;
    await populateConceptsForSubject(e.detail.subject, true);
  });

  // Populate topics for active subject and load lesson
  await populateConceptsForSubject(activeSubj, false);

  // Setup Step Pill Click Handlers
  document.querySelectorAll('#step-pills-bar .step-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stepNum = parseInt(btn.getAttribute('data-step'), 10);
      jumpToStep(stepNum);
    });
  });

  initTutorChat();
  renderLucideIcons();
});

async function populateConceptsForSubject(subject, autoSelectFirst = false) {
  try {
    const concepts = await fetchWithAuth(`/concepts?subject=${encodeURIComponent(subject)}`);
    const selector = document.getElementById('concept-selector');
    if (!selector) return;

    selector.innerHTML = '';
    concepts.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.slug;
      opt.textContent = c.name;
      selector.appendChild(opt);
    });

    const hasCurrent = concepts.some(c => c.slug === currentConceptSlug);
    if (!hasCurrent || autoSelectFirst) {
      if (concepts.length > 0) {
        currentConceptSlug = concepts[0].slug;
      }
    }

    selector.value = currentConceptSlug;

    // Bind change listener
    selector.onchange = (e) => {
      currentConceptSlug = e.target.value;
      currentStepIndex = 0;
      loadLesson(currentConceptSlug);
      loadAdaptivePracticeQuestion(currentConceptSlug);
    };

    // Load active lesson and practice
    await loadLesson(currentConceptSlug);
    await loadAdaptivePracticeQuestion(currentConceptSlug);
  } catch (err) {
    console.error('Failed to populate concepts for subject:', err);
  }
}

async function loadLesson(conceptSlug) {
  try {
    const lesson = await fetchWithAuth(`/learn/lesson/${conceptSlug}`);
    currentLessonData = lesson;

    // Subject Badge
    const subjBadge = document.getElementById('lesson-subject-badge');
    if (subjBadge) {
      const subj = lesson.subject || getActiveSubject();
      subjBadge.textContent = subj;
      subjBadge.className = 'subject-pill-badge ' + (
        subj === 'Physics' ? 'badge-phys' : (subj === 'Computer Science' ? 'badge-cs' : 'badge-math')
      );
    }

    // Title & Summary
    const titleEl = document.getElementById('lesson-title');
    if (titleEl) titleEl.textContent = lesson.title;

    const summaryEl = document.getElementById('lesson-summary');
    if (summaryEl) summaryEl.textContent = lesson.summary;

    // Build or extract 5 Steps
    if (lesson.steps_json && lesson.steps_json.length > 0) {
      lessonSteps = lesson.steps_json;
    } else {
      // Fallback 5 steps from lesson content & analogies
      const userLang = getStoredLang();
      const analogy = lesson[`real_life_analogy_${userLang}`] || lesson.real_life_analogy_en || lesson.real_life_analogy || 'Visualizing real-world analogies helps develop intuition.';
      const workedEx = (lesson.examples_json && lesson.examples_json.length > 0)
        ? `### ${lesson.examples_json[0].problem}\n**Solution:** ${lesson.examples_json[0].solution}`
        : 'Work through problems step-by-step to avoid calculation slips.';

      lessonSteps = [
        {
          step_number: 1,
          title: "Core Principles & Definitions",
          badge: "Rules & Fundamentals",
          content: lesson.content_markdown || "Review foundational definitions and formulas.",
          key_takeaway: "Master fundamental rules before moving to applications."
        },
        {
          step_number: 2,
          title: "Real-World Analogy & Mental Model",
          badge: "Intuitive Analogy",
          content: `### Intuitive Mental Model\n${analogy}`,
          key_takeaway: "Connect abstract concepts to physical objects you already understand."
        },
        {
          step_number: 3,
          title: "Step-by-Step Worked Problem",
          badge: "Worked Problem",
          content: workedEx,
          key_takeaway: "Write out each step sequentially rather than skipping mental steps."
        },
        {
          step_number: 4,
          title: "Common Traps & Mistakes to Avoid",
          badge: "Cognitive Traps",
          content: "### Typical Pitfalls\nBe mindful of common distractor patterns and algebraic inversion slips. Double check units and arithmetic operations.",
          key_takeaway: "Check your work by substituting results back into the initial problem."
        },
        {
          step_number: 5,
          title: "Concept Mastery Check",
          badge: "Knowledge Checkpoint",
          content: "### You have completed the structured lesson!\nYou have covered definitions, mental models, worked calculations, and common pitfalls. Now take the diagnostic practice quiz below to verify your mastery.",
          key_takeaway: "Ready to test your understanding on the calibrated question below!"
        }
      ];
    }

    currentStepIndex = 0;
    renderCurrentStep();
    renderLucideIcons();
  } catch (err) {
    console.error('Failed to load lesson:', err);
    showToast('Failed to load lesson details.', 'error');
  }
}

function renderCurrentStep() {
  if (!lessonSteps || lessonSteps.length === 0) return;

  const totalSteps = lessonSteps.length;
  const step = lessonSteps[currentStepIndex];
  const stepNum = currentStepIndex + 1;
  const pct = Math.round((stepNum / totalSteps) * 100);

  // Update Progress Bar & Labels
  const fill = document.getElementById('step-progress-fill');
  if (fill) fill.style.width = `${pct}%`;

  const counterLabel = document.getElementById('step-counter-label');
  if (counterLabel) counterLabel.textContent = `Step ${stepNum} of ${totalSteps} (${pct}% Completed)`;

  const titleMini = document.getElementById('step-current-title-mini');
  if (titleMini) titleMini.textContent = `${stepNum}. ${step.title}`;

  // Update Step Pills
  document.querySelectorAll('#step-pills-bar .step-pill-btn').forEach((pill, idx) => {
    pill.classList.remove('active', 'completed');
    if (idx === currentStepIndex) {
      pill.classList.add('active');
    } else if (idx < currentStepIndex) {
      pill.classList.add('completed');
    }
  });

  // Update Active Step Card Header
  const badgeEl = document.getElementById('step-badge');
  if (badgeEl) badgeEl.textContent = step.badge || `Step ${stepNum}`;

  const badgeMini = document.getElementById('step-badge-mini');
  if (badgeMini) badgeMini.textContent = `Step ${stepNum} of ${totalSteps}`;

  const headingEl = document.getElementById('step-heading');
  if (headingEl) headingEl.textContent = step.title;

  // Render Step Body (basic markdown formatting)
  const bodyEl = document.getElementById('step-body-content');
  if (bodyEl) {
    let formattedHtml = (step.content || '')
      .replace(/^### (.*$)/gim, '<h3 style="margin: 1.25rem 0 0.5rem; font-size: 1.15rem; color: var(--navy-900);">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 style="margin: 0.85rem 0 0.35rem; font-size: 1rem; color: var(--primary-blue);">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/`([^`]+)`/gim, '<code style="background: #F1F5F9; color: #4338CA; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em;">$1</code>')
      .replace(/```python([\s\S]*?)```/gim, '<pre style="background: #1E293B; color: #F8FAFC; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.9rem; margin: 0.75rem 0;"><code>$1</code></pre>')
      .replace(/\n\n/gim, '<br/><br/>')
      .replace(/\n- (.*$)/gim, '<div style="margin-left: 1.25rem; margin-bottom: 0.35rem;">&bull; $1</div>');
    bodyEl.innerHTML = formattedHtml;
  }

  // Key Takeaway
  const takeawayText = document.getElementById('step-takeaway-text');
  if (takeawayText) takeawayText.textContent = step.key_takeaway || 'Understand the core idea before practicing.';

  // Update Nav Buttons
  const prevBtn = document.getElementById('btn-prev-step');
  if (prevBtn) {
    prevBtn.disabled = (currentStepIndex === 0);
  }

  const nextBtn = document.getElementById('btn-next-step');
  if (nextBtn) {
    if (currentStepIndex === totalSteps - 1) {
      nextBtn.innerHTML = 'Complete Lesson & Practice <i data-lucide="arrow-down" style="width: 18px; height: 18px;"></i>';
      nextBtn.className = 'btn btn-success';
    } else {
      nextBtn.innerHTML = 'Next Step <i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i>';
      nextBtn.className = 'btn btn-primary';
    }
  }

  const navIndicator = document.getElementById('step-nav-indicator');
  if (navIndicator) {
    navIndicator.textContent = `Step ${stepNum} of ${totalSteps}`;
  }

  renderLucideIcons();
}

function goToNextStep() {
  if (currentStepIndex < lessonSteps.length - 1) {
    currentStepIndex++;
    renderCurrentStep();
    // Smoothly scroll back to the top of step player
    const header = document.querySelector('.main-wrapper');
    if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Reached final step: scroll to practice quiz!
    showToast('Lesson completed! Test your knowledge on the diagnostic question.', 'success');
    const quizSec = document.getElementById('adaptive-quiz-section');
    if (quizSec) quizSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function goToPreviousStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderCurrentStep();
    const header = document.querySelector('.main-wrapper');
    if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function jumpToStep(stepNum) {
  const targetIdx = stepNum - 1;
  if (targetIdx >= 0 && targetIdx < lessonSteps.length) {
    currentStepIndex = targetIdx;
    renderCurrentStep();
  }
}

// --- Adaptive Practice Quiz Widget ---

async function loadAdaptivePracticeQuestion(conceptSlug) {
  const container = document.getElementById('practice-quiz-container');
  if (!container) return;

  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Loading adaptive question...</p></div>';

  try {
    const q = await fetchWithAuth(`/learn/adaptive-question/${conceptSlug}`);
    currentPracticeQuestion = q;

    container.innerHTML = `
      <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm);">
        <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
          <span class="badge badge-primary">Practice Question</span>
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600;">Difficulty Level ${q.difficulty_level} / 3</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 1.25rem;">
          ${q.question_text}
        </div>
        <div class="options-list" style="margin-bottom: 1.5rem;">
          ${q.options.map(opt => `
            <div class="option-choice-card" onclick="selectPracticeOption('${opt.id}', this)">
              <div class="option-letter-badge">${opt.id}</div>
              <div class="option-text-label">${opt.text}</div>
            </div>
          `).join('')}
        </div>
        <div class="flex items-center justify-between">
          <div id="practice-status-msg" style="font-size: 0.85rem; color: var(--text-secondary);">Select an option to evaluate your conceptual understanding.</div>
          <button id="btn-submit-practice" class="btn btn-primary" onclick="submitPracticeAnswer()" disabled>
            Check Understanding
          </button>
        </div>
        <div id="practice-feedback-panel" style="margin-top: 1.25rem; display: none;"></div>
      </div>
    `;
    renderLucideIcons();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

let selectedPracticeOptionId = null;

function selectPracticeOption(optId, el) {
  selectedPracticeOptionId = optId;
  document.querySelectorAll('#practice-quiz-container .option-choice-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const btn = document.getElementById('btn-submit-practice');
  if (btn) btn.disabled = false;
}

async function submitPracticeAnswer() {
  if (!currentPracticeQuestion || !selectedPracticeOptionId) return;

  const btn = document.getElementById('btn-submit-practice');
  btn.disabled = true;
  btn.innerHTML = 'Evaluating...';

  try {
    const result = await fetchWithAuth('/learn/evaluate-answer', {
      method: 'POST',
      body: JSON.stringify({
        question_id: currentPracticeQuestion.id,
        selected_option_id: selectedPracticeOptionId
      })
    });

    const feedbackPanel = document.getElementById('practice-feedback-panel');
    feedbackPanel.style.display = 'block';

    if (result.is_correct) {
      feedbackPanel.innerHTML = `
        <div style="background-color: var(--success-green-light); border: 1px solid var(--success-green-border); border-radius: var(--radius-md); padding: 1.25rem;">
          <div class="flex items-center gap-2" style="color: var(--success-green); font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem;">
            <i data-lucide="check-circle" style="width: 22px; height: 22px;"></i> Mastered! Excellent Solution.
          </div>
          <p style="font-size: 0.9rem; color: #166534; line-height: 1.5; margin-bottom: 0.75rem;">${result.explanation}</p>
          <div style="font-size: 0.825rem; color: #166534; font-weight: 600;">
            Estimated Mastery Updated: <strong>${result.updated_mastery}%</strong>
          </div>
          <div style="margin-top: 1rem;">
            <button class="btn btn-success btn-sm" onclick="loadAdaptivePracticeQuestion('${currentConceptSlug}')">
              Next Practice Question <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    } else {
      // Misconception Diagnosed Alert Card (Formative Practice feedback)
      const misc = result.detected_misconception || {};
      const prereq = result.prerequisite_gap;

      feedbackPanel.innerHTML = `
        <div style="background-color: var(--danger-red-light); border: 1px solid var(--danger-red-border); border-radius: var(--radius-md); padding: 1.25rem;">
          <div class="flex items-center gap-2" style="color: var(--danger-red); font-weight: 700; font-size: 1.05rem; margin-bottom: 0.5rem;">
            <i data-lucide="alert-octagon" style="width: 22px; height: 22px;"></i> ${misc.status_label || 'Possible Conceptual Gap Detected'}
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: #991B1B; margin-bottom: 0.4rem;">
            Pattern: ${misc.name || 'Misconception identified'}
          </div>
          <p style="font-size: 0.9rem; color: #991B1B; line-height: 1.5; margin-bottom: 0.75rem;">
            ${misc.explanation}
          </p>
          ${prereq ? `
            <div style="background: rgba(255, 255, 255, 0.7); border-radius: var(--radius-sm); padding: 0.75rem; margin-bottom: 0.75rem;">
              <div style="font-weight: 700; font-size: 0.85rem; color: #991B1B;">Root Prerequisite Gap: ${prereq.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${prereq.description}</div>
            </div>
          ` : ''}
          <div class="flex items-center gap-3" style="margin-top: 1rem;">
            ${result.recommended_lesson ? `
              <a href="${result.recommended_lesson.lesson_url}" class="btn btn-danger btn-sm">
                <i data-lucide="book-open" style="width: 14px; height: 14px;"></i> ${result.recommended_lesson.title}
              </a>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="loadAdaptivePracticeQuestion('${currentConceptSlug}')">
              Try Another Question
            </button>
          </div>
        </div>
      `;
    }

    btn.disabled = false;
    btn.innerHTML = 'Checked';
    renderLucideIcons();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = 'Check Understanding';
  }
}

// --- Multilingual AI Tutor Chat Controller ---

function initTutorChat() {
  const form = document.getElementById('tutor-chat-form');
  const input = document.getElementById('tutor-chat-input');

  document.querySelectorAll('.tutor-prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (input) input.value = promptText;
      sendMessageToTutor(promptText);
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      sendMessageToTutor(text);
      input.value = '';
    });
  }
}

async function sendMessageToTutor(messageText) {
  const messagesBox = document.getElementById('tutor-messages-box');
  if (!messagesBox) return;

  const studentMsg = document.createElement('div');
  studentMsg.style.display = 'flex';
  studentMsg.style.justifyContent = 'flex-end';
  studentMsg.style.marginBottom = '1rem';
  studentMsg.innerHTML = `
    <div style="max-width: 80%; background-color: var(--primary-blue); color: #FFFFFF; padding: 0.85rem 1.15rem; border-radius: 16px 16px 4px 16px; font-size: 0.925rem; line-height: 1.5;">
      ${messageText}
    </div>
  `;
  messagesBox.appendChild(studentMsg);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  const typingMsg = document.createElement('div');
  typingMsg.id = 'tutor-typing-indicator';
  typingMsg.style.display = 'flex';
  typingMsg.style.gap = '0.75rem';
  typingMsg.style.marginBottom = '1rem';
  typingMsg.innerHTML = `
    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-blue), var(--secondary-violet)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0;">AI</div>
    <div style="background: #F1F5F9; color: var(--text-secondary); padding: 0.75rem 1rem; border-radius: 16px 16px 16px 4px; font-size: 0.85rem;">
      Thinking through pedagogical steps...
    </div>
  `;
  messagesBox.appendChild(typingMsg);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    const data = await fetchWithAuth('/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: messageText,
        concept_slug: currentConceptSlug,
        language: getStoredLang()
      })
    });

    typingMsg.remove();

    let formattedReply = data.reply
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n\n/gim, '<br/><br/>')
      .replace(/\n- (.*$)/gim, '<div style="margin-left: 1rem;">&bull; $1</div>');

    const tutorMsg = document.createElement('div');
    tutorMsg.style.display = 'flex';
    tutorMsg.style.gap = '0.75rem';
    tutorMsg.style.marginBottom = '1rem';
    tutorMsg.innerHTML = `
      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-blue), var(--secondary-violet)); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0;">AI</div>
      <div style="max-width: 82%; background: #F8FAFC; border: 1px solid var(--border-color); color: var(--text-main); padding: 1rem 1.25rem; border-radius: 16px 16px 16px 4px; font-size: 0.925rem; line-height: 1.6;">
        ${formattedReply}
      </div>
    `;
    messagesBox.appendChild(tutorMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    renderLucideIcons();
  } catch (err) {
    typingMsg.remove();
    showToast('Tutor communication error: ' + err.message, 'error');
  }
}
