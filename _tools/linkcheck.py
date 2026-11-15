import re,glob,os,urllib.parse
bad={};absr={};n=0
for f in glob.glob('site/**/*.html',recursive=True):
    h=open(f,encoding='utf8').read();d=os.path.dirname(f)
    for m in re.finditer(r'(?:href|src)="([^"]*)"',h):
        u=m.group(1)
        if not u or u.startswith(('http','#','mailto:','tel:','data:','javascript:')):continue
        if u.startswith('/'):absr[u.split('?')[0][:40]]=absr.get(u.split('?')[0][:40],0)+1;continue
        p=urllib.parse.unquote(u.split('#')[0].split('?')[0])
        if not p:continue
        t=os.path.normpath(os.path.join(d,p));n+=1
        if os.path.isdir(t):t=os.path.join(t,'index.html')
        if not os.path.exists(t):bad.setdefault(u[:70],[]).append(f.replace('site/','')[:30])
print('checked',n,'broken',len(bad));
for k,v in list(bad.items())[:15]:print(k,len(v),v[0])
print('abs',len(absr),list(absr.items())[:8])
