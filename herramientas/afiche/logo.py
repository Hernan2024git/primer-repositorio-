# Logo para incrustar en afiche.html: sin el halo oscuro del recorte, recortado a su borde visible
# (así el pin queda alineado en la línea de 56 px) y a 3× del tamaño en pantalla (96 px → 288 px de alto).
import os
import sys
from PIL import Image
ORIGEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../concurso/img/logo-maule-gps.png')
SALIDA = sys.argv[1] if len(sys.argv) > 1 else 'logo-afiche.png'
im = Image.open(ORIGEN).convert('RGBA')
r, g, b, a = im.split()
# Alfa bajo (< 40) = halo turbio del recorte; entre 40 y 72 se suaviza para no dejar un borde duro
a = a.point(lambda v: 0 if v < 40 else (255 * (v - 40) // 32 * v // 255 if v < 72 else v))
im = Image.merge('RGBA', (r, g, b, a))
caja = a.point(lambda v: 255 if v >= 64 else 0).getbbox()
im = im.crop(caja)
alto = 288
im = im.resize((round(im.width * alto / im.height), alto), Image.LANCZOS)
# Paleta de 256 colores con transparencia: ~25 KB en vez de 343 KB (afiche.html carga más rápido en el celular)
im = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.NONE)
im.save(SALIDA, optimize=True)
print(SALIDA, im.size, caja)
