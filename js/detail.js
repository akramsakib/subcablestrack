/* Dossier drawer — cable systems and chokepoints. */
import { esc, escAttr, safeUrl, host } from './lib/security.js';
import { regionInfo, baseStatus, statusNote } from './config.js';
import { INCIDENTS } from '../data/incidents.js';

const $ = id => document.getElementById(id);

function sec(title, body, extra = '') {
  return body ? `<div class="dp-sec"><div class="dp-sec-t">${esc(title)}${extra}</div>${body}</div>` : '';
}
const tags = (arr, cls = '') => (arr || []).map(x => `<span class="tag ${cls}">${esc(x)}</span>`).join('');

export function openDetail(selection) {
  if (!selection) return;
  if (selection.kind === 'choke') return openChoke(selection.data);
  return openCable(selection.data || selection); // tolerate being passed a bare cable too
}

function openCable(c) {
  if (!c) return;
  const panel = $('detail');
  const st = baseStatus(c.status);
  const note = statusNote(c.status);
  const rg = regionInfo(c.region);

  $('dp-name').textContent = c.name;
  $('dp-sub').innerHTML = `${esc(c.aka || '')} \u00b7 RFS ${esc(c.rfs)} \u00b7 <span style="color:${st.hex}">${esc(st.label)}</span>`;

  const incidents = INCIDENTS.filter(i => (c.incidents || []).includes(i.id));
  const incidentsHtml = incidents.map(i => `
    <div class="kv-item">
      <div class="kv-date">${esc(i.date)}</div>
      <div class="kv-k">${esc(i.title)}</div>
      <div class="kv-v">${esc(i.summary)}</div>
      <div class="kv-v" style="color:var(--text4)">Cause: ${esc(i.cause)} (${esc(i.cause_confidence)})</div>
    </div>`).join('');

  const landingsHtml = (c.landings || []).map(l =>
    `<div class="kv-item"><div class="row"><span class="tag accent">${esc(l.city)}</span><span class="kv-v">${esc(l.country)}</span></div></div>`).join('');

  const sources = (c.sources || []).map(s =>
    `<a class="src-link" href="${escAttr(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}
       <span class="src-host">${esc(host(s.url))}${s.date ? ' \u00b7 ' + esc(s.date) : ''}</span></a>`).join('');

  $('dp-body').innerHTML = `
    <div class="dp-sec">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="tag" style="color:${rg.hex};border-color:${rg.hex}66;background:${rg.hex}14">${esc(rg.label)}</span>
        <span class="tag" style="color:${st.hex};border-color:${st.hex}66">${esc(st.label)}${note ? ' \u2014 ' + esc(note) : ''}</span>
        <span class="tag accent">${esc((c.length_km || 0).toLocaleString())} km</span>
        <span class="tag">${esc(c.capacity_tbps || '?')} Tbps design capacity</span>
      </div>
    </div>

    ${sec('Owners / consortium', tags(c.owners))}
    ${sec('Assessment', `<p class="dp-p">${esc(c.summary)}</p>`)}
    ${sec('Landing points', landingsHtml, ` <span style="color:var(--text4)">${(c.landings || []).length} of a larger total \u2014 representative subset</span>`)}
    ${sec('Incident history', incidentsHtml || '', incidents.length ? ` <span style="color:var(--orange)">${incidents.length}</span>` : '')}
    ${sec('Sources', sources)}
  `;

  panel.classList.add('on');
  try { history.replaceState(history.state, '', location.pathname + '#cable=' + encodeURIComponent(c.id)); } catch {}
}

function openChoke(cp) {
  if (!cp) return;
  const panel = $('detail');
  $('dp-name').textContent = cp.name;
  $('dp-sub').innerHTML = `<span style="color:#f5a623">Chokepoint</span> \u00b7 ${esc(cp.cable_count_range)} cables`;

  const sources = (cp.sources || []).map(s =>
    `<a class="src-link" href="${escAttr(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}
       <span class="src-host">${esc(host(s.url))}</span></a>`).join('');

  $('dp-body').innerHTML = `
    <div class="dp-sec">
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <span class="tag" style="color:#f5a623;border-color:#f5a62366;background:#f5a62314">${esc(cp.traffic_share)}</span>
        <span class="tag">${esc(cp.cable_count_range)} cables</span>
      </div>
    </div>
    ${sec('Why it matters', `<p class="dp-p">${esc(cp.note)}</p>`)}
    ${sec('Sources', sources)}
  `;
  panel.classList.add('on');
}

export function closeDetail() {
  $('detail').classList.remove('on');
  try { history.replaceState(history.state, '', location.pathname); } catch {}
}

export function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 1800);
}
