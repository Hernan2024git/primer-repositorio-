// Arma concurso/admin/afiche.html a partir de afiche.plantilla.html, incrustando todo lo que necesita
// (fuentes woff2, logo, vehículo, qrcode.js y html-to-image.js) para que funcione con doble clic y sin internet.
// Uso: node construir.js [salida]
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '../../concurso');
const salida = process.argv[2] || path.join(REPO, 'admin/afiche.html');
const plantilla = fs.readFileSync(path.join(__dirname, 'afiche.plantilla.html'), 'utf8');

const base64 = (ruta) => fs.readFileSync(ruta).toString('base64');
const dataUri = (ruta, tipo) => `data:${tipo};base64,${base64(ruta)}`;

// marca.css con cada url('fonts/x.woff2') convertida en data: URI
const marcaCss = fs.readFileSync(path.join(REPO, 'marca.css'), 'utf8')
  .replace(/url\('fonts\/([^']+)'\)/g, (_, archivo) => `url('${dataUri(path.join(REPO, 'fonts', archivo), 'font/woff2')}')`);
if (/url\('fonts\//.test(marcaCss)) throw new Error('Quedó una fuente sin incrustar');

const qrcodeJs = fs.readFileSync(path.join(REPO, 'admin/qrcode.js'), 'utf8');
const html2imgJs = fs.readFileSync(path.join(REPO, 'admin/html-to-image.js'), 'utf8').replace(/\n\/\/# sourceMappingURL=.*\s*$/, '\n');
for (const [nombre, js] of [['qrcode.js', qrcodeJs], ['html-to-image.js', html2imgJs]]) {
  if (/<\/script/i.test(js)) throw new Error(nombre + ' contiene </script>');
}

// Vehículos: la fila de autos de los folletos de Maule GPS (PNG con fondo transparente)

const reemplazos = {
  '/*@@MARCA_CSS@@*/': marcaCss.trim(),
  // Logo limpio y liviano (lo genera logo.py desde img/logo-maule-gps.png; index.html sigue usando el original)
  '@@LOGO@@': dataUri(path.join(__dirname, 'logo-afiche.png'), 'image/png'),
  '@@VEHICULO@@': dataUri(path.join(REPO, 'img/vehiculos-fila.png'), 'image/png'),
  '/*@@QRCODE_JS@@*/': qrcodeJs.trim(),
  '/*@@HTML_TO_IMAGE_JS@@*/': html2imgJs.trim(),
};
let html = plantilla;
for (const [marca, valor] of Object.entries(reemplazos)) {
  if (!html.includes(marca)) throw new Error('Falta la marca ' + marca + ' en la plantilla');
  html = html.split(marca).join(valor);   // split/join: sin interpretar "$" como en String.replace
}
if (/@@[A-Z_]+@@/.test(html)) throw new Error('Quedaron marcas sin reemplazar');
fs.writeFileSync(salida, html);
console.log('ok ' + salida + ' (' + Math.round(html.length / 1024) + ' KB)');
