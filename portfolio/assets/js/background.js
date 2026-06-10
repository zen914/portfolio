/* ============================================
   PORTFOLIO — Premium 3D Grid Background
   Cursor parallax & Infinite Scroll Flow
   ============================================ */

(function () {
  const bg   = document.querySelector('.premium-bg');
  const grid = document.querySelector('.perspective-grid');

  if (!bg || !grid) return;

  let targetX  = 0;
  let targetY  = 0;
  let currentX = 0;
  let currentY = 0;

  let scrollTarget  = 0;
  let scrollCurrent = 0;

  // Cursor parallax — desktop only
  if (window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Center at 0,0 — range -0.5 to 0.5
      const cx = x - 0.5;
      const cy = y - 0.5;

      // Distance from center — corners = ~0.7, center = 0
      const dist     = Math.sqrt(cx * cx + cy * cy);
      const strength = Math.min(dist * 1.5, 1);

      // Max shift: 26px horizontal, 18px vertical at corners
      targetX = cx * 26 * strength;
      targetY = cy * 18 * strength;

      // Cursor glow position on the grid surface
      grid.style.setProperty('--cursor-x', `${x * 100}%`);
      grid.style.setProperty('--cursor-y', `${y * 100}%`);
    });
  }

  function updateScrollTarget() {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    scrollTarget = Math.min(window.scrollY / maxScroll, 1);
  }

  window.addEventListener('scroll', updateScrollTarget, { passive: true });
  // Set initial scroll target position
  updateScrollTarget();

  function animate() {
    // Smooth scroll position catch-up
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.055;
    const gridFlow = scrollCurrent * 520;

    // Slow lerp for cursor parallax
    currentX += (targetX - currentX) * 0.045;
    currentY += (targetY - currentY) * 0.045;

    // Apply properties
    bg.style.setProperty('--grid-x', `${currentX}px`);
    bg.style.setProperty('--grid-y', `${currentY}px`);
    bg.style.setProperty('--grid-flow', `${gridFlow}px`);

    // Glows move in opposite direction at 35% strength (parallax depth)
    bg.style.setProperty('--glow-x', `${currentX * -0.35}px`);
    bg.style.setProperty('--glow-y', `${currentY * -0.35}px`);

    requestAnimationFrame(animate);
  }

  animate();
})();
