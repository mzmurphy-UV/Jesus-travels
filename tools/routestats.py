import json,re,math,os,io,urllib.request
import numpy as np
from PIL import Image
src=open('js/data.js').read()
m=re.search(r'const ROUTES = (\{.*?\n\});',src,re.S)
routes=json.loads(m.group(1))
Z=12
os.makedirs('.cache/terr12',exist_ok=True)
cache={}
def tile(x,y):
    if (x,y) in cache: return cache[(x,y)]
    f=f'.cache/terr12/{x}_{y}.png'
    if not os.path.exists(f):
        b=urllib.request.urlopen(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png',timeout=60).read()
        open(f,'wb').write(b)
    a=np.asarray(Image.open(f).convert('RGB')).astype(np.float64)
    e=a[...,0]*256+a[...,1]+a[...,2]/256-32768
    cache[(x,y)]=e; return e
def elev(lon,lat):
    n=2**Z
    fx=(lon+180)/360*n; s=math.sin(math.radians(lat))
    fy=(0.5-math.log((1+s)/(1-s))/(4*math.pi))*n
    tx,ty=int(fx),int(fy); px=(fx-tx)*256; py=(fy-ty)*256
    e=tile(tx,ty); i,j=min(int(py),255),min(int(px),255)
    return e[i,j]
def hav(a,b):
    R=3958.8; la1,la2=map(math.radians,(a[1],b[1])); dl=math.radians(b[0]-a[0])
    h=math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dl/2)**2
    return 2*R*math.asin(math.sqrt(h))
out={}
for k,pts in routes.items():
    d=[0.0];samples=[]
    for a,b in zip(pts,pts[1:]):
        L=hav(a,b); n=max(1,int(L/0.06))
        for i in range(n):
            t=i/n; samples.append((a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t, d[-1]+L*t))
        d.append(d[-1]+L)
    samples.append((pts[-1][0],pts[-1][1],d[-1]))
    el=np.array([elev(x,y) for x,y,_ in samples]); dist=np.array([s[2] for s in samples])
    # smooth over ~0.5 mile to drop DEM noise
    w=max(1,int(1.5/0.06)); el_s=np.convolve(np.pad(el,(w//2,w-1-w//2),mode='edge'),np.ones(w)/w,mode='valid')
    up=dn=0.0; ref=el_s[0]
    for v in el_s:
        if v-ref>=25: up+=v-ref; ref=v
        elif ref-v>=25: dn+=ref-v; ref=v
    up*=3.28084; dn*=3.28084
    prof=[round(float(np.interp(t,dist,el_s))*3.28084) for t in np.linspace(0,dist[-1],60)]
    out[k]={"mi":round(d[-1]),"up":int(round(up,-2)),"down":int(round(dn,-2)),"hi":int(round(el_s.max()*3.28084,-1)),"lo":int(round(el_s.min()*3.28084,-1)),"profile":prof}
    print(k,out[k]["mi"],out[k]["up"],out[k]["down"],out[k]["hi"],out[k]["lo"])
open('js/routestats.js','w').write('// Distance and climb along each drawn route, measured from elevation data (AWS Terrain Tiles).\n// Feet and miles. Built by tools/routestats.py; rebuild when ROUTES change.\nconst ROUTE_STATS = {\n'+',\n'.join(f'  {json.dumps(k)}: {json.dumps(v,separators=(",",":"))}' for k,v in out.items())+'\n};\n')
