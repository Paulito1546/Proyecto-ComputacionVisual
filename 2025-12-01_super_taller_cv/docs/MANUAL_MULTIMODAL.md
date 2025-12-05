# 🧠 Sistema de Interacción Multimodal en Tiempo Real

Este proyecto implementa una prueba de concepto (PoC) de un sistema de interacción humano-máquina que fusiona tres tipos de entradas en tiempo real: **visión por computador (gestos), comandos de voz y valores simulados de bioseñales (EEG)**, para controlar una escena 3D renderizada con Three.js.

## ✨ Características

| Módulo | Tecnología | Entrada | Efecto Visual |
| :--- | :--- | :--- | :--- |
| **Visión (Gestos)** | MediaPipe Gesture Recognizer | Pulgar arriba, Puño, Mano abierta | Controla la velocidad y dirección de la rotación de la esfera. |
| **Voz** | Web Speech API | "Día", "Noche" | Cambia el color de fondo de la escena 3D. |
| **EEG (Simulado)** | HTML Range Sliders | Valores Alfa, Beta, Gamma | Modifica la escala de la esfera, su rugosidad y activa/desactiva el modo *wireframe*. |
| **Visualización** | Three.js (WebGL) | N/A | Renderiza una esfera bicolor (Rojo/Azul) que muestra claramente la rotación. |

## 🚀 Inicio Rápido (Localhost)

Debido a que este proyecto utiliza APIs de seguridad estricta del navegador (Cámara, Micrófono, Módulos ES6), **debe ejecutarse desde un servidor local (localhost)**.

### 1\. Estructura del Proyecto

Asegúrate de que tus archivos sigan esta estructura:

```
multimodal-system/
│
├── index.html
├── style.css
├── main.js             # Orquestador principal
│
└── modules/
    ├── scene.js        # Lógica Three.js
    ├── gestures.js     # Lógica MediaPipe
    ├── voice.js        # Lógica Web Speech API
    └── eeg.js          # Lógica Sliders EEG
```

### 2\. Ejecutar el Servidor Local

Abre la terminal en la carpeta `multimodal-system` y utiliza el servidor HTTP integrado de Python 3.

```bash
# Iniciar el servidor en el puerto 8000 (o 8080 si 8000 está ocupado)
python3 -m http.server 8000
```

### 3\. Acceder y Conceder Permisos

1.  Abre tu navegador (Chrome o Edge recomendado) y navega a:
    `http://localhost:8000`
2.  El navegador inmediatamente te pedirá permisos para usar la **Cámara** y el **Micrófono**. **Debes aceptar ambos** para que el sistema funcione.
3.  Si la cámara o el micrófono fallan, consulta la sección de **Solución de Problemas**.

## 🕹️ Guía de Interacción

Una vez que el sistema está cargado y la cámara está activa, puedes controlarlo de la siguiente manera:

| Entrada | Comando / Gesto | Efecto en la Esfera |
| :--- | :--- | :--- |
| **Gesto** | **👍 Pulgar Arriba** | Acelera la rotación. |
| **Gesto** | **✊ Puño Cerrado** | Congela (pausa) la rotación. |
| **Gesto** | **✋ Mano Abierta** | Invierte el sentido de la rotación. |
| **Voz** | **"Día"** | Cambia el fondo 3D a blanco (claro). |
| **Voz** | **"Noche"** | Cambia el fondo 3D a negro (oscuro). |
| **EEG (Alpha)** | Deslizar Alpha | Afecta el **tamaño** de la esfera (Escala). |
| **EEG (Gamma)** | Deslizar Gamma | Activa el modo **Wireframe** si el valor es alto. |
| **EEG (Beta)** | Deslizar Beta | Afecta la **rugosidad** (textura) del material. |

## ⚙️ Notas Técnicas y Escalabilidad

### Modularidad

El sistema está diseñado en módulos ES6 para facilitar el mantenimiento. El archivo `main.js` actúa como el **Orquestador**, recibiendo eventos de `gestures.js`, `voice.js` y `eeg.js`, y luego llamando a las funciones de actualización en `scene.js`.

### Anti-Zoom

Se han añadido directivas de CSS (`touch-action: none;`) y HTML (`user-scalable=no`) para prevenir el zoom involuntario del navegador durante los gestos.

### Dependencias Externas (CDN)

El proyecto utiliza las siguientes librerías cargadas vía CDN:

  * `Three.js` (para WebGL)
  * `@mediapipe/tasks-vision` (para el reconocimiento de gestos)

## Troubleshooting (Solución de Problemas)

| Problema | Mensaje en Consola | Solución |
| :--- | :--- | :--- |
| **No se piden permisos / El script no carga** | `GET /modules/gestures.js 404` | **Error de archivo:** Asegúrate de que `gestures.js` esté correctamente ubicado dentro de la carpeta `/modules/` y que el nombre coincida (distingue mayúsculas y minúsculas). |
| **El servidor no inicia** | `OSError: [Errno 98] Address already in use` | **Error de puerto:** El puerto 8000 está ocupado. Ejecuta el servidor en un puerto diferente (ej. `python3 -m http.server 8080`) o detén el proceso anterior con `sudo kill -9 [PID]`. |
| **La voz no funciona** | `Error voz: not-allowed` | **Permisos denegados:** Debes cambiar la configuración del navegador para `http://localhost:8000` (hacer clic en el icono de candado/micrófono en la URL) y seleccionar **Permitir** micrófono. |
| **La voz falla al capturar** | `Error voz: audio-capture` | **Micrófono ocupado:** Cierra todas las demás aplicaciones (Zoom, Discord) que puedan estar usando el micrófono. Revisa la configuración de privacidad de tu Sistema Operativo. |
