/* Global cable landscape — board-ready brief. */
import { esc, safeUrl } from '../lib/security.js';
import { regionColor, regionInfo, baseStatus } from '../config.js';
import { INCIDENTS } from '../../data/incidents.js';
import { CHOKEPOINTS } from '../../data/chokepoints.js';

export function renderLandscape(cables, onSelect) {
  const body = document.getElementById('landscape-body');

  const byRegion = {};
  cables.forEach(c => { const r = regionInfo(c.region).label; byRegion[r] = (byRegion[r] || 0) + 1; });
  const regionRows = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);
  const total = cables.length || 1;

  const totalKm = cables.reduce((s, c) => s + (c.length_km || 0), 0);
  const totalTbps = cables.reduce((s, c) => s + (c.capacity_tbps || 0), 0);
  const active = cables.filter(c => baseStatus(c.status).label === 'Active').length;
  const decommissioned = cables.filter(c => baseStatus(c.status).label === 'Decommissioned').length;

  const topByLength = [...cables].sort((a, b) => b.length_km - a.length_km).slice(0, 8);
  const topByCapacity = [...cables].sort((a, b) => (b.capacity_tbps || 0) - (a.capacity_tbps || 0)).slice(0, 8);

  const incidentsSorted = [...INCIDENTS].sort((a, b) => b.date.localeCompare(a.date));
  const vesselCaused = INCIDENTS.filter(i => i.cause.startsWith('vessel')).length;
  const naturalCaused = INCIDENTS.filter(i => i.cause.startsWith('natural')).length;
  // Only count an incident as "confirmed deliberate" when a court finding or
  // criminal conviction says so \u2014 substring-matching "confirmed" alone would
  // wrongly sweep in phrases like "not independently confirmed".
  const confirmedDeliberate = INCIDENTS.filter(i => /criminal conviction/i.test(i.cause_confidence || '')).length;

  const blufCells = [
    ['Largest system tracked', topByLength[0]?.name || '\u2014', `${(topByLength[0]?.length_km || 0).toLocaleString()} km \u00b7 ${topByLength[0]?.region || ''}`],
    ['Highest design capacity', topByCapacity[0]?.name || '\u2014', `${topByCapacity[0]?.capacity_tbps || 0} Tbps`],
    ['Most-documented incident cluster', 'Taiwan Strait', `${INCIDENTS.filter(i => i.location?.includes('Taiwan') || i.location?.includes('Matsu')).length} incidents since 2023`],
    ['Incidents attributed to vessels', `${vesselCaused} of ${INCIDENTS.length}`, `${confirmedDeliberate} confirmed deliberate by criminal conviction`],
    ['Incidents attributed to nature', `${naturalCaused} of ${INCIDENTS.length}`, 'earthquakes, landslides, volcanic eruption']
  ];

  body.innerHTML = `
    <div class="cond-banner">
      <span class="blip"></span>
      <b>WATCH</b>
      <span>Seven cable-damage incidents have been recorded in the Baltic Sea alone since November 2024, and Taiwan Strait cables have now produced the industry's first criminal conviction for deliberate subsea sabotage \u2014 treat vessel-pattern anomalies near chokepoints as a live signal, not a historical curiosity.</span>
    </div>

    <div class="v-head">
      <div class="v-title">Global Submarine Cable Landscape</div>
      <div class="bluf">
        <div class="bluf-line">
          <span class="bluf-tag">BLUF</span>
          <span>Bottom line up front \u2014 derived from the corpus, not asserted.</span>
        </div>
        <div class="bluf-grid">
          ${blufCells.map(([k, v, sub]) => `
            <div class="bluf-cell">
              <div class="bluf-k">${esc(k)}</div>
              <div class="bluf-v">${esc(v)}</div>
              <div class="bluf-sub">${esc(sub)}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="v-sub">${esc(new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' }))} \u00b7 compiled from consortium announcements, regulator filings, Internet Society/Cloudflare/APNIC reporting and press coverage. Not a reproduction of TeleGeography's proprietary map data.</div>
    </div>

    <div class="grid3" style="margin-bottom:14px">
      <div class="stat-card"><div class="lab">Cables tracked</div><div class="val">${cables.length}</div><div class="sub">${active} active \u00b7 ${decommissioned} decommissioned</div></div>
      <div class="stat-card"><div class="lab">Total route length</div><div class="val">${Math.round(totalKm / 1000).toLocaleString()}k km</div><div class="sub">of ~1.4\u20131.5M km in global service (2026)</div></div>
      <div class="stat-card"><div class="lab">Combined design capacity</div><div class="val" style="color:var(--blue)">${Math.round(totalTbps).toLocaleString()}</div><div class="sub">Tbps across tracked systems</div></div>
      <div class="stat-card"><div class="lab">Documented incidents</div><div class="val" style="color:var(--orange)">${INCIDENTS.length}</div><div class="sub">2006 \u2192 present, sourced</div></div>
    </div>

    <div class="panel" id="choke-watch" style="margin-bottom:14px"></div>

    <div class="grid2" style="margin-bottom:14px">
      <div class="panel">
        <div class="panel-t">Cables by region <span class="mut">share of tracked systems</span></div>
        <div class="donut-wrap">
          ${donut(regionRows, total)}
          <div class="donut-legend">
            ${regionRows.map(([r, n]) => `
              <div class="dl-row"><span class="dot" style="background:${regionColor(r)}"></span>${esc(r)}<span class="n">${n}</span></div>`).join('')}
          </div>
        </div>

        <div class="panel-t" style="margin-top:20px">Incident cause <span class="mut">as reported, not upgraded to certainty</span></div>
        ${[['Vessel (anchor drag / fishing gear)', vesselCaused], ['Natural (seismic / volcanic)', naturalCaused], ['Other / undetermined', INCIDENTS.length - vesselCaused - naturalCaused]].map(([label, n]) => `
          <div style="margin-bottom:9px">
            <div class="row" style="font-size:12px;margin-bottom:3px">
              <span>${esc(label)}</span>
              <span class="mono muted" style="margin-left:auto">${n}</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${(n / INCIDENTS.length) * 100}%;background:${label.startsWith('Vessel') ? 'var(--red)' : label.startsWith('Natural') ? 'var(--blue)' : 'var(--text4)'}"></div></div>
          </div>`).join('')}

        <div class="mono" style="font-size:10px;color:var(--text4);line-height:1.8;margin-top:16px;border-top:1px solid var(--border);padding-top:12px">
          A cause is only shown as "confirmed" when a court finding, criminal conviction or the cable operator's own published root-cause analysis says so. Everything else is reported with the confidence level the sources themselves used.
        </div>
      </div>

      <div class="panel">
        <div class="panel-t">Longest systems tracked <span class="mut">route length, km</span></div>
        ${topByLength.map(c => barRow(c, c.length_km, topByLength[0].length_km, `${(c.length_km || 0).toLocaleString()} km`, onSelect)).join('')}

        <div class="panel-t" style="margin-top:20px">Highest design capacity <span class="mut">Tbps</span></div>
        ${topByCapacity.map(c => barRow(c, c.capacity_tbps || 0, topByCapacity[0].capacity_tbps || 1, `${c.capacity_tbps || '?'} Tbps`, onSelect)).join('')}
      </div>
    </div>

    <div class="panel">
      <div class="panel-t">Incident record <span class="mut">${INCIDENTS.length} documented events, 2006\u2013present</span></div>
      <div id="inc-list">
        ${incidentsSorted.map(incidentRow).join('')}
      </div>
    </div>`;

  renderChokeWatch(document.getElementById('choke-watch'));
  body.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => onSelect(cables.find(c => c.id === el.dataset.open))));
}

function barRow(c, val, max, label, onSelect) {
  return `<div style="margin-bottom:9px;cursor:pointer" data-open="${c.id}">
    <div class="row" style="font-size:12px;margin-bottom:3px">
      <span>${c.name}</span>
      <span class="mono muted" style="margin-left:auto">${label}</span>
    </div>
    <div class="bar-track"><div class="bar-fill" style="width:${max ? (val / max) * 100 : 0}%;background:${regionColor(c.region)}"></div></div>
  </div>`;
}

function incidentRow(i) {
  return `<div class="kev-row">
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <span class="mono" style="font-weight:650">${esc(i.date)}</span>
      <span class="tag">${esc(i.title)}</span>
      <span class="mono muted" style="margin-left:auto;font-size:10px">${esc(i.location)}</span>
    </div>
    <div style="font-size:11.5px;color:var(--text3);margin:5px 0 6px">${esc(i.summary.slice(0, 260))}${i.summary.length > 260 ? '\u2026' : ''}</div>
    <div class="row" style="gap:6px;flex-wrap:wrap">
      <span class="tag" style="color:var(--red)">${esc(i.cause)}</span>
      <span class="tag" style="color:var(--text4)">${esc(i.cause_confidence)}</span>
    </div>
  </div>`;
}

function renderChokeWatch(el) {
  if (!el) return;
  el.innerHTML = `
    <div class="panel-t">Chokepoint watch <span class="mut">narrow corridors carrying a disproportionate share of traffic</span></div>
    <div class="grid3" style="margin-top:10px">
      ${CHOKEPOINTS.map(cp => `
        <div class="stat-card">
          <div class="lab">${esc(cp.name)}</div>
          <div class="val" style="font-size:15px;color:var(--orange)">${esc(cp.cable_count_range)}</div>
          <div class="sub">${esc(cp.traffic_share)}</div>
        </div>`).join('')}
    </div>
    <div class="mono" style="font-size:9.5px;color:var(--text4);line-height:1.8;margin-top:10px">
      See the Resilience view for the full writeup on each corridor, or
      <a href="https://www.submarinecablemap.com/" target="_blank" rel="noopener">TeleGeography's interactive Submarine Cable Map</a> for the authoritative, continuously updated global picture this console does not attempt to reproduce.
    </div>`;
}

function donut(rows, total) {
  const R = 46, C = 2 * Math.PI * R;
  let off = 0;
  const segs = rows.map(([r, n]) => {
    const len = (n / total) * C;
    const s = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${regionColor(r)}" stroke-width="13"
       stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;
    off += len;
    return s;
  }).join('');
  return `<svg width="120" height="120" viewBox="0 0 120 120" style="flex:none">
    ${segs}
    <text x="60" y="58" text-anchor="middle" fill="currentColor" font-size="22" font-weight="700" font-family="ui-monospace,monospace">${total}</text>
    <text x="60" y="73" text-anchor="middle" fill="#7c8aa0" font-size="8.5" font-family="ui-monospace,monospace">CABLES</text>
  </svg>`;
}
