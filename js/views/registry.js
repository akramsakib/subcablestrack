/* Registry — relationship graph over the cable corpus (D3 force layout).
   Edges are derived at runtime: shared owner/consortium member, shared
   landing country, or the same region bucket. D3 is loaded lazily. */
import { regionColor, EDGE_COLORS } from '../config.js';
import { baseStatus } from '../config.js';

let d3Loading = null;
const state = { types: { owner: true, landing: true, region: false }, sim: null, view: 'graph' };

function loadD3() {
  if (globalThis.d3) return Promise.resolve();
  if (d3Loading) return d3Loading;
  d3Loading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = new URL('../../vendor/d3.min.js', import.meta.url).href;
    s.onload = res;
    s.onerror = () => { d3Loading = null; rej(new Error('d3 failed to load')); };
    document.head.appendChild(s);
  });
  return d3Loading;
}

export async function renderRegistry(cables, edges, onSelect) {
  const root = document.getElementById('registry-view');
  const counts = edges.reduce((a, e) => (a[e.type] = (a[e.type] || 0) + 1, a), {});

  root.innerHTML = `
    <div class="cl-top">
      <span class="mono" style="font-size:10px;color:var(--text3);letter-spacing:.1em">CABLE REGISTRY</span>
      <div class="seg seg-sm" id="reg-view-seg">
        <button class="${state.view === 'graph' ? 'on' : ''}" data-v="graph">Relationship graph</button>
        <button class="${state.view === 'list' ? 'on' : ''}" data-v="list">List</button>
      </div>
      ${['owner', 'landing', 'region'].map(t => `
        <button class="cl-edge-toggle ${state.types[t] ? 'on' : ''}" data-type="${t}">
          <span class="ek-line" style="background:${EDGE_COLORS[t]}"></span>
          ${t === 'owner' ? 'Shared owner' : t === 'landing' ? 'Shared landing country' : 'Same region'}
          <span class="n">${counts[t] || 0}</span>
        </button>`).join('')}
      <div style="flex:1"></div>
      <span class="mono muted" style="font-size:11px">${cables.length} systems</span>
    </div>
    <div class="cl-canvas" id="reg-canvas"></div>`;

  root.querySelectorAll('#reg-view-seg button').forEach(b => b.addEventListener('click', () => {
    state.view = b.dataset.v; renderRegistry(cables, edges, onSelect);
  }));
  root.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => {
    state.types[b.dataset.type] = !state.types[b.dataset.type];
    b.classList.toggle('on', state.types[b.dataset.type]);
    draw(cables, edges, onSelect);
  }));

  if (state.view === 'list') { renderList(cables, onSelect); return; }

  document.getElementById('reg-canvas').innerHTML = '<svg id="registry-svg"></svg>';
  try { await loadD3(); } catch {
    document.getElementById('reg-canvas').innerHTML = '<div class="pr-empty">Graph library unavailable.</div>';
    return;
  }
  requestAnimationFrame(() => draw(cables, edges, onSelect));
}

