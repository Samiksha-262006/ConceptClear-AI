/**
 * ConceptClear AI - Authentication Controller
 * Handles student/teacher login, registration, password reveals, and quick demo credentials.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Password Visibility Toggles
  document.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
      }
      renderLucideIcons();
    });
  });

  // Student Login Form
  const studentLoginForm = document.getElementById('student-login-form');
  if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = studentLoginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing in...';

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        if (data.user.role !== 'student') {
          throw new Error('This account is registered as a teacher. Please use the Teacher Login portal.');
        }

        setSession(data.access_token, data.user);
        showToast(`Welcome back, ${data.user.full_name}!`, 'success');
        setTimeout(() => {
          window.location.href = '/student-dashboard.html';
        }, 600);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Student Registration Form
  const studentRegisterForm = document.getElementById('student-register-form');
  if (studentRegisterForm) {
    studentRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = studentRegisterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const full_name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm_password = document.getElementById('reg-confirm-password').value;
      const academic_level = document.getElementById('reg-class').value;
      const preferred_language = document.getElementById('reg-lang').value;

      if (password !== confirm_password) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Creating account...';

      try {
        const res = await fetch(`${API_BASE}/auth/register/student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name,
            email,
            password,
            confirm_password,
            academic_level,
            preferred_language
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');

        setSession(data.access_token, data.user);
        showToast('Registration successful! Welcome to ConceptClear AI.', 'success');
        setTimeout(() => {
          window.location.href = '/student-dashboard.html';
        }, 700);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Teacher Login Form
  const teacherLoginForm = document.getElementById('teacher-login-form');
  if (teacherLoginForm) {
    teacherLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = teacherLoginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing in...';

      const email = document.getElementById('teacher-email').value.trim();
      const password = document.getElementById('teacher-password').value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        if (data.user.role !== 'teacher') {
          throw new Error('This account is registered as a student. Please use the Student Login portal.');
        }

        setSession(data.access_token, data.user);
        showToast(`Welcome back, Professor ${data.user.full_name}!`, 'success');
        setTimeout(() => {
          window.location.href = '/teacher-dashboard.html';
        }, 600);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Teacher Registration Form
  const teacherRegisterForm = document.getElementById('teacher-register-form');
  if (teacherRegisterForm) {
    teacherRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = teacherRegisterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      const full_name = document.getElementById('teacher-name').value.trim();
      const email = document.getElementById('teacher-official-email').value.trim();
      const password = document.getElementById('teacher-reg-password').value;
      const confirm_password = document.getElementById('teacher-confirm-password').value;
      const school = document.getElementById('teacher-school').value.trim();
      const subject_taught = document.getElementById('teacher-subject').value;

      if (password !== confirm_password) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Registering teacher...';

      try {
        const res = await fetch(`${API_BASE}/auth/register/teacher`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name,
            email,
            password,
            confirm_password,
            school,
            subject_taught
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');

        if (data.access_token) {
          setSession(data.access_token, data.user);
          showToast('Teacher account approved and ready!', 'success');
          setTimeout(() => { window.location.href = '/teacher-dashboard.html'; }, 600);
        } else {
          showToast(data.message || 'Account registered. Verification required.', 'info', 6000);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // Quick Demo Auto-Fill Clickers
  const fillStudentBtn = document.getElementById('btn-fill-student-demo');
  if (fillStudentBtn) {
    fillStudentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const emailField = document.getElementById('login-email');
      const passField = document.getElementById('login-password');
      if (emailField && passField) {
        emailField.value = 'student@conceptclear.ai';
        passField.value = 'Student@123';
        showToast('Demo student credentials filled!', 'info');
      }
    });
  }

  const fillTeacherBtn = document.getElementById('btn-fill-teacher-demo');
  if (fillTeacherBtn) {
    fillTeacherBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const emailField = document.getElementById('teacher-email');
      const passField = document.getElementById('teacher-password');
      if (emailField && passField) {
        emailField.value = 'teacher@conceptclear.ai';
        passField.value = 'Teacher@123';
        showToast('Demo teacher credentials filled!', 'info');
      }
    });
  }
});
