

function initCustomCursor() {
  if (window.innerWidth <= 768) return;

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = `
    <div class="cursor-dot"></div>
    <div class="cursor-zoom-ring"></div>
  `;
  document.body.appendChild(cursor);

  let currentState = 'default';
  let moveTimer = null;

  // Instant position — no lerp
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';

    if (!cursor.classList.contains('moving')) {
      cursor.classList.add('moving');
    }
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => cursor.classList.remove('moving'), 150);

    updateState(e.target);
  });

  function updateState(el) {
    const isZoom      = el.closest('.project-modal-image-stage') !== null;
    const isText      = el.matches('p, h1, h2, h3, h4, h5, h6, span, li, label, input, textarea');
    const isClickable = el.matches('a, button, [role="button"], .project-card, .scroll-dot') ||
                        el.closest('a, button, [role="button"], .project-card') !== null;

    let newState = 'default';
    if (isZoom)           newState = 'zoom';
    else if (isText)      newState = 'text';
    else if (isClickable) newState = 'hover';

    if (newState !== currentState) {
      cursor.classList.remove('state-default', 'state-hover', 'state-text', 'state-zoom');
      cursor.classList.add(`state-${newState}`);
      currentState = newState;
    }
  }

  window.addEventListener('mousedown', () => cursor.classList.add('pressing'));
  window.addEventListener('mouseup',   () => cursor.classList.remove('pressing'));
  window.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
  window.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

  const style = document.createElement('style');
  style.textContent = `* { cursor: none !important; }`;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initCustomCursor);