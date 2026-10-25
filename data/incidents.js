/* ============================================================================
   Documented submarine cable incidents — cuts, faults and sabotage. Every
   entry is a real, publicly reported event with named sources. "Cause" is
   stated at the confidence level the sources themselves used at time of
   writing (confirmed / suspected / disputed / ruled natural) — this registry
   does not upgrade a suspicion to a fact.
   ========================================================================== */

export const INCIDENTS = [
  {
    id: 'hengchun-2006',
    date: '2006-12-26',
    title: 'Hengchun earthquake severs the Luzon Strait',
    location: 'Luzon Strait, off southwest Taiwan',
    cables: ['apcn2'],
    cause: 'natural — undersea landslide',
    cause_confidence: 'confirmed',
    countries_affected: ['Taiwan', 'China', 'Hong Kong', 'South Korea', 'Japan', 'Singapore'],
    summary: 'A magnitude 7.0/6.9 double earthquake triggered a submarine landslide that travelled roughly 300 km across the seabed, cutting 9 cables with 21 separate faults. It took 11 repair ships 49 days to fully restore service. Taiwan\u2019s international calling capacity fell to about 40%; internet connectivity to Hong Kong was cut entirely and traffic to mainland China fell to about a quarter of normal. The event became the industry\u2019s reference case for how a single geological event can cascade across an entire regional chokepoint.',
    sources: [
      { title: 'ICPC — Submarine landslide likely cause of SE Asian communications failure', url: 'https://www.iscpc.org/documents/?id=9' },
      { title: 'Wikipedia — 2006 Hengchun earthquakes', url: 'https://en.wikipedia.org/wiki/2006_Hengchun_earthquakes' }
    ]
  },
  {
    id: 'tonga-2022',
    date: '2022-01-15',
    title: 'Hunga Tonga–Hunga Ha\u02bbapai eruption cuts Tonga\u2019s only cable',
    location: 'Offshore Tongatapu, Tonga',
    cables: ['tonga-cable'],
    cause: 'natural — volcanic eruption',
    cause_confidence: 'confirmed',
    countries_affected: ['Tonga'],
    summary: 'The eruption severed the 827 km Tonga–Fiji cable about 37 km offshore and a domestic extension cable about 47 km out. With no second international cable, the nation of roughly 100,000 people was almost entirely offline for 38 days while a specialised SubCom repair ship sailed from Port Moresby, Papua New Guinea. The domestic extension cable took nearly 18 months to fully repair. Became the standard example cited when arguing that single-cable countries need either a second physical route or a credible satellite fallback.',
    sources: [
      { title: 'Reuters — Undersea cable fault could cut off Tonga from rest of the world for weeks', url: 'https://www.reuters.com/markets/funds/undersea-cable-fault-could-cut-off-tonga-rest-world-weeks-2022-01-18/' },
      { title: 'Cloudflare Radar — Internet is back in Tonga after 38 days of outage', url: 'https://blog.cloudflare.com/internet-is-back-in-tonga-after-38-days-of-outage/' }
    ]
  },
  {
    id: 'matsu-2023',
    date: '2023-02-02',
    title: 'Matsu Islands cut off — two cables, two ships, six days apart',
    location: 'Taiwan Strait, near the Matsu Islands',
    cables: ['tpkm'],
    cause: 'vessel — suspected anchor/fishing gear damage',
    cause_confidence: 'suspected (no evidence of state direction found)',
    countries_affected: ['Taiwan (Matsu Islands)'],
    summary: 'A Chinese fishing vessel was blamed for severing the first cable on 2 February 2023; a Chinese cargo ship severed the second on 8 February. Taiwan\u2019s National Communications Commission said there was no evidence of deliberate government direction, but the 14,000 residents of the Matsu Islands were left on a slow microwave backup link for about 50 days while repair ships were arranged — Matsu-area cables have been damaged roughly 30 times since 2017, mostly ruled accidental.',
    sources: [{ title: 'AP — Taiwan suspects Chinese ships cut islands\u2019 internet cables', url: 'https://apnews.com/article/matsu-taiwan-internet-cables-cut-china-65f10f5f73a346fa788436366d7a7c70' }]
  },
  {
    id: 'redsea-2024',
    date: '2024-02-24',
    title: 'Red Sea cable cluster cut — a quarter of Asia-Europe traffic affected',
    location: 'Red Sea, off Yemen',
    cables: ['aae1', 'seacom-tgn-ea', 'eig'],
    cause: 'vessel — anchor drag from an abandoned, Houthi-struck cargo ship',
    cause_confidence: 'widely reported, not independently confirmed by all operators',
    countries_affected: ['East Africa', 'the Middle East', 'South and Southeast Asia (rerouted traffic)'],
    summary: 'On 24 February 2024, three of the roughly 15 cables running through the Red Sea were cut: AAE-1, SEACOM/TGN-EA and EIG (already degraded). Hong Kong-based HGC Global Communications estimated the combined damage disrupted 25% of traffic flowing between Asia, Africa and Europe through that corridor. US officials and multiple outlets concluded the most likely cause was the dragging anchor of the MV Rubymar, a UK-owned cargo ship abandoned after a Houthi anti-ship missile strike on 18 February; the Houthis denied targeting cables directly. Repairs were unusually slow — AAE-1 took about five months, held up mainly by Yemen\u2019s internationally recognised government withholding repair-ship permits from the AAE-1 consortium.',
    sources: [
      { title: 'BBC — Crucial Red Sea data cables cut, telecoms firm says', url: 'https://www.bbc.com/news/world-middle-east-68478828' },
      { title: 'Wikipedia — AAE-1, February 2024 section', url: 'https://en.wikipedia.org/wiki/AAE-1' }
    ]
  },
  {
    id: 'westafrica-2024',
    date: '2024-03-14',
    title: 'Four West African cables cut off Abidjan in one day',
    location: 'Atlantic Ocean, Trou Sans Fond canyon off Côte d\u2019Ivoire',
    cables: ['wacs', 'ace', 'sat3', 'mainone'],
    cause: 'natural — suspected underwater landslide/seismic event',
    cause_confidence: 'ruled out human activity (cable depth ~3 km); natural cause not formally confirmed',
    countries_affected: ['Benin', 'Burkina Faso', 'Cameroon', 'Côte d\u2019Ivoire', 'The Gambia', 'Ghana', 'Guinea', 'Liberia', 'Namibia', 'Niger', 'Nigeria', 'South Africa', 'Togo'],
    summary: 'WACS, ACE, SAT-3/WASC and MainOne all failed within hours of each other, all with faults traced near the Trou Sans Fond submarine canyon. MainOne\u2019s preliminary analysis ruled out ship anchors, fishing gear or drilling given the ~3 km fault depth, pointing instead to seismic activity. Thirteen countries recorded degraded or near-total loss of international connectivity; Côte d\u2019Ivoire, nearest the fault, suffered a near-total outage. Repairs were staggered: SAT-3 by 6 April, ACE by 17 April, WACS by 29 April, MainOne last by 8–16 May — roughly $8 million in total repair cost across the four systems.',
    sources: [
      { title: 'Internet Society — 2024 West Africa Submarine Cable Outage Report', url: 'https://www.internetsociety.org/resources/doc/2024/2024-west-africa-submarine-cable-outage-report/' },
      { title: 'Cloudflare Radar — Undersea cable failures cause Internet disruptions for multiple African countries', url: 'https://blog.cloudflare.com/undersea-cable-failures-cause-internet-disruptions-across-africa-march-14-2024/' }
    ]
  },
  {
    id: 'baltic-nov-2024',
    date: '2024-11-17',
    title: 'Two Baltic cables cut within a day — suspicion falls on Yi Peng 3',
    location: 'Baltic Sea, between Sweden–Lithuania and Finland–Germany routes',
    cables: ['bcs-ew-interlink', 'c-lion1'],
    cause: 'vessel — suspected deliberate anchor drag',
    cause_confidence: 'suspected; no criminal finding (Chinese consent allowed Swedish boarding, inquiry inconclusive)',
    countries_affected: ['Sweden', 'Lithuania', 'Finland', 'Germany'],
    summary: 'The BCS East-West Interlink (Sweden–Lithuania) and C-Lion1 (Finland\u2019s only direct cable to continental Europe) were both damaged on 17–18 November 2024, roughly 200 km apart but close enough in time to draw NATO and EU accusations of coordinated sabotage. Investigators focused on the Chinese-flagged bulk carrier Yi Peng 3, whose tracked position matched both incident sites and times; it had departed a Russian port and its anchor showed damage consistent with prolonged dragging. China allowed a joint inspection, but the resulting inquiry did not produce a conclusive public finding of intent. C-Lion1 was repaired within 11 days.',
    sources: [
      { title: 'Wikipedia — 2024 Baltic Sea submarine cable disruptions', url: 'https://en.wikipedia.org/wiki/2024_Baltic_Sea_submarine_cable_disruptions' },
      { title: 'Marine Technology News — Underwater Sabotage: A Baltic Sea Timeline', url: 'https://www.marinetechnologynews.com/news/underwater-sabotage-baltic-timeline-645736' }
    ]
  },
  {
    id: 'baltic-dec-2024',
    date: '2024-12-25',
    title: 'The "Christmas Day" Eagle S incident — five cables in one pass',
    location: 'Gulf of Finland',
    cables: ['estlink2', 'c-lion1'],
    cause: 'vessel — anchor drag, prosecuted as suspected deliberate sabotage',
    cause_confidence: 'charged, then dismissed on jurisdiction in Oct 2025 (court found negligence plausible but did not rule on intent)',
    countries_affected: ['Finland', 'Estonia'],
    summary: 'The Cook Islands-flagged oil tanker Eagle S, believed linked to Russia\u2019s sanctions-evading "shadow fleet," dragged its 11-tonne anchor for roughly 90 km across the Gulf of Finland seabed, severing the Estlink 2 power interconnector (Finland–Estonia, 650 MW) and four telecom cables including C-Lion1 again. Finland intercepted and boarded the tanker. Its captain and two officers were charged with aggravated criminal damage and interference with telecommunications; in October 2025 the Helsinki District Court dismissed the case for lack of jurisdiction under UN Convention on the Law of the Sea Article 97 (flag-state jurisdiction applies on the high seas), without ruling on intent. Estlink 2 repairs were estimated near €60 million and took about seven months.',
    sources: [
      { title: 'Wikipedia — 2024 Estlink 2 incident', url: 'https://en.wikipedia.org/wiki/2024_Estlink_2_incident' },
      { title: 'Atlantic Council — How the Baltic Sea nations have tackled suspicious cable cuts', url: 'https://www.atlanticcouncil.org/in-depth-research-reports/issue-brief/how-the-baltic-sea-nations-have-tackled-suspicious-cable-cuts/' }
    ]
  },
  {
    id: 'tpe-2025',
    date: '2025-01-07',
    title: 'TPE cable damaged off Keelung — a ship that changed its flag mid-voyage',
    location: 'Taiwan Strait, north of Taipei',
    cables: ['tpe'],
    cause: 'vessel — suspected deliberate anchor drag',
    cause_confidence: 'suspected; owner denies responsibility',
    countries_affected: ['Taiwan'],
    summary: 'The Cameroon-flagged Shunxing 39, controlled by a Chinese entity, was accused of damaging the Trans-Pacific Express cable after its AIS transponder was switched off during the transit. The vessel later reappeared operating as the Tanzania-flagged Xingshun 39 — widely read by regional security analysts as a deliberate flag-switching tactic to frustrate attribution. Chunghwa Telecom said Taiwan\u2019s own service was largely unaffected because traffic was quickly rerouted to other cables, underscoring the value of route diversity even when an individual cut cannot be prevented.',
    sources: [{ title: 'Reuters — Exclusive: China-linked shipowner denies Taiwan accusation of damaging undersea cable', url: 'https://www.reuters.com/world/asia-pacific/china-linked-shipowner-denies-taiwan-accusation-damaging-undersea-cable-2025-01-08/' }]
  },
  {
    id: 'penghu-2025',
    date: '2025-02-25',
    title: 'Hong Tai 58 severs the Taiwan–Penghu cable in a no-anchor zone',
    location: 'Taiwan Strait, off Tainan',
    cables: ['tpkm'],
    cause: 'vessel — deliberate, later proven in court',
    cause_confidence: 'confirmed by criminal conviction',
    countries_affected: ['Taiwan (Penghu Islands)'],
    summary: 'The Togo-flagged, Chinese-crewed cargo ship Hong Tai 58 circled inside a designated no-anchor zone for roughly three days before severing the Taiwan-Penghu No. 3 cable. Taiwan\u2019s coast guard detained the vessel. In June 2025 a Taiwanese court sentenced the Chinese captain to three years in prison and ordered roughly NT$18 million in damages — the first criminal conviction anywhere for intentional submarine cable sabotage, and the clearest line yet from "suspected" to "proven" in this incident pattern.',
    sources: [
      { title: 'Reuters — Taiwan detains China-linked cargo ship after undersea cable disconnected', url: 'https://www.reuters.com/world/asia-pacific/taiwan-detains-china-linked-cargo-ship-after-undersea-cable-disconnected-2025-02-25/' },
      { title: 'Al Jazeera — China probe finds Taiwanese men controlled ship that cut undersea cables', url: 'https://www.aljazeera.com/news/2025/12/24/china-probe-finds-taiwanese-men-controlled-ship-that-cut-undersea-cables' }
    ]
  }
];
