# Traspaso: concurso Maule GPS

Resumen de todo lo conversado y construido, para seguir el trabajo en otro lado (por ejemplo en Claude Desktop, en tu computador). Para continuar: abre esta carpeta en Claude Desktop y pégale este archivo como primer mensaje.

## El negocio

- **Maule GPS** (Soluciones Informáticas SpA, RUT 77.831.197-6), 4 Norte 1163, Talca. WhatsApp +56 9 7803 8759. Instagram **@maulegps**.
- Venden e instalan GPS para vehículos (ubicación en tiempo real, apagado remoto, alertas, historial). Plan mensual $3.990; instalación a domicilio ~$85.000.

## El concurso (reglas acordadas)

- Premio: **instalación de GPS gratis** (valor referencial $85.000). Hay **sorteo**: no es gratis para todos.
- Requisitos para participar:
  1. Seguir a **@maulegps** en Instagram.
  2. Subir una **historia** en Instagram etiquetando a @maulegps.
  3. Escribir **solo su usuario de Instagram** en la página (no se pide nombre, WhatsApp ni comuna).
- Fechas configuradas: inscripciones hasta el **domingo 18 de octubre de 2026 a las 18:00** (hora de Chile); sorteo en vivo por Instagram a las **20:00**. Si se cambian, hay que cambiarlas en `concurso/index.html` (CONFIG), en `herramientas/concurso-google/servidor.gs` (CIERRE) y en el afiche (`herramientas/afiche/afiche.plantilla.html`, CONFIG).
- En el sorteo se saca 1 ganador y 2 suplentes. Se revisa que el ganador siga la cuenta y haya subido la historia (las menciones llegan a los mensajes de Instagram). Al ganador se le escribe por mensaje directo de Instagram.

## Qué está hecho (carpeta `concurso/`)

| Archivo | Qué es |
|---|---|
| `index.html` | Página de inscripción (la que abre el QR). Diseño de la marca, fila de autos de los folletos, 3 pasos, cuenta regresiva, bases del concurso. |
| `pagina-google.html` | La misma página con letras e imágenes incrustadas, para servirla desde Google. Se genera con `python3 herramientas/concurso-google/construir.py`. |
| `google-apps-script.gs` | Código para Google Apps Script: muestra la página y guarda cada inscrito en la planilla (N°, fecha, Instagram, origen). Evita repetidos y cierra a la hora de cierre. |
| `admin/sorteo.html` | Tómbola para el sorteo en vivo: carga la lista desde la planilla (con la clave) o desde un CSV, saca ganador y suplentes, anula, descarga acta. |
| `admin/afiche.html` | Herramienta del afiche: escribes la dirección de la página y genera el QR; descarga PNG (normal, alta resolución, historias) e imprime A4 o 2 por hoja. |
| `img/vehiculos-fila.png` | Fila de autos (Mazda 3, Hilux, Montero, Accent) recortada de tus folletos, fondo transparente. |
| `img/logo-maule-gps.png` | Logo recortado de los folletos (conviene reemplazarlo por el archivo original para imprimir). |
| `marca.css`, `fonts/` | Colores y tipografías de la marca (Audiowide, Orbitron, Rajdhani). |
| `LEEME.md` | Guía paso a paso (parte de ella describe la versión anterior con nombre y WhatsApp). |

`herramientas/` tiene las plantillas y scripts para regenerar el afiche y el código de Google.

## Qué falta para que funcione

1. **Activar la página** (solo lo puede hacer el dueño de la cuenta de Google):
   - Abrir la planilla "Concurso Maule GPS · Inscripciones" (en tu Google Drive) > Extensiones > Apps Script.
   - Borrar lo que aparece y pegar `codigo-pagina-concurso.gs` (viene en el ZIP; es `google-apps-script.gs` con tu clave y el ID de tu planilla ya puestos).
   - Implementar > Nueva implementación > Aplicación web > Quién tiene acceso: Cualquier usuario > Implementar > Autorizar (Configuración avanzada > Ir a… > Permitir).
   - El link que termina en `/exec` **es la página del concurso**.
   - Alternativa: publicarla en tu propio sitio (por ejemplo tusitio.cl/concurso). Falta saber la dirección del sitio y dónde está hecho (WordPress, Wix, cPanel…). Con hosting PHP se puede guardar en el mismo servidor, sin Google.
2. **Poner ese link en el QR del afiche**: abrir `concurso/admin/afiche.html`, pegar la dirección y descargar los PNG / imprimir. Mientras no haya dirección real, el QR dice "QR DE MUESTRA".
3. **Probar**: inscribirse desde el celular y ver que aparezca la fila en la planilla.
4. **Día del sorteo**: abrir `concurso/admin/sorteo.html`, cargar la lista con la dirección `/exec` y la clave, sortear en vivo, revisar seguidor + historia, descargar el acta.

## Pendientes por confirmar

- Qué incluye exactamente el premio (¿equipo GPS incluido o solo la instalación?).
- Que "$3.990 PLAN MENSUAL" del afiche sea correcto para autos particulares.
- Logo original en buena calidad (PNG grande o SVG).
- Si se quieren otros autos en el afiche (por ejemplo una camioneta tipo Raptor o un deportivo), enviar las imágenes PNG y se cambian en `img/vehiculos-fila.png`.

## Dónde está todo

- Código: repositorio GitHub `Hernan2024git/primer-repositorio-`, rama `claude/affectionate-noether-0ce4z1`.
- La página que sirve Google se descarga de esa rama en GitHub (`concurso/pagina-google.html`), así que si se borra o cambia de nombre la rama, hay que actualizar `URL_PAGINA` en el código de Google.
- Pruebas automáticas usadas durante el trabajo: revisan formulario, planilla simulada, tómbola y afiche (no vienen en el repositorio).
