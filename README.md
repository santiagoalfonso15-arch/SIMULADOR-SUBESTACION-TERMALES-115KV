# Simulador Subestación Termales 115 kV

Simulador académico de la **Subestación Termales 115 kV** (configuración barra principal + barra de transferencia, 7 bahías), Escuela Colombiana de Ingeniería Julio Garavito, Subestaciones Eléctricas 2026-2.

Incluye:

- **Unifilar** con maniobras, enclavamientos, maniobras guiadas (transferencia de bahías, cambio de una unidad por la AT-R) y flujo de carga de ETAP.
- **Patio 3D** según el plano de disposición física rev. 4 (25-nov-2026): pórticos G1/G2, barras de cable AAC 2500 kcmil, cadenas de 17 discos ANSI 52-3, equipos de cada bahía, bancos de autotransformadores monofásicos con remate de 230 kV por unidad, rieles de la AT-R, vías, cerramiento, casa de control y portería. Capas de malla de tierra (diseño final de la Entrega 4), zona protegida y cotas de diseño.
- **Sala de control (IED)** según el unifilar de control G01-CNP-01: disparos 21/87L/87T/87B, 86 de bloqueo y registro de eventos.
- **Datos de equipos** (DTB 145PM40SD, SDF145, POF, 3EL2 096-2PQ3), **coordinación de aislamiento y cadenas**, **malla de puesta a tierra** y **apantallamiento**, con los valores del informe final.

### Malla de puesta a tierra

La pestaña *Malla de tierra* reproduce la memoria de la Entrega 4 (numeral 7, versión corregida) y el Capítulo 11 del informe final:

- S<sub>f</sub> = 1 (criterio del docente), I<sub>F</sub> = 30 kA asimétrica, X/R = 30, D<sub>f</sub> = 1,039, C<sub>p</sub> = 1,05 → I<sub>G</sub> = 31 500 A.
- Grava de 8534,4 Ω·m con 0,35 m; terreno tratado con FAVIGEL (80 Ω·m en 3 m sobre 100 Ω·m); 50 kg; t<sub>s</sub> = 1 s → tolerables de 1433,4 V (toque) y 5385,6 V (paso).
- Diseño final: retícula base de 20 × 19 conductores en todo el lote de 108,30 × 116,00 m, zona de equipos de 66 × 77 m con retícula de unos 3 m, refuerzos de 9 × 9 m en las esquinas, 40 varillas de 3 m y 15 de 2,75 m, cobre blando de 250 kcmil a 0,75 m.
- Verificación IEEE 80 (ρ = 100 Ω·m, D = 5,70 m): R<sub>g</sub> = 0,405 Ω, E<sub>m</sub> = 1077 V, E<sub>s</sub> = 964 V; validación con ETAP (0,381 Ω, 1370,4 V, 770,3 V) y con el cálculo numérico.

## Publicar en GitHub Pages

1. Cree un repositorio nuevo en GitHub (por ejemplo `simulador-termales`).
2. Suba **todo el contenido de esta carpeta** (`index.html`, `calculos.js`, la carpeta `img/` y `.nojekyll`) a la raíz del repositorio: botón **Add file → Upload files**, arrastre los archivos y haga **Commit changes**.
3. Vaya a **Settings → Pages**, en *Build and deployment* elija **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y guarde.
4. En uno o dos minutos la página queda en `https://<su-usuario>.github.io/simulador-termales/`.

Para probarlo en el computador basta con abrir `index.html` en el navegador (necesita internet para cargar la librería 3D three.js y las fuentes).

## Fuentes

Informe final de la Subestación Termales 115 kV (noviembre de 2026) y entregas finales de los Grupos 1 (parámetros y coordinación de aislamiento, MP 40 %, BIL 550 kV), 2 (distancias de seguridad), 3 (selección de equipos y malla de puesta a tierra) y 4 (apantallamiento); plano de planta y cortes rev. 4 y unifilar de control G01-CNP-01. Normas: RETIE (Resolución 40117 de 2024; tablas de la Resolución 90708 de 2013), IEC 60071, IEEE 80 e IEEE 998.
