/* ============================================
   PORTFOLIO — Main Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initProjectOrder();
  initNavbar();
  initNavLinks();
  initScrollIndicator();
  initScrollReveal();
  initSkillBars();
  initScrollTop();
  initHorizontalScroll();
  initProjectScrollDots();
  initCardTilt();
  initProjectModal();
  initTypewriter();
});

function initProjectOrder() {
  const track = document.querySelector('.portfolio-horizontal-track');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.project-card'));
  cards
    .sort((a, b) => {
      const aOrder = Number((a.dataset.project || '').match(/\d+$/)?.[0] || 0);
      const bOrder = Number((b.dataset.project || '').match(/\d+$/)?.[0] || 0);
      return aOrder - bOrder;
    })
    .forEach(card => track.appendChild(card));
}

// ============================================================
// MOMENTUM SCROLL ENGINE
// Desktop only — mobile uses native touch scroll
// ============================================================
(function () {
  if (window.innerWidth <= 768) return;

  const SCROLL_SETTINGS = {
    // Lower inputScale = each wheel move travels less distance.
    inputScale: 0.075,
    // Higher friction = momentum lasts longer. Keep below 1.
    friction: 0.935,
    // Lower maxVelocity keeps quick scroll gestures from jumping too far.
    maxVelocity: 42,
    // Stop once the remaining movement is tiny.
    stopThreshold: 0.28,
    // Lower navEase = slower, smoother section-link scrolling.
    navEase: 0.065,
    navStopThreshold: 1.2,
    keyboardScale: 0.55,
    projectScrollMultiplier: 0.48
  };

  let currentY = window.scrollY;
  let velocity = 0;
  let ticking = false;
  let scrollLocked = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function maxScrollY() {
    return document.documentElement.scrollHeight - window.innerHeight;
  }

  function projectScrollMultiplier() {
    const portfolio = document.getElementById('portfolio');
    if (!portfolio) return 1;

    const rect = portfolio.getBoundingClientRect();
    const isInsidePortfolio = rect.top <= 0 && rect.bottom >= window.innerHeight;
    return isInsidePortfolio ? SCROLL_SETTINGS.projectScrollMultiplier : 1;
  }

  window._setMomentumScrollLocked = (locked) => {
    scrollLocked = locked;
    velocity = 0;
    ticking = false;
    isNavScrolling = false;
    currentY = window.scrollY;
  };

  function tick() {
    if (scrollLocked) return;

    // Decay velocity by friction — this is the ONLY physics happening, no spring
    velocity *= SCROLL_SETTINGS.friction;
    currentY += velocity;
    currentY = clamp(currentY, 0, maxScrollY());

    window.scrollTo(0, currentY);

    if (Math.abs(velocity) > SCROLL_SETTINGS.stopThreshold) {
      requestAnimationFrame(tick);
    } else {
      velocity = 0;
      ticking = false;
    }
  }

  // Wheel — add deltaY straight to velocity, no targetY
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (scrollLocked) return;

    currentY = window.scrollY; // sync position before adding
    velocity = clamp(
      velocity + e.deltaY * SCROLL_SETTINGS.inputScale * projectScrollMultiplier(),
      -SCROLL_SETTINGS.maxVelocity,
      SCROLL_SETTINGS.maxVelocity
    );
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }, { passive: false });

  let isNavScrolling = false;
  let navScrollTarget = 0;

  // Expose for nav clicks / scroll-top — smooth glide to destination
  window._scrollTo = (y) => {
    if (scrollLocked) return;

    navScrollTarget = clamp(y, 0, maxScrollY());
    isNavScrolling = true;
    velocity = 0;

    function animateScroll() {
      if (!isNavScrolling) return;
      const current = window.scrollY;
      const diff = navScrollTarget - current;
      if (Math.abs(diff) < SCROLL_SETTINGS.navStopThreshold) {
        window.scrollTo(0, navScrollTarget);
        currentY = navScrollTarget;
        isNavScrolling = false;
      } else {
        currentY = current + diff * SCROLL_SETTINGS.navEase;
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
    if (scrollLocked) {
      e.preventDefault();
      return;
    }

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
      velocity = clamp(
        velocity + amount * SCROLL_SETTINGS.keyboardScale * projectScrollMultiplier(),
        -SCROLL_SETTINGS.maxVelocity,
        SCROLL_SETTINGS.maxVelocity
      );
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
      const children = entry.target.querySelectorAll(
        '.stagger-child:not(.service-card):not(.why-card)'
      );

      if (entry.isIntersecting) {
        children.forEach((child, i) => {
          setTimeout(() => {
            if (entry.isIntersecting) {
              child.classList.add('visible');
            }
          }, i * 75);
        });
      } else {
        children.forEach(child => child.classList.remove('visible'));
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.stagger-parent').forEach(el => staggerObserver.observe(el));

  const specialCardVisible = new WeakSet();
  const specialCardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target;

      if (entry.isIntersecting) {
        specialCardVisible.add(card);
        const index = Array.from(card.parentElement.children).indexOf(card);

        setTimeout(() => {
          if (specialCardVisible.has(card)) {
            card.classList.add('visible');
          }
        }, Math.max(index, 0) * 80);
      } else {
        specialCardVisible.delete(card);
        card.classList.remove('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.service-card.stagger-child, .why-card.stagger-child').forEach(card => {
    specialCardObserver.observe(card);
  });
}

/* ---- Subtle 3D tilt for Services & Why Me cards ---- */
function initCardTilt() {
  const cards = document.querySelectorAll('.service-card, .why-card');
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(card => {
    let frame = null;

    card.addEventListener('mousemove', (e) => {
      if (frame) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const strength = 9;

        card.style.setProperty('--tilt-x', `${(-y * strength).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * strength).toFixed(2)}deg`);
        frame = null;
      });
    });

    card.addEventListener('mouseleave', () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

/* ---- Project Gallery Modal ---- */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const modalStage = modal?.querySelector('.project-modal-image-stage');
  const imageCard = modal?.querySelector('.project-image-card');
  const modalImg = modal?.querySelector('.project-modal-img');
  const modalTitle = modal?.querySelector('#project-modal-title');
  const modalDesc = modal?.querySelector('.project-modal-desc');
  const modalCount = modal?.querySelector('.project-modal-count');
  const prevBtn = modal?.querySelector('[data-project-prev]');
  const nextBtn = modal?.querySelector('[data-project-next]');
  const cards = document.querySelectorAll('.project-card');

  if (!modal || !modalStage || !imageCard || !modalImg || !modalTitle || !modalDesc || !modalCount || !prevBtn || !nextBtn || !cards.length) {
    return;
  }

  const state = {
    images: [],
    index: 0,
    scrollY: 0,
    isAnimating: false,
    zoom: 1,
    zoomTarget: 1,
    zoomFrame: null,
    pointerX: 50,
    pointerY: 50
  };

  function imageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function findProjectImages(projectName) {
    const images = [];
    let number = 1;

    while (await imageExists(`assets/images/projects/${projectName}/${number}.png`)) {
      images.push(`assets/images/projects/${projectName}/${number}.png`);
      number += 1;
    }

    return images.length ? images : [`assets/images/projects/${projectName}/cover.png`];
  }

  function lockPage() {
    state.scrollY = window.scrollY;
    if (typeof window._setMomentumScrollLocked === 'function') {
      window._setMomentumScrollLocked(true);
    }
    document.body.classList.add('project-modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${state.scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPage() {
    document.body.classList.remove('project-modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, state.scrollY);
    if (typeof window._setMomentumScrollLocked === 'function') {
      window._setMomentumScrollLocked(false);
    }
  }

  function setZoom(value) {
    state.zoomTarget = Math.max(1, Math.min(value, 2.35));
    if (state.zoomFrame) return;

    function animateZoom() {
      state.zoom += (state.zoomTarget - state.zoom) * 0.18;
      if (Math.abs(state.zoomTarget - state.zoom) < 0.01) {
        state.zoom = state.zoomTarget;
      }

      modalImg.style.setProperty('--modal-zoom', state.zoom.toFixed(3));
      modalImg.style.setProperty('--modal-zoom-x', `${state.pointerX}%`);
      modalImg.style.setProperty('--modal-zoom-y', `${state.pointerY}%`);

      if (state.zoom !== state.zoomTarget) {
        state.zoomFrame = requestAnimationFrame(animateZoom);
      } else {
        state.zoomFrame = null;
      }
    }

    state.zoomFrame = requestAnimationFrame(animateZoom);
  }

  function resetZoom() {
    state.zoom = 1;
    state.zoomTarget = 1;
    state.pointerX = 50;
    state.pointerY = 50;
    modalImg.style.setProperty('--modal-zoom', '1');
    modalImg.style.setProperty('--modal-zoom-x', '50%');
    modalImg.style.setProperty('--modal-zoom-y', '50%');
  }

  function updateModalMeta() {
    modalImg.alt = `${modalTitle.textContent} sample ${state.index + 1}`;
    modalCount.textContent = `${state.index + 1} / ${state.images.length}`;
    prevBtn.disabled = state.images.length <= 1;
    nextBtn.disabled = state.images.length <= 1;
  }

  function renderImage() {
    modalImg.src = state.images[state.index];
    resetZoom();
    updateModalMeta();
  }

  function showImage(nextIndex, direction) {
  if (!state.images.length || state.isAnimating) return;

  const newIndex = (nextIndex + state.images.length) % state.images.length;
  if (newIndex === state.index) return;

  state.isAnimating = true;
  resetZoom();

  const exitTo = direction > 0 ? '-1' : '1'; // next exits left, prev exits right

  // Exit: current image shrinks and slides out
  imageCard.style.transition = 'transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.22s ease';
  imageCard.style.transform = `translateX(${exitTo === '-1' ? '-60px' : '60px'}) scale(0.82)`;
  imageCard.style.opacity = '0';

  setTimeout(() => {
    // Swap image
    state.index = newIndex;
    modalImg.src = state.images[state.index];
    updateModalMeta();

    // Position new image on the incoming side instantly (no transition)
    imageCard.style.transition = 'none';
    imageCard.style.transform = `translateX(${direction > 0 ? '60px' : '-60px'}) scale(0.82)`;
    imageCard.style.opacity = '0';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Enter: slide in and grow to normal size with bounce
        imageCard.style.transition = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s ease';
        imageCard.style.transform = 'translateX(0) scale(1)';
        imageCard.style.opacity = '1';
      });
    });
  }, 220);

  setTimeout(() => {
    state.isAnimating = false;
  }, 620);
}

  async function openProject(card) {
    const projectName = card.dataset.project;
    if (!projectName) return;

    const title = card.querySelector('.project-title')?.textContent.trim() || 'Project';
    const description = card.dataset.description || '';

    state.images = await findProjectImages(projectName);
    state.index = 0;

    modalTitle.textContent = title;
    modalDesc.textContent = description;
    renderImage();
    lockPage();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    nextBtn.focus();
  }

  function closeProject() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    resetZoom();
    unlockPage();
  }

  cards.forEach(card => {
    const button = card.querySelector('.project-link');
    button?.addEventListener('click', () => openProject(card));
  });

  nextBtn.addEventListener('click', () => showImage(state.index + 1, 1));
  prevBtn.addEventListener('click', () => showImage(state.index - 1, -1));
  modalStage.addEventListener('click', (e) => {
    if (state.images.length <= 1 || state.zoom > 1.04 || state.isAnimating) return;

    const rect = modalStage.getBoundingClientRect();
    const isRightHalf = e.clientX - rect.left > rect.width / 2;
    showImage(state.index + (isRightHalf ? 1 : -1), isRightHalf ? 1 : -1);
  });
  modalStage.addEventListener('mousemove', (e) => {
    const rect = modalStage.getBoundingClientRect();
    state.pointerX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    state.pointerY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    modalImg.style.setProperty('--modal-zoom-x', `${state.pointerX}%`);
    modalImg.style.setProperty('--modal-zoom-y', `${state.pointerY}%`);
  });
  modalStage.addEventListener('wheel', (e) => {
    if (!modal.classList.contains('open')) return;

    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.16 : -0.16;
    setZoom(state.zoomTarget + delta);
  }, { passive: false });
  modalStage.addEventListener('mouseleave', () => {
    setZoom(1);
  });
  modal.querySelectorAll('[data-project-close]').forEach(button => {
    button.addEventListener('click', closeProject);
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;

    if (e.key === 'Escape') closeProject();
    if (e.key === 'ArrowRight') showImage(state.index + 1, 1);
    if (e.key === 'ArrowLeft') showImage(state.index - 1, -1);
  });
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
  const stickyContent = document.querySelector('.portfolio-sticky-wrapper .container');

  if (!portfolio || !track || !container || !stickyContent) return;

  let lastTranslate = 0;
  let lastVerticalDrift = 0;

  function syncPortfolioHeight() {
    const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
    const scrollDistance = Math.max(window.innerHeight * 1.35, maxTranslate * 1.35);
    portfolio.style.height = `${window.innerHeight + scrollDistance}px`;
  }

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
    const targetVerticalDrift = (0.5 - progress) * 140;
    lastVerticalDrift += (targetVerticalDrift - lastVerticalDrift) * 0.12;

    track.style.transform = `translate3d(${lastTranslate}px, 0, 0)`;
    stickyContent.style.transform = `translate3d(0, ${lastVerticalDrift}px, 0)`;
  }

  // Update on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      track.style.transform = 'none';
      portfolio.style.height = '';
      stickyContent.style.transform = 'none';
    } else {
      syncPortfolioHeight();
      update();
    }
  });

  window.addEventListener('load', syncPortfolioHeight);
  track.querySelectorAll('img').forEach(img => {
    if (img.complete) return;
    img.addEventListener('load', syncPortfolioHeight, { once: true });
  });
  syncPortfolioHeight();

  // Run update inside animation loop for buttery smooth tracking
  function loop() {
    if (window.innerWidth > 768) {
      update();
      requestAnimationFrame(loop);
    }
  }
  loop();
}

