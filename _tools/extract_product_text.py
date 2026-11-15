import glob,re,json,html,sys
# 제품 상세 페이지의 한글 본문 텍스트 노드(30자 이상) 추출
texts={}
for p in sorted(glob.glob('site/our-products/*/index.html')):
    h=open(p,encoding='utf8').read()
    if 'product-summary' not in h: continue
    body=h[h.find('<main'):h.find('</main>')]
    for m in re.finditer(r'>([^<>]{25,})<',body):
        t=m.group(1)
        if re.search(r'[가-힣]',t) and not re.search(r'^[A-Z0-9 ,/()\-\.%&;]+$',t):
            texts.setdefault(t,[]).append(p.replace(chr(92),'/').split('/')[2])
print(len(texts), sum(len(t) for t in texts))
json.dump({t:v[0] for t,v in texts.items()},open('_tools/product_texts.json','w',encoding='utf8'),ensure_ascii=False)
