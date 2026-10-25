/* Cable watch feed.
   Aggregates submarine-cable trade press, networking/infrastructure news and
   general tech outlets, scored for cable relevance server-side (or at build
   time for the static snapshot). The curated incident record is always
   merged in and is used as the offline fallback when the aggregator is
   unreachable. */
import { esc, safeUrl, host } from '../lib/security.js';
import { getFeed } from '../lib/api.js';
import { INCIDENTS } from '../../data/incidents.js';

const state = { filter: 'cable', q: '', items: null, sources: null, loading: false };

function timeAgo(d) {
  const t = new Date(d).getTime();
  if (!t) return '';
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const dd = Math.floor(h / 24);
  return dd < 30 ? dd + 'd ago' : new Date(d).toISOString().slice(0, 10);
}

export async function renderFeed() {
  const body = document.getElementById('feed-body');
  if (!state.items) {
    body.innerHTML = shell('<div class="panel"><div class="skel" style="margin-bottom:8px"></div><div class="skel" style="width:70%"></div></div>');
    await load();
    lastFetch = Date.now();
    startAutoRefresh();
  }
  paint();
}

async function load() {
  state.loading = true;
  try {
    const feed = await getFeed(150);
    state.items = (feed.items || []).concat(curated());
    state.sources = feed.sources?.length ? feed.sources : null;
    state.live = !!feed.items?.length;
    state.mode = feed.mode;
    state.stamp = feed.generated_at;
  } catch {
    state.items = curated();
    state.live = false;
    state.mode = 'static';
  }
  state.loading = false;
}

function curated() {
  return INCIDENTS.map(i => ({
    id: 'inc-' + i.id,
    title: i.title, summary: i.summary, url: i.sources?.[0]?.url || '#',
    source_name: i.sources?.[0]?.title || 'Incident record', source_cat: 'incident', severity: 'high',
    published_at: i.date,
    cable: true, cable_reason: 'Curated incident record', actors: [], tags: [i.location]
  }));
}

function ago(iso) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!isFinite(mins)) return '';
  if (mins < 90) return `${Math.max(1, mins)} min ago`;
  const h = Math.round(mins / 60);
  return h < 36 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}

let timer = null, ticker = null, lastFetch = 0;
const REFRESH_MS = 60000;

function startAutoRefresh() {
  stopAutoRefresh();
  timer = setInterval(async () => {
    if (document.hidden) return;
    const before = state.items.length;
    await load();
    lastFetch = Date.now();
    if (document.getElementById('feed-body')?.offsetParent !== null) paint();
    if (state.items.length !== before) toastNew(state.items.length - before);
  }, REFRESH_MS);
  ticker = setInterval(updateTicker, 1000);
}

export function stopAutoRefresh() {
  if (timer) clearInterval(timer);
  if (ticker) clearInterval(ticker);
  timer = ticker = null;
}

function updateTicker() {
  const el = document.getElementById('feed-ticker');
  if (!el || !lastFetch) return;
  const s = Math.round((Date.now() - lastFetch) / 1000);
  const next = Math.max(0, Math.round((REFRESH_MS - (Date.now() - lastFetch)) / 1000));
  el.textContent = `checked ${s}s ago \u00b7 next in ${next}s`;
}

function toastNew(n) {
  if (n <= 0) return;
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = `${n} new item${n === 1 ? '' : 's'}`;
  t.classList.add('on');
  setTimeout(() => t.classList.remove('on'), 2600);
}

function statusLine() {
  if (!state.live) return 'curated incident record only \u2014 aggregator unreachable';
  const tick = '<span id="feed-ticker" class="mono" style="color:var(--text4)"></span>';
  if (state.mode === 'live') return `<span class="pulse-dot"></span><span style="color:var(--green)">live aggregator</span> \u00b7 ${tick}`;
  const when = ago(state.stamp);
  return `<span class="pulse-dot"></span><span style="color:var(--green)">auto-refreshing</span> \u00b7 snapshot${when ? ' ' + esc(when) : ''} \u00b7 rebuilt every 15 min<br>${tick}`;
}

function shell(inner) {
  return `<div class="v-head">
      <div class="v-title">Cable watch</div>
      <div class="v-sub">Submarine-cable trade press, networking outlets and general tech/security reporting, monitored for cable relevance. The curated incident record is always included.</div>
    </div>${inner}`;
}

