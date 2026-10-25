/* Tiny table-driven router over the History API.

   Base-aware: the same build works at a domain root and under a GitHub Pages
   project prefix (user.github.io/repo/route). The prefix is derived from
   <base href> / the document URL, never hard-coded. */

const ROUTES = [
  { path: '/globe',       view: 'globe',      aliases: ['/'] },
  { path: '/registry',    view: 'registry',   aliases: ['/cables'] },
  { path: '/landscape',   view: 'landscape',  aliases: ['/brief'] },
  { path: '/feed',        view: 'feed' },
  { path: '/resilience',  view: 'resilience', aliases: ['/chokepoints', '/incidents'] },
  { path: '/route',       view: 'route',      aliases: ['/lookup'] }
];

const byPath = new Map(), byView = new Map();
for (const r of ROUTES) {
  byPath.set(r.path, r.view);
  (r.aliases || []).forEach(a => byPath.set(a, r.view));
  byView.set(r.view, r.path);
}

/** Deployment prefix, e.g. '' at a domain root or '/subcablestrack'. */
export const BASE = (() => {
  try {
    let p = new URL(document.baseURI).pathname;
    if (!p.endsWith('/')) p = p.replace(/[^/]*$/, '');
    return p.replace(/\/+$/, '');
  } catch {
    return '';
  }
})();

const normalise = p => {
  let s = String(p || '/');
  if (BASE && s.toLowerCase().startsWith(BASE.toLowerCase())) s = s.slice(BASE.length);
  s = s.toLowerCase();
  if (!s.startsWith('/')) s = '/' + s;
  s = s.replace(/\/index\.html$/, '/');
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s || '/';
};

export const viewForPath = p => byPath.get(normalise(p)) || null;
export const pathForView = v => BASE + (byView.get(v) || '/globe');
export const routeViews = () => ROUTES.map(r => r.view);
