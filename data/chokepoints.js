/* ============================================================================
   Geographic chokepoints — narrow corridors where a disproportionate share of
   global cable traffic converges, so a small-area incident has an
   outsized blast radius. Figures below are cited ranges from public analysis,
   not a single authoritative count — different trade sources count cables
   differently (active vs planned, trunk vs branch), so a range is shown
   honestly rather than picking one number to look precise.
   ========================================================================== */

export const CHOKEPOINTS = [
  {
    id: 'egypt-suez',
    name: 'Egypt / Bab-el-Mandeb corridor',
    lat: 29.9668, lng: 32.5498,
    cable_count_range: '13–22',
    traffic_share: '~17% of global internet traffic; up to ~90% of all Europe–Asia traffic',
    note: 'Cables physically cross ~160 km of Egyptian land between the Mediterranean and the Red Sea, then converge again in the Bab-el-Mandeb Strait — just 26 km wide at its narrowest. There is no alternative sea route between Europe and Asia at comparable cost and latency, which is why the February 2024 Red Sea cuts moved so much traffic onto Egypt\u2019s terrestrial crossing that it reportedly caused congestion there too.',
    sources: [
      { title: 'CSIS — The Strategic Future of Subsea Cables: Egypt Case Study', url: 'https://www.csis.org/analysis/strategic-future-subsea-cables-egypt-case-study' },
      { title: 'Submarine Networks — Digital Chokepoints (NBER working paper review)', url: 'https://www.submarinenetworks.com/en/nv/insights/digital-chokepoints-a-review-of-the-nber-working-paper' }
    ]
  },
  {
    id: 'luzon-strait',
    name: 'Luzon Strait (Taiwan–Philippines)',
    lat: 20.8, lng: 121.3,
    cable_count_range: '8–9 major trunks',
    traffic_share: 'primary East Asia–US trunk corridor',
    note: 'Site of the industry\u2019s reference natural-disaster event: the December 2006 Hengchun earthquake triggered a submarine landslide that cut 9 cables with 21 faults in one pass, taking 11 ships 49 days to repair. Still the main crossing point for most Japan/Korea/Taiwan-to-US cable routes.',
    sources: [{ title: 'ICPC — Submarine landslide likely cause of SE Asian communications failure', url: 'https://www.iscpc.org/documents/?id=9' }]
  },
  {
    id: 'taiwan-strait-islands',
    name: 'Taiwan Strait — Matsu/Penghu approaches',
    lat: 24.5, lng: 119.5,
    cable_count_range: '2–3 short regional links',
    traffic_share: 'local, but strategically watched',
    note: 'Distinct from the Luzon Strait — these are short links to Taiwan\u2019s outlying islands close to the Chinese coast, and they have the worst damage record of any cables in this registry: roughly 30 incidents between 2017 and 2023 (mostly ruled accidental), plus at least three further incidents 2023–2026 that Taiwanese authorities treat as probable deliberate sabotage, including one criminal conviction.',
    sources: [{ title: 'The Diplomat — Another Severed Submarine Cable Raises Alarm in Taiwan', url: 'https://thediplomat.com/2025/01/another-severed-submarine-cable-raises-alarm-in-taiwan/' }]
  },
  {
    id: 'malacca-singapore',
    name: 'Strait of Malacca / Singapore',
    lat: 1.5, lng: 103.0,
    cable_count_range: 'dense regional convergence',
    traffic_share: 'primary intra-Asia hub',
    note: 'The world\u2019s busiest shipping lane doubles as the densest cable-landing hub in maritime Southeast Asia; Singapore\u2019s landing stations are a convergence point for most cables linking South Asia, the Middle East and East Asia.',
    sources: [{ title: 'TeleGeography — Submarine Cable FAQs', url: 'https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions' }]
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    lat: 26.6, lng: 56.25,
    cable_count_range: 'several Gulf-regional systems',
    traffic_share: '~1% of global internet traffic, but a critical regional chokepoint',
    note: 'Low share of *global* traffic, but outsized importance for Gulf states\u2019 own connectivity and for the region\u2019s AI/data-centre buildout. Flagged repeatedly in 2025–2026 amid Iran-related tensions as a plausible pressure point precisely because so little redundancy exists for the countries that do depend on it.',
    sources: [{ title: 'Reuters/Daily Star — Iran has detailed plans to hit Gulf undersea cables if war resumes, officials say', url: 'https://thedailystar.net/news/world/global-conflicts/news/iran-has-detailed-plans-hit-gulf-undersea-cables-if-war-resumes-officials-say-4306161' }]
  },
  {
    id: 'baltic-sea',
    name: 'Baltic Sea',
    lat: 59.0, lng: 20.0,
    cable_count_range: 'about 10 cables cut since 2022 (cumulative incident count, not systems at risk)',
    traffic_share: 'regional — Nordic/Baltic states\u2019 interconnection',
    note: 'Not a natural geographic bottleneck like Hormuz or Bab-el-Mandeb — the risk here is geopolitical. Seven separate cable-damage incidents occurred between November 2024 and January 2025 alone, all involving vessels linked to Russia or China, prompting NATO to launch the "Baltic Sentry" patrol mission in January 2025.',
    sources: [{ title: 'Henry M. Jackson School — Baltic Sea Undersea Cable Security', url: 'https://jsis.washington.edu/news/baltic-sea-undersea-cable-security/' }]
  },
  {
    id: 'marseille',
    name: 'Marseille, France',
    lat: 43.2965, lng: 5.3698,
    cable_count_range: '~15 systems land here',
    traffic_share: 'primary Mediterranean hub',
    note: 'The main landing hub tying Europe to Africa and Asia cable systems via the Mediterranean — appears as a landing point on a disproportionate share of the cables in this registry (2Africa, AAE-1, ACE, SEA-ME-WE-5 among them), making it a quieter but still consequential single point of regional dependency.',
    sources: [{ title: 'Submarine Networks — cable systems by landing point', url: 'https://www.submarinenetworks.com/' }]
  }
];
