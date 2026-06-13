function initCustomCursor() {
  if (window.innerWidth <= 768) return;

  // Create cursor element
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = `
    <div class="cursor-dot"></div>
    <div class="cursor-zoom-ring"></div>
  `;
  document.body.appendChild(cursor);

  // Hide default cursor globally
  document.body.style.cursor = 'none';

  let posX = -100, posY = -100;
  let targetX = -100, targetY = -100;
  let isMoving = false;
  let moveTimer = null;
  let currentState = 'default'; // default | hover | text | zoom

  // Smooth follow loop
  function loop() {
    posX += (targetX - posX) * 0.12;
    posY += (targetY - posY) * 0.12;
    cursor.style.transform = `translate(${posX}px, ${posY}px)`;
    requestAnimationFrame(loop);
  }
  loop();

  // Track mouse position
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    // Moving glow
    if (!isMoving) {
      isMoving = true;
      cursor.classList.add('moving');
    }
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      isMoving = false;
      cursor.classList.remove('moving');
    }, 120);

    // Check what element is under cursor
    updateState(e.target);
  });

  function updateState(el) {
    const isZoom = el.closest('.project-modal-image-stage') !== null;
    const isText = window.getComputedStyle(el).cursor === 'text' ||
                   el.matches('p, h1, h2, h3, h4, h5, h6, span, li, label, input, textarea');
    const isClickable = el.matches('a, button, [role="button"], .project-card, .scroll-dot') ||
                        el.closest('a, button, [role="button"], .project-card') !== null;

    let newState = 'default';
    if (isZoom)      newState = 'zoom';
    else if (isText) newState = 'text';
    else if (isClickable) newState = 'hover';

    if (newState !== currentState) {
      cursor.classList.remove('state-default', 'state-hover', 'state-text', 'state-zoom');
      cursor.classList.add(`state-${newState}`);
      currentState = newState;
    }
  }

  // Click press effect
  window.addEventListener('mousedown', () => cursor.classList.add('pressing'));
  window.addEventListener('mouseup',   () => cursor.classList.remove('pressing'));

  // Hide when leaving window
  window.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
  window.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

  // Hide native cursor on all elements
  const style = document.createElement('style');
  style.textContent = `* { cursor: none !important; }`;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initCustomCursor);