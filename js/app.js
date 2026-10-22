(async () => {
  const KEY = window.MAPTILER_KEY, MT = "https://api.maptiler.com";
  const root = document.documentElement;
  const cssVar = n => getComputedStyle(root).getPropertyValue(n).trim();
  const laneVar = id => `--${id === "jesus" ? "lapis" : id}`;
  const laneColor = id => `var(${laneVar(id)})`;
  const laneHex = id => cssVar(laneVar(id));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mapwrap = document.getElementById("mapwrap");

  // Merge the Gospel and Acts events (js/content.js) after the opening events in data.js
  if (typeof CONTENT_EVENTS !== "undefined") {
    for (const [k, p] of Object.entries(CONTENT_PLACES)) if (!PLACES[k]) PLACES[k] = p;
    EVENTS.push(...CONTENT_EVENTS);
    // A town that is now a real place no longer needs its context dot
    for (let i = CONTEXT.length - 1; i >= 0; i--) if (Object.values(PLACES).some(p => Math.hypot(p.ll[0] - CONTEXT[i][1], p.ll[1] - CONTEXT[i][2]) < 0.03)) CONTEXT.splice(i, 1);
    [["apostles", "Peter & the apostles"], ["women", "The women disciples"], ["paul", "Paul & his companions"], ["tradition", "After Acts, by tradition"]].forEach(([id, name]) => { if (!LANES.some(l => l.id === id) && EVENTS.some(e => e.lane === id)) LANES.push({ id, name }); });
  }
  // Holy Week: the run of events from the Friday before Palm Sunday to Easter evening, each with its day
  const HW_DAYS = ["Six days before", "Palm Sunday", "Monday", "Tuesday", "Wednesday", "Holy Thursday", "Good Friday", "Holy Saturday", "Easter Sunday"];
  const HW_SHORT = ["Fri", "Palm Sun", "Mon", "Tue", "Wed", "Thu", "Good Fri", "Sat", "Easter"];
  const HWDAY = new Map();
  {
    const a = EVENTS.findIndex(e => /Friday before Passion Week/.test(e.date));
    let b = -1; EVENTS.forEach((e, i) => { if (/Sunday evening, AD 33/.test(e.date)) b = i; });
    const order = { Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6, Saturday: 7 };
    let d = 0;
    if (a >= 0) for (let i = a; i <= b; i++) {
      const t = EVENTS[i].date, w = (t.match(/Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/) || [])[0];
      if (/Friday before/.test(t)) d = 0; else if (w === "Sunday") d = /Passion Week/.test(t) ? 1 : 8; else if (w) d = order[w];
      HWDAY.set(EVENTS[i], d);
    }
  }

  const store = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (_) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

  // ---------- Map styles: streamed from MapTiler, with modern labels, roads and borders stripped ----------
  const STYLE_URL = { sat: `${MT}/maps/satellite/style.json?key=${KEY}`, terrain: `${MT}/maps/landscape/style.json?key=${KEY}` };
  const MODERN = /road|railway|tunnel|bridge|pier|runway|taxiway|path|building|residential|industrial|pedestrian|cemetery|border/i;
  const KEEP = { sat: l => l.type === "raster", terrain: l => l.type !== "symbol" && !MODERN.test(l.id) };
  const styleCache = {};
  async function styleFor(k) {
    if (k === "parchment") return parchmentStyle();
    if (!styleCache[k]) { const s = await (await fetch(STYLE_URL[k])).json(); s.layers = s.layers.filter(KEEP[k]); styleCache[k] = s; }
    return JSON.parse(JSON.stringify(styleCache[k]));
  }
  function parchmentStyle() {
    const dark = cssVar("--bg").toLowerCase() === "#15171c";
    return { version: 8,
      sources: {
        omt: { type: "vector", url: `${MT}/tiles/v3/tiles.json?key=${KEY}` },
        hs: { type: "raster-dem", url: `${MT}/tiles/terrain-rgb-v2/tiles.json?key=${KEY}` } },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": cssVar("--land") } },
        { id: "hs", type: "hillshade", source: "hs", paint: { "hillshade-shadow-color": dark ? "#000000" : "#6f5a36", "hillshade-highlight-color": dark ? "#4c4537" : "#fffaf0", "hillshade-accent-color": dark ? "#111111" : "#8d7a55", "hillshade-exaggeration": 0.4 } },
        { id: "water", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": cssVar("--sea"), "fill-outline-color": cssVar("--sea-ink") } },
        { id: "rivers", type: "line", source: "omt", "source-layer": "waterway", paint: { "line-color": cssVar("--sea-ink"), "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 12, 2.2] } }
      ] };
  }

  let bm = store.get("ntmap.basemap", "sat"); if (!["sat", "terrain", "parchment"].includes(bm)) bm = "sat";
  const map = new maplibregl.Map({
    container: "map", style: await styleFor(bm), bounds: [[34.4, 31.0], [35.9, 33.3]], fitBoundsOptions: { padding: 20 },
    attributionControl: false, maxPitch: 70, minZoom: 2.5, renderWorldCopies: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showZoom: false, visualizePitch: true }), "bottom-right");
  map.touchZoomRotate.disableRotation();
  new ResizeObserver(() => map.resize()).observe(mapwrap);

  // ---------- Overlay layers (re-added whenever the base style changes) ----------
  let routeData = { type: "FeatureCollection", features: [] };
  let rulersOn = store.get("ntmap.rulers", "0") === "1", terrainOn = false;
  const realmsGeo = y => {
    const R = rulersAt(y);
    return { type: "FeatureCollection", features: Object.entries(REALMS).map(([id, r]) => ({ type: "Feature", properties: { id, color: RULER_COLORS[R[id].key] }, geometry: { type: "Polygon", coordinates: [[...r.poly, r.poly[0]]] } })) };
  };
  function addOverlays() {
    if (!map.getSource("dem3d")) map.addSource("dem3d", { type: "raster-dem", url: `${MT}/tiles/terrain-rgb-v2/tiles.json?key=${KEY}` });
    const vis = rulersOn ? "visible" : "none";
    map.addSource("realms", { type: "geojson", data: realmsGeo(cur >= 0 ? yearOf(EVENTS[cur]) : -6) });
    map.addLayer({ id: "realm-fill", type: "fill", source: "realms", layout: { visibility: vis }, paint: { "fill-color": ["get", "color"], "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, bm === "sat" ? 0.32 : 0.22, 10, 0.1] } });
    map.addLayer({ id: "realm-line", type: "line", source: "realms", layout: { visibility: vis, "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-width": 1.6, "line-dasharray": [3, 2] } });
    map.addSource("routes", { type: "geojson", data: routeData });
    map.addLayer({ id: "route-past", type: "line", source: "routes", filter: ["!", ["get", "now"]], layout: { "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-width": 2.5, "line-opacity": 0.75, "line-dasharray": [2, 2] } });
    map.addLayer({ id: "route-casing", type: "line", source: "routes", filter: ["get", "now"], layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": bm === "sat" ? "rgba(255,255,255,.8)" : cssVar("--panel"), "line-width": 7 } });
    map.addLayer({ id: "route-now", type: "line", source: "routes", filter: ["all", ["get", "now"], ["!", ["get", "uncertain"]]], layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": ["get", "color"], "line-width": 4 } });
    // A leg whose line is a reconstruction (the storm drift in Acts 27) is drawn dashed
    map.addLayer({ id: "route-now-uncertain", type: "line", source: "routes", filter: ["all", ["get", "now"], ["get", "uncertain"]], layout: { "line-join": "round" }, paint: { "line-color": ["get", "color"], "line-width": 4, "line-dasharray": [1.5, 1.2] } });
    if (terrainOn) map.setTerrain({ source: "dem3d", exaggeration: 1.5 });
  }
  map.on("style.load", addOverlays);

  // ---------- Markers: places, context towns, mountains, regions and seas ----------
  const markers = [];
  function mk(cls, label, ll, pos, show) {
    const el = document.createElement("div"); el.className = "mk " + cls;
    el.innerHTML = (cls.startsWith("place") ? `<span class="halo"></span><span class="dot"></span>` : cls === "ctx" ? `<span class="dot"></span>` : cls === "mtn" ? `<span class="tri"></span>` : "") + `<span class="lbl ${pos}">${esc(label)}</span>`;
    new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(ll).addTo(map);
    const m = { el, lbl: el.querySelector(".lbl"), show }; markers.push(m); return m;
  }
  const seaLabels = [["The Great Sea", 33.6, 32.4, z => z <= 9], ["Sea of Galilee", 35.60, 32.81, z => z >= 7.5 && z <= 11], ["Salt Sea", 35.47, 31.40, z => z >= 7.5 && z <= 11], ["Red Sea", 34.0, 27.4, z => z <= 8]];
  seaLabels.forEach(([t, lon, lat, f]) => mk("sealbl", t, [lon, lat], "", z => f(z)));
  REGIONS.forEach(([t, lon, lat]) => mk("rg", t.toUpperCase(), [lon, lat], "", z => z >= 6.2 && z <= 10.4));
  MOUNTAINS.forEach(([t, lon, lat]) => mk("mtn", t, [lon, lat], t === "Mt of Olives" ? "b" : "r", z => z >= 8));
  CONTEXT.forEach(([t, lon, lat]) => mk("ctx", t, [lon, lat], "r", z => lon < 33 || ["Damascus", "Tyre", "Sidon"].includes(t) ? true : z >= 7.6));
  const placeEls = {};
  const placeHasEvent = new Set(EVENTS.map(e => e.place));
  const LBL = { einkarem: "l", shepherds: "b", bethlehem: "bl", herodium: "b", temple: "t", bethabara: "b", wilderness: "t" };
  const KEYPLACES = ["nazareth", "temple", "bethlehem", "egypt", "capernaum", "rome", "athens", "antioch", "ephesus", "corinth", "damascus"];
  Object.entries(PLACES).forEach(([id, p]) => {
    const m = mk("place" + (placeHasEvent.has(id) ? " has-event" : ""), p.name, p.ll, LBL[id] || "r", () => true);
    const g = m.el; g.tabIndex = 0; g.setAttribute("role", "button"); g.setAttribute("aria-label", p.name);
    const far = p.ll[0] < 34 || p.ll[1] > 33.6 || p.ll[0] > 36.2; // outside the crowded Holy Land core
    m.labelShow = z => far || z >= (placeHasEvent.has(id) ? 9.2 : 9.8) || KEYPLACES.includes(id) || g.classList.contains("active");
    g.addEventListener("click", ev => { ev.stopPropagation(); const i = EVENTS.findIndex((e, k) => e.place === id && k >= cur); go(i >= 0 ? i : EVENTS.findIndex(e => e.place === id)); });
    g.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); g.click(); } });
    placeEls[id] = g; m.isPlace = true; m.rank = () => g.classList.contains("active") ? 3 : KEYPLACES.includes(id) ? 2 : placeHasEvent.has(id) ? 1 : 0;
  });
  function updateMarkers() {
    const z = map.getZoom();
    for (const m of markers) { m.el.classList.toggle("hide", !m.show(z)); m.lbl.classList.toggle("hide", !!m.labelShow && !m.labelShow(z)); }
  }
  // Hide place labels that would overlap a more important one (the current place wins, then key towns)
  function declutter() {
    updateMarkers();
    const placed = [];
    markers.filter(m => /\b(place|ctx|mtn)\b/.test(m.el.className) && !m.el.classList.contains("hide") && !m.lbl.classList.contains("hide")).sort((a, b) => (b.rank ? b.rank() : -1) - (a.rank ? a.rank() : -1)).forEach(m => {
      const r = m.lbl.getBoundingClientRect();
      if (placed.some(q => r.left < q.right + 4 && r.right + 4 > q.left && r.top < q.bottom && r.bottom > q.top)) m.lbl.classList.add("hide"); else placed.push(r);
    });
  }
  map.on("zoom", updateMarkers);
  map.on("moveend", declutter);

  // ---------- Camera ----------
  const pad = () => innerWidth <= 900 ? { top: 50, bottom: 40, left: 30, right: 30 } : { top: 60, bottom: 60, left: 80, right: 80 };
  function flyBounds(lls, maxZoom, duration = 1600) {
    const b = new maplibregl.LngLatBounds(); lls.forEach(l => b.extend(l));
    map.fitBounds(b, { padding: pad(), maxZoom, duration: reduce ? 0 : duration });
  }
  const PRESETS = [
    ["Whole map", [[29.5, 29.0], [36.5, 34.0]]],
    ["Holy Land", [[34.4, 31.0], [35.9, 33.3]]],
    ["Galilee", [[35.15, 32.6], [35.75, 33.0]]],
    ["Judea", [[35.05, 31.6], [35.6, 31.92]]],
    ["Egypt route", [[31.2, 30.0], [35.3, 31.8]]],
    ["Paul's world", [[12.3, 30.8], [36.5, 42.0]]]
  ];
  const presetsEl = document.getElementById("presets");
  PRESETS.forEach(([name, b]) => { const btn = document.createElement("button"); btn.textContent = name; btn.addEventListener("click", () => flyBounds(b, 12, 900)); presetsEl.appendChild(btn); });
  document.getElementById("zin").onclick = () => map.zoomIn();
  document.getElementById("zout").onclick = () => map.zoomOut();

  // ---------- Timeline (only the events the current lens and filter let through) ----------
  const lanesEl = document.getElementById("lanes");
  let VIS = EVENTS.map((_, i) => i), evBtns = [], cells = [], dateEls = [], eraAt = {};
  function buildTimeline() {
    lanesEl.innerHTML = ""; evBtns = []; cells = []; eraAt = {};
    lanesEl.style.setProperty("--n", VIS.length);
    const dateRow = document.createElement("div"); dateRow.className = "lname"; lanesEl.appendChild(dateRow);
    dateEls = VIS.map(i => { const d = document.createElement("div"); d.className = "dates"; d.dataset.i = i; lanesEl.appendChild(d); return d; });
    LANES.filter(l => VIS.some(i => EVENTS[i].lane === l.id)).forEach(l => {
      const n = document.createElement("div"); n.className = "lname"; n.style.setProperty("--lc", laneColor(l.id)); n.innerHTML = `<i></i>${l.name}`; lanesEl.appendChild(n);
      VIS.forEach(i => {
        const e = EVENTS[i];
        const c = document.createElement("div"); c.className = "cell"; c.style.setProperty("--lc", laneColor(l.id)); c.dataset.i = i;
        if (e.lane === l.id) { const b = document.createElement("button"); b.className = "ev"; b.style.setProperty("--lc", laneColor(l.id)); b.title = `${e.title} · ${e.date}`; b.setAttribute("aria-label", `${e.title}, ${e.date}`); b.onclick = () => go(i); c.appendChild(b); evBtns[i] = b; }
        cells.push(c); lanesEl.appendChild(c);
      });
    });
    // Era labels: the first visible event of each year
    // Era labels: the first visible event of each year, at least three columns apart so they don't run together
    let last = null, lastPos = -9;
    if (kind === "holyweek") { let d = -1; VIS.forEach(i => { const k = HWDAY.get(EVENTS[i]); if (k !== d) { eraAt[i] = HW_SHORT[k]; d = k; } }); renderDays(); return; }
    renderDays();
    let inBeyond = false;
    VIS.forEach((i, pos) => { const y = Math.trunc(yearOf(EVENTS[i])); const fresh = EVENTS[i].basis && !inBeyond; if (fresh) inBeyond = true; if ((last === null || y > last || fresh) && pos - lastPos >= 3) { eraAt[i] = y < 0 ? `${-y} BC` : `AD ${y}`; last = y; lastPos = pos; } });
  }

  // ---------- Folio ----------
  const folio = document.getElementById("folio");
  let tab = "story";
  const wiki = a => "https://en.wikipedia.org/wiki/Special:Search?search=" + encodeURIComponent(`${a.title} ${a.artist.split(" and ")[0]}`);
  const fmt = n => (n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US");
  const journeyOf = e => e.route || (e.from ? ROUTES[`${e.from}>${e.place}`] : null);
  function journeyStats(e) {
    const st = e.from && ROUTE_STATS[e.route ? "@" + e.id : `${e.from}>${e.place}`]; if (!st) return "";
    const pr = st.profile, lo = Math.min(...pr, 0), hi = Math.max(...pr), span = Math.max(hi - lo, 200);
    const X = i => (i / (pr.length - 1) * 300).toFixed(1), Y = v => (56 - (v - lo) / span * 52).toFixed(1);
    const area = `M0 60L${pr.map((v, i) => `${X(i)} ${Y(v)}`).join("L")}L300 60Z`;
    const seaLine = st.lo < 0 ? `<line class="sea0" x1="0" x2="300" y1="${Y(0)}" y2="${Y(0)}"/>` : "";
    if (st.sea >= 0.5) return `<div class="jstats">Along the route drawn: <b>${fmt(st.mi)} miles</b>, mostly by sea${e.routeUncertain ? ". The line is a reconstruction of the ship's drift." : ""}</div>`;
    return `<div class="jstats">Along the route drawn: <b>${fmt(st.mi)} miles</b>${st.sea >= 0.1 ? ", partly by sea" : ""} · about <b>${fmt(st.up)} ft</b> of climbing and <b>${fmt(st.down)} ft</b> down · highest ${fmt(st.hi)} ft, lowest ${fmt(st.lo)} ft${st.lo < 0 ? " (below sea level)" : ""}</div>
      ${st.mi >= 3 ? `<svg class="profile" viewBox="0 0 300 60" preserveAspectRatio="none" role="img" aria-label="Elevation profile from ${esc(PLACES[e.from].name)} to ${esc(PLACES[e.place].name)}"><path class="area" d="${area}"/>${seaLine}</svg>
      <div class="jstats" style="display:flex;justify-content:space-between;margin-top:0"><span>${esc(PLACES[e.from].name)}</span>${st.lo < 0 ? "<span>dashed line: sea level</span>" : ""}<span>${esc(PLACES[e.place].name)}</span></div>` : ""}`;
  }
  function openLightbox(o, back) {
    const lb = document.createElement("div"); lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", o.title);
    lb.innerHTML = `<button class="lb-close" aria-label="Close">×</button><div class="lb-img"><img src="${esc(o.img)}" alt="${esc(o.alt)}"></div>
      <div class="lb-info"><span class="kind">${esc(o.kind)}</span><h4>${esc(o.title)}</h4>${o.by ? `<div class="by">${esc(o.by)}</div>` : ""}
      ${o.fields ? `<dl>${o.fields.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>` : ""}${o.text ? `<p>${esc(o.text)}</p>` : ""}
      <p class="credit">${esc(o.credit)} · <a href="${esc(o.source)}" target="_blank" rel="noopener">file page</a></p></div>`;
    const close = () => { lb.remove(); document.removeEventListener("keydown", onKey); back && back.focus(); };
    const onKey = ev => { if (ev.key === "Escape") close(); };
    lb.querySelector(".lb-close").onclick = close;
    lb.querySelector(".lb-img").onclick = ev => { if (ev.target === ev.currentTarget || ev.target.tagName === "IMG") close(); };
    document.addEventListener("keydown", onKey); document.body.appendChild(lb); lb.querySelector(".lb-close").focus();
  }
  const BOOKNAME = { Mt: "Matthew", Mk: "Mark", Lk: "Luke", Jn: "John", Acts: "Acts", Rom: "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians", Gal: "Galatians", Phil: "Philippians", "1Thess": "1 Thessalonians", "2Tim": "2 Timothy", "1Pet": "1 Peter", Rev: "Revelation" };
  const TAGNAME = { miracle: "Miracle", healing: "Healing", "nature-miracle": "Nature miracle", raising: "Raising the dead", exorcism: "Exorcism", parable: "Parable", teaching: "Teaching", sermon: "Sermon",
    prayer: "Prayer", call: "Call", conflict: "Conflict", prophecy: "Prophecy", passion: "Passion", appearance: "Appearance" };
  // ---------- Gospels side by side ----------
  const GOSPELS = [["Mt", "Matthew"], ["Mk", "Mark"], ["Lk", "Luke"], ["Jn", "John"]];
  const passageUrl = ref => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref.replace(/[–—]/g, "-"))}&version=RSVCE`;
  // One block per Gospel: its passage, its key quote (from `parallels` when the content has it), or a note that it doesn't tell this event
  function parallels(e, all) {
    return `<div class="par${all ? " wide" : ""}">` + GOSPELS.map(([k, n]) => {
      if (!e.gospels[k]) return all ? `<section class="par-col absent"><h4>${n}</h4><p class="empty">Not told in ${n}.</p></section>` : "";
      const ref = `${n} ${e.gospels[k]}`;
      const qs = e.parallels && e.parallels[k] ? [e.parallels[k]] : e.scripture.filter(s => s.ref.startsWith(n + " "));
      return `<section class="par-col"><h4>${n} <a href="${passageUrl(ref)}" target="_blank" rel="noopener">${esc(e.gospels[k])} ↗</a></h4>${qs.length ? qs.map(s => `<blockquote><p>${esc(s.text)}</p><cite>${esc(s.ref)}</cite></blockquote>`).join("") : `<p class="empty">No quotation here yet; follow the link to read ${n}'s account.</p>`}</section>`;
    }).join("") + `</div>`;
  }
  // Daily-life explainers (content/explainers.json)
  const EXPLAINERS = typeof CONTENT_EXPLAINERS !== "undefined" ? CONTENT_EXPLAINERS : {};
  const explainersFor = e => Object.entries(EXPLAINERS).filter(([, x]) => x.events.includes(e.id));
  function openExplainer(k, back) {
    const x = EXPLAINERS[k], idx = id => EVENTS.findIndex(ev => ev.id === id);
    const ov = document.createElement("div"); ov.className = "compare"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", x.title);
    ov.innerHTML = `<div class="cmp-box explainer"><button class="lb-close" aria-label="Close">×</button><span class="kind">Daily life</span><h2>${esc(x.title)}</h2>
      ${x.text.map(t => `<p>${esc(t)}</p>`).join("")}<h3>In the story</h3><div class="explainers">${x.events.map(idx).filter(i => i >= 0).map(i => `<button type="button" data-go="${i}">${esc(EVENTS[i].title)}</button>`).join("")}</div></div>`;
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); back && back.isConnected && back.focus(); };
    const onKey = ev => { if (ev.key === "Escape") close(); };
    ov.querySelector(".lb-close").onclick = close; ov.onclick = ev => { if (ev.target === ov) close(); };
    ov.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { close(); stop(); go(+b.dataset.go); });
    document.addEventListener("keydown", onKey); document.body.appendChild(ov); ov.querySelector(".lb-close").focus();
  }
  function openParallels(e, back) {
    const ov = document.createElement("div"); ov.className = "compare"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", `${e.title}, the Gospels side by side`);
    ov.innerHTML = `<div class="cmp-box"><button class="lb-close" aria-label="Close">×</button><span class="kind">The Gospels side by side</span><h2>${esc(e.title)}</h2>
      ${e.orderNote ? `<p class="echo">${esc(e.orderNote)}</p>` : ""}${parallels(e, true)}<p class="credit">Links open the full passage in the RSV Catholic Edition on Bible Gateway.</p></div>`;
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); back && back.focus(); };
    const onKey = ev => { if (ev.key === "Escape") close(); };
    ov.querySelector(".lb-close").onclick = close; ov.onclick = ev => { if (ev.target === ov) close(); };
    document.addEventListener("keydown", onKey); document.body.appendChild(ov); ov.querySelector(".lb-close").focus();
  }
  function renderFolio(e) {
    const p = PLACES[e.place];
    const lane = LANES.find(l => l.id === e.lane);
    folio.style.setProperty("--lc", laneColor(e.lane));
    const G = e.gospels.Acts || e.basis ? Object.keys(e.gospels).map(k => [k, BOOKNAME[k] || k]) : [["Mt", "Matthew"], ["Mk", "Mark"], ["Lk", "Luke"], ["Jn", "John"]];
    const tabs = [["story", "Story"], ["scripture", "Scripture"], ["art", `Art${e.art.length ? " (" + e.art.length + ")" : ""}`], ["place", "Place"]];
    let body = "";
    if (tab === "story") {
      body += `<p>${esc(e.summary)}</p>`;
      body += `<dl class="facts"><dt>Where</dt><dd>${esc(p.name)} <span class="pill ${p.certainty}">${p.certainty}</span></dd>`;
      if (e.stay) body += `<dt>Stayed</dt><dd>${esc(e.stay)}</dd>`;
      if (e.journey) body += `<dt>Journey</dt><dd>${esc(e.journey)}${journeyStats(e)}</dd>`;
      body += `</dl>`;
      body += `<h3>People</h3><div class="people">${e.people.map(x => `<span>${esc(x)}</span>`).join("")}</div>`;
      if (e.history) body += `<h3>From history</h3><p class="echo">${esc(e.history)}</p>`;
      if (e.orderNote) body += `<h3>${e.basis ? "Sources" : "On the order"}</h3><p class="echo">${esc(e.orderNote)}</p>`;
      const ex = explainersFor(e);
      if (ex.length) body += `<h3>Daily life</h3><div class="explainers">${ex.map(([k, x]) => `<button type="button" data-ex="${k}">${esc(x.title)}</button>`).join("")}</div>`;
      if (e.tags && e.tags.length) body += `<div class="people tags">${e.tags.map(t => `<span>${esc(TAGNAME[t] || t)}</span>`).join("")}</div>`;
      if (e.scripture[0]) body += `<blockquote><p>${esc(e.scripture[0].text)}</p><cite>${esc(e.scripture[0].ref)} · RSV-2CE</cite></blockquote>`;
    } else if (tab === "scripture") {
      const told = GOSPELS.filter(([k]) => e.gospels[k]);
      if (told.length >= 2) {
        body += `<div class="par-head"><h3>As each Gospel tells it</h3><button class="par-open" type="button">Side by side ⤢</button></div>${parallels(e, false)}`;
        const rest = e.scripture.filter(s => !GOSPELS.some(([, n]) => s.ref.startsWith(n + " ")));
        if (rest.length) body += `<h3>Also quoted</h3>` + rest.map(s => `<blockquote><p>${esc(s.text)}</p><cite>${esc(s.ref)}</cite></blockquote>`).join("");
      } else body += e.scripture.map(s => `<blockquote><p>${esc(s.text)}</p><cite>${esc(s.ref)}</cite></blockquote>`).join("");
      if (e.echoes && e.echoes.length) body += `<h3>Old Testament echoes</h3>` + e.echoes.map(x => `<p class="echo"><b>${esc(x.ref)}</b>. ${esc(x.note)}</p>`).join("");
      body += `<p class="credit">Scripture quotations are from the Revised Standard Version of the Bible, Second Catholic Edition, copyright © 2000 and 2006 by the National Council of the Churches of Christ in the United States of America. Used by permission. Quotations were checked word for word against the RSV Catholic Edition, with the archaic pronouns (thee, thou) modernized as in the Second Catholic Edition.</p>`;
    } else if (tab === "art") {
      if (!e.art.length) body += `<p class="empty">No artwork for this event yet.</p>`;
      body += e.art.map((a, k) => `<article class="artcard">${a.img ? `<figure><img src="${esc(a.img)}" alt="${esc(a.title)}, ${esc(a.artist)}" loading="lazy" data-zoom="${k}"><figcaption>${esc(a.credit)} · <a href="${esc(a.source)}" target="_blank" rel="noopener">file page</a></figcaption></figure>` : ""}<span class="kind">${esc(a.kind)}</span><h4>${esc(a.title)}</h4><div class="by">${esc(a.artist)} · ${esc(a.year)} · ${esc(a.medium)}</div>
        <dl><dt>Where now</dt><dd>${esc(a.location)}</dd><dt>Shows</dt><dd>${esc(a.description)}</dd><dt>Significance</dt><dd>${esc(a.significance)}</dd><dt>Symbolism</dt><dd>${esc(a.symbolism)}</dd><dt>Impact</dt><dd>${esc(a.impact)}</dd></dl>
        <a href="${wiki(a)}" target="_blank" rel="noopener">See the work ↗</a></article>`).join("");
      if (e.art.length) body += `<p class="credit">Images come from Wikimedia Commons. Paintings are public domain; photos of objects carry the photographer's license as noted. Tap an image to enlarge it.</p>`;
    } else {
      body += `<p><b>${esc(p.name)}</b> · ${esc(p.region)} <span class="pill ${p.certainty}">${p.certainty}</span></p><p>${esc(p.note)}</p>`;
      if (p.today) body += `<h3>Today</h3><figure class="today">${p.today.img ? `<img src="${esc(p.today.img)}" alt="${esc(p.today.credit.split(". Photo")[0])}" loading="lazy" data-today onerror="this.remove()">` : ""}<div class="tx"><p>${esc(p.today.text)}</p>${p.today.credit ? `<p class="credit">${esc(p.today.credit)} · <a href="${esc(p.today.source)}" target="_blank" rel="noopener">file page</a></p>` : ""}</div></figure>`;
      const here = EVENTS.map((x, i) => [x, i]).filter(([x]) => x.place === e.place);
      body += `<h3>Events here</h3>` + here.map(([x, i]) => `<p class="echo"><a href="#" data-go="${i}" style="color:var(--lapis)">${esc(x.title)}</a> · ${esc(x.date)}</p>`).join("");
      body += `<p class="credit">Certainty: Certain means the site is securely identified; Probable means scholars broadly agree; Traditional means the location rests on early Church tradition.</p>`;
    }
    folio.innerHTML = `<div class="folio-head">
      <div class="eyebrow"><span class="lane">${esc(lane.name)}</span><span>·</span><span>${esc(e.date)}</span><span>·</span><span>${esc(p.name)}</span>${e.harmony ? `<span>·</span><span title="Section in A. T. Robertson, A Harmony of the Gospels (1922)">Harmony ${esc(e.harmony)}</span>` : ""}</div>
      <h2>${esc(e.title)}</h2>${e.basis ? `<span class="basis" data-b="${esc(e.basis)}" title="How firm the witness is: Scripture, early tradition (recorded by the 2nd to 5th centuries), or later legend">${esc(e.basis)}</span>` : ""}
      <div class="gospels">${G.map(([k, n]) => `<span class="gchip ${e.gospels[k] ? "on" : ""}">${e.gospels[k] ? `<b>${n}</b> ${esc(e.gospels[k])}` : n}</span>`).join("")}</div>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-tab="${k}" aria-selected="${tab === k}">${n}</button>`).join("")}</div>
    </div><div class="folio-body">${body}</div>`;
    folio.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { tab = b.dataset.tab; renderFolio(e); });
    folio.querySelectorAll(".par-open").forEach(b => b.onclick = () => openParallels(e, b));
    folio.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => openExplainer(b.dataset.ex, b));
    folio.querySelectorAll("[data-go]").forEach(a => a.onclick = ev => { ev.preventDefault(); go(+a.dataset.go); });
    folio.querySelectorAll("img[data-zoom]").forEach(img => img.onclick = () => {
      const a = e.art[+img.dataset.zoom];
      openLightbox({ img: a.img, alt: `${a.title}, ${a.artist}`, kind: a.kind, title: a.title, by: `${a.artist} · ${a.year} · ${a.medium}`,
        fields: [["Where now", a.location], ["Shows", a.description], ["Significance", a.significance], ["Symbolism", a.symbolism], ["Impact", a.impact]], credit: a.credit, source: a.source }, img);
    });
    folio.querySelectorAll("img[data-today]").forEach(img => img.onclick = () => openLightbox({ img: p.today.img, alt: img.alt, kind: "Today", title: p.name, text: p.today.text, credit: p.today.credit, source: p.today.source }, img));
  }

  // ---------- Routes ----------
  const fc = features => ({ type: "FeatureCollection", features });
  const feat = (pts, now, color, uncertain = false) => ({ type: "Feature", properties: { now, color, uncertain }, geometry: { type: "LineString", coordinates: pts } });
  function partial(pts, f) {
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let left = seg.reduce((a, b) => a + b, 0) * f; const out = [pts[0]];
    for (let i = 0; i < seg.length; i++) {
      if (left >= seg[i]) { out.push(pts[i + 1]); left -= seg[i]; continue; }
      const t = seg[i] ? left / seg[i] : 0; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]); break;
    }
    return out.length > 1 ? out : [pts[0], pts[0]];
  }
  const setRoutes = data => { routeData = data; const s = map.getSource("routes"); if (s) s.setData(data); };
  let routeAnim = 0;
  function drawRoutes(i) {
    cancelAnimationFrame(routeAnim);
    const e = EVENTS[i], r = journeyOf(e), past = [];
    // The last few journeys stay on the map as dashed lines; older ones fade out so the map stays readable
    const trail = ["paul", "apostles", "tradition"].includes(e.lane) ? e.lane : "jesus";
    // In Holy Week the whole day so far stays drawn, whoever walked it
    (kind === "holyweek" ? EVENTS.slice(0, i).filter(x => journeyOf(x) && HWDAY.get(x) === HWDAY.get(e)) : EVENTS.slice(0, i).filter(x => journeyOf(x) && x.lane === trail).slice(-5)).forEach(x => past.push(feat(journeyOf(x), false, laneHex(x.lane))));
    if (!r) return setRoutes(fc(past));
    const color = laneHex(e.lane);
    const unc = !!e.routeUncertain;
    if (reduce) return setRoutes(fc([...past, feat(r, true, color, unc)]));
    const t0 = performance.now() + 300, dur = 1600, ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const step = now => { const t = Math.max(0, Math.min(1, (now - t0) / dur)); setRoutes(fc([...past, feat(partial(r, ease(t)), true, color, unc)])); if (t < 1) routeAnim = requestAnimationFrame(step); };
    routeAnim = requestAnimationFrame(step);
  }

  // ---------- Who ruled where ----------
  const rulersEl = document.getElementById("rulers"), rulersBtn = document.getElementById("trulers");
  function renderRulers() {
    rulersBtn.setAttribute("aria-pressed", String(rulersOn));
    rulersEl.hidden = !rulersOn;
    ["realm-fill", "realm-line"].forEach(id => map.getLayer(id) && map.setLayoutProperty(id, "visibility", rulersOn ? "visible" : "none"));
    if (!rulersOn || cur < 0) return;
    const e = EVENTS[cur], y = yearOf(e), R = rulersAt(y);
    const src = map.getSource("realms"); if (src) src.setData(realmsGeo(y));
    const groups = new Map();
    for (const [id, r] of Object.entries(R)) { const g = groups.get(r.who) || { ...r, regions: [] }; g.regions.push(REALMS[id].name); groups.set(r.who, g); }
    rulersEl.innerHTML = `<h4>Who ruled, ${esc(e.date)}</h4><div class="emp">Emperor: ${esc(emperorAt(y))}</div><ul>${[...groups.values()].map(g =>
      `<li style="--c:${RULER_COLORS[g.key]}" title="${esc(g.title)}"><i></i><div><b>${esc(g.who)}</b> · ${esc(g.regions.join(", "))}</div></li>`).join("")}</ul><div class="fine">Boundaries are approximate, after Josephus. Hover a ruler for dates.</div>`;
  }
  rulersBtn.onclick = () => { rulersOn = !rulersOn; store.set("ntmap.rulers", rulersOn ? "1" : "0"); renderRulers(); };

  // ---------- 3D hills ----------
  const t3d = document.getElementById("t3d");
  t3d.onclick = () => {
    terrainOn = !terrainOn; t3d.setAttribute("aria-pressed", String(terrainOn));
    map.setTerrain(terrainOn ? { source: "dem3d", exaggeration: 1.5 } : null);
    map.easeTo({ pitch: terrainOn ? 60 : 0, bearing: terrainOn ? map.getBearing() : 0, duration: reduce ? 0 : 900 });
  };

  // ---------- Stepping ----------
  let cur = -1;
  function go(i) {
    if (i < 0 || i >= EVENTS.length) return;
    cur = i; const e = EVENTS[i], p = PLACES[e.place];
    if (!noteEl.hidden) { noteEl.hidden = true; hidePin(); }
    Object.values(placeEls).forEach(g => g.classList.remove("active"));
    placeEls[e.place].classList.add("active"); placeEls[e.place].style.setProperty("--lc", laneColor(e.lane));
    Object.entries(placeEls).forEach(([id, g]) => g.style.zIndex = id === e.place ? "2" : "");
    drawRoutes(i);
    const r = journeyOf(e);
    const crowded = Object.values(PLACES).some(q => q !== p && Math.hypot(q.ll[0] - p.ll[0], q.ll[1] - p.ll[1]) < 0.03);
    const hw = kind === "holyweek";
    flyBounds(r || [p.ll], hw ? 14.5 : r ? 13 : e.place === "egypt" ? 8 : crowded ? 13 : 10.6);
    updateMarkers();
    markTimeline(); renderDays();
    document.getElementById("now").innerHTML = `${esc(e.title)}<span>${esc(e.date)}</span>`;
    renderFolio(e);
    renderRulers();
    evBtns[i] && evBtns[i].scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
    store.set("ntmap.cur", i);
  }
  function markTimeline() {
    const i = cur, e = EVENTS[i];
    evBtns.forEach((b, k) => { if (!b) return; b.classList.toggle("on", k === i); b.classList.toggle("done", k < i); });
    cells.forEach(c => c.classList.toggle("cur", +c.dataset.i === i));
    dateEls.forEach(d => { const k = +d.dataset.i; d.textContent = k === i ? (kind === "holyweek" ? HW_SHORT[HWDAY.get(e)] : shortDate(e.date)) : (eraAt[k] || ""); d.classList.toggle("era", k === i); });
    const pos = VIS.indexOf(i);
    document.getElementById("count").textContent = pos >= 0 ? `${pos + 1} / ${VIS.length}` : `${VIS.length} shown`;
  }
  // "Tuesday afternoon, Passion Week, AD 33" -> "AD 33"; "c. 6–4 BC" -> "6–4 BC"
  const shortDate = d => { const m = d.match(/(?:c\. )?((?:\d+[–-])?\d+ BC|AD \d+(?:[–-]\d+)?)/); return m ? m[1] : d; };
  const step = dir => { const pos = VIS.indexOf(cur); const next = pos >= 0 ? VIS[pos + dir] : (dir > 0 ? VIS.find(k => k > cur) : [...VIS].reverse().find(k => k < cur)); if (next !== undefined) go(next); };
  let timer = null;
  const playBtn = document.getElementById("play");
  function stop() { clearInterval(timer); timer = null; playBtn.textContent = "Play"; }
  const atEnd = () => cur >= VIS[VIS.length - 1];
  playBtn.onclick = () => { if (timer) return stop(); if (atEnd()) go(VIS[0]); playBtn.textContent = "Pause"; timer = setInterval(() => { if (atEnd()) return stop(); step(1); }, 4500); };
  document.getElementById("prev").onclick = () => { stop(); step(-1); };
  document.getElementById("next").onclick = () => { stop(); step(1); };
  document.addEventListener("keydown", e => {
    if (e.target.closest("input,textarea,#map") || document.querySelector(".lightbox,.compare")) return;
    if (e.key === "ArrowRight") { stop(); step(1); } if (e.key === "ArrowLeft") { stop(); step(-1); }
  });

  // ---------- Search: events, people, places, and Bible references ----------
  const BOOKS = { Matthew: ["matthew", "matt", "mt"], Mark: ["mark", "mk", "mrk"], Luke: ["luke", "lk", "luk"], John: ["john", "jn", "jhn", "joh"], Acts: ["acts", "ac"],
    Genesis: ["genesis", "gen", "gn"], Exodus: ["exodus", "exod", "ex"], Leviticus: ["leviticus", "lev"], Numbers: ["numbers", "num"], Joshua: ["joshua", "josh"],
    "1 Samuel": ["1 samuel", "1 sam", "1sam", "1 sm"], "2 Samuel": ["2 samuel", "2 sam", "2sam", "2 sm"], "2 Kings": ["2 kings", "2 kgs", "2kgs", "2 ki"],
    Psalm: ["psalm", "psalms", "ps", "psa"], Isaiah: ["isaiah", "isa", "is"], Jeremiah: ["jeremiah", "jer"], Hosea: ["hosea", "hos"], Micah: ["micah", "mic"], Malachi: ["malachi", "mal"],
    Deuteronomy: ["deuteronomy", "deut", "dt"], "1 Kings": ["1 kings", "1 kgs", "1kgs", "1 ki"], Ezekiel: ["ezekiel", "ezek", "ez"], Zechariah: ["zechariah", "zech", "zec"], Daniel: ["daniel", "dan", "dn"],
    Jonah: ["jonah", "jon"], Proverbs: ["proverbs", "prov", "prv"], Sirach: ["sirach", "sir"], Joel: ["joel"], Amos: ["amos"], Job: ["job"], Esther: ["esther", "esth"], "2 Chronicles": ["2 chronicles", "2 chr"],
    "Song of Songs": ["song of songs", "song", "song of solomon"], "1 Maccabees": ["1 maccabees", "1 macc"], "1 Corinthians": ["1 corinthians", "1 cor", "1cor"],
    Romans: ["romans", "rom", "rm"], "2 Corinthians": ["2 corinthians", "2 cor", "2cor"], Galatians: ["galatians", "gal"], Ephesians: ["ephesians", "eph"], Philippians: ["philippians", "phil", "php"],
    Colossians: ["colossians", "col"], "1 Thessalonians": ["1 thessalonians", "1 thess", "1thess", "1 thes"], "2 Thessalonians": ["2 thessalonians", "2 thess"], "2 Timothy": ["2 timothy", "2 tim", "2tim"], "1 Peter": ["1 peter", "1 pet", "1pet", "1 pt"], Revelation: ["revelation", "rev", "apocalypse"] };
  const ALIAS = {}; for (const [b, list] of Object.entries(BOOKS)) list.forEach(a => ALIAS[a] = b);
  const CODE = { Mt: "Matthew", Mk: "Mark", Lk: "Luke", Jn: "John", Acts: "Acts", Rom: "Romans", "1Cor": "1 Corinthians", "2Cor": "2 Corinthians", Gal: "Galatians", Phil: "Philippians", "1Thess": "1 Thessalonians", "2Tim": "2 Timothy", "1Pet": "1 Peter", Rev: "Revelation" };
  const normBook = s => ALIAS[s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()];
  // "Psalm 72:10–11; Isaiah 60:6" or "1:25; 2:1" (with a default book) -> [{ book, c1, v1, c2, v2 }]
  function parseRefs(str, book) {
    const out = [];
    for (let seg of String(str).split(";")) {
      seg = seg.trim().replace(/[–—]/g, "-");
      const m = seg.match(/^((?:[123]\s*)?[A-Za-z][A-Za-z.]*)\s+(.*)$/);
      if (m && normBook(m[1])) { book = normBook(m[1]); seg = m[2]; }
      const r = seg.match(/^(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
      if (!r || !book) continue;
      const c1 = +r[1], v1 = r[2] ? +r[2] : 1;
      let c2 = c1, v2 = r[2] ? v1 : 999;
      if (r[3] && r[4]) { c2 = +r[3]; v2 = +r[4]; } else if (r[3]) { if (r[2]) v2 = +r[3]; else { c2 = +r[3]; v2 = 999; } }
      out.push({ book, c1, v1, c2, v2 });
    }
    return out;
  }
  const overlaps = (a, b) => a.book === b.book && (a.c1 * 1000 + a.v1) <= (b.c2 * 1000 + b.v2) && (b.c1 * 1000 + b.v1) <= (a.c2 * 1000 + a.v2);
  const INDEX = EVENTS.map((e, i) => {
    const main = Object.entries(e.gospels).flatMap(([k, v]) => parseRefs(v, CODE[k])).concat(e.scripture.flatMap(x => parseRefs(x.ref)));
    const echo = (e.echoes || []).flatMap(x => parseRefs(x.ref));
    const p = PLACES[e.place];
    return { i, e, main, echo, title: e.title.toLowerCase(), text: [e.title, p.name, p.region, e.people.join(" "), e.summary, e.art.map(a => a.title + " " + a.artist).join(" ")].join(" ").toLowerCase() };
  });
  const fold = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  function search(q) {
    q = q.trim(); if (!q) return [];
    const refs = parseRefs(q);
    if (refs.length) {
      const res = [];
      INDEX.forEach(x => {
        if (refs.some(r => x.main.some(m => overlaps(r, m)))) res.push({ kind: "event", i: x.i, score: 3, why: "Scripture", tab: "scripture" });
        else if (refs.some(r => x.echo.some(m => overlaps(r, m)))) res.push({ kind: "event", i: x.i, score: 2, why: "Old Testament echo", tab: "scripture" });
      });
      return res.length ? res : [{ kind: "none", text: `No event on the map covers ${q} yet.` }];
    }
    const toks = fold(q).split(/\s+/).filter(t => t.length > 1 && !["the", "of", "at", "in", "and", "a"].includes(t));
    if (!toks.length) return [];
    const res = [];
    INDEX.forEach(x => {
      const t = fold(x.text), ti = fold(x.title);
      if (toks.every(k => t.includes(k))) res.push({ kind: "event", i: x.i, score: toks.filter(k => ti.includes(k)).length * 2 + 1, why: "", tab: "story" });
    });
    // Places with no event yet (e.g. Cana): fly there so the reader can still see it
    const seen = new Set(res.map(r => EVENTS[r.i].place));
    Object.entries(PLACES).forEach(([id, p]) => { if (!seen.has(id) && toks.every(k => fold(p.name).includes(k))) res.push({ kind: "place", ll: p.ll, name: p.name, note: p.note, score: 1 }); });
    CONTEXT.concat(MOUNTAINS).forEach(([n, lon, lat]) => { if (toks.some(k => fold(n).includes(k))) res.push({ kind: "place", ll: [lon, lat], name: n, score: .5 }); });
    res.sort((a, b) => b.score - a.score || (a.i ?? 99) - (b.i ?? 99));
    return res.length ? res.slice(0, 8) : [{ kind: "none", text: `Nothing matches "${q}" yet.` }];
  }
  const qEl = document.getElementById("q"), resEl = document.getElementById("results");
  let hits = [], sel = 0;
  function showResults() {
    resEl.hidden = !hits.length; qEl.setAttribute("aria-expanded", String(!!hits.length));
    resEl.innerHTML = hits.map((h, k) => {
      if (h.kind === "none") return `<li class="r-empty" role="option" aria-disabled="true">${esc(h.text)}</li>`;
      if (h.kind === "place") return `<li role="option" id="r${k}" data-k="${k}" aria-selected="${k === sel}"><span class="r-title">${esc(h.name)}</span><span class="r-meta">Place on the map${h.note ? "" : " · no event here yet"}</span></li>`;
      const e = EVENTS[h.i], lane = LANES.find(l => l.id === e.lane);
      return `<li role="option" id="r${k}" data-k="${k}" aria-selected="${k === sel}" style="--lc:${laneColor(e.lane)}"><span class="r-title">${esc(e.title)}</span><span class="r-meta"><b>${esc(lane.name)}</b> · ${esc(e.date)} · ${esc(PLACES[e.place].name)}${h.why ? " · " + h.why : ""}</span></li>`;
    }).join("");
    resEl.querySelectorAll("[data-k]").forEach(li => li.onmousedown = ev => { ev.preventDefault(); pick(+li.dataset.k); });
    const on = resEl.querySelector('[aria-selected="true"]'); qEl.setAttribute("aria-activedescendant", on ? on.id : "");
  }
  const noteEl = document.getElementById("mapnote");
  function pick(k) {
    const h = hits[k]; if (!h || h.kind === "none") return;
    stop(); hits = []; showResults(); qEl.blur();
    if (h.kind === "event") { tab = h.tab; go(h.i); return; }
    flyBounds([h.ll], 11);
    showPin(h.ll);
    noteEl.querySelector("h4").textContent = h.name;
    noteEl.querySelector("p").textContent = h.note ? h.note + " No event happens here on this map yet." : `No event happens here on this map yet. ${h.name} is shown for context.`;
    noteEl.hidden = false;
  }
  let pin = null;
  function showPin(ll) { hidePin(); const el = document.createElement("div"); el.className = "pin"; el.innerHTML = "<b></b><i></i>"; pin = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(ll).addTo(map); }
  function hidePin() { if (pin) { pin.remove(); pin = null; } }
  noteEl.querySelector("button").onclick = () => { noteEl.hidden = true; hidePin(); };
  qEl.addEventListener("input", () => { hits = search(qEl.value); sel = 0; showResults(); });
  qEl.addEventListener("focus", () => { if (qEl.value.trim()) { hits = search(qEl.value); showResults(); } });
  qEl.addEventListener("blur", () => setTimeout(() => { hits = []; showResults(); }, 120));
  qEl.addEventListener("keydown", ev => {
    const n = hits.filter(h => h.kind !== "none").length;
    if (ev.key === "ArrowDown" && n) { ev.preventDefault(); sel = (sel + 1) % n; showResults(); }
    else if (ev.key === "ArrowUp" && n) { ev.preventDefault(); sel = (sel - 1 + n) % n; showResults(); }
    else if (ev.key === "Enter") { ev.preventDefault(); pick(sel); }
    else if (ev.key === "Escape") { qEl.value = ""; hits = []; showResults(); }
  });

  // ---------- Base map switch: satellite, terrain, or parchment ----------
  const bmButtons = document.querySelectorAll("#basemaps [data-bm]");
  function markBasemap(k) {
    ["sat", "terrain", "parchment"].forEach(x => mapwrap.classList.toggle("bm-" + x, x === k));
    bmButtons.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.bm === k)));
  }
  async function setBasemap(k) {
    if (k === bm) return;
    bm = k; markBasemap(k); store.set("ntmap.basemap", k);
    const s = await styleFor(k); if (bm !== k) return;
    map.setStyle(s, { diff: false });
  }
  markBasemap(bm);
  bmButtons.forEach(b => b.onclick = () => setBasemap(b.dataset.bm));

  // Holy Week day strip: jump to the first event of each day
  const daysEl = document.getElementById("days");
  function renderDays() {
    daysEl.hidden = kind !== "holyweek"; if (daysEl.hidden) return;
    const day = cur >= 0 ? HWDAY.get(EVENTS[cur]) : -1;
    daysEl.innerHTML = HW_DAYS.map((n, d) => { const first = VIS.find(i => HWDAY.get(EVENTS[i]) === d); return first === undefined ? "" : `<button data-go="${first}" aria-pressed="${d === day}">${n}<small>${VIS.filter(i => HWDAY.get(EVENTS[i]) === d).length}</small></button>`; }).join("");
    daysEl.querySelectorAll("button").forEach(b => b.onclick = () => { stop(); go(+b.dataset.go); });
  }

  // ---------- Gospel lens and kind filter ----------
  const KINDS = { miracles: ["miracle", "healing", "nature-miracle", "raising", "exorcism"], parables: ["parable"], teaching: ["teaching", "sermon"], passion: ["passion"], appearances: ["appearance"] };
  const LENSES = { all: "All", Mt: "Matthew", Mk: "Mark", Lk: "Luke", Jn: "John", Acts: "Acts", beyond: "Beyond Acts" };
  const KINDNAMES = { all: "Everything", miracles: "Miracles", parables: "Parables", teaching: "Teaching", holyweek: "Holy Week", passion: "Passion", appearances: "Risen Lord" };
  let lens = store.get("ntmap.lens", "all"), kind = store.get("ntmap.kind", "all");
  if (!LENSES[lens]) lens = "all"; if (!KINDNAMES[kind]) kind = "all";
  const passes = (e, l, k) => (l === "all" || (l === "beyond" ? !!e.basis : !e.basis && e.gospels[l])) && (k === "all" || (k === "holyweek" ? HWDAY.has(e) : (e.tags || []).some(t => KINDS[k].includes(t))));
  const lensEl = document.getElementById("lens"), kindEl = document.getElementById("kinds");
  function renderFilters() {
    lensEl.innerHTML = Object.entries(LENSES).map(([k, n]) => `<button data-lens="${k}" aria-pressed="${lens === k}">${n}<small>${EVENTS.filter(e => passes(e, k, kind)).length}</small></button>`).join("");
    kindEl.innerHTML = Object.entries(KINDNAMES).map(([k, n]) => `<button data-kind="${k}" aria-pressed="${kind === k}">${n}<small>${EVENTS.filter(e => passes(e, lens, k)).length}</small></button>`).join("");
    lensEl.querySelectorAll("button").forEach(b => b.onclick = () => { lens = b.dataset.lens; store.set("ntmap.lens", lens); applyFilter(); });
    kindEl.querySelectorAll("button").forEach(b => b.onclick = () => { kind = b.dataset.kind; store.set("ntmap.kind", kind); applyFilter(); });
  }
  function applyFilter(first) {
    VIS = EVENTS.map((_, i) => i).filter(i => passes(EVENTS[i], lens, kind));
    if (!VIS.length) { kind = "all"; VIS = EVENTS.map((_, i) => i).filter(i => passes(EVENTS[i], lens, kind)); }
    renderFilters(); buildTimeline();
    if (first) return;
    stop();
    if (!VIS.includes(cur)) go(VIS.find(k => k > cur) ?? VIS[VIS.length - 1]);
    else { markTimeline(); evBtns[cur] && evBtns[cur].scrollIntoView({ block: "nearest", inline: "center" }); }
  }

  // Start
  updateMarkers();
  applyFilter(true);
  let start = Math.max(0, Math.min(EVENTS.length - 1, +store.get("ntmap.cur", 0) || 0));
  if (!VIS.includes(start)) start = VIS.find(k => k > start) ?? VIS[0];
  go(start);
})();
