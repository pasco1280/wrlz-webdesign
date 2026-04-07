/* ============================================================
   WRLZ WEBDESIGN — Three.js Hero: Flying Monitors (ES Module)
   Three.js r168 + EffectComposer / UnrealBloom / ChromaticAberration
   ============================================================ */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// ── Mobile gate ───────────────────────────────────────────────────────────────
if (window.innerWidth < 768) {
  const heroEl = document.querySelector('.hero');
  if (heroEl) heroEl.classList.add('hero-mobile-fallback');

  window.WRLZ_HERO = {
    updateScrollProgress() {},
    triggerEntrance() {},
    setChromaticIntensity() {},
  };

  // Stop execution — no Three.js on mobile
  throw new Error('WRLZ_HERO: mobile gate — Three.js skipped.');
}

// ── Loading Manager ───────────────────────────────────────────────────────────
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
  window.WRLZ_LOAD_PROGRESS = loaded / total;
};
loadingManager.onLoad = () => {
  window.WRLZ_LOAD_PROGRESS = 1;
};

// ── Canvas & Renderer ─────────────────────────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
if (!canvas) {
  window.WRLZ_HERO = {
    updateScrollProgress() {},
    triggerEntrance() {},
    setChromaticIntensity() {},
  };
  throw new Error('WRLZ_HERO: #hero-canvas not found.');
}

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ── Scene & Camera ────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 18);

// ── Lighting ──────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const accentLight = new THREE.PointLight(0xff6b2c, 1.5, 30);
accentLight.position.set(5, 5, 8);
scene.add(accentLight);

const neonLight = new THREE.PointLight(0x7b61ff, 1.0, 30);
neonLight.position.set(-5, -3, 6);
scene.add(neonLight);

const cyberLight = new THREE.PointLight(0x00d4ff, 0.6, 30);
cyberLight.position.set(0, 4, 10);
scene.add(cyberLight);

// ── Texture Loading ───────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader(loadingManager);

const texturePaths = [
  'assets/portfolio/hefe-van-haag.png',
  'assets/portfolio/nachi-europe.png',
  'assets/portfolio/levaco.png',
  'assets/portfolio/kyowa.png',
  'assets/portfolio/matchachin.png',
];

const textures = texturePaths.map((path) => {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
});

// ── Monitor Layout Data ───────────────────────────────────────────────────────
const monitorData = [
  { w: 3.6, h: 2.2, x: -4.5, y: 1.5,  z: -2,   ry: 0.3,   rx: 0.08  }, // left big
  { w: 3.6, h: 2.2, x: 4.5,  y: 0.3,  z: -1.5,  ry: -0.25, rx: 0.05  }, // right big
  { w: 3.0, h: 1.9, x: 0,    y: -2,   z: -3.5,  ry: 0.1,   rx: -0.12 }, // center bottom
  { w: 2.2, h: 1.4, x: -6.5, y: -0.8, z: -5,    ry: 0.4,   rx: 0     }, // far left small
  { w: 2.2, h: 1.4, x: 6.5,  y: 2.2,  z: -4.5,  ry: -0.35, rx: 0.08  }, // far right small
];

// ── Build Monitor Meshes ──────────────────────────────────────────────────────
const screens = [];

monitorData.forEach(({ w, h, x, y, z, ry, rx }, i) => {
  const group = new THREE.Group();

  // Bezel
  const bezelGeo = new THREE.BoxGeometry(w + 0.24, h + 0.24, 0.08);
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    metalness: 0.8,
    roughness: 0.3,
  });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  group.add(bezel);

  // Screen
  const screenGeo = new THREE.PlaneGeometry(w, h);
  const screenMat = new THREE.MeshStandardMaterial({
    map: textures[i],
    emissive: 0xffffff,
    emissiveMap: textures[i],
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 1,
  });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.z = 0.045;
  group.add(screenMesh);

  // Window control dots — red / yellow / green
  const dotColors = [0xff5f57, 0xffbd2e, 0x28c840];
  dotColors.forEach((col, k) => {
    const dotRadius = Math.min(w, h) * 0.03;
    const dotGeo = new THREE.CircleGeometry(dotRadius, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: col });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    // Position on top bezel strip
    dot.position.set(
      -w * 0.42 + k * dotRadius * 3.5,
      (h / 2) + 0.09,
      0.05
    );
    group.add(dot);
  });

  group.position.set(x, y, z);
  group.rotation.set(rx, ry, 0);
  scene.add(group);

  screens.push({
    mesh: group,
    screenMat,
    bezelMat,
    basePos: { x, y, z },
    baseRot: { x: rx, y: ry },
    currentPos: { x, y, z },
    phase: Math.random() * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.4,
    amplitude: 0.12 + Math.random() * 0.12,
  });
});