function renderList(cables, onSelect) {
  const canvas = document.getElementById('reg-canvas');
  canvas.style.position = 'static';
  canvas.style.paddingTop = '96px';
  canvas.innerHTML = `<div class="scroll-wrap" style="padding:4px 2px">
    ${cables.slice().sort((a, b) => b.length_km - a.length_km).map(c => {
      const st = baseStatus(c.status);
      return `<div class="feed-item" data-open="${c.id}" style="cursor:pointer;border-left-color:${regionColor(c.region)}">
        <div class="fi-top">
          <span class="fi-src">${(c.length_km || 0).toLocaleString()} KM</span>
          <span class="mono muted" style="font-size:10px">RFS ${c.rfs}</span>
          <span class="pill" style="color:${st.hex};border-color:${st.hex}55">${st.label}</span>
          <span class="fi-time">${c.capacity_tbps || '?'} Tbps</span>
        </div>
        <div class="fi-title">${c.name}${c.aka ? ' <span class="muted" style="font-weight:400;font-size:11px">(' + c.aka + ')</span>' : ''}</div>
        <div class="fi-sum">${c.summary.slice(0, 220)}</div>
        <div class="fi-tags">
          <span class="tag accent">${c.region}</span>
          ${(c.owners || []).slice(0, 4).map(o => `<span class="tag">${o}</span>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
  canvas.querySelectorAll('[data-open]').forEach(el =>
    el.addEventListener('click', () => onSelect(cables.find(c => c.id === el.dataset.open))));
}

function draw(cables, edges, onSelect) {
  const svgEl = document.getElementById('registry-svg');
  if (!svgEl || !globalThis.d3) return;
  const box = svgEl.getBoundingClientRect();
  const W = box.width || 900, H = box.height || 600;

  const nodes = cables.map(c => ({ ...c }));
  const ids = new Set(nodes.map(n => n.id));
  const links = edges
    .filter(e => state.types[e.type] && ids.has(e.s) && ids.has(e.t))
    .map(e => ({ source: e.s, target: e.t, type: e.type, n: e.n, items: e.items }));

  const svg = d3.select(svgEl);
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${W} ${H}`);
  const g = svg.append('g');

  const zoom = d3.zoom().scaleExtent([.25, 4]).on('zoom', ev => g.attr('transform', ev.transform));
  svg.call(zoom);

  const link = g.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', d => EDGE_COLORS[d.type])
    .attr('stroke-opacity', d => d.type === 'region' ? .16 : .45)
    .attr('stroke-width', d => Math.min(3.5, 1 + d.n * .5))
    .attr('stroke-dasharray', d => d.type === 'landing' ? '4 3' : d.type === 'region' ? '2 3' : null);

  const node = g.append('g').selectAll('g').data(nodes).join('g')
    .style('cursor', 'pointer')
    .on('click', (_, d) => onSelect(d))
    .call(d3.drag()
      .on('start', (ev, d) => { if (!ev.active) sim.alphaTarget(.25).restart(); d.fx = d.x; d.fy = d.y; })
      .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
      .on('end', (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  node.append('circle')
    .attr('class', 'node-circle')
    .attr('r', d => 7 + Math.min(1, (d.capacity_tbps || 10) / 200) * 13)
    .attr('fill', d => regionColor(d.region))
    .attr('fill-opacity', .88)
    .attr('stroke', d => baseStatus(d.status).hex)
    .attr('stroke-width', 2);

  node.append('title').text(d => `${d.name} \u2014 ${d.region} \u00b7 ${(d.length_km || 0).toLocaleString()} km`);

  node.append('text')
    .attr('class', 'node-label')
    .attr('text-anchor', 'middle')
    .attr('dy', d => 7 + Math.min(1, (d.capacity_tbps || 10) / 200) * 13 + 13)
    .text(d => d.name);

  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.type === 'region' ? 170 : 110).strength(d => d.type === 'region' ? .05 : .32))
    .force('charge', d3.forceManyBody().strength(-420).distanceMax(520))
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('x', d3.forceX(W / 2).strength(.055))
    .force('y', d3.forceY(H / 2).strength(.085))
    .force('collide', d3.forceCollide().radius(d => 36 + Math.min(1, (d.capacity_tbps || 10) / 200) * 14))
    .on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    })
    .on('end', fit);

  function fit() {
    if (!nodes.length) return;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const pad = 70;
    const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
    const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
    const k = Math.min(2, Math.max(.25, Math.min(W / (x1 - x0), H / (y1 - y0))));
    const tx = W / 2 - k * (x0 + x1) / 2, ty = H / 2 - k * (y0 + y1) / 2;
    svg.transition().duration(650)
       .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
  }
  setTimeout(fit, 2200);

  state.sim = sim;
}
