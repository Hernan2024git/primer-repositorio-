/**
 * Concurso Maule GPS — guarda las inscripciones en Google Sheets.
 *
 * Este archivo NO se sube a tu página web. Se pega en Google Sheets:
 *   1. Crea una planilla nueva en Google Sheets (ej: "Concurso Maule GPS").
 *   2. Menú Extensiones > Apps Script. Borra lo que aparezca y pega TODO este archivo.
 *   3. Cambia CLAVE_ADMIN (abajo) por una clave larga que solo tú conozcas.
 *   4. Guarda (ícono de disquete), elige la función "configurar" arriba y presiona Ejecutar.
 *      Google pedirá permisos: Revisar permisos > tu cuenta > Configuración avanzada >
 *      Ir a ... (no seguro) > Permitir. Es normal: el script es tuyo.
 *   5. Implementar > Nueva implementación > tipo "Aplicación web"
 *        - Ejecutar como: Yo
 *        - Quién tiene acceso: Cualquier usuario
 *      Copia la URL que termina en /exec y pégala en CONFIG.urlScript de index.html.
 *
 * Si después cambias este código: Implementar > Administrar implementaciones >
 * lápiz (editar) > Versión: "Nueva versión" > Implementar. La URL no cambia.
 */

const CLAVE_ADMIN = 'CAMBIA-ESTA-CLAVE';                // clave para cargar la lista en la tómbola
const CIERRE = new Date('2026-10-18T18:00:00-03:00');   // igual que CONFIG.cierre en index.html
const NOMBRE_HOJA = 'Participantes';
const ENCABEZADOS = ['N°', 'Fecha', 'Nombre', 'WhatsApp', 'Instagram', 'Comuna', 'Vehículo', 'Acepta ofertas', 'Origen'];

/** Ejecútala una vez desde el editor para crear la hoja y dar permisos. */
function configurar() {
  const hoja = obtenerHoja();
  SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetTimeZone('America/Santiago');
  Logger.log('Listo. Hoja "%s" con %s inscritos.', hoja.getName(), Math.max(hoja.getLastRow() - 1, 0));
}

/** Recibe una inscripción desde la página. */
function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, error: 'Datos inválidos' });
  }

  // Campo trampa: las personas no lo ven, los robots lo llenan.
  if (datos.website) return responder({ ok: true, numero: 0 });
  if (new Date() > CIERRE) return responder({ ok: false, error: 'cerrado' });

  const nombre = limpiar(datos.nombre, 80);
  const telefono = normalizarTelefono(datos.telefono);
  const instagram = normalizarInstagram(datos.instagram);
  const comuna = limpiar(datos.comuna, 40);
  const vehiculo = limpiar(datos.vehiculo, 40);
  const origen = limpiar(datos.origen, 30);

  if (nombre.length < 3 || !telefono || !instagram || !comuna || datos.sigue !== true || datos.bases !== true) {
    return responder({ ok: false, error: 'Faltan datos o no son válidos' });
  }

  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    const hoja = obtenerHoja();
    const filas = leerFilas(hoja);

    // Una participación por persona: mismo WhatsApp o mismo Instagram = ya inscrito.
    let mayor = 0;
    for (const f of filas) {
      mayor = Math.max(mayor, Number(f[0]) || 0);
      const telFila = normalizarTelefono(f[3]);
      const igFila = normalizarInstagram(f[4]);
      if (telFila === telefono || igFila === instagram) {
        return responder({ ok: true, duplicado: true, numero: f[0] });
      }
    }

    const numero = mayor + 1;
    hoja.appendRow([
      numero,
      new Date(),
      nombre,
      formatearTelefono(telefono),
      '@' + instagram,
      comuna,
      vehiculo,
      datos.ofertas === true ? 'Sí' : 'No',
      origen || 'directo',
    ]);
    return responder({ ok: true, numero: numero });
  } finally {
    candado.releaseLock();
  }
}

/**
 * GET público:  ?accion=total                         -> { ok, total, abierto }
 * GET tómbola:  ?accion=participantes&clave=TU_CLAVE  -> { ok, participantes: [...] }
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const hoja = obtenerHoja();

  if (p.accion === 'participantes') {
    if (CLAVE_ADMIN === 'CAMBIA-ESTA-CLAVE' || p.clave !== CLAVE_ADMIN) {
      return responder({ ok: false, error: 'Clave incorrecta' });
    }
    const participantes = leerFilas(hoja)
      .filter((f) => f[2])
      .map((f) => ({
        numero: f[0],
        fecha: f[1] instanceof Date ? f[1].toISOString() : String(f[1]),
        nombre: String(f[2]),
        telefono: String(f[3]),
        instagram: String(f[4]),
        comuna: String(f[5]),
        vehiculo: String(f[6]),
      }));
    return responder({ ok: true, participantes: participantes });
  }

  return responder({ ok: true, total: leerFilas(hoja).length, abierto: new Date() <= CIERRE });
}

/* ------------------------------------------------------------------ */

function obtenerHoja() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.getRange(1, 1, 1, ENCABEZADOS.length).setValues([ENCABEZADOS]).setFontWeight('bold');
    hoja.setFrozenRows(1);
    hoja.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
    hoja.getRange('D:D').setNumberFormat('@');   // el teléfono como texto
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

/** Devuelve el celular chileno como 9XXXXXXXX, o '' si no es válido. */
function normalizarTelefono(valor) {
  let d = String(valor == null ? '' : valor).replace(/\D/g, '');
  if (d.length === 11 && d.indexOf('56') === 0) d = d.slice(2);
  if (d.length === 8) d = '9' + d;
  return /^9\d{8}$/.test(d) ? d : '';
}

function formatearTelefono(d) {
  return '+56 ' + d.charAt(0) + ' ' + d.slice(1, 5) + ' ' + d.slice(5);
}

/** Devuelve el usuario de Instagram en minúsculas y sin @, o '' si no es válido. */
function normalizarInstagram(valor) {
  let u = String(valor == null ? '' : valor).trim().toLowerCase();
  u = u.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
  return /^[a-z0-9._]{1,30}$/.test(u) ? u : '';
}
