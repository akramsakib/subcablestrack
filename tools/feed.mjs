/* ============================================================================
   Feed aggregation — RSS/Atom collection with submarine-cable relevance
   scoring. Used by server.mjs at request time and by tools/build.mjs to bake
   a snapshot for static hosting (refreshed by a scheduled GitHub Action).

   Every source below was verified reachable and parseable before being
   added (see project notes) — no blind feed URLs.
   ========================================================================== */
import { createHash } from 'node:crypto';
import { CABLES } from '../data/cables.js';

const CABLE_KEYWORDS = [
  'submarine cable', 'subsea cable', 'undersea cable', 'cable landing',
  'cable cut', 'cable fault', 'cable repair', 'cable ship', 'anchor drag',
  'telegeography', 'internet exchange', 'subsea fibre', 'subsea fiber',
  'data center interconnect', 'chokepoint', 'red sea cable', 'baltic sea cable',
  'taiwan strait cable', 'matsu', 'estlink', 'internet outage', 'bgp'
];
const OWNER_TERMS = [];
for (const c of CABLES) {
  OWNER_TERMS.push(c.name.toLowerCase());
  (c.owners || []).forEach(o => { const s = o.toLowerCase(); if (s.length > 3 && !s.includes('~')) OWNER_TERMS.push(s); });
}

export const SOURCES = [
  { id: 'subtelforum', name: 'SubTel Forum',          cat: 'trade', url: 'https://subtelforum.com/feed/' },
  { id: 'dcd',         name: 'DataCenterDynamics',    cat: 'trade', url: 'https://www.datacenterdynamics.com/en/rss/' },
  { id: 'cfradar',     name: 'Cloudflare Radar Blog', cat: 'vendor', url: 'https://blog.cloudflare.com/rss/' },
  { id: 'record',      name: 'The Record',            cat: 'news',  url: 'https://therecord.media/feed' },
  { id: 'thn',         name: 'The Hacker News',       cat: 'news',  url: 'https://feeds.feedburner.com/TheHackersNews' },
  { id: 'register',    name: 'The Register — Networks', cat: 'news', url: 'https://www.theregister.com/networks/headlines.atom' },
  { id: 'arstechnica', name: 'Ars Technica',          cat: 'news',  url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { id: 'bbctech',     name: 'BBC Technology',        cat: 'news',  url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { id: 'lightreading',name: 'Light Reading',         cat: 'trade', url: 'https://www.lightreading.com/rss.xml' },
  { id: 'nwworld',     name: 'Network World',         cat: 'trade', url: 'https://www.networkworld.com/feed/' }
];

export const cache = { items: [], sources: [], at: 0 };
const TTL = 15 * 60 * 1000;

const decode = t => String(t || '')
  .replace(/&nbsp;/gi, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&quot;/gi, '"').replace(/&apos;|&#39;|&rsquo;|&#8217;/gi, "'")
  .replace(/&lsquo;|&#8216;/gi, "'").replace(/&ldquo;|&rdquo;/gi, '"')
  .replace(/&mdash;/gi, '\u2014').replace(/&ndash;/gi, '\u2013').replace(/&hellip;/gi, '\u2026')
  .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&');

const strip = raw => {
  let t = String(raw || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  for (let i = 0; i < 3; i++) {
    const before = t;
    t = decode(t).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]*>/g, ' ');
    if (t === before) break;
  }
  return t.replace(/\s+/g, ' ').trim();
};

const tagVal = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? strip(m[1]) : '';
};

function severityOf(text) {
  const t = text.toLowerCase();
  if (/cable cut|severed|cable fault|outage|sabotage/.test(t)) return 'high';
  if (/repair|anchor|vessel detained|internet disruption/.test(t)) return 'medium';
  return 'info';
}

// Word-boundary match only — a naive substring test would flag "ACE" inside
// "SpaceX" or "interface". Cable names under 4 characters are skipped
// entirely as too generic to disambiguate from ordinary English text, and a
// few longer names that are also ordinary English/astronomy words (FASTER,
// JUPITER) are only matched alongside a cable-ish keyword in the same item.
function wordMatch(t, needle) {
  const n = needle.toLowerCase();
  if (n.length < 4) return false;
  const re = new RegExp('(^|[^a-z0-9])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)', 'i');
  return re.test(t);
}

const AMBIGUOUS_NAMES = new Set(['faster', 'jupiter', 'equiano']);

function cableScore(text) {
  const t = text.toLowerCase();
  const hits = [];
  for (const k of CABLE_KEYWORDS) {
    if (wordMatch(t, k)) hits.push(k);
  }
  const matched = [];
  for (const c of CABLES) {
    const n = c.name.toLowerCase();
    if (!wordMatch(t, c.name)) continue;
    if (AMBIGUOUS_NAMES.has(n) && hits.length === 0) continue;   // needs corroborating context
    matched.push(c.name);
  }
  const reason = matched.length ? 'tracked cable: ' + matched[0] : hits.length ? 'keyword: ' + hits[0] : '';
  return { cable: hits.length > 0 || matched.length > 0, reason, matched };
}

async function fetchSource(s) {
  const ctl = AbortSignal.timeout(9000);
  try {
    const res = await fetch(s.url, { signal: ctl, headers: { 'user-agent': 'SubCableTrack/1.0 (+https://subcablestrack.org)' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const xml = await res.text();
    const blocks = xml.split(/<item[\s>]|<entry[\s>]/i).slice(1);
    const items = blocks.slice(0, 25).map(b => {
      const title = tagVal(b, 'title');
      let url = tagVal(b, 'link');
      if (!url) { const m = b.match(/<link[^>]*href="([^"]+)"/i); url = m ? m[1] : ''; }
      const summary = tagVal(b, 'description') || tagVal(b, 'summary') || tagVal(b, 'content:encoded');
      const date = tagVal(b, 'pubDate') || tagVal(b, 'published') || tagVal(b, 'updated');
      const blob = title + ' ' + summary;
      const score = cableScore(blob);
      return {
        id: createHash('sha1').update(url || title).digest('hex').slice(0, 16),
        title, url, summary: summary.slice(0, 400),
        published_at: date ? new Date(date).toISOString() : new Date().toISOString(),
        source_id: s.id, source_name: s.name, source_cat: s.cat,
        severity: severityOf(blob),
        cable: score.cable, cable_reason: score.reason,
        tags: []
      };
    }).filter(i => i.title && i.url);
    return { ok: true, items, meta: { id: s.id, name: s.name, ok: true, count: items.length, cat: s.cat } };
  } catch (e) {
    return { ok: false, items: [], meta: { id: s.id, name: s.name, ok: false, count: 0, cat: s.cat, error: String(e.message || e) } };
  }
}

export async function getFeed() {
  if (Date.now() - cache.at < TTL && cache.items.length) return cache;
  const results = await Promise.all(SOURCES.map(fetchSource));
  cache.items = results.flatMap(r => r.items)
    .sort((a, b) => String(b.published_at).localeCompare(String(a.published_at)));
  cache.sources = results.map(r => r.meta);
  cache.at = Date.now();
  return cache;
}
