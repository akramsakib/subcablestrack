/* Resilience — chokepoint dossiers, the incident timeline, and a
   redundancy pivot: how many systems serve each region, and which regions
   would be most exposed if one failed. */
import { esc, safeUrl } from '../lib/security.js';
import { regionColor, regionInfo, baseStatus } from '../config.js';
import { CHOKEPOINTS } from '../../data/chokepoints.js';
import { INCIDENTS } from '../../data/incidents.js';

let tab = 'chokepoints';

export function renderResilience(cables, onSelect) {
  const body = document.getElementById('resilience-body');
  const tabs = [['chokepoints', 'Chokepoints'], ['incidents', 'Incident timeline'], ['redundancy', 'Redundancy pivot']];

  body.innerHTML = `
    <div class="v-head">
      <div class="v-title">Resilience</div>
      <div class="v-sub">Where the network is geographically concentrated, what has actually gone wrong there, and which regions carry the least redundancy if a system fails. Every figure below is counted from the curated corpus.</div>
    </div>
    <div class="seg" style="margin-bottom:16px" id="res-tabs">
      ${tabs.map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-t="${k}">${l}</button>`).join('')}
    </div>
    <div id="res-pane"></div>`;

  body.querySelectorAll('#res-tabs button').forEach(b =>
    b.addEventListener('click', () => { tab = b.dataset.t; renderResilience(cables, onSelect); }));

  const pane = document.getElementById('res-pane');
  if (tab === 'chokepoints') chokepoints(pane, cables, onSelect);
  if (tab === 'incidents') incidents(pane, cables, onSelect);
  if (tab === 'redundancy') redundancy(pane, cables, onSelect);
}

/* ------------------------------------------------------------ chokepoints */
function chokepoints(pane, cables, onSelect) {
  pane.innerHTML = CHOKEPOINTS.map(cp => `
    <div class="panel" style="margin-bottom:12px">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <div class="panel-t" style="margin:0">${esc(cp.name)}</div>
        <span class="pill warn">${esc(cp.cable_count_range)}</span>
        <span class="mono muted" style="margin-left:auto;font-size:10.5px">${esc(cp.traffic_share)}</span>
      </div>
      <p class="dp-p" style="font-size:12.5px">${esc(cp.note)}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">
        ${(cp.sources || []).map(s => `<a class="src-link" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('')}
      </div>
    </div>`).join('');
}

/* -------------------------------------------------------------- incidents */
function incidents(pane, cables, onSelect) {
  const byId = new Map(cables.map(c => [c.id, c]));
  const sorted = [...INCIDENTS].sort((a, b) => b.date.localeCompare(a.date));
  pane.innerHTML = `
    <div class="mono muted" style="font-size:11px;margin-bottom:10px">${sorted.length} documented incidents, 2006\u2192present \u00b7 click a cable chip to open its dossier</div>
    ${sorted.map(i => `
    <div class="kev-row">
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <span class="mono" style="font-weight:650">${esc(i.date)}</span>
        <span class="tag">${esc(i.title)}</span>
      </div>
      <div style="font-size:11.5px;color:var(--text3);margin:5px 0 6px">${esc(i.summary)}</div>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px">
        <span class="tag" style="color:var(--red)">${esc(i.cause)}</span>
        <span class="tag" style="color:var(--text4)">confidence: ${esc(i.cause_confidence)}</span>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap">
        ${(i.cables || []).map(cid => byId.get(cid) ? `<span class="tag accent" data-open="${esc(cid)}" style="cursor:pointer">${esc(byId.get(cid).name)}</span>` : '').join('')}
      </div>
    </div>`).join('')}`;
  pane.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => onSelect(cables.find(c => c.id === el.dataset.open))));
}

/* ------------------------------------------------------------- redundancy */
function redundancy(pane, cables, onSelect) {
  const byRegion = {};
  cables.filter(c => baseStatus(c.status).label === 'Active').forEach(c => {
    const r = regionInfo(c.region).label;
    (byRegion[r] = byRegion[r] || []).push(c);
  });
  const rows = Object.entries(byRegion).sort((a, b) => a[1].length - b[1].length);
  const maxN = Math.max(...rows.map(([, l]) => l.length), 1);

  pane.innerHTML = `
    <div class="mono muted" style="font-size:11px;margin-bottom:10px">Active systems per region bucket, fewest first \u2014 a region served by one or two systems has no physical fallback if either is cut.</div>
    <div class="panel">
      ${rows.map(([region, list]) => {
        const risky = list.length <= 2;
        return `<div style="margin-bottom:12px">
          <div class="row" style="font-size:12.5px;margin-bottom:4px">
            <span class="dot" style="background:${regionColor(region)}"></span><b>${esc(region)}</b>
            ${risky ? '<span class="pill crit" style="margin-left:8px">low redundancy</span>' : ''}
            <span class="mono muted" style="margin-left:auto">${list.length} system${list.length === 1 ? '' : 's'}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${(list.length / maxN) * 100}%;background:${risky ? 'var(--red)' : regionColor(region)}"></div></div>
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
            ${list.map(c => `<span class="tag" data-open="${esc(c.id)}" style="cursor:pointer">${esc(c.name)}</span>`).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="mono" style="font-size:9.5px;color:var(--text4);line-height:1.8;margin-top:12px">
      This counts systems carried in this curated corpus, not every cable serving a region \u2014 it illustrates concentration risk, it is not an exhaustive redundancy audit. Tonga (one cable, 38 days offline after the 2022 eruption) and the Matsu Islands (repeated short outages) are the clearest real-world cases in the incident record.
    </div>`;
  pane.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => onSelect(cables.find(c => c.id === el.dataset.open))));
}
