"""Arma la página del concurso para Google Apps Script y el código que la sirve y guarda las inscripciones.

Toma concurso/index.html, le incrusta tipografías, logo y autos (Google no puede leer archivos sueltos) y la
deja en concurso/pagina-google.html, que Apps Script descarga de GitHub. El código de servidor.gs queda corto.

Uso:
  python3 herramientas/concurso-google/construir.py                      -> concurso/google-apps-script.gs (clave de ejemplo)
  python3 herramientas/concurso-google/construir.py SALIDA CLAVE [ID]    -> copia lista para pegar, con tu clave
"""
import base64
import io
import os
import re
import sys

from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
CONCURSO = os.path.join(AQUI, '..', '..', 'concurso')


def data_uri(ruta, tipo):
    with open(ruta, 'rb') as f:
        return 'data:%s;base64,%s' % (tipo, base64.b64encode(f.read()).decode())


def autos_webp():
    # La fila de autos en WebP con transparencia: pesa la cuarta parte que el PNG
    im = Image.open(os.path.join(CONCURSO, 'img', 'vehiculos-fila.png'))
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=86, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def pagina():
    html = open(os.path.join(CONCURSO, 'index.html'), encoding='utf-8').read()
    css = open(os.path.join(CONCURSO, 'marca.css'), encoding='utf-8').read()
    css = re.sub(r"url\('fonts/([^']+)'\)",
                 lambda m: "url('%s')" % data_uri(os.path.join(CONCURSO, 'fonts', m.group(1)), 'font/woff2'), css)
    html = re.sub(r'<link rel="preload"[^>]*fonts/[^>]*>\s*', '', html)
    html, n = re.subn(r'<link rel="stylesheet" href="marca\.css">', lambda m: '<style>\n' + css + '\n</style>', html)
    assert n == 1, 'no encontré el link a marca.css'
    html = html.replace('src="img/logo-maule-gps.png"',
                        'src="%s"' % data_uri(os.path.join(AQUI, '..', 'afiche', 'logo-afiche.png'), 'image/png'))
    html = html.replace('src="img/vehiculos-fila.png"', 'src="%s"' % autos_webp())
    assert 'img/' not in re.sub(r'data:[^"\')]+', '', html), 'quedó una imagen sin incrustar'
    # Datos que pone el servidor: de dónde llegó la persona y la dirección pública de la página
    html, n = re.subn(r'<script>\n/\* =====',
                      lambda m: '<script>window.CONCURSO_ORIGEN = "__CONCURSO_ORIGEN__"; '
                                'window.CONCURSO_URL = "__CONCURSO_URL__";</script>\n' + m.group(0), html, count=1)
    assert n == 1, 'no encontré el script principal'
    return html


URL_PAGINA = ('https://raw.githubusercontent.com/Hernan2024git/primer-repositorio-/'
              'refs/heads/claude/affectionate-noether-0ce4z1/concurso/pagina-google.html')


def construir(salida, clave='CAMBIA-ESTA-CLAVE', id_planilla=''):
    # 1) La página con todo incrustado, que Google descarga de GitHub
    destino = os.path.join(CONCURSO, 'pagina-google.html')
    with open(destino, 'w', encoding='utf-8') as f:
        f.write(pagina())
    print('ok', os.path.normpath(destino), '%d KB' % (os.path.getsize(destino) // 1024))
    # 2) El código para Apps Script (corto: guarda inscripciones y sirve la página)
    servidor = open(os.path.join(AQUI, 'servidor.gs'), encoding='utf-8').read()
    codigo = (servidor.replace('@@CLAVE@@', clave)
                      .replace('@@ID_PLANILLA@@', id_planilla)
                      .replace('@@URL_PAGINA@@', URL_PAGINA))
    assert '@@' not in codigo, 'quedó una marca sin reemplazar'
    with open(salida, 'w', encoding='utf-8') as f:
        f.write(codigo)
    print('ok', os.path.normpath(salida), '%d KB' % (len(codigo.encode()) // 1024))


if __name__ == '__main__':
    if len(sys.argv) > 1:
        construir(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else '')
    else:
        construir(os.path.join(CONCURSO, 'google-apps-script.gs'))
