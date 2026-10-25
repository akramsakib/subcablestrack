/* ============================================================================
   Submarine cable registry — a curated subset of the ~600 active/planned
   systems TeleGeography tracks (TeleGeography Submarine Cable Map, 2026),
   not a reproduction of their dataset. Every entry below is built from public
   consortium announcements, regulator filings, and press reporting — see
   `sources` on each record. Landing points are a representative subset for
   each system, not an exhaustive list. Coordinates are approximate city-level
   positions for the named landing station, used only to draw the great-circle
   arc on the globe.
   ========================================================================== */

export const CABLES = [
  {
    id: '2africa',
    name: '2Africa',
    aka: '2Africa Pearls (extension)',
    length_km: 45000,
    rfs: 2025,
    status: 'active',
    region: 'Africa · Europe · Middle East',
    owners: ['Meta Platforms', 'China Mobile International', 'MTN (Bayobab)', 'Orange', 'Saudi Telecom (center3)', 'Telecom Egypt', 'Vodafone', 'WIOCC'],
    capacity_tbps: 180,
    landings: [
      { country: 'France', city: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { country: 'Portugal', city: 'Lisbon', lat: 38.7223, lng: -9.1393 },
      { country: 'Egypt', city: 'Alexandria', lat: 31.2001, lng: 29.9187 },
      { country: 'Saudi Arabia', city: 'Jeddah', lat: 21.4858, lng: 39.1925 },
      { country: 'Kenya', city: 'Mombasa', lat: -4.0435, lng: 39.6682 },
      { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 }
    ],
    summary: 'The largest subsea cable system ever built — a single loop around the African continent plus spurs into Europe, the Middle East and South Asia. Core system declared complete by Meta in November 2025; the Pearls extension is scheduled for 2026. Reaches 33 countries via 46 landing points and is designed to roughly triple available capacity for many African markets that previously depended on 1–2 older cables.',
    incidents: [],
    sources: [
      { title: 'Meta Engineering — Announcing the Completion of the Core 2Africa System', url: 'https://engineering.fb.com/2025/11/17/connectivity/core-2africa-system-completion-future-connectivity/', date: '2025-11-17' },
      { title: 'Wikipedia — 2Africa', url: 'https://en.wikipedia.org/wiki/2Africa', date: '2026' }
    ]
  },
  {
    id: 'aae1',
    name: 'AAE-1',
    aka: 'Asia-Africa-Europe-1',
    length_km: 25000,
    rfs: 2017,
    status: 'active',
    region: 'Middle East · Red Sea',
    owners: ['China Unicom', 'China Telecom', 'Etisalat', 'Ooredoo', 'Telekom Malaysia', 'Vodafone', 'Orange', 'and ~15 other carriers (consortium)'],
    capacity_tbps: 40,
    landings: [
      { country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
      { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { country: 'India', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
      { country: 'Djibouti', city: 'Djibouti City', lat: 11.5886, lng: 43.1456 },
      { country: 'Saudi Arabia', city: 'Jeddah', lat: 21.4858, lng: 39.1925 },
      { country: 'France', city: 'Marseille', lat: 43.2965, lng: 5.3698 }
    ],
    summary: 'One of the main trunk routes carrying Asia-to-Europe traffic through the Red Sea / Bab-el-Mandeb chokepoint. Damaged on 24 February 2024 along with SEACOM/TGN-EA and EIG, almost certainly by the dragging anchor of the abandoned cargo ship MV Rubymar after a Houthi missile strike. Repairs were delayed roughly five months by the need for permits from Yemen\u2019s internationally recognised government, which had not been granted to the AAE-1 consortium as of mid-May 2024; the cable came back online in July 2024.',
    incidents: ['redsea-2024'],
    sources: [
      { title: 'Wikipedia — AAE-1', url: 'https://en.wikipedia.org/wiki/AAE-1', date: '2026' },
      { title: 'SubTel Forum — Finally, Progress With Red Sea Cable Repairs', url: 'https://subtelforum.com/finally-progress-with-red-sea-cable-repairs/', date: '2024-07-17' }
    ]
  },
  {
    id: 'seacom-tgn-ea',
    name: 'SEACOM / TGN-Eastern Africa',
    aka: 'TGN-EA',
    length_km: 17000,
    rfs: 2009,
    status: 'active',
    region: 'Africa · Middle East',
    owners: ['Seacom', 'Tata Communications'],
    capacity_tbps: 12,
    landings: [
      { country: 'Kenya', city: 'Mombasa', lat: -4.0435, lng: 39.6682 },
      { country: 'Egypt', city: 'Zafarana', lat: 29.1167, lng: 32.6500 },
      { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 }
    ],
    summary: 'East Africa\u2019s first major submarine cable, built to break the continent\u2019s historic dependence on satellite links. The Egypt-Kenya segment was severed on 24 February 2024 in the same incident that cut AAE-1 and EIG, disrupting connectivity as far south as Tanzania, Uganda and Mozambique while repairs were negotiated.',
    incidents: ['redsea-2024'],
    sources: [
      { title: 'Cloudflare Radar — East African Internet connectivity again impacted by submarine cable cuts', url: 'https://blog.cloudflare.com/east-african-internet-connectivity-again-impacted-by-submarine-cable-cuts/', date: '2024-05-13' }
    ]
  },
  {
    id: 'eig',
    name: 'EIG',
    aka: 'Europe India Gateway',
    length_km: 15000,
    rfs: 2011,
    status: 'active',
    region: 'Middle East · Red Sea',
    owners: ['Vodafone', 'Telecom Egypt', 'Etisalat', 'du', 'Mobily', 'and others (consortium)'],
    capacity_tbps: 3.5,
    landings: [
      { country: 'United Kingdom', city: 'Bude', lat: 50.8295, lng: -4.5438 },
      { country: 'Portugal', city: 'Lisbon', lat: 38.7223, lng: -9.1393 },
      { country: 'Egypt', city: 'Suez', lat: 29.9668, lng: 32.5498 },
      { country: 'Saudi Arabia', city: 'Jeddah', lat: 21.4858, lng: 39.1925 },
      { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777 }
    ],
    summary: 'A UK-to-India trunk route via Gibraltar, Egypt and the Gulf. Reportedly already degraded before the February 2024 Red Sea incident; the segment damage that month compounded an existing fault, and repair work was delayed by the same Yemeni permitting dispute that held up AAE-1.',
    incidents: ['redsea-2024'],
    sources: [
      { title: 'AP — 3 Red Sea data cables cut as Houthis launch more attacks in the vital waterway', url: 'https://apnews.com/article/red-sea-undersea-cables-yemen-houthi-rebels-attacks-b53051f61a41bd6b357860bbf0b0860a', date: '2024-03-05' }
    ]
  },
  {
    id: 'marea',
    name: 'MAREA',
    length_km: 6600,
    rfs: 2017,
    status: 'active',
    region: 'Transatlantic',
    owners: ['Microsoft', 'Meta Platforms', 'Telxius (Telefónica)'],
    capacity_tbps: 224,
    landings: [
      { country: 'USA', city: 'Virginia Beach', lat: 36.8529, lng: -75.9780 },
      { country: 'Spain', city: 'Bilbao', lat: 43.2630, lng: -2.9350 }
    ],
    summary: 'Built jointly by Microsoft and Meta (then Facebook) with Telxius to carry hyperscaler cloud traffic across the Atlantic independent of traditional carrier consortia — one of the first major examples of the "big tech builds its own cables" era.',
    incidents: [],
    sources: [{ title: 'Submarine Networks — MAREA', url: 'https://www.submarinenetworks.com/en/systems/trans-atlantic/marea', date: '2017' }]
  },
  {
    id: 'dunant',
    name: 'Dunant',
    length_km: 6600,
    rfs: 2021,
    status: 'active',
    region: 'Transatlantic',
    owners: ['Google'],
    capacity_tbps: 250,
    landings: [
      { country: 'USA', city: 'Virginia Beach', lat: 36.8529, lng: -75.9780 },
      { country: 'France', city: 'Saint-Hilaire-de-Riez', lat: 46.7167, lng: -1.9500 }
    ],
    summary: 'A Google-owned private transatlantic cable, named after Red Cross founder Henry Dunant. Part of Google\u2019s own fleet of cables (alongside Curie, Equiano, Grace Hopper and Firmina) built to carry its own cloud and search traffic rather than lease capacity from carrier consortia.',
    incidents: [],
    sources: [{ title: 'Google Cloud blog — Dunant subsea cable', url: 'https://cloud.google.com/blog/products/infrastructure/google-dunant-subsea-cable-is-ready-for-service', date: '2021-01' }]
  },
  {
    id: 'grace-hopper',
    name: 'Grace Hopper',
    length_km: 6500,
    rfs: 2022,
    status: 'active',
    region: 'Transatlantic',
    owners: ['Google'],
    capacity_tbps: 340,
    landings: [
      { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { country: 'United Kingdom', city: 'Bude', lat: 50.8295, lng: -4.5438 },
      { country: 'Spain', city: 'Bilbao', lat: 43.2630, lng: -2.9350 }
    ],
    summary: 'A three-landing Google-owned cable named for computing pioneer Rear Admiral Grace Hopper, the first subsea cable to connect the US directly to Spain. Designed with 16 fiber pairs for both capacity and resilience against a single-point cut.',
    incidents: [],
    sources: [{ title: 'Google Cloud blog — Grace Hopper subsea cable', url: 'https://cloud.google.com/blog/products/infrastructure/grace-hopper-subsea-cable-is-ready-for-service', date: '2022-12' }]
  },
  {
    id: 'c-lion1',
    name: 'C-Lion1',
    length_km: 1200,
    rfs: 2016,
    status: 'active',
    region: 'Baltic · Nordic',
    owners: ['Cinia Oy'],
    capacity_tbps: 144,
    landings: [
      { country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
      { country: 'Germany', city: 'Rostock', lat: 54.0924, lng: 12.0991 }
    ],
    summary: 'Finland\u2019s only direct subsea data cable to continental Europe. Cut twice in six weeks over the 2024 holiday period — first on 17–18 November 2024 alongside the BCS East-West Interlink, then again on 25 December 2024 in the Eagle S anchor-drag incident. Each outage was repaired within days to under two weeks; Finland was never fully disconnected because of backup capacity via other regional links.',
    incidents: ['baltic-nov-2024', 'baltic-dec-2024'],
    sources: [{ title: 'Wikipedia — C-Lion1', url: 'https://en.wikipedia.org/wiki/C-Lion1', date: '2026' }]
  },
  {
    id: 'bcs-ew-interlink',
    name: 'BCS East-West Interlink',
    length_km: 218,
    rfs: 2015,
    status: 'active',
    region: 'Baltic · Nordic',
    owners: ['Telia Lithuania'],
    capacity_tbps: null,
    landings: [
      { country: 'Sweden', city: 'Stockholm', lat: 59.3293, lng: 18.0686 },
      { country: 'Lithuania', city: 'Klaipėda', lat: 55.7033, lng: 21.1443 }
    ],
    summary: 'A regional Baltic link between Sweden and Lithuania, cut on 17–18 November 2024 in close time-and-place proximity to the C-Lion1 fault — a pattern that drove NATO and EU accusations of coordinated hybrid-warfare sabotage, although no state has been formally found responsible.',
    incidents: ['baltic-nov-2024'],
    sources: [{ title: 'Wikipedia — 2024 Baltic Sea submarine cable disruptions', url: 'https://en.wikipedia.org/wiki/2024_Baltic_Sea_submarine_cable_disruptions', date: '2026' }]
  },
  {
    id: 'estlink2',
    name: 'Estlink 2',
    aka: 'power interconnector, not a data cable',
    length_km: 171,
    rfs: 2014,
    status: 'active',
    region: 'Baltic · Nordic',
    owners: ['Elering (Estonia)', 'Fingrid (Finland)'],
    capacity_tbps: null,
    landings: [
      { country: 'Finland', city: 'Helsinki', lat: 60.1699, lng: 24.9384 },
      { country: 'Estonia', city: 'Tallinn', lat: 59.4370, lng: 24.7536 }
    ],
    summary: 'A 650 MW electricity interconnector, not a telecom cable, but it was severed in the same 25 December 2024 incident alongside four data cables — included here because it is the clearest evidence of intent in the Baltic pattern: the Eagle S dragged its anchor roughly 90 km across the seabed, striking five separate cables of two different types in one pass. Repair cost was estimated near €60 million and took about seven months.',
    incidents: ['baltic-dec-2024'],
    sources: [{ title: 'Wikipedia — 2024 Estlink 2 incident', url: 'https://en.wikipedia.org/wiki/2024_Estlink_2_incident', date: '2026' }]
  },
  {
    id: 'tonga-cable',
    name: 'Tonga Cable',
    aka: 'Tonga–Fiji Submarine Cable System',
    length_km: 827,
    rfs: 2013,
    status: 'active',
    region: 'Pacific Islands',
    owners: ['Tonga Cable Limited'],
    capacity_tbps: null,
    landings: [
      { country: 'Tonga', city: 'Nuku\u02bbalofa', lat: -21.1393, lng: -175.2049 },
      { country: 'Fiji', city: 'Suva', lat: -18.1416, lng: 178.4419 }
    ],
    summary: 'Tonga\u2019s only international connection at the time of the January 2022 Hunga Tonga–Hunga Ha\u02bbapai volcanic eruption, which severed it roughly 37 km offshore. The nation of about 100,000 people was almost entirely offline for 38 days while a specialised repair ship sailed from Port Moresby. A textbook case for why single-cable countries are treated as a distinct risk category rather than an edge case.',
    incidents: ['tonga-2022'],
    sources: [{ title: 'Cloudflare Radar — Internet is back in Tonga after 38 days of outage', url: 'https://blog.cloudflare.com/internet-is-back-in-tonga-after-38-days-of-outage/', date: '2022-02-22' }]
  },
  {
    id: 'tpkm',
    name: 'TPKM-2 / TPKM-3',
    aka: 'Taiwan–Matsu / Taiwan–Penghu links',
    length_km: 55,
    rfs: 2000,
    status: 'active',
    region: 'Taiwan Strait',
    owners: ['Chunghwa Telecom'],
    capacity_tbps: null,
    landings: [
      { country: 'Taiwan', city: 'Keelung', lat: 25.1276, lng: 121.7392 },
      { country: 'Taiwan (Matsu/Penghu)', city: 'Nangan, Matsu', lat: 26.1600, lng: 119.9333 }
    ],
    summary: 'Short regional links tying Taiwan\u2019s outlying Matsu and Penghu islands to the main island — and the most frequently damaged cables in the world: at least 30 incidents between 2017 and 2023, most ruled accidental. Two cuts six days apart in February 2023 (blamed on a Chinese fishing vessel, then a cargo ship) left 14,000 Matsu residents without normal internet for about 50 days. A third cable to Penghu was deliberately severed in February 2025 by the Togo-flagged, Chinese-crewed Hong Tai 58 — Taiwan\u2019s first criminal conviction for intentional cable sabotage followed in June 2025.',
    incidents: ['matsu-2023', 'penghu-2025'],
    sources: [
      { title: 'AP — Taiwan suspects Chinese ships cut islands\u2019 internet cables', url: 'https://apnews.com/article/matsu-taiwan-internet-cables-cut-china-65f10f5f73a346fa788436366d7a7c70', date: '2023-04-18' },
      { title: 'Al Jazeera — China probe finds Taiwanese men controlled ship that cut undersea cables', url: 'https://www.aljazeera.com/news/2025/12/24/china-probe-finds-taiwanese-men-controlled-ship-that-cut-undersea-cables', date: '2025-12-24' }
    ]
  },
  {
    id: 'tpe',
    name: 'TPE',
    aka: 'Trans-Pacific Express',
    length_km: 17800,
    rfs: 2008,
    status: 'active',
    region: 'Transpacific',
    owners: ['China Telecom', 'China Unicom', 'Chunghwa Telecom', 'KT Corporation', 'NTT', 'Verizon'],
    capacity_tbps: 5.12,
    landings: [
      { country: 'USA', city: 'Nedonna Beach, Oregon', lat: 45.8068, lng: -123.9623 },
      { country: 'Japan', city: 'Chikura', lat: 34.9333, lng: 139.9667 },
      { country: 'Taiwan', city: 'Keelung', lat: 25.1276, lng: 121.7392 },
      { country: 'South Korea', city: 'Busan', lat: 35.1796, lng: 129.0756 }
    ],
    summary: 'A long-standing China-Korea-Japan-Taiwan-US trunk route. Damaged north of Taipei on 7 January 2025, reportedly by the Cameroon-flagged, Chinese-linked vessel Shunxing 39, which switched off its AIS transponder before and during the incident and later reappeared under a different flag registration — a pattern regional security analysts read as deliberate obfuscation rather than an accident.',
    incidents: ['tpe-2025'],
    sources: [{ title: 'Reuters — Exclusive: China-linked shipowner denies Taiwan accusation of damaging undersea cable', url: 'https://www.reuters.com/world/asia-pacific/china-linked-shipowner-denies-taiwan-accusation-damaging-undersea-cable-2025-01-08/', date: '2025-01-08' }]
  },
  {
    id: 'plcn',
    name: 'PLCN',
    aka: 'Pacific Light Cable Network',
    length_km: 13000,
    rfs: 2022,
    status: 'active (Hong Kong segment never activated)',
    region: 'Transpacific',
    owners: ['Google', 'Meta Platforms', 'Pacific Light Data Communication (Hong Kong segment only, blocked)'],
    capacity_tbps: 144,
    landings: [
      { country: 'USA', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { country: 'Taiwan', city: 'Fangshan', lat: 22.3833, lng: 120.7167 },
      { country: 'Philippines', city: 'Manila', lat: 14.5995, lng: 120.9842 }
    ],
    summary: 'Built to be the highest-capacity direct US-Asia link of its generation, including the first direct US-Hong Kong connection. In 2020, the US "Team Telecom" review recommended blocking the Hong Kong leg outright over national-security concerns tied to its Chinese investor, Dr. Peng Telecom. Google and Meta withdrew that segment; the FCC granted a licence in January 2022 covering only the US-Taiwan-Philippines legs. The physical Hong Kong cable exists but has never carried licensed commercial US traffic — a rare case of a built cable permanently stranded by geopolitics rather than physical damage.',
    incidents: [],
    sources: [
      { title: 'US DOJ — Team Telecom Recommends that the FCC Deny Pacific Light Cable Network System\u2019s Hong Kong Undersea Cable Connection', url: 'https://www.justice.gov/archives/opa/pr/team-telecom-recommends-fcc-deny-pacific-light-cable-network-system-s-hong-kong-undersea', date: '2020-06-17' },
      { title: 'Wikipedia — Pacific Light Cable Network', url: 'https://en.wikipedia.org/wiki/Pacific_Light_Cable_Network', date: '2026' }
    ]
  },
  {
    id: 'faster',
    name: 'FASTER',
    length_km: 9000,
    rfs: 2016,
    status: 'active',
    region: 'Transpacific',
    owners: ['Google', 'China Mobile International', 'China Telecom', 'Global Transit', 'KDDI', 'SingTel'],
    capacity_tbps: 60,
    landings: [
      { country: 'USA', city: 'Bandon, Oregon', lat: 43.1187, lng: -124.4087 },
      { country: 'Japan', city: 'Chikura', lat: 34.9333, lng: 139.9667 },
      { country: 'Japan', city: 'Shima', lat: 34.3167, lng: 136.8333 }
    ],
    summary: 'At launch, one of the highest-capacity transpacific cables ever built, part of the first wave of hyperscaler-backed consortium cables as cloud providers began co-investing directly rather than only leasing capacity.',
    incidents: [],
    sources: [{ title: 'Submarine Networks — FASTER', url: 'https://www.submarinenetworks.com/en/systems/trans-pacific/faster', date: '2016' }]
  },
  {
    id: 'jupiter',
    name: 'JUPITER',
    length_km: 14000,
    rfs: 2024,
    status: 'active',
    region: 'Transpacific',
    owners: ['Google', 'Meta Platforms', 'NTT', 'PCCW Global', 'SoftBank'],
    capacity_tbps: null,
    landings: [
      { country: 'Japan', city: 'Maruyama, Chiba', lat: 35.1500, lng: 140.3000 },
      { country: 'Philippines', city: 'Baler', lat: 15.7589, lng: 121.5667 },
      { country: 'USA (Guam)', city: 'Piti', lat: 13.4667, lng: 144.7000 },
      { country: 'USA', city: 'Hermosa Beach', lat: 33.8622, lng: -118.3995 }
    ],
    summary: 'A newer-generation transpacific hyperscaler cable linking Japan, the Philippines, Guam and the US mainland — part of the continuing build-out of direct cloud-provider-owned capacity across the Pacific, diversifying away from a handful of older shared-consortium trunks.',
    incidents: [],
    sources: [{ title: 'Google Cloud blog — JUPITER subsea cable', url: 'https://cloud.google.com/blog/products/infrastructure/jupiter-subsea-cable-is-ready-for-service', date: '2024-07' }]
  },
  {
    id: 'southern-cross-next',
    name: 'Southern Cross NEXT',
    length_km: 13300,
    rfs: 2022,
    status: 'active',
    region: 'Pacific Islands',
    owners: ['Southern Cross Cable Network'],
    capacity_tbps: 72,
    landings: [
      { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
      { country: 'New Zealand', city: 'Auckland', lat: -36.8485, lng: 174.7633 },
      { country: 'Fiji', city: 'Suva', lat: -18.1416, lng: 178.4419 },
      { country: 'USA', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 }
    ],
    summary: 'A major Pacific trunk connecting Australia and New Zealand to the US via Fiji, which doubles as the main regional relay point for several smaller Pacific Island nations\u2019 connectivity (including Tonga\u2019s link onward from Suva) — meaning a fault on this route has knock-on effects far beyond its four landing points.',
    incidents: [],
    sources: [{ title: 'Southern Cross Cable Network — NEXT overview', url: 'https://www.southerncrosscables.com/', date: '2022' }]
  },
  {
    id: 'smw5',
    name: 'SEA-ME-WE-5',
    aka: 'South East Asia–Middle East–Western Europe 5',
    length_km: 20000,
    rfs: 2016,
    status: 'active',
    region: 'Asia · Middle East · Europe',
    owners: ['~18-carrier consortium including BSCCL (Bangladesh), BSNL, Telecom Malaysia, Orange, and others'],
    capacity_tbps: 24,
    landings: [
      { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
      { country: 'Bangladesh', city: 'Kuakata', lat: 21.8167, lng: 90.1167 },
      { country: 'Sri Lanka', city: 'Colombo', lat: 6.9271, lng: 79.8612 },
      { country: 'France', city: 'Marseille', lat: 43.2965, lng: 5.3698 }
    ],
    summary: 'One of the two primary international cables serving Bangladesh (landing at Kuakata, operated domestically by state-owned BSCCL), part of the long SEA-ME-WE lineage of consortium cables linking Southeast Asia to Europe via the Middle East and the same Egypt/Red Sea corridor that carries most Europe-Asia traffic.',
    incidents: [],
    sources: [{ title: 'Submarine Networks — SEA-ME-WE 5', url: 'https://www.submarinenetworks.com/en/systems/asia-europe-africa/sea-me-we-5', date: '2016' }]
  },
  {
    id: 'apcn2',
    name: 'APCN-2',
    aka: 'Asia Pacific Cable Network 2',
    length_km: 19000,
    rfs: 2001,
    status: 'active',
    region: 'Asia-Intra',
    owners: ['China Telecom', 'China Unicom', 'Chunghwa Telecom', 'PLDT', 'SingTel', 'and others (consortium)'],
    capacity_tbps: 2.5,
    landings: [
      { country: 'China', city: 'Shantou', lat: 23.3535, lng: 116.6820 },
      { country: 'Hong Kong', city: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
      { country: 'Taiwan', city: 'Tanshui', lat: 25.1700, lng: 121.4400 },
      { country: 'Philippines', city: 'Manila', lat: 14.5995, lng: 120.9842 }
    ],
    summary: 'One of the eight to nine cables severed by the 26 December 2006 Hengchun earthquake and the submarine landslide it triggered in the Luzon Strait — the industry\u2019s benchmark natural-disaster event. Taiwan lost international calling capacity to about 40%, and it took 11 repair ships 49 days to fix 21 separate faults across nine cables. Damaged again in 2009 by a second, unrelated fault.',
    incidents: ['hengchun-2006'],
    sources: [{ title: 'ICPC — Submarine landslide likely cause of SE Asian communications failure', url: 'https://www.iscpc.org/documents/?id=9', date: '2007-03-21' }]
  },
  {
    id: 'wacs',
    name: 'WACS',
    aka: 'West Africa Cable System',
    length_km: 14000,
    rfs: 2012,
    status: 'active',
    region: 'Africa',
    owners: ['MTN (Bayobab)', 'Vodacom', 'Telkom SA', 'Tata Communications', 'and others (consortium)'],
    capacity_tbps: 14.5,
    landings: [
      { country: 'United Kingdom', city: 'Bude', lat: 50.8295, lng: -4.5438 },
      { country: 'Côte d\u2019Ivoire', city: 'Abidjan', lat: 5.3600, lng: -4.0083 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 }
    ],
    summary: 'One of four West African cables cut on 14 March 2024 near a known trouble spot, the Trou Sans Fond submarine canyon off Abidjan. The outage degraded connectivity for 13 countries and was initially ruled out as deliberate — MainOne\u2019s own investigation cited the fault depth (~3 km) as too deep for anchors, fishing gear or drilling, pointing instead to a seismic event or landslide. Repaired by 29 April 2024.',
    incidents: ['westafrica-2024'],
    sources: [{ title: 'Reuters — African internet outage was caused by subsea cable break, MainOne says', url: 'https://www.reuters.com/world/africa/african-internet-outage-was-caused-by-subsea-cable-break-mainone-says-2024-03-15/', date: '2024-03-15' }]
  },
  {
    id: 'ace',
    name: 'ACE',
    aka: 'Africa Coast to Europe',
    length_km: 17000,
    rfs: 2012,
    status: 'active',
    region: 'Africa',
    owners: ['Orange', 'and a 20-plus-member carrier consortium'],
    capacity_tbps: 12.8,
    landings: [
      { country: 'France', city: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { country: 'The Gambia', city: 'Banjul', lat: 13.4549, lng: -16.5790 },
      { country: 'Côte d\u2019Ivoire', city: 'Abidjan', lat: 5.3600, lng: -4.0083 },
      { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 }
    ],
    summary: 'A second West Africa coast cable cut in the 14 March 2024 incident; the Ghanaian regulator reported ACE lost about 90% of its capacity on the affected segment. Repaired between 4 and 17 April 2024.',
    incidents: ['westafrica-2024'],
    sources: [{ title: 'Ghana NCA — Update 2: Undersea Cable Disruptions Affect Data Services', url: 'https://nca.org.gh/2024/03/14/update-2-undersea-cable-disruptions-affect-data-services/', date: '2024-03-14' }]
  },
  {
    id: 'sat3',
    name: 'SAT-3/WASC',
    aka: 'South Atlantic 3 / West Africa Submarine Cable',
    length_km: 14350,
    rfs: 2002,
    status: 'active',
    region: 'Africa',
    owners: ['Telkom SA', 'Angola Cables', 'and a multi-carrier consortium'],
    capacity_tbps: 0.8,
    landings: [
      { country: 'Portugal', city: 'Sesimbra', lat: 38.4445, lng: -9.1012 },
      { country: 'Ghana', city: 'Accra', lat: 5.6037, lng: -0.1870 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'South Africa', city: 'Melkbosstrand', lat: -33.7333, lng: 18.4333 }
    ],
    summary: 'One of the oldest major Africa cables, and the one hit hardest in the 14 March 2024 West Africa outage — Ghana\u2019s regulator reported 100% capacity loss on the affected leg. Fully restored by 6 April 2024, the first of the four damaged cables to come back.',
    incidents: ['westafrica-2024'],
    sources: [{ title: 'Internet Society — 2024 West Africa Submarine Cable Outage Report', url: 'https://www.internetsociety.org/resources/doc/2024/2024-west-africa-submarine-cable-outage-report/', date: '2024-04' }]
  },
  {
    id: 'mainone',
    name: 'MainOne',
    length_km: 7000,
    rfs: 2010,
    status: 'active',
    region: 'Africa',
    owners: ['Equinix'],
    capacity_tbps: 10,
    landings: [
      { country: 'Portugal', city: 'Sesimbra', lat: 38.4445, lng: -9.1012 },
      { country: 'Ghana', city: 'Accra', lat: 5.6037, lng: -0.1870 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 }
    ],
    summary: 'The last of the four West African cables to be repaired after the March 2024 outage, restored 5–16 May 2024 — an eight-week outage window for its segment, the longest of the four. MainOne\u2019s own fault analysis was the first to publicly rule out ship or fishing-gear damage based on cable depth.',
    incidents: ['westafrica-2024'],
    sources: [{ title: 'TechNext24 — Subsea cable cut: MainOne announces successful repair, 8 weeks after', url: 'https://technext24.com/news/subsea-cable-mainone-announces-repair/', date: '2024-05-14' }]
  },
  {
    id: 'equiano',
    name: 'Equiano',
    length_km: 15000,
    rfs: 2022,
    status: 'active',
    region: 'Africa',
    owners: ['Google'],
    capacity_tbps: 144,
    landings: [
      { country: 'Portugal', city: 'Sesimbra', lat: 38.4445, lng: -9.1012 },
      { country: 'Togo', city: 'Lomé', lat: 6.1319, lng: 1.2228 },
      { country: 'Nigeria', city: 'Lagos', lat: 6.5244, lng: 3.3792 },
      { country: 'Namibia', city: 'Swakopmund', lat: -22.6783, lng: 14.5267 },
      { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 }
    ],
    summary: 'A newer, high-capacity Google-owned West/Southern Africa cable, named after writer and abolitionist Olaudah Equiano. Not involved in the March 2024 outage cluster — a useful contrast showing that newer, better-surveyed and better-buried routes are not immune to risk in principle, but have so far had a cleaner record than the older SAT-3-era cables sharing the same coastline.',
    incidents: [],
    sources: [{ title: 'Google Cloud blog — Equiano subsea cable', url: 'https://cloud.google.com/blog/products/infrastructure/google-equiano-subsea-cable-lands-in-south-africa', date: '2022-10' }]
  },
  {
    id: 'tat14',
    name: 'TAT-14',
    length_km: 15300,
    rfs: 2001,
    status: 'decommissioned',
    region: 'Transatlantic',
    owners: ['Multi-carrier consortium (AT&T, Verizon, Deutsche Telekom, France Télécom, and others)'],
    capacity_tbps: null,
    landings: [
      { country: 'USA', city: 'Manasquan, New Jersey', lat: 40.1245, lng: -74.0432 },
      { country: 'United Kingdom', city: 'Bude', lat: 50.8295, lng: -4.5438 },
      { country: 'France', city: 'Saint-Valery-en-Caux', lat: 49.8667, lng: 0.7167 },
      { country: 'Germany', city: 'Norden', lat: 53.5950, lng: 7.2061 }
    ],
    summary: 'A once-essential early-2000s consortium transatlantic cable, retired as newer, far-higher-capacity private cables (MAREA, Dunant, Grace Hopper) took over the same route. Included here to show the normal lifecycle of a cable system — decommissioning, not just cutting, is how most cables actually leave service.',
    incidents: [],
    sources: [{ title: 'Submarine Networks — TAT-14', url: 'https://www.submarinenetworks.com/en/systems/trans-atlantic/tat-14', date: '2021' }]
  }
];
