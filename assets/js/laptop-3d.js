/* ============================================
   PORTFOLIO — 3D Scene Components (r128)
   Laptop, Excel, & Google Sheets 3D Visualizer
   ============================================ */

(function () {
  // Skip on mobile
  if (window.innerWidth <= 768) return;

  const container = document.getElementById('laptop-canvas-container');
  if (!container) return;

  // Dynamically load Three.js + GLTFLoader (r128 — stable legacy build)
  const threeScript = document.createElement('script');
  threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
  threeScript.onload = () => {
    const gltfScript = document.createElement('script');
    gltfScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
    gltfScript.onload = init3DScene;
    document.head.appendChild(gltfScript);
  };
  document.head.appendChild(threeScript);

  function init3DScene() {
    const ICON_CONFIG = {
      // ── Visibility Range ──────────────────────────────────────
      // Change these IDs to control which sections the icons are visible between.
      visibleStartSection: 'services',  // icons appear as this section approaches
      visibleEndSection: 'skills',    // icons disappear after this section passes
      // Fraction of viewport height used for enter/exit transitions (0–1).
      enterOffset: 0.85,   // lower = earlier entry
      exitOffset: 0.35,   // higher = later exit start
      exitTailOffset: 0.4, // extra viewport height after end section before fully gone

      // ── Scale & Speed ─────────────────────────────────────────
      scale: 0.52,
      enterSpeed: 0.12,
      exitSpeed: 0.05,
      scrollFollowSpeed: 0.075,

      // ── Rotation & Float ──────────────────────────────────────
      cursorRotateX: 0.51,
      cursorRotateY: 0.518,
      idleFloat: 0.035,
      idleRotate: 0.535,
      maxIconYaw: 0.85,
      maxIconPitch: 0.42,
      maxIconRoll: 0.32,
      spinYaw: 0.24,
      spinPitch: 0.12,
      spinRoll: 0.08,
      excelSideYaw: 0.68,
      excelFrontYaw: 0.42,
      gsheetSideYaw: -0.68,
      gsheetFrontYaw: -0.42,

      excel: {
        startX: -3.8,
        homeX: -1.75,
        switchX: -2.15,
        exitX: -4.4,
        y: 0.75,
        z: 0.5
      },

      gsheet: {
        startX: 2.8,
        homeX: 1.6,
        switchX: 1.8,
        exitX: 2.6,
        y: -0.35,
        z: -0.35
      }
    };

    const rootStyles = getComputedStyle(document.documentElement);
    function readColorVar(name, fallback) {
      const value = (rootStyles.getPropertyValue(name).trim() || fallback).trim();
      const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hex) {
        const fullHex = hex[1].length === 3
          ? hex[1].split('').map((char) => char + char).join('')
          : hex[1];
        return parseInt(fullHex, 16);
      }

      const rgb = value.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/i);
      if (rgb) {
        return (Number(rgb[1]) << 16) + (Number(rgb[2]) << 8) + Number(rgb[3]);
      }

      return readColorVar('', fallback);
    }

    const COLORS = {
      light: readColorVar('--three-light', '#ffffff'),
      laptopBase: readColorVar('--three-laptop-base', '#2a2a2a'),
      laptopKeyboard: readColorVar('--three-laptop-keyboard', '#1a1a1a'),
      laptopTrackpad: readColorVar('--three-laptop-trackpad', '#333333'),
      screen: readColorVar('--three-screen', '#111111'),
      screenGlow: readColorVar('--three-screen-glow', '#222244'),
      excel: readColorVar('--three-excel', '#107c41'),
      gsheet: readColorVar('--three-gsheet', '#0f9d58')
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    camera.position.set(1.5, 1.2, 3);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // r128 uses outputEncoding
    if (THREE.sRGBEncoding !== undefined) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(COLORS.light, 0.5);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(COLORS.light, 0.95);
    dirLight.position.set(-3, 4, 2);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(COLORS.light, 0.45, 10);
    pointLight.position.set(0, 1.5, 0.5);
    scene.add(pointLight);

    // Model States
    let laptopGroup = null;
    let lidPivot = null;
    let excelGroup = null;
    let gsheetGroup = null;

    const startTime = performance.now();
    let lastTime = performance.now();

    // Scroll & mouse trackers
    let scrollTarget = 0;
    let scrollCurrent = 0;

    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;

    let laptopIntroTime = 0;

    // References to DOM sections — driven by ICON_CONFIG
    const startSec = document.getElementById(ICON_CONFIG.visibleStartSection);
    const endSec = document.getElementById(ICON_CONFIG.visibleEndSection);
    // Keep legacy aliases so the animation block below is easy to read
    const servicesSec = startSec;
    const certsSec = endSec;

    window.addEventListener('mousemove', (e) => {
      mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function updateScrollTarget() {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      scrollTarget = Math.min(window.scrollY / maxScroll, 1);
    }

    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    updateScrollTarget();

    /* Procedural laptop fallback removed — no fallback when GLB missing */


    /* ------- Procedural fallback Excel ------- */
    function createProceduralExcel() {
      excelGroup = new THREE.Group();
      excelGroup.scale.setScalar(ICON_CONFIG.scale);
      const cardGeo = new THREE.BoxGeometry(0.75, 0.75, 0.12);
      const cardMat = new THREE.MeshStandardMaterial({
        color: COLORS.excel, metalness: 0.6, roughness: 0.2
      });
      const card = new THREE.Mesh(cardGeo, cardMat);
      excelGroup.add(card);

      const xBar1Geo = new THREE.BoxGeometry(0.35, 0.08, 0.05);
      const xMat = new THREE.MeshStandardMaterial({ color: COLORS.light, roughness: 0.5 });
      const xBar1 = new THREE.Mesh(xBar1Geo, xMat);
      xBar1.rotation.z = Math.PI / 4;
      xBar1.position.z = 0.08;
      excelGroup.add(xBar1);

      const xBar2Geo = new THREE.BoxGeometry(0.35, 0.08, 0.05);
      const xBar2 = new THREE.Mesh(xBar2Geo, xMat);
      xBar2.rotation.z = -Math.PI / 4;
      xBar2.position.z = 0.08;
      excelGroup.add(xBar2);

      scene.add(excelGroup);
    }

    /* ------- Procedural fallback Google Sheets ------- */
    function createProceduralGSheet() {
      gsheetGroup = new THREE.Group();
      gsheetGroup.scale.setScalar(ICON_CONFIG.scale);
      const cardGeo = new THREE.BoxGeometry(0.75, 0.75, 0.12);
      const cardMat = new THREE.MeshStandardMaterial({
        color: COLORS.gsheet, metalness: 0.6, roughness: 0.2
      });
      const card = new THREE.Mesh(cardGeo, cardMat);
      gsheetGroup.add(card);

      const lineGeo = new THREE.BoxGeometry(0.4, 0.03, 0.05);
      const lineMat = new THREE.MeshStandardMaterial({ color: COLORS.light, roughness: 0.5 });

      const line1 = new THREE.Mesh(lineGeo, lineMat);
      line1.position.set(0, 0.15, 0.08);
      gsheetGroup.add(line1);

      const line2 = new THREE.Mesh(lineGeo, lineMat);
      line2.position.set(0, 0, 0.08);
      gsheetGroup.add(line2);

      const line3 = new THREE.Mesh(lineGeo, lineMat);
      line3.position.set(0, -0.15, 0.08);
      gsheetGroup.add(line3);

      scene.add(gsheetGroup);
    }

    /* ------- Load GLBs ------- */
    const loader = new THREE.GLTFLoader();

    // 1. Laptop
    loader.load(
      'assets/models/laptop.glb',
      (gltf) => {
        laptopGroup = gltf.scene;
        laptopGroup.scale.set(1, 1, 1);
        laptopGroup.traverse((child) => {
          if (child.isMesh) {
            child.material.metalness = 0.6;
            child.material.roughness = 0.4;
          }
          const n = child.name.toLowerCase();
          if (n.includes('lid') || n.includes('screen') || n.includes('top')) {
            lidPivot = child;
          }
        });
        scene.add(laptopGroup);
      }
    );

    // 2. Excel
    loader.load(
      'assets/models/excel.glb',
      (gltf) => {
        excelGroup = gltf.scene;
        excelGroup.scale.setScalar(ICON_CONFIG.scale);
        scene.add(excelGroup);
      },
      undefined,
      () => createProceduralExcel()
    );

    // 3. Google Sheets
    loader.load(
      'assets/models/gsheet.glb',
      (gltf) => {
        gsheetGroup = gltf.scene;
        gsheetGroup.scale.setScalar(ICON_CONFIG.scale);
        scene.add(gsheetGroup);
      },
      undefined,
      () => createProceduralGSheet()
    );

    // Smoothed transition values for Excel / GSheets
    let enterProgress = 0;
    let exitProgress = 0;

    let iconSpinVelocity = 0;
    let iconSpin = 0;
    let lastScrollY = window.scrollY;

    /* ------- Animation loop ------- */
    function animate() {
      requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      updateScrollTarget();

      // Faster scroll response sync
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.1;

      const scrollDelta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;

      // Scroll adds momentum.
      iconSpinVelocity += scrollDelta * 0.0001;

      // Friction slows it smoothly.
      iconSpinVelocity *= 0.92;

      // Constant slow space rotation.
      iconSpinVelocity += 0.0001;

      iconSpin += iconSpinVelocity;

      // Mouse values smoothing
      mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.055;
      mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.055;

      // Update laptop intro timer based on scroll location
      if (scrollCurrent < 0.005) {
        laptopIntroTime = Math.min(laptopIntroTime + delta, 2.5);
      } else if (scrollCurrent > 0.075) {
        laptopIntroTime = 0;
      }

      const idleTime = Math.max(laptopIntroTime - 1.6, 0);

      // Current scroll value
      const scrollY = window.scrollY;

      /* ============================================================
         1. LAPTOP ANIMATION
         ============================================================ */
      if (laptopGroup) {
        const intro = easeOutCubic(Math.min(laptopIntroTime / 1.6, 1));
        const outro = smoothstep(0.005, 0.075, scrollCurrent);

        const idleY = Math.sin(idleTime * 1.4) * 0.035;
        const idleRotY = Math.sin(idleTime * 0.55) * 0.025;

        const homeX = 1.15;
        const baseX = lerp(3.8, homeX, intro);
        const baseY = 0.02 + idleY;
        const baseZ = lerp(0.35, 0, intro);

        const cursorYaw = mouseCurrentX * 0.16;
        const cursorPitch = mouseCurrentY * -0.07;

        laptopGroup.position.x = lerp(baseX, 4.75, outro);
        laptopGroup.position.y = lerp(baseY, 1.25, outro);
        laptopGroup.position.z = lerp(baseZ, 2.65, outro);

        laptopGroup.rotation.y =
          lerp(0.85, 0.24 + idleRotY + cursorYaw, intro) +
          outro * 0.95;

        laptopGroup.rotation.x = cursorPitch + outro * -0.16;
        laptopGroup.rotation.z = outro * -0.14;

        laptopGroup.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 1 - outro;
          }
        });

        if (lidPivot) {
          const lidOpen = easeInOutCubic(Math.min(Math.max((laptopIntroTime - 0.8) / 1.2, 0), 1));
          lidPivot.rotation.x = (Math.PI / 2) * (1 - lidOpen);
        }
      }

      /* ============================================================
         2. EXCEL & GSHEET SERVICE MODELS ANIMATION
         ============================================================ */
      const servicesTop = servicesSec ? servicesSec.offsetTop : 900;
      const certsBottom = endSec ? (endSec.offsetTop + endSec.offsetHeight) : 2600;

      // Enter when approaching the start section — driven by ICON_CONFIG.enterOffset
      const enterStart = servicesTop - window.innerHeight * ICON_CONFIG.enterOffset;
      const enterEnd = servicesTop - window.innerHeight * 0.15;
      const targetEnter = clamp((scrollY - enterStart) / (enterEnd - enterStart || 1), 0, 1);

      // Exit after the end section — driven by ICON_CONFIG.exitOffset / exitTailOffset
      const exitStart = certsBottom - window.innerHeight * ICON_CONFIG.exitOffset;
      const exitEnd = certsBottom + window.innerHeight * ICON_CONFIG.exitTailOffset;
      const targetExit = clamp((scrollY - exitStart) / (exitEnd - exitStart || 1), 0, 1);

      // Smooth transition progress
      enterProgress += (targetEnter - enterProgress) * ICON_CONFIG.enterSpeed;
      exitProgress += (targetExit - exitProgress) * ICON_CONFIG.exitSpeed;

      const activeProgress = enterProgress * (1 - exitProgress);
      const isVisible = activeProgress > 0.01;

      // Scroll progress specifically within active range (for gradual float upwards)
      const rangeScroll = clamp((scrollY - servicesTop) / (certsBottom - servicesTop || 1), 0, 1);
      const rangeSmooth = smoothstep(0, 1, rangeScroll);

      // Cursor interaction offsets
      const iconYaw = mouseCurrentX * ICON_CONFIG.cursorRotateY;
      const iconPitch = mouseCurrentY * -ICON_CONFIG.cursorRotateX;

      // A. Excel (Left)
      if (excelGroup) {
        excelGroup.visible = isVisible;
        if (isVisible) {
          const cfg = ICON_CONFIG.excel;

          const homeX = lerp(cfg.homeX, cfg.switchX, rangeSmooth);
          const enterX = lerp(cfg.startX, homeX, enterProgress);
          const finalX = lerp(enterX, cfg.exitX, exitProgress);

          excelGroup.position.set(
            finalX,
            cfg.y + Math.sin(idleTime * 1.3) * ICON_CONFIG.idleFloat,
            cfg.z
          );

          const excelSpinYaw = Math.sin(iconSpin) * ICON_CONFIG.spinYaw;
          const excelBaseYaw = lerp(
            lerp(ICON_CONFIG.excelSideYaw, ICON_CONFIG.excelFrontYaw, enterProgress),
            ICON_CONFIG.excelSideYaw,
            exitProgress
          );

          excelGroup.rotation.y = clamp(excelBaseYaw + excelSpinYaw + iconYaw, -ICON_CONFIG.maxIconYaw, ICON_CONFIG.maxIconYaw);
          excelGroup.rotation.x = clamp(Math.sin(iconSpin * 0.7) * ICON_CONFIG.spinPitch + iconPitch, -ICON_CONFIG.maxIconPitch, ICON_CONFIG.maxIconPitch);
          excelGroup.rotation.z = clamp(Math.cos(iconSpin * 0.5) * ICON_CONFIG.spinRoll, -ICON_CONFIG.maxIconRoll, ICON_CONFIG.maxIconRoll);
        }
      }

      // B. Google Sheets (Right)
      if (gsheetGroup) {
        gsheetGroup.visible = isVisible;
        if (isVisible) {
          const cfg = ICON_CONFIG.gsheet;

          const homeX = lerp(cfg.homeX, cfg.switchX, rangeSmooth);
          const enterX = lerp(cfg.startX, homeX, enterProgress);
          const finalX = lerp(enterX, cfg.exitX, exitProgress);

          gsheetGroup.position.set(
            finalX,
            cfg.y + Math.sin(idleTime * 1.1) * ICON_CONFIG.idleFloat,
            cfg.z
          );

          const gsheetSpinYaw = -Math.sin(iconSpin) * ICON_CONFIG.spinYaw;
          const gsheetBaseYaw = lerp(
            lerp(ICON_CONFIG.gsheetSideYaw, ICON_CONFIG.gsheetFrontYaw, enterProgress),
            ICON_CONFIG.gsheetSideYaw,
            exitProgress
          );

          gsheetGroup.rotation.y = clamp(gsheetBaseYaw + gsheetSpinYaw + iconYaw, -ICON_CONFIG.maxIconYaw, ICON_CONFIG.maxIconYaw);
          gsheetGroup.rotation.x = clamp(Math.cos(iconSpin * 0.65) * ICON_CONFIG.spinPitch + iconPitch, -ICON_CONFIG.maxIconPitch, ICON_CONFIG.maxIconPitch);
          gsheetGroup.rotation.z = clamp(-Math.sin(iconSpin * 0.55) * ICON_CONFIG.spinRoll, -ICON_CONFIG.maxIconRoll, ICON_CONFIG.maxIconRoll);
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    /* ------- Resize handler ------- */
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        renderer.domElement.style.display = 'none';
        return;
      }
      renderer.domElement.style.display = '';
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
  }

  // Animation Helper Functions
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
    return t * t * (3 - 2 * t);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
})();
