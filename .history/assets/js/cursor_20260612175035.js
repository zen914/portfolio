function initCustomCursor() {
  if (window.innerWidth <= 768) return;

  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  cursor.innerHTML = `
    <div class="cursor-dot"></div>
  `;
  document.body.appendChild(cursor);

  // Ring is separate from cursor div so it has its own position
  const ring = document.createElement('div');
  ring.className = 'cursor-zoom-ring';
  document.body.appendChild(ring);

  let currentState = 'default';
  let moveTimer = null;
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  // Ring lerp loop
  function ringLoop() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';

    if (!cursor.classList.contains('moving')) cursor.classList.add('moving');
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => cursor.classList.remove('moving'), 150);

// remove this line entirely:
ring.className = `cursor-zoom-ring ring-${newState}`;

// replace with just:
ring.className = `cursor-zoom-ring${newState === 'hover' ? ' ring-hover' : ''}`;

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
      // sync ring state
      ring.className = `cursor-zoom-ring ring-${newState}`;
      currentState = newState;
    }
  }

  window.addEventListener('mousedown', () => {
    cursor.classList.add('pressing');
    ring.classList.add('pressing');
  });
  window.addEventListener('mouseup', () => {
    cursor.classList.remove('pressing');
    ring.classList.remove('pressing');
  });
  window.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
    ring.classList.add('hidden');
  });
  window.addEventListener('mouseenter', () => {
    cursor.classList.remove('hidden');
    ring.classList.remove('hidden');
  });

  const style = document.createElement('style');
  style.textContent = `* { cursor: none !important; }`;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initCustomCursor);