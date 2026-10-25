/* ============================================================================
   SubCableTrack — application shell
   Persistent filter state across six views; hand-rolled router; spotlight;
   theme; keyboard shortcuts.
   ========================================================================== */
import { CABLES } from '../data/cables.js';
import { STATUS, FRESHNESS, computeEdges, regionColor, regionInfo, baseStatus } from './config.js';
import { initGlobe, updateGlobe, toggleArcs } from './globe.js';
import { openDetail, closeDetail, toast } from './detail.js';
import { renderRegistry } from './views/registry.js';
import { renderLandscape } from './views/landscape.js';
import { renderFeed } from './views/feed.js';
import { renderResilience } from './views/resilience.js';
import { renderRoute } from './views/route.js';
import { viewForPath, pathForView } from './lib/router.js';
import { esc } from './lib/security.js';
import { renderHero, initTimeline, activeInYear } from './globe-hud.js';

const ALL = CABLES.slice();
let fYear = null;
const EDGES = computeEdges(ALL);

// Fixed region buckets actually present in the corpus, in a stable order.
const REGION_KEYS = [...new Set(ALL.map(c => regionInfo(c.region).label))];

let currentView = 'globe';
let fRegion = null, fStatus = null, q = '';
let visible = ALL.slice();
let arcsOn = true;

const $ = id => document.getElementById(id);

/* ------------------------------------------------------------------- theme */
function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('sct_theme'); } catch {}
  document.body.classList.toggle('light-mode', saved === 'light');
}
function toggleTheme() {
  const light = !document.body.classList.contains('light-mode');
  document.body.classList.toggle('light-mode', light);
  try { localStorage.setItem('sct_theme', light ? 'light' : 'dark'); } catch {}
  document.dispatchEvent(new CustomEvent('theme-change'));
}

/* ----------------------------------------------------------------- filters */
function buildFilters() {
  $('status-chips').innerHTML = Object.entries(STATUS).map(([k, v]) =>
    `<span class="chip" data-status="${k}" title="${esc(v.desc)}"><span class="dot" style="background:${v.hex}"></span>${esc(v.label)}
      <span style="margin-left:auto;color:var(--text4)">${ALL.filter(g => baseStatus(g.status).label === v.label).length}</span></span>`).join('');

  $('mot-chips').innerHTML = REGION_KEYS.map(r => {
    const n = ALL.filter(c => regionInfo(c.region).label === r).length;
    return `<span class="chip" data-region="${esc(r)}"><span class="dot" style="background:${regionColor(r)}"></span>${esc(r)}
      <span style="margin-left:auto;color:var(--text4)">${n}</span></span>`;
  }).join('');

  $('freshness-key').innerHTML = FRESHNESS.map(f =>
    `<div class="ek-row"><span class="ek-dot" style="background:${f.hex}"></span>${esc(f.label)}</div>`).join('');

  document.querySelectorAll('[data-status]').forEach(el => el.addEventListener('click', () => {
    fStatus = fStatus === el.dataset.status ? null : el.dataset.status; syncChips(); refresh();
  }));
  document.querySelectorAll('[data-region]').forEach(el => el.addEventListener('click', () => {
    fRegion = fRegion === el.dataset.region ? null : el.dataset.region; syncChips(); refresh();
  }));
}

function syncChips() {
  document.querySelectorAll('[data-status]').forEach(e => e.classList.toggle('on', e.dataset.status === fStatus));
  document.querySelectorAll('[data-region]').forEach(e => e.classList.toggle('on', e.dataset.region === fRegion));
}

