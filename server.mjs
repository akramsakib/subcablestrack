/* ============================================================================
   SubCableTrack — edge service (zero dependencies)
   · static asset serving with SPA fallback
   · /api/feed/*   RSS aggregation + cable relevance scoring (15m cache)
   · /api/cables   the full cable corpus as JSON

   The feed engine lives in a shared module so the static GitHub Pages build
   produces a byte-identical snapshot via tools/build.mjs.
   ========================================================================== */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CABLES } from './data/cables.js';
import { INCIDENTS } from './data/incidents.js';
import { SOURCES, getFeed, cache } from './tools/feed.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const PORT = process.env.PORT || 3000;
const ROUTES = ['/', '/globe', '/registry', '/cables', '/landscape', '/brief', '/feed', '/resilience', '/chokepoints', '/incidents', '/route', '/lookup'];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const json = (res, obj, code = 200, extra = {}) => {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
    'access-control-allow-origin': '*',
    ...extra
  });
  res.end(body);
};

async function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  if (ROUTES.includes(pathname)) rel = '/index.html';
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('forbidden'); return; }
  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    const immutable = /^\/(vendor|assets)\//.test(rel);
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin'
    });
    res.end(data);
  } catch {
    const idx = await fs.readFile(path.join(ROOT, 'index.html')).catch(() => null);
    if (idx) { res.writeHead(200, { 'content-type': MIME['.html'] }); res.end(idx); }
    else { res.writeHead(404).end('not found'); }
  }
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const p = u.pathname.replace(/\/+$/, '') || '/';

  try {
    if (p === '/api/health') {
      const f = cache.items.length ? cache : { items: [], sources: [] };
      return json(res, {
        ok: true, service: 'subcablestrack', timestamp: new Date().toISOString(),
        corpus: { cables: CABLES.length, incidents: INCIDENTS.length },
        feed: { cached_items: f.items.length, sources: SOURCES.length, age_s: cache.at ? Math.round((Date.now() - cache.at) / 1000) : null },
        capabilities: { feed: true, ai: false }
      });
    }

    if (p === '/api/feed/items') {
      const { items } = await getFeed();
      const limit = Math.min(Number(u.searchParams.get('limit')) || 80, 300);
      const only = u.searchParams.get('cable') === '1';
      return json(res, { items: (only ? items.filter(i => i.cable) : items).slice(0, limit), total: items.length, generated_at: new Date().toISOString() });
    }

    if (p === '/api/feed/sources') {
      const { sources } = await getFeed();
      return json(res, { sources, generated_at: new Date().toISOString() });
    }

    if (p === '/api/cables') {
      return json(res, { cables: CABLES, count: CABLES.length });
    }

    if (p === '/api/incidents') {
      return json(res, { incidents: INCIDENTS, count: INCIDENTS.length });
    }

    if (p.startsWith('/api/')) return json(res, { error: 'Not found', hint: 'Try /api/health, /api/cables, /api/incidents, /api/feed/items' }, 404);

    await serveStatic(req, res, u.pathname);
  } catch (err) {
    json(res, { error: String(err.message || err) }, 500);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SubCableTrack listening on 0.0.0.0:${PORT}`);
  console.log(`  corpus: ${CABLES.length} cables · ${INCIDENTS.length} documented incidents`);
  getFeed().then(c => console.log(`  feed warm: ${c.items.length} items from ${c.sources.filter(s => s.ok).length}/${SOURCES.length} sources`));
});
