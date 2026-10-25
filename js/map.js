/* The atlas — a flat equirectangular vector map. Cable routes are drawn as
   gently-bowed curves between each system's documented landing points (in
   the order listed, with a simple antimeridian split for Pacific-crossing
   routes), chokepoints as pulsing rings. Pan is a CSS-space transform on an
   inner <g>, zoom is centred on the cursor/pinch point \u2014 no mapping library,
   just the baked WORLD_LAND_PATH and plain SVG. */

import { WORLD_LAND_PATH } from './data/world-outline.js';
import { regionColor, baseStatus } from './config.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

/* Split a landing-point chain at the antimeridian so a Pacific-crossing
   cable doesn't get drawn as one line straight across the whole map. */
function splitAntimeridian(points) {
  const segments = [[points[0]]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1], cur = points[i];
    const dlng = cur[0] - prev[0];
    if (Math.abs(dlng) > 180) {
      const unwrapped = dlng > 0 ? cur[0] - 360 : cur[0] + 360;
      const edge = dlng > 0 ? -180 : 180;
      const frac = (edge - prev[0]) / (unwrapped - prev[0]);
      const latAtEdge = prev[1] + frac * (cur[1] - prev[1]);
      segments[segments.length - 1].push([edge, latAtEdge]);
      segments.push([[-edge, latAtEdge]]);
    }
    segments[segments.length - 1].push(cur);
  }
  return segments.filter(s => s.length > 1);
}

/* A gently-bowed quadratic path between two points \u2014 a flat-map stand-in for
   a great-circle arc, not a literal projection of one. */
function bowPath(a, b) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(len * 0.12, 9);
  const nx = -dy / len, ny = dx / len;
  const cx = mx + nx * bow * Math.sign(my >= 0 ? 1 : -1 || 1);
  const cy = my + ny * bow * Math.sign(my >= 0 ? 1 : -1 || 1);
  return `M${a[0]},${a[1]} Q${cx},${cy} ${b[0]},${b[1]}`;
}

