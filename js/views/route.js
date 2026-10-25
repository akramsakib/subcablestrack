/* Route — point-to-point lookup. Given two landing points (city or country),
   find every tracked cable connecting them and flag which chokepoints the
   great-circle path between them is likely to cross. Pure local lookup over
   the curated corpus \u2014 no external service, no keys, nothing logged. */
import { esc, escAttr } from '../lib/security.js';
import { regionColor, baseStatus } from '../config.js';
import { CHOKEPOINTS } from '../../data/chokepoints.js';

let last = null;

const EXAMPLES = [
  ['Marseille', 'Mumbai'],
  ['Chennai', 'Djibouti City'],
  ['Singapore', 'Los Angeles'],
  ['Lagos', 'Lisbon'],
  ['Helsinki', 'Tallinn'],
  ['Keelung', 'Matsu']
];

export function renderRoute(cables) {
  const body = document.getElementById('route-body');
  body.innerHTML = `
    <div class="v-head">
      <div class="v-title">Route lookup</div>
      <div class="v-sub">Enter two landing points to find which tracked cables connect them, and which geographic chokepoints a path between them is likely to cross.</div>
    </div>
    <div class="prism-input-row" style="gap:8px">
      <input id="route-a" placeholder="From \u2014 e.g. Marseille" autocomplete="off" style="flex:1">
      <input id="route-b" placeholder="To \u2014 e.g. Mumbai" autocomplete="off" style="flex:1">
      <button class="btn-primary" id="route-go">Find routes \u2192</button>
    </div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:16px">
      <span class="mono muted" style="font-size:10.5px">Try:</span>
      ${EXAMPLES.map(([a, b]) => `<span class="pv-chip" data-a="${escAttr(a)}" data-b="${escAttr(b)}">${esc(a)} \u2192 ${esc(b)}</span>`).join('')}
    </div>
    <div id="route-out">${last ? '' : '<div class="pr-empty">Enter two cities or countries to begin.</div>'}</div>`;

  const run = () => {
    const a = document.getElementById('route-a').value.trim();
    const b = document.getElementById('route-b').value.trim();
    if (!a || !b) return;
    last = { a, b };
    paint(cables, a, b);
  };

  document.getElementById('route-go').addEventListener('click', run);
  ['route-a', 'route-b'].forEach(id => document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') run(); }));
  body.querySelectorAll('[data-a]').forEach(c => c.addEventListener('click', () => {
    document.getElementById('route-a').value = c.dataset.a;
    document.getElementById('route-b').value = c.dataset.b;
    run();
  }));

  if (last) paint(cables, last.a, last.b);
}

function matchesPoint(landing, needle) {
  const n = needle.toLowerCase();
  return landing.city.toLowerCase().includes(n) || landing.country.toLowerCase().includes(n) || n.includes(landing.city.toLowerCase());
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* Heuristic: a chokepoint is "likely crossed" if it lies roughly between the
   two points \u2014 closer to the straight path than either endpoint is to the
   other, within a generous tolerance. This is a rough corridor estimate for
   orientation, not a routing engine. */
function likelyChokepoints(from, to) {
  const direct = haversine(from.lat, from.lng, to.lat, to.lng);
  if (direct < 500) return [];
  return CHOKEPOINTS.filter(cp => {
    // Skip a chokepoint that just coincides with one of the endpoints itself
    // (e.g. "Marseille, France" when Marseille is the landing point searched)
    // \u2014 that's not something the route "crosses", it's the origin/destination.
    if (haversine(from.lat, from.lng, cp.lat, cp.lng) < 400) return false;
    if (haversine(to.lat, to.lng, cp.lat, cp.lng) < 400) return false;
    const viaChoke = haversine(from.lat, from.lng, cp.lat, cp.lng) + haversine(cp.lat, cp.lng, to.lat, to.lng);
    // Tight detour tolerance \u2014 a chokepoint is only "likely crossed" if routing
    // through it adds very little extra distance versus the direct path.
    return viaChoke < direct * 1.15;
  });
}

function paint(cables, a, b) {
  const out = document.getElementById('route-out');
  const matches = cables.filter(c =>
    (c.landings || []).some(l => matchesPoint(l, a)) &&
    (c.landings || []).some(l => matchesPoint(l, b)));

  if (!matches.length) {
    out.innerHTML = `<div class="pr-empty">No tracked cable in this corpus has documented landing points matching both "${esc(a)}" and "${esc(b)}". The corpus carries a representative subset of ~600 active global systems \u2014 try a nearby hub city, or see TeleGeography's full map for exhaustive coverage.</div>`;
    return;
  }

  out.innerHTML = matches.map(c => {
    const la = (c.landings || []).find(l => matchesPoint(l, a));
    const lb = (c.landings || []).find(l => matchesPoint(l, b));
    const chokes = likelyChokepoints(la, lb);
    const st = baseStatus(c.status);
    return `<div class="panel" style="margin-bottom:12px;border-left:3px solid ${regionColor(c.region)}">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px">
        <div class="panel-t" style="margin:0">${esc(c.name)}</div>
        <span class="pill" style="color:${st.hex};border-color:${st.hex}55">${esc(st.label)}</span>
        <span class="mono muted" style="margin-left:auto;font-size:10.5px">${(c.length_km || 0).toLocaleString()} km \u00b7 RFS ${esc(c.rfs)}</span>
      </div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${esc(la.city)}, ${esc(la.country)} \u2192 ${esc(lb.city)}, ${esc(lb.country)}</div>
      ${chokes.length ? `<div class="row" style="gap:6px;flex-wrap:wrap">
        <span class="mono muted" style="font-size:10px">likely crosses:</span>
        ${chokes.map(cp => `<span class="tag" style="color:var(--orange)">${esc(cp.name)}</span>`).join('')}
      </div>` : '<div class="mono muted" style="font-size:10px">no major chokepoint corridor in this registry lies between these two points</div>'}
    </div>`;
  }).join('');
}
