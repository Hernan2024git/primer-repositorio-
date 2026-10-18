/**
 * Concurso Maule GPS — página de inscripción + planilla, todo en Google.
 * (Archivo generado por herramientas/concurso-google/construir.py.)
 * La página se descarga de GitHub (concurso/pagina-google.html), así se puede actualizar sin volver a pegar este código.
 *
 * Cómo dejarlo funcionando (una sola vez, en el computador):
 *   1. Abre este proyecto en Apps Script (o pega TODO este archivo en Extensiones > Apps Script de la planilla).
 *   2. Implementar > Nueva implementación > engranaje > Aplicación web.
 *        Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier usuario   ·   Implementar.
 *   3. Google pide permiso: Autorizar acceso > tu cuenta > Configuración avanzada > Ir a … (no seguro) > Permitir.
 *   4. Copia la URL que termina en /exec. ESA es la página del concurso: ponla en el QR del afiche.
 *
 * Los inscritos quedan en la hoja "Participantes". La tómbola (admin/sorteo.html) los carga con esta misma
 * URL y la clave CLAVE_ADMIN.
 */

const CLAVE_ADMIN = '@@CLAVE@@';                         // clave para cargar la lista en la tómbola
const ID_PLANILLA = '@@ID_PLANILLA@@';                   // vacío = la planilla donde pegaste este código
const CIERRE = new Date('2026-10-18T18:00:00-03:00');    // fin de inscripciones (igual que en la página)
const URL_PAGINA = '@@URL_PAGINA@@';
const NOMBRE_HOJA = 'Participantes';
const ENCABEZADOS = ['N°', 'Fecha', 'Instagram', 'Origen'];

/** La página del concurso (o los datos para la tómbola si viene ?accion=...). */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.accion === 'participantes') {
    if (CLAVE_ADMIN === 'CAMBIA-ESTA-CLAVE' || p.clave !== CLAVE_ADMIN) return responder({ ok: false, error: 'Clave incorrecta' });
    const participantes = leerFilas(obtenerHoja())
      .filter((f) => f[2])
      .map((f) => ({
        numero: f[0],
        fecha: f[1] instanceof Date ? f[1].toISOString() : String(f[1]),
        instagram: String(f[2]),
        nombre: String(f[2]),
        origen: String(f[3]),
      }));
    return responder({ ok: true, participantes: participantes });
  }
  if (p.accion === 'total') return responder(total());

  const origen = String(p.src || p.utm_source || 'directo').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30) || 'directo';
  const html = pagina()
    .replace('__CONCURSO_ORIGEN__', origen)
    .replace('__CONCURSO_URL__', ScriptApp.getService().getUrl());
  return HtmlService.createHtmlOutput(html)
    .setTitle('Concurso Maule GPS · Instalación GPS gratis')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Lo llama la página con google.script.run al apretar "Quiero participar". */
function registrar(datos) {
  datos = datos || {};
  if (datos.website) return { ok: true, numero: 0 };                 // campo trampa: robots
  if (new Date() > CIERRE) return { ok: false, error: 'cerrado' };

  const instagram = normalizarInstagram(datos.instagram);
  const origen = limpiar(datos.origen, 30) || 'directo';
  if (!instagram || datos.sigue !== true || datos.bases !== true) return { ok: false, error: 'Faltan datos o no son válidos' };

  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    const hoja = obtenerHoja();
    const filas = leerFilas(hoja);
    let mayor = 0;
    for (const f of filas) {
      mayor = Math.max(mayor, Number(f[0]) || 0);
      if (normalizarInstagram(f[2]) === instagram) return { ok: true, duplicado: true, numero: f[0] };
    }
    const numero = mayor + 1;
    hoja.appendRow([numero, new Date(), '@' + instagram, origen]);
    return { ok: true, numero: numero };
  } finally {
    candado.releaseLock();
  }
}

/** Inscripciones desde otra página (por ejemplo la misma página publicada en GitHub Pages). */
function doPost(e) {
  let datos;
  try { datos = JSON.parse(e.postData.contents); } catch (err) { return responder({ ok: false, error: 'Datos inválidos' }); }
  return responder(registrar(datos));
}

function total() {
  return { ok: true, total: leerFilas(obtenerHoja()).length, abierto: new Date() <= CIERRE };
}

/* ------------------------------------------------------------------ */

function obtenerHoja() {
  const libro = ID_PLANILLA ? SpreadsheetApp.openById(ID_PLANILLA) : SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return hoja;
}

function leerFilas(hoja) {
  const ultima = hoja.getLastRow();
  if (ultima < 2) return [];
  return hoja.getRange(2, 1, ultima - 1, ENCABEZADOS.length).getValues();
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

/** Quita saltos de línea, recorta el largo y evita que Sheets lo trate como fórmula. */
function limpiar(texto, maximo) {
  return String(texto == null ? '' : texto)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[=+\-@]+/, '')
    .trim()
    .slice(0, maximo);
}

/** Devuelve el usuario de Instagram en minúsculas y sin @, o '' si no es válido. */
function normalizarInstagram(valor) {
  let u = String(valor == null ? '' : valor).trim().toLowerCase();
  u = u.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
  return /^[a-z0-9._]{1,30}$/.test(u) ? u : '';
}

/** Página del concurso: se descarga de GitHub y se guarda 10 minutos en caché (en trozos de 90 KB). */
function pagina() {
  const cache = CacheService.getScriptCache();
  const partes = Number(cache.get('pagina-partes')) || 0;
  if (partes) {
    const trozos = cache.getAll(Array.from({ length: partes }, (_, i) => 'pagina-' + i));
    const texto = Array.from({ length: partes }, (_, i) => trozos['pagina-' + i]).join('');
    if (Object.keys(trozos).length === partes) return texto;
  }
  const r = UrlFetchApp.fetch(URL_PAGINA, { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) {
    return '<p style="font-family:sans-serif;padding:24px">La página del concurso no está disponible en este momento. Intenta de nuevo en unos minutos.</p>';
  }
  const texto = r.getContentText('UTF-8');
  const trozos = {};
  for (let i = 0; i * 90000 < texto.length; i++) trozos['pagina-' + i] = texto.slice(i * 90000, (i + 1) * 90000);
  try {
    cache.putAll(trozos, 600);
    cache.put('pagina-partes', String(Object.keys(trozos).length), 600);
  } catch (e) { /* sin caché: igual se muestra */ }
  return texto;
}