export function initMap({ svgEl, tipEl, cables, chokepoints, onSelect, getFilter }) {
  const VB = { x: -182, y: -94, w: 364, h: 188 };
  svgEl.setAttribute('viewBox', `${VB.x} ${VB.y} ${VB.w} ${VB.h}`);

  const graticule = el('g', { class: 'graticule' });
  for (let lng = -180; lng <= 180; lng += 30) {
    graticule.appendChild(el('line', { x1: lng, y1: -90, x2: lng, y2: 90, stroke: 'var(--graticule)', 'stroke-width': 0.3 }));
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    graticule.appendChild(el('line', { x1: -180, y1: -lat, x2: 180, y2: -lat, stroke: 'var(--graticule)', 'stroke-width': 0.3 }));
  }

  const land = el('path', { d: WORLD_LAND_PATH, fill: 'var(--land)', stroke: 'none' });

  const layer = el('g', { id: 'map-layer' });
  const cableLayer = el('g', { class: 'cable-layer' });
  const nodeLayer = el('g', { class: 'node-layer' });
  const chokeLayer = el('g', { class: 'choke-layer' });

  layer.append(land, graticule, cableLayer, nodeLayer, chokeLayer);
  svgEl.innerHTML = '';
  svgEl.appendChild(layer);

  const cablePaths = [];

  for (const cable of cables) {
    const pts = (cable.landings || []).map(l => [l.lng, -l.lat]);
    if (pts.length < 2) continue;
    const st = baseStatus(cable.status);
    const segs = splitAntimeridian(pts);
    const group = el('g', { class: 'cable-g', 'data-id': cable.id, 'data-status': cable.status, 'data-region': cable.region });
    for (const seg of segs) {
      for (let i = 1; i < seg.length; i++) {
        const hit = el('path', { d: bowPath(seg[i - 1], seg[i]), fill: 'none', stroke: 'transparent', 'stroke-width': 3.2, class: 'cable-hit' });
        const line = el('path', {
          d: bowPath(seg[i - 1], seg[i]), fill: 'none',
          stroke: cable.incidents?.length ? 'var(--coral)' : st.hex,
          'stroke-width': 0.55, 'stroke-linecap': 'round', opacity: cable.incidents?.length ? 0.85 : 0.6,
          class: 'cable-line'
        });
        group.append(line, hit);
      }
    }
    cableLayer.appendChild(group);
    cablePaths.push({ cable, group });

    for (const l of cable.landings || []) {
      const dot = el('circle', { cx: l.lng, cy: -l.lat, r: 0.9, fill: st.hex, class: 'node-dot', 'data-id': cable.id, opacity: .85 });
      nodeLayer.appendChild(dot);
    }
  }

  for (const cp of chokepoints) {
    const g = el('g', { class: 'choke-g' });
    g.appendChild(el('circle', { cx: cp.lng, cy: -cp.lat, r: 3.2, fill: 'none', stroke: 'var(--coral)', 'stroke-width': 0.45, opacity: .75, class: 'choke-ring' }));
    g.appendChild(el('circle', { cx: cp.lng, cy: -cp.lat, r: 1, fill: 'var(--coral)' }));
    chokeLayer.appendChild(g);
  }

  /* -------------------------------------------------------------- pan/zoom */
  let scale = 1, tx = 0, ty = 0;
  const apply = () => layer.setAttribute('transform', `translate(${tx} ${ty}) scale(${scale})`);
  const clampScale = s => Math.max(1, Math.min(7, s));

  let dragging = false, lastX = 0, lastY = 0;
  svgEl.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY; svgEl.setPointerCapture(e.pointerId);
  });
  svgEl.addEventListener('pointermove', e => {
    if (!dragging) return;
    const rect = svgEl.getBoundingClientRect();
    const unitsPerPx = VB.w / rect.width;
    tx += (e.clientX - lastX) * unitsPerPx;
    ty += (e.clientY - lastY) * unitsPerPx;
    lastX = e.clientX; lastY = e.clientY;
    apply();
  });
  const endDrag = () => { dragging = false; };
  svgEl.addEventListener('pointerup', endDrag);
  svgEl.addEventListener('pointerleave', endDrag);

  function zoomAt(clientX, clientY, factor) {
    const rect = svgEl.getBoundingClientRect();
    const unitsPerPx = VB.w / rect.width;
    const px = (clientX - rect.left) * unitsPerPx + VB.x;
    const py = (clientY - rect.top) * unitsPerPx + VB.y;
    const worldX = (px - tx) / scale, worldY = (py - ty) / scale;
    scale = clampScale(scale * factor);
    tx = px - worldX * scale;
    ty = py - worldY * scale;
    apply();
  }
  svgEl.addEventListener('wheel', e => {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.18 : 0.85);
  }, { passive: false });

  function zoomButton(factor) {
    const rect = svgEl.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  /* ---------------------------------------------------------------- hover/click */
  let selectedId = null;
  function paintSelection() {
    for (const { cable, group } of cablePaths) {
      const dim = selectedId && cable.id !== selectedId;
      group.querySelectorAll('.cable-line').forEach(p => {
        p.style.opacity = dim ? 0.12 : (cable.incidents?.length ? 0.85 : 0.6);
        p.style.strokeWidth = (!dim && cable.id === selectedId) ? 1.3 : 0.55;
      });
    }
  }

  function showTip(x, y, cable) {
    const st = baseStatus(cable.status);
    tipEl.innerHTML = `<div class="mt-name">${cable.name}</div>
      <div class="mt-meta">${(cable.length_km || 0).toLocaleString()} km \u00b7 RFS ${cable.rfs} \u00b7 <span style="color:${st.hex}">${st.label}</span></div>`;
    const wrapRect = svgEl.parentElement.getBoundingClientRect();
    tipEl.style.left = Math.min(x - wrapRect.left + 14, wrapRect.width - 260) + 'px';
    tipEl.style.top = Math.max(y - wrapRect.top - 50, 8) + 'px';
    tipEl.classList.add('on');
  }
  function hideTip() { tipEl.classList.remove('on'); }

  cableLayer.addEventListener('pointermove', e => {
    const g = e.target.closest('.cable-g');
    if (!g) { hideTip(); return; }
    const cable = cables.find(c => c.id === g.dataset.id);
    if (cable) showTip(e.clientX, e.clientY, cable);
  });
  cableLayer.addEventListener('pointerleave', hideTip);
  cableLayer.addEventListener('click', e => {
    const g = e.target.closest('.cable-g');
    if (!g) return;
    selectedId = g.dataset.id;
    paintSelection();
    onSelect?.(selectedId);
  });

  function applyFilter() {
    const f = getFilter();
    for (const { cable, group } of cablePaths) {
      const statusOk = !f.status.has(cable.status.split(/\s/)[0]);
      const regionOk = f.region.size === 0 || f.region.has(regionColor(cable.region));
      group.style.display = (statusOk && regionOk) ? '' : 'none';
    }
  }

  return {
    refreshFilter: applyFilter,
    zoomIn: () => zoomButton(1.3),
    zoomOut: () => zoomButton(0.72),
    reset: () => { scale = 1; tx = 0; ty = 0; apply(); },
    select: id => { selectedId = id; paintSelection(); }
  };
}
