import glob, os, sys
from PIL import Image
for p in glob.glob(sys.argv[1] + '/*.png'):
    im = Image.open(p).convert('RGB'); im.thumbnail((1200, 1200))
    im.save(p[:-4] + '.jpg', quality=82, optimize=True); os.remove(p)