/* ---- Project Scroll Dots ---- */
function initProjectScrollDots() {
  if (window.innerWidth <= 768) return;

  const portfolio = document.getElementById('portfolio');
  const track = document.querySelector('.portfolio-horizontal-track');
  const container = document.querySelector('.portfolio-horizontal-container');
  const dotsContainer = document.querySelector('.project-scroll-dots');

  if (!portfolio || !track || !container || !dotsContainer) return;

  const cards = track.querySelectorAll('.project-card');
  if (cards.length === 0) return;

  dotsContainer.innerHTML = '';
  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'project-scroll-dot';
    dot.setAttribute('aria-label', `View project ${index + 1}`);
    dot.dataset.projectIndex = index;
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.project-scroll-dot');

  function updateActiveDot() {
    const rect = portfolio.getBoundingClientRect();
    const top = rect.top;
    const height = rect.height;

    const scrollable = height - window.innerHeight;
    const scrolled = -top;
    const progress = Math.max(0, Math.min(1, scrolled / (scrollable || 1)));

    const maxTranslate = Math.max(0, track.scrollWidth - container.offsetWidth);
    const cardWidth = cards[0]?.offsetWidth || 1;
    const gapWidth = 20;
    const activeIndex = Math.round(progress * (cards.length - 1));

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }

  window.addEventListener('scroll', updateActiveDot, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      dotsContainer.innerHTML = '';
    }
  });

  updateActiveDot();
}