function paint() {
  const body = document.getElementById('feed-body');
  let items = state.items.slice();

  if (state.filter === 'cable') items = items.filter(i => i.cable);
  if (state.filter === 'trade') items = items.filter(i => i.source_cat === 'trade');
  if (state.q) {
    const q = state.q.toLowerCase();
    items = items.filter(i => (i.title + ' ' + (i.summary || '')).toLowerCase().includes(q));
  }
  items.sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));

  const cableCount = state.items.filter(i => i.cable).length;

  body.innerHTML = shell(`
    <div class="grid3" style="margin-bottom:14px">
      <div class="stat-card"><div class="lab">Items in window</div><div class="val">${state.items.length}</div><div class="sub">${statusLine()}</div></div>
      <div class="stat-card"><div class="lab">Cable-relevant</div><div class="val" style="color:var(--bd-green)">${cableCount}</div><div class="sub">matched on cable/infrastructure keywords</div></div>
      <div class="stat-card"><div class="lab">Sources polled</div><div class="val">${(state.sources || []).length || '\u2014'}</div><div class="sub">every 15 minutes</div></div>
    </div>

    <div class="feed-bar">
      <div class="seg" id="feed-seg">
        <button class="${state.filter === 'cable' ? 'on' : ''}" data-f="cable">\ud83d\udd0c Cable-relevant</button>
        <button class="${state.filter === 'all' ? 'on' : ''}" data-f="all">All sources</button>
      </div>
      <input id="feed-q" placeholder="Filter\u2026" value="${esc(state.q)}"
        style="flex:1;min-width:160px;padding:7px 11px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-family:var(--mono);font-size:11.5px;outline:none">
      <button class="btn-ghost" style="padding:7px 13px;font-size:11.5px" id="feed-refresh">\u21bb Refresh</button>
    </div>

    <div class="grid2" style="grid-template-columns: 1fr 250px; align-items:start">
      <div>
        ${items.length ? items.map(card).join('') : '<div class="pr-empty">Nothing matches those filters.</div>'}
      </div>
      <div class="panel">
        <div class="panel-t">Source health</div>
        <div class="src-health">
          ${(state.sources || []).map(s => `
            <div class="sh-row" title="${esc(s.error || 'ok')}">
              <span class="dot" style="background:${s.ok ? 'var(--green)' : 'var(--red)'}"></span>
              ${esc(s.name)}<span class="n">${s.count ?? 0}</span>
            </div>`).join('') || '<div class="mono muted" style="font-size:10.5px">Aggregator offline \u2014 showing curated incident record.</div>'}
        </div>
        <div class="panel-t" style="margin-top:14px">Cable keyword model</div>
        <div class="mono" style="font-size:10px;color:var(--text4);line-height:1.7">
          submarine cable \u00b7 subsea cable \u00b7 cable landing \u00b7 cable cut \u00b7 cable fault \u00b7 TeleGeography \u00b7 chokepoint \u00b7 + every tracked system/owner name in the corpus
        </div>
      </div>
    </div>`);

  body.querySelectorAll('#feed-seg button').forEach(b => b.addEventListener('click', () => { state.filter = b.dataset.f; paint(); }));
  const q = body.querySelector('#feed-q');
  q.addEventListener('input', () => { state.q = q.value; const p = q.selectionStart; paint(); const nq = document.getElementById('feed-q'); nq.focus(); nq.setSelectionRange(p, p); });
  body.querySelector('#feed-refresh').addEventListener('click', async () => { state.items = null; await renderFeed(); });
}

function card(i) {
  const sev = i.severity || 'info';
  return `<div class="feed-item ${i.cable ? 'bd' : ''} sev-${esc(sev)}">
    <div class="fi-top">
      <span class="fi-src">${esc((i.source_cat || 'news').toUpperCase())}</span>
      <span class="mono muted" style="font-size:10px">${esc(i.source_name || host(i.url))}</span>
      ${i.cable ? '<span class="pill live">CABLE RELEVANT</span>' : ''}
      <span class="fi-time">${esc(timeAgo(i.published_at))}</span>
    </div>
    <div class="fi-title"><a href="${esc(safeUrl(i.url))}" target="_blank" rel="noopener">${esc(i.title)}</a></div>
    ${i.summary ? `<div class="fi-sum">${esc(String(i.summary).slice(0, 320))}</div>` : ''}
    <div class="fi-tags">
      ${(i.tags || []).slice(0, 4).map(t => `<span class="tag">#${esc(t)}</span>`).join('')}
      ${i.cable_reason ? `<span class="tag" style="color:var(--text4)">${esc(i.cable_reason)}</span>` : ''}
    </div>
  </div>`;
}
