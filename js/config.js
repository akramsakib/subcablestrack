/* SubCableTrack — shared configuration: palettes, geography, derived edges */

/* Region is a free-text, sometimes composite string on each cable record
   (e.g. "Africa · Middle East · Red Sea"). Bucket it by keyword for a
   consistent colour instead of requiring an exact-match enum. */
const REGION_RULES = [
  ['Baltic',       { hex: '#a87dff', label: 'Baltic / Nordic' }],
  ['Taiwan',       { hex: '#f0544f', label: 'Taiwan Strait' }],
  ['Pacific',      { hex: '#ec4899', label: 'Pacific Islands' }],
  ['Transpacific', { hex: '#22d3c8', label: 'Transpacific' }],
  ['Transatlantic',{ hex: '#4a9eff', label: 'Transatlantic' }],
  ['Red Sea',      { hex: '#f5a623', label: 'Red Sea / Middle East' }],
  ['Middle East',  { hex: '#f5a623', label: 'Middle East' }],
  ['Africa',       { hex: '#e8b84b', label: 'Africa' }],
  ['Asia-Intra',   { hex: '#36d1e0', label: 'Asia-Intra' }],
  ['Asia',         { hex: '#36d1e0', label: 'Asia' }],
  ['Europe',       { hex: '#4a9eff', label: 'Europe' }]
];
export function regionInfo(region) {
  const r = String(region || '');
  for (const [k, v] of REGION_RULES) if (r.includes(k)) return v;
  return { hex: '#7c8aa0', label: r || 'Unclassified' };
}
export function regionColor(r) { return regionInfo(r).hex; }

/* Status strings in the data are sometimes annotated, e.g.
   "active (Hong Kong segment never activated)" for PLCN — treat the leading
   word as the base state and keep the parenthetical as a footnote. */
const STATUS_BASE = {
  active:         { label: 'Active',         hex: '#22d3c8', desc: 'In commercial service' },
  decommissioned: { label: 'Decommissioned', hex: '#5a6d88', desc: 'Out of commercial service' },
  planned:        { label: 'Planned',        hex: '#4a9eff', desc: 'Announced or under construction' }
};
export function baseStatus(s) {
  const key = String(s || '').trim().split(/\s/)[0].toLowerCase();
  return STATUS_BASE[key] || { label: s || 'Unknown', hex: '#7c8aa0', desc: '' };
}
export function statusNote(s) {
  const m = /\(([^)]+)\)/.exec(String(s || ''));
  return m ? m[1] : '';
}
export const STATUS = STATUS_BASE;

export const FRESHNESS = [
  { label: 'RFS 2024\u20132026', min: 2024, hex: '#22d3c8' },
  { label: 'RFS 2015\u20132023', min: 2015, hex: '#4a9eff' },
  { label: 'RFS 2000\u20132014', min: 2000, hex: '#f5a623' },
  { label: 'RFS < 2000',    min: 0,    hex: '#6b7280' }
];
export function freshness(year) {
  for (const f of FRESHNESS) if (year >= f.min) return f;
  return FRESHNESS[FRESHNESS.length - 1];
}

/* ---------------------------------------------------------------------------
   Derived relationship edges for the Registry graph — computed at runtime
   from the corpus so the graph can never drift from the dossiers. A shared
   owner/consortium member, a shared landing country, or the same region
   bucket each draw a distinct edge type.
--------------------------------------------------------------------------- */
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');

export function computeEdges(cables) {
  const edges = [];
  for (let i = 0; i < cables.length; i++) {
    for (let j = i + 1; j < cables.length; j++) {
      const a = cables[i], b = cables[j];

      const ao = new Set((a.owners || []).map(norm));
      const bo = new Set((b.owners || []).map(norm));
      const sharedOwner = [...ao].filter(x => bo.has(x) && x.length > 2);

      const ac = new Set((a.landings || []).map(l => norm(l.country)));
      const bc = new Set((b.landings || []).map(l => norm(l.country)));
      const sharedCountry = [...ac].filter(x => bc.has(x));

      if (sharedOwner.length) edges.push({ s: a.id, t: b.id, type: 'owner', n: sharedOwner.length, items: sharedOwner });
      if (sharedCountry.length >= 2) edges.push({ s: a.id, t: b.id, type: 'landing', n: sharedCountry.length, items: sharedCountry });
      if (regionInfo(a.region).label === regionInfo(b.region).label) edges.push({ s: a.id, t: b.id, type: 'region', n: 1, items: [regionInfo(a.region).label] });
    }
  }
  return edges;
}

export const EDGE_COLORS = {
  owner:   '#a87dff',
  landing: '#f0544f',
  region:  '#4a9eff'
};