function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const words = [
    'Accurate Data Entry',
    'Clean Spreadsheets',
    'Interactive Dashboards',
    'Inventory Tracking',
    'Sales Reporting',
    'Business Insights'
  ];

const TYPE_SPEED = 85;        // slightly slower = more human
const DELETE_SPEED = 45;      // faster delete feels natural
const PAUSE_AFTER = 2200;     // more reading time
const PAUSE_BEFORE = 500;     // breath before next word

  let state = { wordIndex: 0, charIndex: 0, isDeleting: false };

  function renderChars(text) {
    el.innerHTML = text
      .split('')
      .map(ch => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`)
      .join('');
  }

function triggerGlow() {
  el.classList.add('glow');
  const spans = el.querySelectorAll('span');
  const totalDuration = PAUSE_AFTER - 200; // finish just before delete starts
  const staggerPerLetter = totalDuration / spans.length;
  spans.forEach((span, i) => {
    span.style.animationDelay = `${i * staggerPerLetter}ms`;
  });
}

  function loop() {
    const word = words[state.wordIndex];

    if (!state.isDeleting) {
      if (state.charIndex < word.length) {
        state.charIndex++;
        renderChars(word.substring(0, state.charIndex));
        setTimeout(loop, TYPE_SPEED);
      } else {
  // Word complete — glow stays entire PAUSE_AFTER duration
  triggerGlow();
setTimeout(() => {
  // fade all spans out together smoothly
  el.classList.add('glow-out');
  
  setTimeout(() => {
    el.classList.remove('glow');
    el.classList.remove('glow-out');
    state.isDeleting = true;
    setTimeout(loop, 50);
  }, 600); // wait for fade-out transition to finish

}, PAUSE_AFTER - 600); // start fade-out 600ms before delete begins
}
    } else {
      if (state.charIndex > 0) {
        state.charIndex--;
        renderChars(word.substring(0, state.charIndex));
        setTimeout(loop, DELETE_SPEED + (Math.random() * 20 - 10));
      } else {
        state.wordIndex = (state.wordIndex + 1) % words.length;
        state.isDeleting = false;
        setTimeout(loop, TYPE_SPEED + (Math.random() * 60 - 30));
      }
    }
  }

  loop();
}