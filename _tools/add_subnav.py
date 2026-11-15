import glob,re,os
S={'p':[('전체 제품','our-products'),('라인별 제품','product-lines')],
   's':[('고민별 관리','skin-concerns'),('성분 사전','ingredients'),('계절별 관리','seasonal-care'),('전문의 영상','expert-videos'),('피부 상식','skin-knowledge')]}
sec={'our-products':'p','product-lines':'p','skin-concerns':'s','ingredients':'s','seasonal-care':'s','expert-videos':'s','skin-knowledge':'s'}
n=0
for f in glob.glob('site/**/index.html',recursive=True):
    rel=os.path.relpath(f,'site').replace(chr(92),'/');parts=rel.split('/')[:-1]
    if not parts or parts[0] not in sec: continue
    h=open(f,encoding='utf8').read()
    h=re.sub(r'<nav class="gdr-subnav".*?</nav>\n?','',h,flags=re.S)
    if '</header>' not in h: continue
    pre='../'*len(parts);k=sec[parts[0]];a=''
    for t,d in S[k]:
        cls=' class="is-active" aria-current="page"' if parts[0]==d else ''
        a+='<a href="%s%s/index.html"%s>%s</a>'%(pre,d,cls,t)
    h=h.replace('</header>','</header>\n<nav class="gdr-subnav" aria-label="하위 메뉴"><div class="gdr-subnav__in">'+a+'</div></nav>',1)
    open(f,'w',encoding='utf8').write(h);n+=1
print(n)
