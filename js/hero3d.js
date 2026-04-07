/* ============================================================
   WRLZ WEBDESIGN — Three.js Hero: Flying Monitors
   ============================================================ */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // Ambient + point lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const pointLight1 = new THREE.PointLight(0xff6b2c, 1.2, 30);
  pointLight1.position.set(5, 5, 8);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7b61ff, 0.8, 30);
  pointLight2.position.set(-5, -3, 6);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0x00d4ff, 0.5, 30);
  pointLight3.position.set(0, 4, 10);
  scene.add(pointLight3);

  // --- Create screen meshes ---
  const screens = [];
  const screenData = [
    // [width, height, x, y, z, rotY, rotX, type]
    [3.2, 2,    -4,   1.5,  -2,  0.3,  0.1,  'monitor'],
    [3.2, 2,     4,   0.5,  -1,  -0.25, 0.05, 'monitor'],
    [3.2, 2,     0,  -1.8,  -3,  0.1,  -0.15, 'monitor'],
    [1.6, 2.4,  -6,  -0.5,  -4,  0.4,   0,    'tablet'],
    [1.6, 2.4,   6.5, 2,    -5,  -0.35, 0.1,  'tablet'],
    [0.9, 1.8,   2.5, 2.8,  -3,  -0.1, -0.05, 'phone'],
    [0.9, 1.8,  -2.5,-2.8,  -4,  0.15,  0.1,  'phone'],
  ];

  // Website preview colors for screens
  const screenColors = [0x1a1a2e, 0x16213e, 0x0f3460, 0x1a1a2e, 0x16213e, 0x0f3460, 0x1a1a2e];
  const accentColors = [0xff6b2c, 0x7b61ff, 0x00d4ff, 0xff6b2c, 0x4ade80, 0x7b61ff, 0x00d4ff];

  screenData.forEach(([w, h, x, y, z, ry, rx, type], i) => {
    const group = new THREE.Group();

    // Screen bezel (frame)
    const bezelPad = 0.12;
    const bezelGeo = new THREE.BoxGeometry(w + bezelPad * 2, h + bezelPad * 2, 0.08);
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1f,
      metalness: 0.8,
      roughness: 0.3,
    });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    group.add(bezel);

    // Screen surface (emissive glow)
    const screenGeo = new THREE.PlaneGeometry(w, h);
    const screenMat = new THREE.MeshStandardMaterial({
      color: screenColors[i],
      emissive: screenColors[i],
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.5,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = 0.045;
    group.add(screenMesh);

    // Fake UI elements on screen
    createScreenUI(group, w, h, accentColors[i]);

    // Position
    group.position.set(x, y, z);
    group.rotation.set(rx, ry, 0);

    scene.add(group);
    screens.push({
      mesh: group,
      basePos: { x, y, z },
      baseRot: { x: rx, y: ry },
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      amplitude: 0.15 + Math.random() * 0.15,
    });
  });

  function createScreenUI(group, w, h, accent) {
    // Top bar
    const barGeo = new THREE.PlaneGeometry(w * 0.92, h * 0.06);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x2a2a35, transparent: true, opacity: 0.8 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, h * 0.44, 0.05);
    group.add(bar);

    // Accent element (hero block)
    const heroGeo = new THREE.PlaneGeometry(w * 0.5, h * 0.15);
    const heroMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.6 });
    const hero = new THREE.Mesh(heroGeo, heroMat);
    hero.position.set(-w * 0.15, h * 0.15, 0.05);
    group.add(hero);

    // Text lines (placeholder bars)
    for (let j = 0; j < 3; j++) {
      const lineW = w * (0.3 + Math.random() * 0.3);
      const lineGeo = new THREE.PlaneGeometry(lineW, h * 0.02);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x444455, transparent: true, opacity: 0.5 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(-w * 0.15 + lineW * 0.2, -h * 0.05 - j * h * 0.06, 0.05);
      group.add(line);
    }

    // Dots (3 window control dots)
    [0xff5f57, 0xffbd2e, 0x28c840].forEach((col, k) => {
      const dotGeo = new THREE.CircleGeometry(h * 0.015, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: col });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(-w * 0.42 + k * h * 0.05, h * 0.44, 0.051);
      group.add(dot);
    });
  }

  // --- Floating particles ---
  const particleCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 24;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xff6b2c,
    size: 0.04,
    transparent: true,
    opacity: 0.5,
  });
  scene.add(new THREE.Points(particleGeo, particleMat));

  // --- Mouse tracking ---
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Touch support for mobile
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  }, { passive: true });

  // --- Animation loop ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Animate screens
    screens.forEach((s) => {
      const { mesh, basePos, baseRot, phase, speed, amplitude } = s;
      mesh.position.y = basePos.y + Math.sin(t * speed + phase) * amplitude;
      mesh.position.x = basePos.x + Math.cos(t * speed * 0.7 + phase) * amplitude * 0.5;
      mesh.rotation.y = baseRot.y + mouse.x * 0.15;
      mesh.rotation.x = baseRot.x + mouse.y * 0.08;
    });

    // Camera subtle movement
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 0.4 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // --- Resize handler ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
