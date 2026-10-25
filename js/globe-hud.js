/* ============================================================================
   Globe HUD — hero stat bar + incident timeline.

   Every number is counted from the curated corpus at render time: total
   cables, total route length, design capacity, countries served and the
   incident count — nothing here is a live network measurement.
   ========================================================================== */
import { INCIDENTS } from '../data/incidents.js';

function incidentYear(inc) {
  const m = /^(\d{4})/.exec(String(inc && inc.date || ''));
  return m ? Number(m[1]) : null;
}

function incidentsForCable(cable) {
  const ids = new Set(cable.incidents || []);
  return INCIDENTS.filter(i => ids.has(i.id));
}

/** Does this cable have a dated incident in `year`? */
export function activeInYear(cable, year) {
  return incidentsForCable(cable).some(i => incidentYear(i) === year);
}

/* ------------------------------------------------------------------ hero bar */
export function renderHero(visible, all, year = null) {
  const el = document.getElementById('globe-hero');
  if (!el) return;

  const cables = year === null ? visible : visible.filter(c => activeInYear(c, year));
  const totalKm = cables.reduce((s, c) => s + (c.length_km || 0), 0);
  const totalTbps = cables.reduce((s, c) => s + (c.capacity_tbps || 0), 0);
  const countries = new Set();
  cables.forEach(c => (c.landings || []).forEach(l => countries.add(l.country)));
  const incCount = year === null
    ? new Set(visible.flatMap(c => c.incidents || [])).size
    : INCIDENTS.filter(i => incidentYear(i) === year).length;

  const stats = [
    { n: visible.length, l: 'cable systems tracked', c: 'var(--text)' },
    { n: Math.round(totalKm / 1000).toLocaleString() + 'k', l: 'route km', c: 'var(--accent)' },
    { n: Math.round(totalTbps).toLocaleString(), l: 'design Tbps', c: 'var(--blue)' },
    { n: countries.size, l: 'countries landed', c: 'var(--text)' },
    { n: incCount, l: year === null ? 'documented incidents' : `incidents in ${year}`, c: 'var(--orange)' }
  ];

  el.innerHTML = stats.map((s, i) =>
    (i ? '<div class="gh-sep"></div>' : '') +
    `<div class="gh-stat"><div class="gh-num" style="color:${s.c}">${s.n}</div>` +
    `<div class="gh-lab">${s.l}</div></div>`
  ).join('');
}

/* ----------------------------------------------------------------- timeline */
let playTimer = null;
let years = [];
let onYearCb = null;
let current = null;

function paint() {
  document.querySelectorAll('.gt-bar').forEach(b => {
    const y = Number(b.dataset.year);
    b.classList.toggle('on', current === y);
    b.classList.toggle('dim', current !== null && current !== y);
  });
  const lab = document.getElementById('gt-year');
  if (lab) lab.textContent = current === null ? 'ALL YEARS' : String(current);
}

function select(year) {
  current = year;
  paint();
  if (onYearCb) onYearCb(year);
}

export function stopPlay() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  const b = document.getElementById('gt-play');
  if (b) b.textContent = '\u25b6';
}

function togglePlay() {
  const btn = document.getElementById('gt-play');
  if (playTimer) { stopPlay(); return; }
  if (!years.length) return;
  let i = current === null ? -1 : years.indexOf(current);
  if (btn) btn.textContent = '\u2758\u2758';
  playTimer = setInterval(() => {
    i += 1;
    if (i >= years.length) { stopPlay(); select(null); return; }
    select(years[i]);
  }, 1100);
}

export function initTimeline(all, onYear) {
  const wrap = document.getElementById('gt-bars');
  if (!wrap) return;
  onYearCb = onYear;

  const counts = {};
  INCIDENTS.forEach(i => { const y = incidentYear(i); if (y) counts[y] = (counts[y] || 0) + 1; });
  years = Object.keys(counts).map(Number).sort((a, b) => a - b);
  if (!years.length) return;

  const full = [];
  for (let y = years[0]; y <= years[years.length - 1]; y++) full.push(y);
  const max = Math.max(...Object.values(counts));

  wrap.innerHTML = full.map(y => {
    const n = counts[y] || 0;
    const h = n ? Math.max(14, Math.round(Math.sqrt(n / max) * 100)) : 3;
    const label = n === 1 ? '1 incident' : `${n} incidents`;
    return `<div class="gt-bar" data-year="${y}" title="${y} — ${label}">
      <div class="gt-fill" style="height:${h}%"></div>
      <div class="gt-yr">${y}</div>
    </div>`;
  }).join('');

  wrap.querySelectorAll('.gt-bar').forEach(b => {
    b.addEventListener('click', () => {
      stopPlay();
      const y = Number(b.dataset.year);
      select(current === y ? null : y);
    });
  });

  const play = document.getElementById('gt-play');
  if (play) play.addEventListener('click', togglePlay);
  const reset = document.getElementById('gt-reset');
  if (reset) reset.addEventListener('click', () => { stopPlay(); select(null); });

  paint();
}
