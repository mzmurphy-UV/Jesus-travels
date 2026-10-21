# Footsteps of the Gospel

An interactive map of the life of Jesus. Step through the Gospel story event by event and watch the journeys unfold on a real, zoomable map of the Holy Land, with Scripture (RSV-2CE), masterpiece art, who ruled where, and each place as it looks today.

The site is plain HTML, CSS and JavaScript with no build step. It is served by GitHub Pages.

## What is where

| Path | What it holds |
| --- | --- |
| `index.html` | The page |
| `css/app.css` | All styling |
| `js/config.js` | The MapTiler key (public by design; restrict it to the site's domain in MapTiler) |
| `js/data.js` | Places, routes, timeline lanes and events, with Scripture, art and "today" notes |
| `js/routestats.js` | Miles and climb for each route, built by `tools/routestats.py` |
| `js/realms.js` | Approximate regions and rulers by year |
| `js/app.js` | Map, timeline, event panel, search |
| `img/` | Artwork (`<eventId><n>.jpg`) and site photos (`img/today/`) from Wikimedia Commons |
| `tools/routestats.py` | Rebuilds `js/routestats.js` from elevation tiles when routes change |

## Map

The map streams from [MapTiler](https://www.maptiler.com/) through [MapLibre GL JS](https://maplibre.org/): satellite imagery, a landscape terrain style and a parchment style drawn from MapTiler's vector tiles, all with modern labels, roads and borders removed. "3D hills" uses MapTiler's terrain elevation.

## Run it locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Your MapTiler key must allow `localhost` while testing.

## Credits

- Scripture: Revised Standard Version of the Bible, Second Catholic Edition, © 2000 and 2006 by the National Council of the Churches of Christ in the United States of America. Used by permission.
- Map data: © MapTiler, © OpenStreetMap contributors. Route elevations: AWS Terrain Tiles.
- Images: Wikimedia Commons; each carries its own credit and license in `js/data.js`.
