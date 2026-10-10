# Fuente del afiche (solo para editar el diseño)

`concurso/admin/afiche.html` se genera desde estos archivos e incluye adentro las fuentes, el logo, el auto y las librerías, para que funcione con doble clic y sin internet. No hace falta subir esta carpeta a la página.

- `afiche.plantilla.html`: el diseño y el código de la herramienta.
- `construir.js`: arma `concurso/admin/afiche.html`. Uso: `node herramientas/afiche/construir.js`
- `logo.py` / `logo-afiche.png`: versión liviana del logo que va incrustada en el afiche (se regenera con `python3 herramientas/afiche/logo.py herramientas/afiche/logo-afiche.png`).

Para cambiar solo textos, precio, fecha o Instagram no hace falta nada de esto: basta con el bloque `CONFIGURACIÓN` de `concurso/admin/afiche.html`.
