import { esc, safeUrl, host } from './lib/security.js';
import { getFeed } from './lib/api.js';
import { regionColor, regionInfo, baseStatus, freshness, causeCategory, chokepointMagnitude, relatedCables } from './config.js';
import { initMap } from './map.js';
import { CABLES } from '../data/cables.js';
import { INCIDENTS } from '../data/incidents.js';
import { CHOKEPOINTS } from '../data/chokepoints.js';

/* ------------------------------------------------------------------- theme */
const THEME_KEY = 'sct-theme';
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'night') document.body.classList.add('night');
  document.getElementById('theme-btn').addEventListener('click', () => {
    document.body.classList.toggle('night');
    localStorage.setItem(THEME_KEY, document.body.classList.contains('night') ? 'night' : 'day');
  });
}

/* --------------------------------------------------------------- mobile nav */
function initMobileNav() {
  const btn = document.getElementById('mob-nav-btn');
  const panel = document.getElementById('mob-nav-panel');
  btn?.addEventListener('click', () => panel.classList.toggle('on'));
  panel?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('on')));
  document.addEventListener('click', e => {
    if (!panel?.contains(e.target) && !btn?.contains(e.target)) panel?.classList.remove('on');
  });
}

/* -------------------------------------------------------------------- hero */
function renderHeroStats() {
  const active = CABLES.filter(c => c.status.startsWith('active'));
  const totalKm = CABLES.reduce((s, c) => s + (c.length_km || 0), 0);
  const totalTbps = CABLES.reduce((s, c) => s + (c.capacity_tbps || 0), 0);
  const countries = new Set(CABLES.flatMap(c => (c.landings || []).map(l => l.country)));
  document.getElementById('hero-stats').innerHTML = [
    [CABLES.length, 'Cable systems'],
    [Math.round(totalKm / 1000) + 'k', 'Route km'],
    [Math.round(totalTbps).toLocaleString(), 'Design Tbps'],
    [countries.size, 'Countries landed'],
    [INCIDENTS.length, 'Documented incidents']
  ].map(([v, l]) => `<div class="hstat"><b>${v}</b><span>${esc(l)}</span></div>`).join('');
}

/* --------------------------------------------------------------------- map */
function initAtlas() {
  const svg = document.getElementById('world-map');
  const tip = document.getElementById('map-tip');
  const filter = { status: new Set(), region: new Set() };

  const controller = initMap({
    svgEl: svg, tipEl: tip, cables: CABLES, chokepoints: CHOKEPOINTS,
    getFilter: () => filter,
    onSelect: id => openDirectoryRow(id, true)
  });

  const statuses = [...new Set(CABLES.map(c => c.status.split(/\s/)[0]))];
  const toolbar = document.getElementById('atlas-chips');
  toolbar.innerHTML = statuses.map(s => {
    const st = baseStatus(s);
    return `<button class="atlas-chip" data-kind="status" data-v="${esc(s)}"><span class="dot" style="background:${st.hex}"></span>${esc(st.label)}</button>`;
  }).join('');

  /* filter.status holds EXCLUDED statuses \u2014 clicking a chip toggles that
     status's cables off the map; an empty set means "show everything". */
  toolbar.querySelectorAll('.atlas-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.v;
      if (filter.status.has(v)) filter.status.delete(v);
      else filter.status.add(v);
      btn.classList.toggle('off', filter.status.has(v));
      controller.refreshFilter();
    });
  });

  document.getElementById('map-zoom-in').addEventListener('click', controller.zoomIn);
  document.getElementById('map-zoom-out').addEventListener('click', controller.zoomOut);
  document.getElementById('map-zoom-reset').addEventListener('click', controller.reset);

  document.getElementById('map-legend').innerHTML = `
    <span><span class="dot" style="background:${baseStatus('active').hex}"></span>Active</span>
    <span><span class="dot" style="background:${baseStatus('decommissioned').hex}"></span>Decommissioned</span>
    <span><span class="dot" style="background:var(--coral)"></span>Documented incident history</span>
    <span><span class="ring"></span>Chokepoint</span>`;

  window.__atlasController = controller;
}

