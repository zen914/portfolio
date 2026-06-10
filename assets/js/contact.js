/* ============================================
   PORTFOLIO — Contact Form Handling
   ============================================ */

(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = form.querySelector('.btn-submit');
  const originalText = btn ? btn.innerHTML : '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = form.querySelector('#form-name');
    const email = form.querySelector('#form-email');
    const subject = form.querySelector('#form-subject');
    const message = form.querySelector('#form-message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      showFormFeedback('Please fill in all required fields.', 'error');
      return;
    }

    if (!isValidEmail(email.value)) {
      showFormFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // Simulate send (replace with real endpoint)
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
      showFormFeedback('Thank you! Your message has been sent. I\'ll respond within 24 hours.', 'success');
      form.reset();
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 1500);
  });

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function showFormFeedback(msg, type) {
    // Remove existing
    const existing = form.parentElement.querySelector('.form-feedback');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'form-feedback';
    div.textContent = msg;
    div.style.cssText = `
      margin-top: 12px; padding: 12px 16px; border-radius: 8px;
      font-size: 0.88rem; font-family: var(--font-mono);
      animation: fadeIn 0.3s ease;
      ${type === 'success'
        ? 'background: rgba(var(--success-rgb), 0.1); color: var(--success); border: 1px solid rgba(var(--success-rgb), 0.2);'
        : 'background: rgba(var(--error-rgb), 0.1); color: var(--error); border: 1px solid rgba(var(--error-rgb), 0.2);'}
    `;
    form.parentElement.appendChild(div);

    setTimeout(() => div.remove(), 5000);
  }
})();
