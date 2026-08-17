import * as THREE from 'three';

// Ambient background: a slow drifting flyover of the map table, with a couple of
// brass gears and house-sigil rings turning in place — a lightweight nod to the
// GoT-style title sequence, running continuously behind the page.
//
// Materials are unlit (MeshBasicMaterial) with baked-in tint/emissive color rather
// than relying on scene lights: keeps the look stable across Three.js versions
// regardless of how a given release calibrates physical light units.

const canvas = document.getElementById('ambient-canvas');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function supportsWebGL() {
  try {
    const test = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (test.getContext('webgl') || test.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

if (!canvas || prefersReducedMotion || !supportsWebGL()) {
  document.body.classList.add('no-webgl-bg');
} else {
  initScene();
}

function makeGearShape(radius, teeth, toothDepth, holeRadius) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? radius : radius - toothDepth;
    const angle = i * step;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

function makeGear(radius, teeth, color) {
  const shape = makeGearShape(radius, teeth, radius * 0.16, radius * 0.32);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: radius * 0.14,
    bevelEnabled: true,
    bevelThickness: radius * 0.02,
    bevelSize: radius * 0.02,
    bevelSegments: 1,
    curveSegments: 10,
  });
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

function makeSigil(loader, url, radius, tint) {
  const texture = loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: tint,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(new THREE.CircleGeometry(radius, 40), material);
}

function initScene() {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0b0d, 0.022);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);

  const loader = new THREE.TextureLoader();

  // Map plane sized to the source image's aspect ratio (1024x1535).
  const mapAspect = 1024 / 1535;
  const mapHeight = 22;
  const mapWidth = mapHeight * mapAspect;
  const mapTexture = loader.load('assets/img/luzon-map.png');
  mapTexture.colorSpace = THREE.SRGBColorSpace;
  const mapPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth, mapHeight, 1, 1),
    new THREE.MeshBasicMaterial({ map: mapTexture, color: 0xe0cba3 })
  );
  mapPlane.rotation.x = -Math.PI / 2;
  scene.add(mapPlane);

  // North (Limmies) gear + sigil.
  const gearNorth = makeGear(0.85, 12, 0xd9ac3f);
  gearNorth.rotation.x = -Math.PI / 2;
  gearNorth.position.set(-1.3, 0.05, -mapHeight * 0.22);
  scene.add(gearNorth);

  const sigilNorth = makeSigil(loader, 'assets/img/limmies-banner.png', 0.48, 0xc9a227);
  sigilNorth.rotation.x = -Math.PI / 2;
  sigilNorth.position.set(-1.3, 0.22, -mapHeight * 0.22);
  scene.add(sigilNorth);

  // South (Jalandoni/Koi) gear + sigil.
  const gearSouth = makeGear(0.6, 10, 0xc9993a);
  gearSouth.rotation.x = -Math.PI / 2;
  gearSouth.position.set(1.6, 0.04, mapHeight * 0.2);
  scene.add(gearSouth);

  const sigilSouth = makeSigil(loader, 'assets/img/koi-banner.png', 0.35, 0xc9a227);
  sigilSouth.rotation.x = -Math.PI / 2;
  sigilSouth.position.set(1.6, 0.18, mapHeight * 0.2);
  scene.add(sigilSouth);

  const clock = new THREE.Clock();
  let visible = true;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  document.addEventListener('visibilitychange', () => {
    visible = document.visibilityState === 'visible';
    if (visible) requestAnimationFrame(tick);
  });

  const driftPeriod = 70; // seconds for one full side-to-side sweep
  const driftRange = mapWidth * 0.5;

  function tick() {
    if (!visible) return;
    const t = clock.getElapsedTime();

    const drift = Math.sin((t / driftPeriod) * Math.PI * 2);
    const bob = Math.sin(t / 42) * 0.5;

    camera.position.set(drift * driftRange * 0.4, 16 + bob, 10 + Math.cos(t / 55) * 2);
    camera.lookAt(drift * driftRange * 0.15, 0, -3);

    gearNorth.rotation.z += 0.0022;
    gearSouth.rotation.z -= 0.0029;
    sigilNorth.rotation.z += 0.0008;
    sigilSouth.rotation.z -= 0.0011;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}
