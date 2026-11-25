# Simulador Subestación Termales 115 kV

Simulador académico de la **Subestación Termales 115 kV** (configuración barra principal + barra de transferencia, 7 bahías), Escuela Colombiana de Ingeniería Julio Garavito, Subestaciones Eléctricas 2026-2.

Incluye:

- **Unifilar** con maniobras, enclavamientos, maniobras guiadas (transferencia de bahías, cambio de una unidad por la AT-R) y flujo de carga de ETAP.
- **Patio 3D** según el plano de disposición física rev. 4 (25-nov-2026): pórticos G1/G2, barras, equipos de cada bahía, bancos de autotransformadores monofásicos con remate de 230 kV por unidad, rieles de la AT-R, vías, cerramiento, casa de control y portería. Capas de malla de tierra, zona protegida (Entrega 4) y cotas de diseño (Entrega 2).
- **Sala de control (IED)** según el unifilar de control G01-CNP-01: disparos 21/87L/87T/87B, 86 de bloqueo y registro de eventos.
- **Datos de equipos, aisladores, malla de tierra y apantallamiento** con los valores de las entregas finales de los Grupos 1 a 4.

## Publicar en GitHub Pages

1. Cree un repositorio nuevo en GitHub (por ejemplo `simulador-termales`).
2. Suba **todo el contenido de esta carpeta** (`index.html`, `calculos.js`, la carpeta `img/` y `.nojekyll`) a la raíz del repositorio: botón **Add file → Upload files**, arrastre los archivos y haga **Commit changes**.
3. Vaya a **Settings → Pages**, en *Build and deployment* elija **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarde.
4. En uno o dos minutos la página queda en `https://<su-usuario>.github.io/simulador-termales/`.

Para probarlo en el computador basta con abrir `index.html` en el navegador (necesita internet para cargar la librería 3D three.js y las fuentes).

## Fuentes

Entregas finales de los Grupos 1 (parámetros y coordinación de aislamiento, MP 40 %, BIL 550/750 kV), 2 (distancias de seguridad), 3 (selección de equipos), 4 (apantallamiento), plano de planta y cortes rev. 4 y unifilar de control G01-CNP-01. Norma base: RETIE 2013.
