/* ============================================================================
   SubCableTrack — WebGL globe
   Earth + atmosphere + starfield. One marker per cable (at its route
   centroid, click → dossier), route arcs between consecutive landing
   points, and pulsing chokepoint markers at the narrow corridors where
   many systems converge.
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { regionColor, baseStatus } from './config.js';
import { CHOKEPOINTS } from '../data/chokepoints.js';

const R = 100;
const ARC_PTS = 64;

let scene, camera, renderer, controls, raycaster, mouse, container, canvas;
let globeGroup, markerGroup, arcGroup, chokeGroup, starField;
let markers = [], arcs = [];
let onSelect = null, hoverEl = null;
let showArcs = true, animId = null;
let allCables = [];

const deg = d => d * Math.PI / 180;

function toVec(lat, lng, radius = R) {
  const phi = deg(90 - lat), theta = deg(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ----------------------------------------------------------- scene assets */
function makeAtmosphere() {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0x22d3c8) } },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vPos;
      void main(){ vNormal = normalize(normalMatrix * normal); vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 glowColor; varying vec3 vNormal;
      void main(){
        float i = pow(0.62 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.0);
        gl_FragColor = vec4(glowColor, 1.0) * i * 1.15; }`,
    side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
  });
}

function makeStars() {
  const n = 2600, pos = [], sizes = [];
  for (let i = 0; i < n; i++) {
    const r = 600 + Math.random() * 900;
    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    pos.push(r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p));
    sizes.push(Math.random() * 2.4 + 0.5);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xbcd4ff) } },
    vertexShader: `attribute float aSize; varying float vS;
      void main(){ vS = aSize; vec4 mv = modelViewMatrix * vec4(position,1.0);
        gl_PointSize = aSize * (300.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; varying float vS;
      void main(){ float d = length(gl_PointCoord - vec2(0.5));
        if(d > 0.5) discard; gl_FragColor = vec4(uColor, (1.0 - d*2.0) * 0.75); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  return new THREE.Points(g, mat);
}

/* ------------------------------------------------------------------ label */
function makeLabel(text, lat, lng, color, size = 9) {
  const pad = 8, dpr = 2;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `700 ${size * dpr}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2 * dpr;
  const h = Math.ceil(size * dpr * 1.9);
  c.width = w; c.height = h;
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 6 * dpr;
  ctx.fillText(text, pad * dpr, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  const k = 0.105;
  spr.scale.set(w * k, h * k, 1);
  spr.position.copy(toVec(lat, lng, R + 2.2));
  spr.userData.isLabel = true;
  return spr;
}

/* ------------------------------------------------------------------ marker */
function centroid(landings) {
  const lats = landings.map(l => l.lat), lngs = landings.map(l => l.lng);
  return { lat: lats.reduce((a, b) => a + b, 0) / lats.length, lng: lngs.reduce((a, b) => a + b, 0) / lngs.length };
}

function makeMarker(cable, idx) {
  const base = centroid(cable.landings || [{ lat: 0, lng: 0 }]);
  // small deterministic jitter so cables sharing a busy region stay separable
  const ang = (idx % 9) * (Math.PI * 2 / 9);
  const spread = 1.6 + Math.floor(idx / 9) * 2.4;
  const lat = base.lat + Math.sin(ang) * spread * 0.6;
  const lng = base.lng + Math.cos(ang) * spread;

  const st = baseStatus(cable.status);
  const hasIncident = (cable.incidents || []).length > 0;
  const colHex = st.label === 'Decommissioned' ? '#5a6d88' : (hasIncident ? '#f5a623' : regionColor(cable.region));
  const col = new THREE.Color(colHex);
  const pos = toVec(lat, lng, R + 1.2);
  const g = new THREE.Group();
  g.position.copy(pos);
  g.lookAt(0, 0, 0);

  const size = 0.65 + Math.min(1, (cable.capacity_tbps || 10) / 200) * 1.1;
  const core = new THREE.Mesh(
    new THREE.CircleGeometry(size, 24),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .95, side: THREE.DoubleSide })
  );
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(size * 1.5, size * 2.1, 32),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .40, side: THREE.DoubleSide, depthWrite: false })
  );
  g.add(core); g.add(halo);
  g.userData = { cable, halo, baseSize: size, lat, lng, phase: Math.random() * Math.PI * 2 };
  return g;
}

function makeChokeMarker(cp) {
  const g = new THREE.Group();
  const pos = toVec(cp.lat, cp.lng, R + 1.4);
  g.position.copy(pos); g.lookAt(0, 0, 0);
  const amber = new THREE.Color(0xf5a623), red = new THREE.Color(0xf0544f);
  g.add(new THREE.Mesh(new THREE.CircleGeometry(1.7, 32),
    new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: .85, side: THREE.DoubleSide })));
  g.add(new THREE.Mesh(new THREE.RingGeometry(0.0, 0.7, 3),
    new THREE.MeshBasicMaterial({ color: red, side: THREE.DoubleSide })));
  const pulse = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.6, 48),
    new THREE.MeshBasicMaterial({ color: amber, transparent: true, opacity: .5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(pulse);
  g.userData = { choke: cp, pulse };
  return g;
}

/* --------------------------------------------------------------------- arc */
function makeArc(fromLat, fromLng, toLat, toLng, color, speed, dim = false) {
  const v1 = toVec(fromLat, fromLng, R + 0.5);
  const v2 = toVec(toLat, toLng, R + 0.5);
  const dist = v1.distanceTo(v2);
  const mid = v1.clone().add(v2).multiplyScalar(.5).normalize().multiplyScalar(R + dist * 0.28 + 4);
  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
  const pts = curve.getPoints(ARC_PTS - 1);

  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: dim ? .16 : .34, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 10, 10),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })
  );

  const grp = new THREE.Group();
  grp.add(line); grp.add(head);
  grp.userData = { curve, head, t: Math.random(), speed, dim };
  return grp;
}

/* -------------------------------------------------------------------- init */
export function initGlobe(cables, selectHandler) {
  onSelect = selectHandler;
  canvas = document.getElementById('globe-canvas');
  container = canvas.parentElement;
  hoverEl = document.getElementById('g-tooltip');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03060c);
  scene.fog = new THREE.FogExp2(0x03060c, 0.0014);

  camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 4000);
  camera.position.copy(toVec(8, 10, 340));

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .06;
  controls.rotateSpeed = .42;
  controls.minDistance = 150;
  controls.maxDistance = 520;
  controls.enablePan = false;
  controls.autoRotate = false;

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const earthMat = new THREE.MeshPhongMaterial({ color: 0x0d1c2c, shininess: 6, specular: 0x14324a });
  new THREE.TextureLoader().load(new URL('../assets/earth-blue-marble.jpg', import.meta.url).href, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    earthMat.map = tex; earthMat.color.set(0xffffff); earthMat.needsUpdate = true;
  });
  globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), earthMat));
  globeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(R + 3.2, 64, 64), makeAtmosphere()));

  const sun = new THREE.DirectionalLight(0xfff3e2, 1.25);
  sun.position.copy(new THREE.Vector3(0.6, 0.35, 0.8).normalize().multiplyScalar(500));
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x50708f, .85));
  scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x0c1626, .5));

  starField = makeStars();
  scene.add(starField);

  markerGroup = new THREE.Group(); globeGroup.add(markerGroup);
  arcGroup = new THREE.Group(); globeGroup.add(arcGroup);
  chokeGroup = new THREE.Group(); globeGroup.add(chokeGroup);

  CHOKEPOINTS.forEach(cp => chokeGroup.add(makeChokeMarker(cp)));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-9999, -9999);

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);
  document.addEventListener('theme-change', applyTheme);
  applyTheme();

  allCables = cables;
  updateGlobe(cables);
  animate();
}

function applyTheme() {
  const light = document.body.classList.contains('light-mode');
  const bg = light ? 0xdfe8f4 : 0x03060c;
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.FogExp2(bg, light ? 0.0008 : 0.0014);
  if (starField) starField.visible = !light;
}

/* ------------------------------------------------------------------ update */
export function updateGlobe(cables) {
  allCables = cables;
  markerGroup.clear(); arcGroup.clear();
  markers = []; arcs = [];

  cables.forEach((c, i) => {
    const m = makeMarker(c, i);
    markerGroup.add(m); markers.push(m);

    const landings = c.landings || [];
    const st = baseStatus(c.status);
    const dim = st.label === 'Decommissioned';
    const hasIncident = (c.incidents || []).length > 0;
    const colHex = dim ? 0x5a6d88 : (hasIncident ? 0xf5a623 : parseInt(regionColor(c.region).slice(1), 16));
    for (let k = 0; k < landings.length - 1; k++) {
      const a = landings[k], b = landings[k + 1];
      const speed = dim ? 0 : 0.0022 + Math.min(1, (c.capacity_tbps || 10) / 200) * 0.003;
      const arc = makeArc(a.lat, a.lng, b.lat, b.lng, colHex, speed, dim);
      arc.userData.cable = c;
      arcGroup.add(arc); arcs.push(arc);
    }
  });

  CHOKEPOINTS.forEach(cp => markerGroup.add(makeLabel(cp.name.toUpperCase(), cp.lat - 4, cp.lng, '#f5a623', 8)));

  renderLegend(cables);
}

function renderLegend(cables) {
  const el = document.getElementById('globe-legend');
  if (!el) return;
  const active = cables.filter(c => baseStatus(c.status).label === 'Active').length;
  const decommissioned = cables.filter(c => baseStatus(c.status).label === 'Decommissioned').length;
  const withIncidents = cables.filter(c => (c.incidents || []).length > 0).length;
  el.innerHTML =
    '<div class="gl-title">Cable network</div>' +
    `<div class="ek-row"><span class="ek-dot" style="background:#22d3c8"></span>Active, no incident history<span style="margin-left:auto;color:var(--text4)">${active - withIncidents >= 0 ? active - withIncidents : active}</span></div>` +
    `<div class="ek-row"><span class="ek-dot" style="background:#f5a623"></span>Documented incident history<span style="margin-left:auto;color:var(--text4)">${withIncidents}</span></div>` +
    `<div class="ek-row"><span class="ek-dot" style="background:#5a6d88"></span>Decommissioned<span style="margin-left:auto;color:var(--text4)">${decommissioned}</span></div>` +
    `<div class="ek-row" style="margin-top:6px;padding-top:6px;border-top:1px solid var(--border)"><span class="ek-dot" style="background:#f0544f;border-radius:2px"></span>Chokepoint<span style="margin-left:auto;color:var(--text4)">${CHOKEPOINTS.length}</span></div>` +
    `<div class="gl-note">Marker = one cable system (click to open its dossier). Arcs trace each cable between its documented landing points; amber marks a cable with a recorded cut or fault. Amber rings mark the geographic chokepoints where many systems converge.</div>`;
}

export function toggleArcs(force) {
  showArcs = typeof force === 'boolean' ? force : !showArcs;
  return showArcs;
}

export function focusCable(cable) {
  const m = markers.find(x => x.userData.cable?.id === cable.id);
  if (!m) return;
  const { lat, lng } = m.userData;
  const target = toVec(lat, lng, 250);
  const start = camera.position.clone();
  const t0 = performance.now();
  (function fly() {
    const k = Math.min(1, (performance.now() - t0) / 900);
    const e = 1 - Math.pow(1 - k, 3);
    camera.position.lerpVectors(start, target, e);
    if (k < 1) requestAnimationFrame(fly);
  })();
}

/* -------------------------------------------------------------- interaction */
function onPointerMove(ev) {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  hoverEl.dataset.x = ev.clientX - r.left;
  hoverEl.dataset.y = ev.clientY - r.top;
}

function pick() {
  raycaster.setFromCamera(mouse, camera);
  let hits = raycaster.intersectObjects(markerGroup.children, true);
  if (hits.length) {
    let o = hits[0].object;
    while (o && !o.userData?.cable) o = o.parent;
    if (o) return { kind: 'cable', object: o };
  }
  hits = raycaster.intersectObjects(chokeGroup.children, true);
  if (hits.length) {
    let o = hits[0].object;
    while (o && !o.userData?.choke) o = o.parent;
    if (o) return { kind: 'choke', object: o };
  }
  return null;
}

function onClick() {
  const hit = pick();
  if (!hit || !onSelect) return;
  if (hit.kind === 'cable') onSelect({ kind: 'cable', data: hit.object.userData.cable });
  else onSelect({ kind: 'choke', data: hit.object.userData.choke });
}

function onResize() {
  if (!container.clientWidth) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

/* ------------------------------------------------------------------- frame */
function animate() {
  animId = requestAnimationFrame(animate);
  const t = performance.now() * 0.001;

  const camDir = camera.position.clone().normalize();
  markerGroup.children.forEach(o => {
    if (!o.userData?.isLabel) return;
    const n = o.position.clone().applyMatrix4(globeGroup.matrixWorld).normalize();
    o.visible = n.dot(camDir) > 0.22;
  });

  markers.forEach(m => {
    const u = m.userData;
    const s = 1 + Math.sin(t * 1.6 + u.phase) * .18;
    u.halo.scale.setScalar(s);
    u.halo.material.opacity = .45 - Math.sin(t * 1.6 + u.phase) * .15;
  });

  chokeGroup.children.forEach(c => {
    const k = (t * 0.45) % 1;
    c.userData.pulse.scale.setScalar(1 + k * 1.9);
    c.userData.pulse.material.opacity = .55 * (1 - k);
  });

  if (showArcs) {
    arcGroup.visible = true;
    arcs.forEach(a => {
      const u = a.userData;
      if (!u.speed) return;
      u.t += u.speed;
      if (u.t > 1) u.t = 0;
      u.head.position.copy(u.curve.getPoint(u.t));
      u.head.material.opacity = .3 + Math.sin(u.t * Math.PI) * .6;
    });
  } else {
    arcGroup.visible = false;
  }

  const hit = pick();
  if (hit) {
    canvas.style.cursor = 'pointer';
    hoverEl.style.opacity = '1';
    hoverEl.style.left = (Number(hoverEl.dataset.x) + 14) + 'px';
    hoverEl.style.top = (Number(hoverEl.dataset.y) + 14) + 'px';
    if (hit.kind === 'cable') {
      const c = hit.object.userData.cable;
      hoverEl.innerHTML = `<div class="tt-name">${c.name}</div>
         <div class="tt-sub">${c.length_km.toLocaleString()} km · RFS ${c.rfs} · ${baseStatus(c.status).label}</div>`;
    } else {
      const cp = hit.object.userData.choke;
      hoverEl.innerHTML = `<div class="tt-name">${cp.name}</div><div class="tt-sub">${cp.traffic_share}</div>`;
    }
  } else {
    canvas.style.cursor = 'grab';
    hoverEl.style.opacity = '0';
  }

  controls.update();
  renderer.render(scene, camera);
}

export function disposeGlobe() { if (animId) cancelAnimationFrame(animId); }
