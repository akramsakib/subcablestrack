/* SubCableTrack — shared configuration: palettes, classification, derived data.
   Pure logic, no DOM/rendering — reused by the map, directory, chokepoints
   and route tools alike. */

/* Region is a free-text, sometimes composite string on each cable record
   (e.g. "Africa · Middle East · Red Sea"). Bucket it by keyword for a
   consistent colour instead of requiring an exact-match enum. */
const REGION_RULES = [
  ['Baltic',        { hex: '#8d6fb8', label: 'Baltic / Nordic' }],
  ['Taiwan',        { hex: '#b6482f', label: 'Taiwan Strait' }],
  ['Pacific',       { hex: '#c0607a', label: 'Pacific Islands' }],
  ['Transpacific',  { hex: '#1f7a6c', label: 'Transpacific' }],
  ['Transatlantic', { hex: '#2b5f8a', label: 'Transatlantic' }],
  ['Red Sea',       { hex: '#a9772f', label: 'Red Sea / Middle East' }],
  ['Middle East',   { hex: '#a9772f', label: 'Middle East' }],
  ['Africa',        { hex: '#bb8f3d', label: 'Africa' }],
  ['Asia-Intra',    { hex: '#3f8f93', label: 'Asia-Intra' }],
  ['Asia',          { hex: '#3f8f93', label: 'Asia' }],
  ['Europe',        { hex: '#2b5f8a', label: 'Europe' }]
];
export function regionInfo(region) {
  const r = String(region || '');
  for (const [k, v] of REGION_RULES) if (r.includes(k)) return v;
  return { hex: '#6d7d78', label: r || 'Unclassified' };
}
export function regionColor(r) { return regionInfo(r).hex; }

/* Status strings in the data are sometimes annotated, e.g.
   "active (Hong Kong segment never activated)" for PLCN — treat the leading
   word as the base state and keep the parenthetical as a footnote. */
const STATUS_BASE = {
  active:         { label: 'Active',         hex: '#1f7a6c', desc: 'In commercial service' },
  decommissioned: { label: 'Decommissioned', hex: '#8a9490', desc: 'Out of commercial service' },
  planned:        { label: 'Planned',        hex: '#2b5f8a', desc: 'Announced or under construction' }
};
export function baseStatus(s) {
  const key = String(s || '').trim().split(/\s/)[0].toLowerCase();
  return STATUS_BASE[key] || { label: s || 'Unknown', hex: '#6d7d78', desc: '' };
}
export function statusNote(s) {
  const m = /\(([^)]+)\)/.exec(String(s || ''));
  return m ? m[1] : '';
}
export const STATUS = STATUS_BASE;

export const FRESHNESS = [
  { label: 'RFS 2024\u20132026', min: 2024, hex: '#1f7a6c' },
  { label: 'RFS 2015\u20132023', min: 2015, hex: '#2b5f8a' },
  { label: 'RFS 2000\u20132014', min: 2000, hex: '#a9772f' },
  { label: 'RFS < 2000',    min: 0,    hex: '#8a9490' }
];
export function freshness(year) {
  for (const f of FRESHNESS) if (year >= f.min) return f;
  return FRESHNESS[FRESHNESS.length - 1];
}

/* Incidents carry a cause string like "vessel \u2014 suspected deliberate anchor
   drag"; bucket to the leading category for colouring/counting. */
export function causeCategory(cause) {
  const c = String(cause || '').toLowerCase();
  if (c.startsWith('vessel')) return 'vessel';
  if (c.startsWith('natural')) return 'natural';
  return 'other';
}

/* A chokepoint's cable_count_range is sometimes a numeric range ("13\u201322")
   and sometimes a descriptive phrase ("dense regional convergence") because
   trade sources don't all count the same way. Extract a sortable/plottable
   upper-bound number when one exists; otherwise null so callers can fall
   back to a text-only badge instead of a fabricated bar length. */
export function chokepointMagnitude(range) {
  // Only read the leading number (and an optional "N\u2013M" range right after it) so a
  // trailing year or unrelated figure further into a descriptive sentence
  // (e.g. "...cut since 2022") never gets mistaken for the cable count.
  const m = /^\D*(\d+)(?:\s*[\u2013\u2014-]\s*(\d+))?/.exec(String(range || ''));
  if (!m) return null;
  return Math.max(Number(m[1]), Number(m[2] || 0));
}

/* ---------------------------------------------------------------------------
   Related systems for a given cable — shared owner, shared landing country,
   or same region bucket. Computed at runtime from the corpus so it can never
   drift from the dossiers. Used by the directory's expanded row.
--------------------------------------------------------------------------- */
export function relatedCables(cable, allCables) {
  const ownerSet = new Set((cable.owners || []).map(o => o.toLowerCase()));
  const countrySet = new Set((cable.landings || []).map(l => l.country.toLowerCase()));
  const region = regionInfo(cable.region).label;

  const out = [];
  for (const other of allCables) {
    if (other.id === cable.id) continue;
    const sharedOwner = (other.owners || []).some(o => ownerSet.has(o.toLowerCase()));
    const sharedCountry = (other.landings || []).some(l => countrySet.has(l.country.toLowerCase()));
    const sameRegion = regionInfo(other.region).label === region;
    if (sharedOwner || sharedCountry) out.push({ cable: other, via: sharedOwner ? 'owner' : 'landing country' });
    else if (sameRegion && out.length < 6) out.push({ cable: other, via: 'region' });
  }
  return out.slice(0, 6);
}
