# SubCableTrack

**An atlas of the cables that carry the internet.** A single, long scrolling
page in a cartographer's-table register — parchment surfaces, ink-teal type,
a flat 2D vector world map — not a dashboard, not a tabbed console, and not a
reskin of a security product. Every fact is cited.

Live: https://akramsakib.github.io/subcablestrack/

## What's here

One page, read top to bottom:

- **Atlas** — a flat equirectangular world map (not a 3D globe) with every
  tracked cable drawn as a route between its documented landing points, and
  the seven geographic chokepoints where traffic concentrates (Egypt/Red Sea,
  Bab-el-Mandeb, Luzon Strait, Taiwan Strait, Strait of Malacca, Strait of
  Hormuz, the Baltic Sea). Pan, zoom, click a route or a chokepoint ring,
  filter by status.
- **Chokepoints** — a ranked list of those corridors, with the cited cable
  count range and context for each — shown as a range rather than a false
  single number, because trade sources don't all count the same way.
- **Timeline** — every documented cut, fault or act of sabotage since 2006,
  on a horizontal ribbon; click a point for the full dossier and sources.
- **Directory** — the full 25-system registry as a plain sortable, searchable
  table. Opening a row shows ownership, landing points, related systems
  (shared owner / shared landing country / shared region, computed from the
  data itself) and primary sources.
- **Watch** — a live aggregator across verified submarine-cable trade,
  networking and tech/security outlets, scored for cable relevance, refreshed
  every 15 minutes.
- **Route** — enter two landing points and find every tracked cable
  connecting them, plus which chokepoints the path is likely to cross.

## Data integrity

Every cable, incident and chokepoint entry is built from public consortium
announcements, regulator filings, Internet Society / Cloudflare Radar / APNIC
reporting, and press coverage — see the `sources` array on every record. This
is **not** a reproduction of TeleGeography's proprietary
[Submarine Cable Map](https://www.submarinecablemap.com/) data or styling;
where their map is the better, more exhaustive resource, this atlas links to
it directly instead of attempting to clone it. The land outline on the map
itself is public-domain [Natural Earth](https://www.naturalearthdata.com/)
data via the ISC-licensed [world-atlas](https://github.com/topojson/world-atlas)
package, baked into a static asset — no live mapping library, no
TeleGeography assets.

## Run it locally

```bash
npm start             # node server.mjs — live feed aggregation on :3000
npm run build          # node tools/build.mjs — static dist/ for GitHub Pages
```

## License

CC BY 4.0 for the data content (`data/`), MIT for the application code.
See [LICENSE](LICENSE).