/* --------------------------------------------------------------- chokepoints */
function renderChokepoints() {
  const list = document.getElementById('choke-list');
  const withMag = CHOKEPOINTS.map(cp => ({ cp, mag: chokepointMagnitude(cp.cable_count_range) }));
  const maxMag = Math.max(...withMag.map(x => x.mag || 0), 1);
  withMag.sort((a, b) => (b.mag || 0) - (a.mag || 0));

  list.innerHTML = withMag.map(({ cp, mag }, i) => `
    <div class="choke-row" data-id="${esc(cp.id)}">
      <button class="choke-head">
        <span class="choke-rank">${String(i + 1).padStart(2, '0')}</span>
        <span class="choke-name-wrap">
          <div class="choke-name">${esc(cp.name)}</div>
          <div class="choke-sub">${esc(cp.traffic_share)}</div>
        </span>
        <span class="choke-bar-wrap">
          ${mag ? `<span class="choke-bar-track"><span class="choke-bar-fill" style="width:${(mag / maxMag * 100).toFixed(0)}%"></span></span>` : '<span class="choke-bar-track"></span>'}
          <span class="choke-bar-label">${esc(cp.cable_count_range)}</span>
        </span>
        <svg class="choke-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="choke-body"><div class="choke-body-in">
        <p>${esc(cp.note)}</p>
        <div class="choke-sources">${(cp.sources || []).map(s => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} \u2197</a>`).join('')}</div>
      </div></div>
    </div>`).join('');

  list.querySelectorAll('.choke-head').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.choke-row').classList.toggle('open'));
  });
}

/* ----------------------------------------------------------------- timeline */
function renderTimeline() {
  const rail = document.getElementById('timeline-rail');
  const detail = document.getElementById('timeline-detail');
  const sorted = [...INCIDENTS].sort((a, b) => a.date.localeCompare(b.date));
  const minYr = 2006, maxYr = new Date().getFullYear();
  const span = maxYr - minYr || 1;

  const years = [];
  for (let y = minYr; y <= maxYr; y += 2) years.push(y);

  rail.innerHTML = `<div class="timeline-axis"></div>` +
    years.map((y, i) => {
      const pct = (y - minYr) / span * 100;
      const anchor = i === 0 ? 'translateX(0)' : i === years.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)';
      return `<div class="timeline-yr" style="left:${pct.toFixed(2)}%;transform:${anchor}">${y}</div>`;
    }).join('') +
    sorted.map(inc => {
      const yr = new Date(inc.date).getFullYear() + (new Date(inc.date).getMonth() / 12);
      const cat = causeCategory(inc.cause);
      const color = cat === 'vessel' ? 'var(--coral)' : cat === 'natural' ? 'var(--navy)' : 'var(--brass)';
      return `<div class="timeline-pt" data-id="${esc(inc.id)}" style="left:${((yr - minYr) / span * 100).toFixed(2)}%;background:${color}" title="${esc(inc.title)}"></div>`;
    }).join('');

  function showIncident(inc) {
    detail.innerHTML = `
      <h3>${esc(inc.title)}</h3>
      <div class="td-meta">${esc(new Date(inc.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }))} \u00b7 ${esc(inc.location)} \u00b7 ${esc(inc.cause)}</div>
      <p>${esc(inc.summary)}</p>
      <div class="td-sources">${(inc.sources || []).map(s => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} \u2197</a>`).join('')}</div>`;
    detail.classList.add('on');
  }

  rail.querySelectorAll('.timeline-pt').forEach(pt => {
    pt.addEventListener('click', () => {
      rail.querySelectorAll('.timeline-pt').forEach(p => p.classList.remove('active'));
      pt.classList.add('active');
      showIncident(sorted.find(i => i.id === pt.dataset.id));
    });
  });

  if (sorted.length) {
    rail.querySelector('.timeline-pt')?.classList.add('active');
    showIncident(sorted[0]);
  }
}

/* ----------------------------------------------------------------- directory */
let dirSort = { key: 'name', dir: 1 };
let dirOpenId = null;

function dossierHTML(cable) {
  const st = baseStatus(cable.status);
  const related = relatedCables(cable, CABLES);
  return `<div class="dir-expand-in">
    <p class="dir-assess">${esc(cable.summary)}</p>
    <div class="dex-grid">
      <div>
        <div class="dex-h">Owners / consortium</div>
        <div class="chip-row">${(cable.owners || []).map(o => `<span class="chip-sm">${esc(o)}</span>`).join('')}</div>
      </div>
      <div>
        <div class="dex-h">Landing points (representative)</div>
        <div class="chip-row">${(cable.landings || []).map(l => `<span class="chip-sm">${esc(l.city)}, ${esc(l.country)}</span>`).join('')}</div>
      </div>
      <div>
        <div class="dex-h">Related systems</div>
        ${related.length ? related.map(r => `<div class="related-item"><span class="status-dot" style="background:${regionColor(r.cable.region)}"></span>${esc(r.cable.name)}<span class="via">shared ${esc(r.via)}</span></div>`).join('') : '<div class="related-item">No close relationships found in this corpus.</div>'}
      </div>
      <div class="dex-sources">
        <div class="dex-h">Sources</div>
        ${(cable.sources || []).map(s => `<a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.title)} \u00b7 ${esc(host(s.url))} \u2197</a>`).join('')}
      </div>
    </div>
  </div>`;
}