function applyFilters() {
  const needle = q.trim().toLowerCase();
  visible = ALL.filter(c => {
    if (fRegion && regionInfo(c.region).label !== fRegion) return false;
    if (fStatus && baseStatus(c.status).label !== STATUS[fStatus].label) return false;
    if (fYear !== null && !activeInYear(c, fYear)) return false;
    if (needle) {
      const hay = [c.name, c.aka, c.region, c.summary,
        ...(c.owners || []), ...((c.landings || []).map(l => l.city + ' ' + l.country))].join(' ').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  const active = fRegion || fStatus || needle || fYear !== null;
  $('filter-count').textContent = active ? `${visible.length}/${ALL.length}` : '';
}

function refresh() {
  applyFilters();
  updateGlobe(visible);
  renderHero(visible, ALL, fYear);
  renderCurrentView();
}

/* ------------------------------------------------------------------- views */
function renderCurrentView() {
  // Registry/Landscape/Resilience/Route selection callbacks pass a bare cable
  // object; detail.js's openDetail() tolerates that directly.
  const sel = c => openDetail(c);
  $('cluster-legend').style.display = currentView === 'registry' ? '' : 'none';
  $('arc-sec').style.display = currentView === 'globe' ? '' : 'none';

  if (currentView === 'registry') renderRegistry(visible, EDGES, sel);
  if (currentView === 'landscape') renderLandscape(visible, sel);
  if (currentView === 'feed') renderFeed();
  if (currentView === 'resilience') renderResilience(visible, sel);
  if (currentView === 'route') renderRoute(visible);
}

function showView(view, { push = true } = {}) {
  currentView = view;
  document.querySelectorAll('.view-panel').forEach(p => p.classList.toggle('on', p.dataset.view === view));
  document.querySelectorAll('.tab').forEach(t => {
    const on = t.dataset.view === view;
    t.classList.toggle('on', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.querySelectorAll('.mob-tab').forEach(t => t.classList.toggle('on', t.dataset.view === view));
  if (push) { try { history.pushState({ v: view }, '', pathForView(view)); } catch {} }
  renderCurrentView();
}

function bindTabs() {
  document.querySelectorAll('.tab, .mob-tab').forEach(t => {
    if (t.dataset.view) t.setAttribute('href', pathForView(t.dataset.view));
  });
  document.querySelectorAll('.tab, .mob-tab').forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    showView(t.dataset.view);
    $('sidebar').classList.remove('on');
    $('sb-overlay').classList.remove('on');
  }));
  $('tb-brand').addEventListener('click', () => showView('globe'));
  window.addEventListener('popstate', () => showView(viewForPath(location.pathname) || 'globe', { push: false }));
}

/* --------------------------------------------------------------- spotlight */
function bindSpotlight() {
  const overlay = $('spotlight-overlay'), input = $('spotlight-input'), results = $('spotlight-results');
  let sel = 0, items = [];

  const open = () => { overlay.classList.add('on'); input.value = ''; input.focus(); render(''); };
  const close = () => overlay.classList.remove('on');

  function render(needle) {
    const n = needle.toLowerCase().trim();
    items = !n ? ALL.slice(0, 8) : ALL.filter(c =>
      (c.name + ' ' + (c.aka || '') + ' ' + (c.owners || []).join(' ') +
       (c.landings || []).map(l => l.city + ' ' + l.country).join(' ')).toLowerCase().includes(n)).slice(0, 12);
    sel = 0;
    results.innerHTML = items.length ? items.map((c, i) =>
      `<div class="sr-item ${i === 0 ? 'sel' : ''}" data-i="${i}">
         <span class="dot" style="background:${regionColor(c.region)}"></span>
         <span class="sr-name">${esc(c.name)}</span>
         <span class="mono muted" style="font-size:10px">${esc(c.region)}</span>
         <span class="sr-meta">${(c.length_km || 0).toLocaleString()} km</span>
       </div>`).join('') : '<div class="spotlight-empty">No match in the cable registry.</div>';
    results.querySelectorAll('.sr-item').forEach(el =>
      el.addEventListener('click', () => { openDetail({ kind: 'cable', data: items[Number(el.dataset.i)] }); close(); }));
  }

  input.addEventListener('input', () => render(input.value));
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  $('spotlight-hint').addEventListener('click', open);

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); return; }
    if (!overlay.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = Math.max(0, Math.min(items.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1)));
      results.querySelectorAll('.sr-item').forEach((el, i) => el.classList.toggle('sel', i === sel));
    }
    if (e.key === 'Enter' && items[sel]) { openDetail({ kind: 'cable', data: items[sel] }); close(); }
  });
}

function bindKeys() {
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 't') toggleTheme();
    if (k === 'escape') closeDetail();
    const order = ['globe', 'registry', 'landscape', 'feed', 'resilience', 'route'];
    if (/^[1-6]$/.test(k)) showView(order[Number(k) - 1]);
  });
}

/* -------------------------------------------------------------------- boot */
function boot() {
  try {
    initTheme();
    buildFilters();
    bindTabs();
    bindSpotlight();
    bindKeys();

    $('theme-toggle').addEventListener('click', toggleTheme);
    $('dp-close').addEventListener('click', closeDetail);
    $('mob-menu-btn').addEventListener('click', () => {
      $('sidebar').classList.toggle('on'); $('sb-overlay').classList.toggle('on');
    });
    $('sb-overlay').addEventListener('click', () => {
      $('sidebar').classList.remove('on'); $('sb-overlay').classList.remove('on');
    });
    $('arc-toggle').addEventListener('click', () => {
      arcsOn = toggleArcs();
      $('arc-toggle').textContent = arcsOn ? 'Hide cable arcs' : 'Show cable arcs';
    });

    const search = $('g-search');
    let t;
    search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { q = search.value; refresh(); }, 160); });

    applyFilters();
    initGlobe(visible, sel => openDetail(sel));
    renderHero(visible, ALL);
    initTimeline(ALL, year => { fYear = year; refresh(); });
    $('globe-loading').style.display = 'none';

    const initial = viewForPath(location.pathname) || 'globe';
    showView(initial, { push: false });

    const m = /^#cable=(.+)$/.exec(location.hash || '');
    if (m) {
      const c = ALL.find(x => x.id === decodeURIComponent(m[1]));
      if (c) openDetail({ kind: 'cable', data: c });
    }
  } catch (err) {
    console.error('[SubCableTrack]', err);
    const el = $('globe-loading');
    if (el) el.innerHTML = `<div style="text-align:center;padding:40px;max-width:460px;font-family:ui-monospace,monospace">
      <div style="font-size:14px;color:#f0544f;margin-bottom:12px;font-weight:700">Init failed</div>
      <div style="font-size:11px;color:#5a6d88;line-height:1.9;background:#131a27;padding:14px;border-radius:6px;text-align:left">${esc(err.message || String(err))}</div></div>`;
  }
}

window.addEventListener('error', e => console.error('[SCT]', e.message));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
