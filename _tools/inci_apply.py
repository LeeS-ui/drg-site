import sys,json,glob,re
sys.path.insert(0,'_tools')
from inci_lib import *
M=json.load(open('_tools/inci_map.json',encoding='utf8'))
n=0;tok=0
for f in glob.glob('site/our-products/*/index.html'):
    h=open(f,encoding='utf8').read();b=blocks(h)
    if not b:continue
    seg=h[b[0]:b[1]]
    def rep(m):
        global tok
        t=m.group(1)
        if not re.search(r'[A-Z]{3,}',t):return m.group(0)
        lead=re.match(r'^[\s,]*',t).group(0);trail=re.search(r'[\s,]*$',t).group(0)
        out=[]
        for p in split(t.strip(' ,')):
            pre,core,suf=norm(p)
            if core in M:
                tok+=1;out.append(pre+M[core]+suf)
            else:out.append(p)
        return '>'+lead+', '.join(out)+trail+'<'
    new=re.sub(r'>([^<>]+)<',rep,seg)
    if new!=seg:
        open(f,'w',encoding='utf8').write(h[:b[0]]+new+h[b[1]:]);n+=1
print(n,tok)