// ── Floating Particles ────────────────────────────────────────────────────────
const particleCount = 100;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3]     = (Math.random() - 0.5) * 28;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 4;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xff6b2c,
  size: 0.04,
  transparent: true,
  opacity: 0.4,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ── Post-Processing ───────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.35,  // strength
  0.6,   // radius
  0.85   // threshold
);
composer.addPass(bloomPass);

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.002 },
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - vec2(0.5);
      float d = length(dir);
      float r = texture2D(tDiffuse, vUv + dir * uIntensity * d).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - dir * uIntensity * d).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};
const chromaticPass = new ShaderPass(ChromaticAberrationShader);
composer.addPass(chromaticPass);

// ── Scroll-Linked Camera ──────────────────────────────────────────────────────
let scrollProgress = 0;
let cameraBaseY = 0;

function updateScrollProgress(progress) {
  scrollProgress = progress;
  // Camera z: lerp 18 → 10
  camera.position.z = 18 - progress * 8;
  // Camera y: tilt down slightly
  cameraBaseY = -progress * 1;
  // Spread monitors outward
  screens.forEach((s) => {
    s.currentPos.x = s.basePos.x * (1 + progress * 0.5);
    s.currentPos.y = s.basePos.y * (1 + progress * 0.5);
  });
}

// ── Cinematic Entrance ────────────────────────────────────────────────────────
function triggerEntrance() {
  // Set initial hidden state
  screens.forEach((s) => {
    s.mesh.position.z = s.basePos.z - 15;
    s.screenMat.opacity = 0;
    s.screenMat.transparent = true;
    s.bezelMat.opacity = 0;
    s.bezelMat.transparent = true;
  });
  particleMat.opacity = 0;

  if (typeof gsap === 'undefined') {
    // Fallback without GSAP — snap immediately
    screens.forEach((s) => {
      s.mesh.position.z = s.basePos.z;
      s.screenMat.opacity = 1;
      s.bezelMat.opacity = 1;
    });
    particleMat.opacity = 0.4;
    return;
  }

  const tl = gsap.timeline();

  screens.forEach((s, i) => {
    tl.to(
      s.mesh.position,
      {
        z: s.basePos.z,
        duration: 1.5,
        ease: 'power3.out',
        delay: i * 0.15,
      },
      i * 0.15
    );
    tl.to(
      s.screenMat,
      {
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
      },
      i * 0.15
    );
    tl.to(
      s.bezelMat,
      {
        opacity: 1,
        duration: 1.5,
        ease: 'power3.out',
      },
      i * 0.15
    );
  });

  tl.to(
    particleMat,
    {
      opacity: 0.4,
      duration: 1.2,
      ease: 'power2.out',
    },
    0.3
  );
}

// ── Mouse Parallax ────────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

window.addEventListener('mousemove', (e) => {
  mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

window.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  },
  { passive: true }
);

// ── Animation Loop ────────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth mouse lerp
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Float monitors (sine/cosine bob)
  screens.forEach((s) => {
    s.mesh.position.y =
      s.currentPos.y + Math.sin(t * s.speed + s.phase) * s.amplitude;
    s.mesh.position.x =
      s.currentPos.x +
      Math.cos(t * s.speed * 0.7 + s.phase) * s.amplitude * 0.5;
    s.mesh.rotation.y = s.baseRot.y + mouse.x * 0.12;
    s.mesh.rotation.x = s.baseRot.x + mouse.y * 0.06;
  });

  // Camera follows mouse
  camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.03;
  camera.position.y +=
    (mouse.y * 0.4 + cameraBaseY - camera.position.y) * 0.03;
  camera.lookAt(0, 0, 0);

  composer.render();
}

animate();

// ── Chromatic Intensity Control ───────────────────────────────────────────────
function setChromaticIntensity(val) {
  chromaticPass.uniforms.uIntensity.value = val;
}

// ── Resize Handler ────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloomPass.resolution.set(w, h);
});

// ── Public API ────────────────────────────────────────────────────────────────
window.WRLZ_HERO = {
  updateScrollProgress,
  triggerEntrance,
  setChromaticIntensity,
};
