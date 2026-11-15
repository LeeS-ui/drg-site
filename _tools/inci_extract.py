import re,glob,json
def block(h):
    i=h.find('전성분')
    if i<0:return None
    # text-node region after label until next label
    j=h.find('<label',i+10)
    k=h.find('<input',i)
    return i,(j if j>0 else i+6000)
pieces={}
for f in glob.glob('site/our-products/*/index.html'):
    h=open(f,encoding='utf8').read()
    b=block(h)
    if not b:continue
    seg=h[b[0]:b[1]]
    for m in re.finditer(r'>([^<>]+)<',seg):
        t=m.group(1)
        if re.search(r'[A-Z]{3,}',t):
            for p in re.split(r',\s*',t.strip()):
                if p:pieces.setdefault(p,0)
print(len(pieces))
json.dump(list(pieces),open('_tools/inci_all.json','w',encoding='utf8'),ensure_ascii=False,indent=0)
