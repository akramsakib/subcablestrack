/* ============================================================================
   Static build for GitHub Pages.

   Produces dist/ — the same application, with the API surface baked into JSON
   artifacts instead of served by Node:

     api/cables.json        full cable corpus
     api/incidents.json     full incident record
     api/feed.json          aggregated feed snapshot   (refreshed by cron Action)
     api/feed-sources.json  per-source health snapshot
     api/health.json        build metadata

   Usage:  node tools/build.mjs
   Env:    BASE_PATH   path prefix, e.g. /subcablestrack  (default '')
           SITE_URL    absolute origin for sitemap/OG tags
           SKIP_FEED   '1' to skip network aggregation (fast local builds)
   ========================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { CABLES } from '../data/cables.js';
import { INCIDENTS } from '../data/incidents.js';
import { CHOKEPOINTS } from '../data/chokepoints.js';
import { getFeed, SOURCES } from './feed.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');

let BASE = (process.env.BASE_PATH || '').replace(/\/+$/, '');
if (BASE && !BASE.startsWith('/')) BASE = '/' + BASE;
const SITE = (process.env.SITE_URL || '').replace(/\/+$/, '');
const HREF = (BASE || '') + '/';

const COPY = ['css', 'js', 'data'];
const FILES = ['robots.txt', 'README.md', 'LICENSE'];

const log = (...a) => console.log('  ', ...a);

async function main() {
  console.log('\nSubCableTrack — static build');
  console.log(`   base path : ${BASE || '(domain root)'}`);
  console.log(`   site url  : ${SITE || '(relative)'}\n`);

  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(path.join(DIST, 'api'), { recursive: true });

  for (const dir of COPY) {
    await fs.cp(path.join(ROOT, dir), path.join(DIST, dir), { recursive: true }).catch(() => {});
    log(`copied  ${dir}/`);
  }
  for (const f of FILES) {
    await fs.copyFile(path.join(ROOT, f), path.join(DIST, f)).catch(() => {});
  }
  await fs.writeFile(path.join(DIST, '.nojekyll'), '');

  let html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  html = html.replace('<head>', `<head>\n<base href="${HREF}">`);

  if (SITE) {
    html = html.replace('<meta property="og:type" content="website">',
      `<meta property="og:type" content="website">\n<link rel="canonical" href="${SITE}${HREF}">\n<meta property="og:url" content="${SITE}${HREF}">`);
  }
  html = html.replace('</head>',
    `<meta name="generator" content="subcablestrack static build ${new Date().toISOString()}">\n</head>`);

  await fs.writeFile(path.join(DIST, 'index.html'), html);
  await fs.writeFile(path.join(DIST, '404.html'), html);
  log('wrote   index.html + 404.html');

  await fs.writeFile(path.join(DIST, 'api', 'cables.json'), JSON.stringify({
    cables: CABLES, count: CABLES.length, generated_at: new Date().toISOString()
  }));
  log(`wrote   api/cables.json — ${CABLES.length} cables`);

  await fs.writeFile(path.join(DIST, 'api', 'incidents.json'), JSON.stringify({
    incidents: INCIDENTS, count: INCIDENTS.length, generated_at: new Date().toISOString()
  }));
  log(`wrote   api/incidents.json — ${INCIDENTS.length} incidents`);

  await fs.writeFile(path.join(DIST, 'api', 'chokepoints.json'), JSON.stringify({
    chokepoints: CHOKEPOINTS, count: CHOKEPOINTS.length
  }));
  log(`wrote   api/chokepoints.json — ${CHOKEPOINTS.length} chokepoints`);

  let feedCount = 0, healthy = 0;
  if (process.env.SKIP_FEED === '1') {
    log('skipped api/feed.json (SKIP_FEED=1)');
    await fs.writeFile(path.join(DIST, 'api', 'feed.json'),
      JSON.stringify({ items: [], total: 0, generated_at: new Date().toISOString(), skipped: true }));
    await fs.writeFile(path.join(DIST, 'api', 'feed-sources.json'),
      JSON.stringify({ sources: [], generated_at: new Date().toISOString() }));
  } else {
    const feed = await getFeed();
    feedCount = feed.items.length;
    healthy = feed.sources.filter(s => s.ok).length;
    await fs.writeFile(path.join(DIST, 'api', 'feed.json'), JSON.stringify({
      items: feed.items.slice(0, 200), total: feed.items.length,
      generated_at: new Date().toISOString()
    }));
    await fs.writeFile(path.join(DIST, 'api', 'feed-sources.json'), JSON.stringify({
      sources: feed.sources, generated_at: new Date().toISOString()
    }));
    log(`wrote   api/feed.json — ${feedCount} items from ${healthy}/${SOURCES.length} sources`);
  }

  await fs.writeFile(path.join(DIST, 'api', 'health.json'), JSON.stringify({
    ok: true, service: 'subcablestrack', mode: 'static',
    built_at: new Date().toISOString(),
    corpus: { cables: CABLES.length, incidents: INCIDENTS.length, chokepoints: CHOKEPOINTS.length },
    feed: { snapshot_items: feedCount, sources: SOURCES.length, healthy },
    capabilities: { feed: 'snapshot', ai: false }
  }, null, 2));

  /* Single scrolling page — one URL, with in-page anchors for the sections. */
  const anchors = ['atlas', 'chokepoints', 'timeline', 'directory', 'watch', 'route'];
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}${HREF}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${anchors.map(a => `  <url><loc>${SITE}${HREF}#${a}</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>`).join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
  await fs.writeFile(path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n${SITE ? `Sitemap: ${SITE}${HREF}sitemap.xml\n` : ''}`);
  log('wrote   sitemap.xml + robots.txt');

  const size = async d => {
    let t = 0;
    for (const e of await fs.readdir(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      t += e.isDirectory() ? await size(p) : (await fs.stat(p)).size;
    }
    return t;
  };
  console.log(`\n   dist/ ready — ${(await size(DIST) / 1048576).toFixed(1)} MB\n`);
}

main().catch(e => { console.error('\nBuild failed:', e); process.exit(1); });
