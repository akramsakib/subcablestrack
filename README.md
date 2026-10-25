# SubCableTrack

**Global submarine cable intelligence console.** A curated, fully-cited registry of
25 major submarine cable systems, a documented incident record going back to 2006,
chokepoint risk analysis, a live infrastructure-news feed, a point-to-point route
lookup, and a cable relationship graph — built in the same design language as
[ThreatNexus BD](https://akramsakib.github.io/bangladesh-threat-intelligence/).

Live: https://akramsakib.github.io/subcablestrack/

## What's here

- **Globe** — a 3D globe showing every tracked cable as an animated route arc between
  its documented landing points, plus the seven geographic chokepoints where traffic
  concentrates (Egypt/Red Sea, Bab-el-Mandeb, Luzon Strait, Taiwan Strait, Strait of
  Malacca, Strait of Hormuz, the Baltic Sea).
- **Registry** — a D3 force-directed graph of every cable in the corpus, linked by
  shared owner/consortium membership, shared landing country, or region; also
  browsable as a plain sortable list.
- **Landscape** — a board-ready brief: cables by region, incident cause breakdown,
  longest systems, highest-capacity systems, and the full incident record.
- **Feed** — a live aggregator across 10 verified submarine-cable trade, networking
  and tech/security outlets, scored for cable relevance, refreshed every 15 minutes.
- **Resilience** — chokepoint dossiers, the incident timeline, and a redundancy
  pivot showing which regions depend on the fewest active systems.
- **Route** — enter two landing points and find every tracked cable connecting them,
  plus which chokepoints the path is likely to cross.

## Data integrity

Every cable, incident and chokepoint entry is built from public consortium
announcements, regulator filings, Internet Society / Cloudflare Radar / APNIC
reporting, and press coverage — see the `sources` array on every record. This is
**not** a reproduction of TeleGeography's proprietary
[Submarine Cable Map](https://www.submarinecablemap.com/) data or styling; where
their map is the better, more exhaustive resource, this console links to it
directly instead of attempting to clone it.

## Run it locally

```bash
npm start            # node server.mjs — live feed aggregation on :3000
npm run build         # node tools/build.mjs — static dist/ for GitHub Pages
```

## License

CC BY 4.0 for the intelligence content (`data/`), MIT for the application code.
See [LICENSE](LICENSE).
