import re,glob
LOT=re.compile(r'^\d{7}\s*\d{2}\s*-\s*')
FIL=re.compile(r'\s*\(F\.I\.L\.?\s*T[\d/]+\)\s*$')
def split(t):
    # 쉼표+공백으로 나누되 '1,2-' 같은 숫자 쉼표는 유지
    return re.split(r',\s+',t)
def norm(p):
    p=p.strip();pre=LOT.match(p);pre=pre.group(0) if pre else ''
    p=p[len(pre):];m=FIL.search(p);suf=m.group(0) if m else ''
    core=p[:len(p)-len(suf)] if suf else p
    return pre,core.strip(),suf
def blocks(h):
    i=h.find('전성분')
    if i<0:return None
    j=h.find('<label',i+10)
    return i,(j if j>0 else i+6000)
