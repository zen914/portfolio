/* ============================================
   PORTFOLIO — Main Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initNavLinks();
  initScrollIndicator();
  initScrollReveal();
  initSkillBars();
  initScrollTop();
  initHorizontalScroll();
});

// ============================================================
// MOMENTUM SCROLL ENGINE
// Desktop only — mobile uses native touch scroll
// ============================================================
(function () {
  if (window.innerWidth <= 768) return;

  let currentY = window.scrollY;
  let velocity = 0;
  let ticking = false;

  // friction: how fast the glide dies out each frame
  // 0.90 = short glide | 0.92 = medium | 0.95 = long silky glide
  const friction = 0.75;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function maxScrollY() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function tick() {
    // Decay velocity by friction — this is the ONLY physics happening, no spring
    velocity *= friction;
    currentY += velocity;
    currentY = clamp(currentY, 0, maxScrollY());

    window.scrollTo(0, currentY);

    if (Math.abs(velocity) > 0.5) {
      requestAnimationFrame(tick);
    } else {
      velocity = 0;
      ticking = false;
    }
  }

  // Wheel — add deltaY straight to velocity, no targetY
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    currentY = window.scrollY; // sync position before adding
    velocity += e.deltaY * 0.3; // 0.8 scales raw deltaY to a comfortable speed
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }, { passive: false });

  let isNavScrolling = false;
  let navScrollTarget = 0;

  // Expose for nav clicks / scroll-top — smooth glide to destination
  window._scrollTo = (y) => {
    navScrollTarget = clamp(y, 0, maxScrollY());
    isNavScrolling = true;
    velocity = 0;
    
    function animateScroll() {
      if (!isNavScrolling) return;
      const current = window.scrollY;
      const diff = navScrollTarget - current;
      if (Math.abs(diff) < 1.5) {
        window.scrollTo(0, navScrollTarget);
        currentY = navScrollTarget;
        isNavScrolling = false;
      } else {
        currentY = current + diff * 0.085; // smooth deceleration
        window.scrollTo(0, currentY);
        requestAnimationFrame(animateScroll);
      }
    }
    animateScroll();
  };

  // Cancel glide if user manually scrolls with wheel
  window.addEventListener('wheel', () => {
    isNavScrolling = false;
  }, { passive: true });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const map = {
      ArrowDown: 100,
      ArrowUp: -100,
      PageDown: window.innerHeight * 0.85,
      PageUp: -(window.innerHeight * 0.85),
      ' ': window.innerHeight * 0.85,
    };
    if (e.key === 'Home') { e.preventDefault(); window._scrollTo(0); return; }
    if (e.key === 'End') { e.preventDefault(); window._scrollTo(maxScrollY()); return; }
    const amount = map[e.key];
    if (amount !== undefined) {
      e.preventDefault();
      currentY = window.scrollY;
      velocity += amount;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(tick);
      }
    }
  });
})();

/* ---- Navbar: hide on scroll down, show on scroll up ---- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  let lastScroll = 0;
  const threshold = 80;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > threshold) {
      navbar.classList.toggle('hidden', current > lastScroll);
    } else {
      navbar.classList.remove('hidden');
    }
    lastScroll = current;
  }, { passive: true });

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ---- Nav Link & Scroll-Dot Clicks ---- */
function initNavLinks() {
  // Anchor links — use momentum engine on desktop, scrollIntoView on mobile
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerOffset = 90;
      const targetTop = target.offsetTop - headerOffset;
      if (typeof window._scrollTo === 'function') {
        window._scrollTo(targetTop);
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Scroll-dot clicks
  document.querySelectorAll('.scroll-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const sections = document.querySelectorAll('section[id]');
      if (!sections[i]) return;
      const headerOffset = 90;
      const targetTop = sections[i].offsetTop - headerOffset;
      if (typeof window._scrollTo === 'function') {
        window._scrollTo(targetTop);
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ---- Scroll Indicator: progress bar + active dot ---- */
function initScrollIndicator() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  const dots = document.querySelectorAll('.scroll-dot');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && maxScroll > 0) {
      progressBar.style.height = `${(scrollY / maxScroll) * 100}%`;
    }

    sections.forEach((section, i) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        dots.forEach(d => d.classList.remove('active'));
        if (dots[i]) dots[i].classList.add('active');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + section.id);
        });
      }
    });
  }, { passive: true });
}

/* ---- Scroll Reveal (IntersectionObserver) ---- */
function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .stagger-child').forEach(el => el.classList.add('visible'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stagger-child').forEach((child, i) => {
          setTimeout(() => {
            if (entry.isIntersecting) {
              child.classList.add('visible');
            }
          }, i * 75);
        });
      } else {
        entry.target.querySelectorAll('.stagger-child').forEach(child => {
          child.classList.remove('visible');
        });
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.stagger-parent').forEach(el => staggerObserver.observe(el));
}

/* ---- Skill Bars: animate width on view ---- */
function initSkillBars() {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(fill => {
          fill.style.width = fill.getAttribute('data-percent') + '%';
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skills-col').forEach(el => skillObserver.observe(el));
}

/* ---- Scroll-to-top button ---- */
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    if (typeof window._scrollTo === 'function') {
      window._scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ---- Horizontal Projects Scroll ---- */
function initHorizontalScroll() {
  if (window.innerWidth <= 768) return;

  const portfolio = document.getElementById('portfolio');
  const track = document.querySelector('.portfolio-horizontal-track');
  const container = document.querySelector('.portfolio-horizontal-container');

  if (!portfolio || !track || !container) return;

  let lastTranslate = 0;

  function update() {
    const rect = portfolio.getBoundingClientRect();
    const top = rect.top;
    const height = rect.height;
    
    const scrollable = height - window.innerHeight;
    const scrolled = -top;
    
    const progress = Math.max(0, Math.min(1, scrolled / (scrollable || 1)));

    const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
    const targetTranslate = -progress * maxTranslate;

    // Smoothed transition using lerp
    lastTranslate += (targetTranslate - lastTranslate) * 0.12;
    
    track.style.transform = `translate3d(${lastTranslate}px, 0, 0)`;
  }

  // Update on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      track.style.transform = 'none';
    } else {
      update();
    }
  });

  // Run update inside animation loop for buttery smooth tracking
  function loop() {
    if (window.innerWidth > 768) {
      update();
      requestAnimationFrame(loop);
    }
  }
  loop();
}
