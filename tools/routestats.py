"""Distance and climb for every drawn route, from AWS Terrain Tiles elevation data.

Run from the repo root: python3 tools/routestats.py  (writes js/routestats.js; tiles cache in .cache/)
Keys: "from>to" for ROUTES in js/data.js, "@<eventId>" for events in content/*.json that carry a route.
"""
import json, re, math, os, glob, urllib.request
import numpy as np
from PIL import Image

src = open('js/data.js').read()
routes = json.loads(re.search(r'const ROUTES = (\{.*?\n\});', src, re.S).group(1))
for f in sorted(glob.glob('content/*.json')):
    for e in json.load(open(f)).get('events', []):
        if e.get('route'):
            routes['@' + e['id']] = e['route']

cache = {}
def tile(z, x, y):
    if (z, x, y) in cache: return cache[(z, x, y)]
    os.makedirs(f'.cache/terr{z}', exist_ok=True)
    f = f'.cache/terr{z}/{x}_{y}.png'
    if not os.path.exists(f):
        b = urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png', timeout=60).read()
        open(f, 'wb').write(b)
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float64)
    cache[(z, x, y)] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    return cache[(z, x, y)]

def elev(z, lon, lat):
    n = 2 ** z
    fx = (lon + 180) / 360 * n; s = math.sin(math.radians(lat))
    fy = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    tx, ty = int(fx), int(fy)
    return tile(z, tx, ty)[min(int((fy - ty) * 256), 255), min(int((fx - tx) * 256), 255)]

# The Jordan Valley and Dead Sea are really below sea level; anywhere else, below sea level means open water
in_rift = lambda lon, lat: 35.3 <= lon <= 35.7 and 30.9 <= lat <= 33.3

def hav(a, b):
    R = 3958.8; la1, la2 = map(math.radians, (a[1], b[1])); dl = math.radians(b[0] - a[0])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))

out = {}
for k, pts in routes.items():
    total = sum(hav(a, b) for a, b in zip(pts, pts[1:]))
    z, step = (12, 0.06) if total < 120 else (10, 0.25)
    d = [0.0]; samples = []
    for a, b in zip(pts, pts[1:]):
        L = hav(a, b); n = max(1, int(L / step))
        for i in range(n):
            t = i / n; samples.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, d[-1] + L * t))
        d.append(d[-1] + L)
    samples.append((pts[-1][0], pts[-1][1], d[-1]))
    raw = [elev(z, x, y) for x, y, _ in samples]
    sea = [r < -450 or (r <= 0 and not in_rift(x, y)) for r, (x, y, _) in zip(raw, samples)]
    el = np.array([0.0 if s else r for r, s in zip(raw, sea)]); dist = np.array([s[2] for s in samples])
    # smooth over ~1.5 miles to drop DEM noise, then count only rises and falls of 25 m or more
    w = max(1, int(1.5 / step)); el_s = np.convolve(np.pad(el, (w // 2, w - 1 - w // 2), mode='edge'), np.ones(w) / w, mode='valid')
    up = dn = 0.0; ref = el_s[0]
    for v in el_s:
        if v - ref >= 25: up += v - ref; ref = v
        elif ref - v >= 25: dn += ref - v; ref = v
    ft = 3.28084
    out[k] = {"mi": round(d[-1]), "up": int(round(up * ft, -2)), "down": int(round(dn * ft, -2)), "hi": int(round(el_s.max() * ft, -1)), "lo": int(round(el_s.min() * ft, -1)),
              "sea": round(sum(sea) / len(sea), 2), "profile": [round(float(np.interp(t, dist, el_s)) * ft) for t in np.linspace(0, dist[-1], 60)]}

open('js/routestats.js', 'w').write('// Distance and climb along each drawn route, measured from elevation data (AWS Terrain Tiles).\n// Feet and miles; "sea" is the share of the route over open water. Built by tools/routestats.py.\nconst ROUTE_STATS = {\n'
    + ',\n'.join(f'  {json.dumps(k)}: {json.dumps(v, separators=(",", ":"))}' for k, v in out.items()) + '\n};\n')
print(len(out), 'routes')