function renderDirectory() {
  const q = document.getElementById('dir-search').value.trim().toLowerCase();
  const statusF = document.getElementById('dir-status').value;
  const regionF = document.getElementById('dir-region').value;

  let rows = CABLES.filter(c => {
    if (q && !(c.name + ' ' + (c.aka || '') + ' ' + c.owners.join(' ')).toLowerCase().includes(q)) return false;
    if (statusF && !c.status.startsWith(statusF)) return false;
    if (regionF && regionInfo(c.region).label !== regionF) return false;
    return true;
  });

  const key = dirSort.key;
  rows.sort((a, b) => {
    let av = a[key], bv = b[key];
    if (key === 'name') { av = a.name; bv = b.name; }
    if (typeof av === 'string') return av.localeCompare(bv) * dirSort.dir;
    return ((av || 0) - (bv || 0)) * dirSort.dir;
  });

  document.getElementById('dir-count').textContent = `${rows.length} of ${CABLES.length} systems`;

  const tbody = document.getElementById('dir-tbody');
  tbody.innerHTML = rows.map(c => {
    const st = baseStatus(c.status);
    const open = c.id === dirOpenId;
    return `<tr class="dir-row${open ? ' open' : ''}" data-id="${esc(c.id)}">
        <td><span class="status-dot" style="background:${st.hex}"></span><span class="dname">${esc(c.name)}</span>${c.aka ? `<div class="daka">${esc(c.aka)}</div>` : ''}</td>
        <td>${esc(regionInfo(c.region).label)}</td>
        <td>${(c.length_km || 0).toLocaleString()} km</td>
        <td>${esc(c.rfs)}</td>
        <td><span class="pill" style="color:${st.hex};border-color:${st.hex}66">${esc(st.label)}</span></td>
        <td>${c.owners.length}</td>
      </tr>
      <tr class="dir-expand-row"><td colspan="6"><div class="dir-expand${open ? ' on' : ''}" id="dex-${esc(c.id)}">${open ? dossierHTML(c) : ''}</div></td></tr>`;
  }).join('');

  tbody.querySelectorAll('.dir-row').forEach(tr => {
    tr.addEventListener('click', () => {
      const id = tr.dataset.id;
      dirOpenId = dirOpenId === id ? null : id;
      renderDirectory();
      if (dirOpenId) {
        requestAnimationFrame(() => document.getElementById('dex-' + dirOpenId)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        window.__atlasController?.select(dirOpenId);
      }
    });
  });
}

function openDirectoryRow(id, scrollTo) {
  dirOpenId = id;
  renderDirectory();
  if (scrollTo) {
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function initDirectory() {
  const regions = [...new Set(CABLES.map(c => regionInfo(c.region).label))].sort();
  document.getElementById('dir-region').innerHTML = `<option value="">All regions</option>` + regions.map(r => `<option>${esc(r)}</option>`).join('');
  document.getElementById('dir-status').innerHTML = `<option value="">All statuses</option>` +
    [...new Set(CABLES.map(c => c.status.split(/\s/)[0]))].map(s => `<option value="${esc(s)}">${esc(baseStatus(s).label)}</option>`).join('');

  document.getElementById('dir-search').addEventListener('input', renderDirectory);
  document.getElementById('dir-status').addEventListener('change', renderDirectory);
  document.getElementById('dir-region').addEventListener('change', renderDirectory);
  document.querySelectorAll('.dir-table th[data-key]').forEach(th => {
    th.innerHTML += ' <span class="arrow">\u2191</span>';
    th.addEventListener('click', () => {
      if (dirSort.key === th.dataset.key) dirSort.dir *= -1;
      else { dirSort.key = th.dataset.key; dirSort.dir = 1; }
      document.querySelectorAll('.dir-table th').forEach(t => t.classList.remove('sorted'));
      th.classList.add('sorted');
      th.querySelector('.arrow').textContent = dirSort.dir === 1 ? '\u2191' : '\u2193';
      renderDirectory();
    });
  });
  renderDirectory();
}

/* --------------------------------------------------------------------- watch */
function timeAgo(d) {
  const t = new Date(d).getTime();
  if (!t) return '';
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

let watchState = { filter: 'cable', items: [], sources: [] };

function paintWatch() {
  const list = document.getElementById('watch-list');
  const items = watchState.items.filter(i => watchState.filter === 'all' || i.cable);
  if (!items.length) {
    list.innerHTML = `<div class="route-empty">No items in this window yet.</div>`;
    return;
  }
  list.innerHTML = items.slice(0, 40).map(i => `
    <div class="watch-item">
      <div class="watch-time">${esc(timeAgo(i.published_at))}</div>
      <div class="watch-body">
        <a href="${safeUrl(i.url)}" target="_blank" rel="noopener">${esc(i.title)}</a>
        <div class="watch-meta">${esc(i.source_name || i.source_id || '')} \u00b7 ${esc(host(i.url))}</div>
        ${i.summary ? `<div class="watch-sum">${esc(i.summary).slice(0, 200)}</div>` : ''}
        ${i.cable ? `<span class="rel-tag">${esc(i.cable_reason || 'cable relevant')}</span>` : ''}
      </div>
    </div>`).join('');
}

async function initWatch() {
  document.getElementById('watch-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.watch-tab');
    if (!btn) return;
    watchState.filter = btn.dataset.f;
    document.querySelectorAll('.watch-tab').forEach(b => b.classList.toggle('on', b === btn));
    paintWatch();
  });
  try {
    const { items, sources, mode } = await getFeed(150);
    watchState.items = items.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
    watchState.sources = sources;
    document.getElementById('watch-stats').innerHTML = `
      <div><b>${items.length}</b> items in window</div>
      <div><b>${items.filter(i => i.cable).length}</b> cable-relevant</div>
      <div><b>${sources.length || 10}</b> sources polled</div>
      <div>${mode === 'live' ? 'live aggregator' : 'static snapshot, rebuilt every 15 min'}</div>`;
    paintWatch();
  } catch {
    document.getElementById('watch-list').innerHTML = `<div class="route-empty">Feed unavailable right now \u2014 try again shortly.</div>`;
  }
}

/* --------------------------------------------------------------------- route */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function matchesPoint(landing, q) {
  const n = q.trim().toLowerCase();
  return landing.city.toLowerCase().includes(n) || landing.country.toLowerCase().includes(n);
}
function likelyChokepoints(from, to) {
  const direct = haversine(from.lat, from.lng, to.lat, to.lng);
  if (direct < 500) return [];
  return CHOKEPOINTS.filter(cp => {
    if (haversine(from.lat, from.lng, cp.lat, cp.lng) < 400) return false;
    if (haversine(to.lat, to.lng, cp.lat, cp.lng) < 400) return false;
    const via = haversine(from.lat, from.lng, cp.lat, cp.lng) + haversine(cp.lat, cp.lng, to.lat, to.lng);
    return via < direct * 1.15;
  });
}

function runRoute(a, b) {
  const out = document.getElementById('route-out');
  if (!a || !b) { out.innerHTML = `<div class="route-placeholder">Enter two cities or countries to begin.</div>`; return; }
  const matches = CABLES.filter(c => (c.landings || []).some(l => matchesPoint(l, a)) && (c.landings || []).some(l => matchesPoint(l, b)));
  if (!matches.length) {
    out.innerHTML = `<div class="route-empty">No tracked cable in this corpus has documented landing points matching both "${esc(a)}" and "${esc(b)}". This registry carries a representative subset of the ~600 active global systems \u2014 try a nearby hub city.</div>`;
    return;
  }
  out.innerHTML = matches.map(c => {
    const la = c.landings.find(l => matchesPoint(l, a));
    const lb = c.landings.find(l => matchesPoint(l, b));
    const chokes = likelyChokepoints(la, lb);
    const st = baseStatus(c.status);
    return `<div class="route-result">
      <div class="rr-top">
        <span class="rr-name">${esc(c.name)}</span>
        <span class="pill" style="color:${st.hex};border-color:${st.hex}66">${esc(st.label)}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--ink3)">${(c.length_km || 0).toLocaleString()} km \u00b7 RFS ${esc(c.rfs)}</span>
      </div>
      <div class="route-path">${esc(la.city)}, ${esc(la.country)} \u2192 ${esc(lb.city)}, ${esc(lb.country)}</div>
      ${chokes.length ? `<div class="chip-row">${chokes.map(cp => `<span class="chip-sm" style="color:var(--coral);border-color:var(--coral)">${esc(cp.name)}</span>`).join('')}</div>` : '<div style="font-size:12px;color:var(--ink4)">No major chokepoint corridor in this registry lies between these two points.</div>'}
    </div>`;
  }).join('');
}

function initRoute() {
  const fromI = document.getElementById('route-from'), toI = document.getElementById('route-to');
  document.getElementById('route-go').addEventListener('click', () => runRoute(fromI.value, toI.value));
  [fromI, toI].forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') runRoute(fromI.value, toI.value); }));
  document.querySelectorAll('.route-ex').forEach(ex => {
    ex.addEventListener('click', () => {
      fromI.value = ex.dataset.a; toI.value = ex.dataset.b;
      runRoute(ex.dataset.a, ex.dataset.b);
    });
  });
  runRoute('', '');
}

/* -------------------------------------------------------------------- init */
initTheme();
initMobileNav();
renderHeroStats();
initAtlas();
renderChokepoints();
renderTimeline();
initDirectory();
initWatch();
initRoute();
