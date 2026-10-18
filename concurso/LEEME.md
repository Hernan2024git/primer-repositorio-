# Concurso Maule GPS · Instalación GPS gratis

Página para que la gente se inscriba escaneando un QR, con la lista guardada en Google Sheets y una tómbola para sortear en vivo por Instagram.

| Archivo | Para qué sirve | ¿Se sube a la página? |
|---|---|---|
| `index.html` | Página pública de inscripción (la que abre el QR) | **Sí** |
| `marca.css`, `fonts/`, `img/` | Colores, letras, logo y auto de la marca que usa `index.html` | **Sí** |
| `admin/sorteo.html` | Tómbola para el día del sorteo | Sí (o ábrela desde tu computador) |
| `admin/afiche.html` | Afiche del concurso con el QR: lo descargas en PNG o lo imprimes | Sí (o ábrelo con doble clic en tu computador, funciona sin internet) |
| `admin/qr.html` | Dirección antigua del generador de QR: ahora abre `afiche.html` | Sí |
| `admin/qrcode.js`, `admin/html-to-image.js` | Copias de referencia (`afiche.html` ya las trae adentro) | No hace falta |
| `google-apps-script.gs` | Código que guarda las inscripciones en Google Sheets | **No**: se pega en Google Sheets |

---

## Paso 1 · Conectar Google Sheets (10 minutos)

1. Entra a [sheets.new](https://sheets.new) con tu cuenta de Google y ponle un nombre, por ejemplo *Concurso Maule GPS*.
2. Menú **Extensiones › Apps Script**. Borra lo que aparece y pega todo el contenido de `google-apps-script.gs`.
3. Arriba, en `CLAVE_ADMIN`, cambia `CAMBIA-ESTA-CLAVE` por una clave larga que solo tú conozcas (la usarás en la tómbola).
4. Guarda (ícono de disquete). En la lista de funciones elige **configurar** y presiona **Ejecutar**.
   Google pedirá permisos: *Revisar permisos › tu cuenta › Configuración avanzada › Ir a … (no seguro) › Permitir*. Es normal, porque el script es tuyo.
5. **Implementar › Nueva implementación**. En el engranaje elige **Aplicación web** y configura:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Copia la **URL de la aplicación web** (termina en `/exec`).

> Si después cambias el código del script: *Implementar › Administrar implementaciones › lápiz › Versión: Nueva versión › Implementar*. La URL no cambia.

## Paso 2 · Configurar la página

Abre `index.html` con cualquier editor de texto y busca el bloque `CONFIGURACIÓN` (cerca del final). Lo mínimo que tienes que cambiar es esto:

- `urlScript`: pega la URL del paso 1. **Mientras esté vacío, la página funciona en MODO PRUEBA y no guarda nada** (verás una franja amarilla arriba).
- `instagram`: tu usuario de Instagram, sin @.
- `cierre` y `sorteo`: la fecha y hora en que se cierran las inscripciones y en que se hace el sorteo. Por defecto el cierre es el lunes 19 de octubre a las 18:00 y el sorteo ese mismo día a las 20:00.
- `premio` y `valorPremio`: qué incluye exactamente el premio.

Si cambias la fecha de cierre, cámbiala también en `CIERRE` dentro del Apps Script, y la del sorteo en `sorteo` dentro de `admin/afiche.html`.

Si cambias `instagram` o `whatsapp`, cámbialos también en el bloque `CONFIGURACIÓN` de `admin/afiche.html` (el afiche tiene su propia copia de esos datos).

Si cambias `CONFIG.whatsapp`, cambia también el número y el enlace `tel:` del pie en `index.html` (están escritos a mano, no se actualizan solos).

Las bases del concurso se arman solas con estos datos. Para leerlas, abre "Bases del concurso" al final de la página.

## Paso 3 · Publicarla en tu página (sin tocar el DNS)

La idea es que quede en una dirección como `https://tusitio.cl/concurso/`.

- **Si tienes hosting con cPanel o FTP:** dentro de `public_html` crea la carpeta `concurso` y sube `index.html`, `marca.css` y las carpetas `admin`, `fonts` e `img`.
- **Si tu página es WordPress con acceso al hosting:** haz lo mismo que en el punto anterior. WordPress no se ve afectado.
- **Si tu página es WordPress.com, Wix o similar, sin acceso a los archivos:** esos planes normalmente no permiten subir páginas propias. La alternativa gratuita es GitHub Pages desde este mismo repositorio: *Settings › Pages › Deploy from branch*. En el plan gratis, el repositorio tiene que ser público. Así la página queda en `https://hernan2024git.github.io/primer-repositorio-/concurso/`, y desde tu sitio pones un botón que enlace ahí.

## Paso 4 · Probar antes de lanzar

1. Abre la página en tu celular, inscríbete y revisa que aparezca la fila en la hoja **Participantes**.
2. Inscríbete otra vez con el mismo número: debe decirte "ya estabas participando".
3. Abre `admin/sorteo.html`, carga la lista con la URL y la clave, y haz un sorteo de práctica.
4. **Borra las filas de prueba** de la planilla antes de difundir.

## Paso 5 · Afiche y QR

Abre `admin/afiche.html`. Funciona desde tu página publicada (`https://tusitio.cl/concurso/admin/afiche.html`) y también con doble clic en tu computador, sin internet.

1. En **Dirección de la página del concurso** escribe la dirección donde quedó publicado el concurso, por ejemplo `https://tusitio.cl/concurso/` (con tu sitio). Si abres la herramienta desde tu página ya publicada, la dirección aparece sola.
2. Mira el afiche (en el computador está a la derecha; en el celular, debajo de la dirección). **Mientras el QR diga «QR DE MUESTRA», todavía falta la dirección real**: ese sello se quita solo cuando escribes la dirección pública real (no la de ejemplo ni una de tu computador o red local). Si la dirección empieza con `http://` verás un aviso.
3. Escanea con tu celular el QR que se ve en la pantalla y revisa que abra la página del concurso (si estás usando el celular, descarga el PNG y escanéalo desde otra pantalla).

La dirección que escribes en la herramienta no queda guardada. Para que quede guardada al abrirlo con doble clic, escríbela en `urlConcurso` dentro de `CONFIGURACIÓN` (con `https://`). El pie del afiche dice dónde están las bases (`Bases en tusitio.cl/concurso`), como pide la Ley del Consumidor: sale solo a partir de esa misma dirección.

Después usa los botones:

- **Descargar afiche PNG (1080×1920):** para mandarlo por chat o publicarlo.
- **PNG alta resolución (2160×3840):** para imprimir en grande o mandarlo a la imprenta.
- **PNG para historias de Instagram y estados de WhatsApp:** el mismo afiche un poco más chico, para que las barras de Instagram (tu perfil arriba, «Enviar mensaje» abajo) no tapen el logo ni el teléfono, y con «Toca el link de nuestra bio» en vez de «Escanea el código QR» (quien lo ve en su celular no puede escanear su propia pantalla). Pon el link del concurso en tu bio o usa el sticker de enlace.
- **PNG para imprenta a 10 × 17,8 cm con sangrado de 3 mm:** solo si la imprenta te pide «sangrado». Los 3 mm son a ese tamaño (el archivo trae anotado su tamaño de impresión); para otro tamaño pide a la imprenta que lo ajuste o usa el PNG de alta resolución.
- **Imprimir afiche A4:** una hoja A4 con el afiche de 28 cm de alto, centrado, y el fondo oscuro hasta el borde (los 8 mm de arriba y abajo son solo fondo, así la impresora de casa no corta nada). En la ventana de impresión activa **Gráficos de fondo** y elige márgenes **Ninguno**. Para una imprenta es mejor el PNG de alta resolución o el de sangrado.
- **Imprimir 2 por hoja A4 (para recortar):** dos afiches de 10 × 17,8 cm en una hoja horizontal, con marcas para recortar.
- **Descargar solo el QR (PNG o SVG):** para stickers o flyers. Para la imprenta usa el SVG, que se ve nítido en cualquier tamaño. Estos botones se activan cuando la dirección es la real.
- **Cambiar imagen del vehículo** y **Cambiar logo:** por si quieres usar otra foto. Usa una imagen sin fondo (PNG) o con fondo negro. **Volver a las imágenes originales** deshace el cambio.

Para cambiar el precio, la fecha del sorteo, el Instagram, el teléfono o los textos, abre `admin/afiche.html` con un editor de texto y cambia el bloque `CONFIGURACIÓN` que está al principio. Lo que va entre `*asteriscos*` sale destacado en color.

> Antes de imprimir:
> - Confirma que **@maulegps** es tu Instagram (sale en el afiche y es requisito para participar) y que la fecha del sorteo es la correcta (lunes 19 de octubre).
> - Imprime una hoja de prueba y escanea el A4 (QR de unos 49 mm) y un afiche recortado de 2 por hoja (QR de unos 31 mm) con un iPhone y con un Android.
> - Si tienes el logo en mejor calidad (SVG o PNG de 1000 px o más de alto), úsalo con **Cambiar logo**: el que viene está recortado de un afiche antiguo.

El QR agrega `?src=qr` a la dirección, así en la columna **Origen** de la planilla ves cuántos llegaron escaneando. Usa la misma idea en otros lados, por ejemplo `?src=ig` en el link de la bio de Instagram o `?src=wa` en los estados de WhatsApp. Quienes invitan a un amigo desde la página quedan con `?src=amigo`.

---

## El día del sorteo

1. Abre `admin/sorteo.html` en el computador y carga la lista desde Google Sheets (o descarga la planilla como CSV y súbela).
2. Haz una prueba con la pestaña **Ensayo** si quieres practicar, y después vuelve a cargar la lista real (el aviso amarillo de ENSAYO debe desaparecer).
3. Inicia el en vivo de Instagram y presiona **Sortear ganador/a**.
4. Revisa en tu lista de seguidores que la persona te siga:
   - Si te sigue: **Confirmar**.
   - Si no te sigue: **Anular** y sortear de nuevo.
5. Sigue con los suplentes.
6. Presiona **Descargar acta del sorteo** y guarda el archivo como respaldo.
7. Usa el botón **WhatsApp** para escribirle al ganador. El mensaje ya va escrito.

En pantalla el teléfono aparece oculto (`+56 9 •••• 1234`), así que puedes transmitir sin mostrar datos personales. Si recargas la página por error, el sorteo en curso no se pierde.

## Recomendaciones

- **Instagram no permite comprobar automáticamente quién te sigue.** Por eso la página pide el usuario y una casilla de "ya sigo", y el seguimiento se revisa en vivo al momento del sorteo. Eso ya está explicado en las bases.
- **Sortea 1 ganador y 2 suplentes.** Si el ganador no responde en 2 días, el premio pasa al siguiente. Así no hay que repetir el sorteo.
- **Haz el sorteo en vivo.** Da confianza y te trae seguidores nuevos ese mismo día.
- **Aprovecha la lista después del concurso.** Quienes marcaron "quiero recibir ofertas" son clientes potenciales. Puedes dejar un regalo para todos los que participan (por ejemplo, un descuento en la instalación) con `beneficioParticipar` en `index.html`. Ese texto aparece al inscribirse.
- **Deja las bases visibles.** La Ley del Consumidor (art. 35, Ley 19.496) exige informar las bases y la duración de toda promoción. Ya vienen en la página.
- **El contador "Ya participan N personas"** aparece solo cuando hay 25 o más inscritos, para que no se vea vacío al principio. Lo cambias con `mostrarContadorDesde`.
