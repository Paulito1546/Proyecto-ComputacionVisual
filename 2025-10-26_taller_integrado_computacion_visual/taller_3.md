# Taller Integral de Computación Visual

## Actividades

Diseñar y curar experiencias visuales interactivas que integren modelado 3D, materiales PBR, shaders personalizados, texturas dinámicas, detección multimodal (voz, gestos, EEG) y control de cámara o entorno. Cada sección explora un componente del pipeline gráfico y sensorial, uniendo percepción visual, física de la luz, geometría procedural y comunicación humano–máquina.

---

### 1. Materiales, luz y color (PBR y modelos cromáticos)

* Texturas PBR: albedo, roughness, metalness, normal map.
* Iluminación múltiple: key, fill, rim, HDRI.
* Cámaras: alternancia perspectiva/ortográfica.
* Paleta en RGB/HSV y justificación de contraste en CIELAB.
* Animaciones que expongan variaciones de luz y material.

### 2. Modelado procedural desde código

* Generación de geometría por algoritmos (rejillas, espirales, fractales simples).
* Bucles/recursión para patrones espaciales.
* Modificación de vértices/transformaciones dinámicas.
* Comparativa: modelado por código vs modelado manual.

### 3. Shaders personalizados y efectos

* Shaders básicos (GLSL, HLSL, Shader Graph).
* Color por posición/tiempo/interacción.
* Toon shading, gradientes, wireframe, distorsión UV.
* Texturizado procedural o mezcla de mapas dinámicos.

### 4. Texturizado dinámico y partículas

* Materiales reactivos a tiempo, input o sensores.
* Mapas animados (emissive, normal, offset UV, ruido).
* Sistemas de partículas sincronizados con el material.
* Evento visual coordinado shader + partículas.

### 5. Visualización de imágenes y video 360°

* Esfera invertida o skybox para equirectangulares.
* Video 360° como textura dinámica.
* Conmutación entre panoramas/escenas.
* Controles de cámara (orbit, giroscopio, input).

### 6. Entrada e interacción (UI, input y colisiones)

* Captura de teclado, mouse y touch.
* UI Canvas/HTML con botones y sliders.
* Colisiones físicas o triggers que disparen efectos.
* Sincronización de eventos visuales con acciones del usuario.

### 7. Gestos con cámara web (MediaPipe Hands)

* Detección de manos en tiempo real (mediapipe + opencv).
* Conteo de dedos, distancias y gestos.
* Mapeo gesto → acción visual.
* Minijuego o interfaz gestual sin hardware adicional.

### 8. Reconocimiento de voz y control por comandos

* Captura de audio con SpeechRecognition/PyAudio.
* Reconocimiento local (CMU Sphinx) u online.
* Diccionario de comandos y acciones visuales.
* Enlace a Unity/Processing vía OSC.
* Retroalimentación por voz con pyttsx3.

### 9. Interfaces multimodales (voz + gestos)

* Integración simultánea de voz y gestos.
* Hilos o sincronización de entradas.
* Lógica condicional para acciones compuestas.
* Interfaz visual reactiva con retroalimentación.

### 10. Simulación BCI (EEG sintético y control)

* Señales EEG reales o sintéticas; bandas Alpha/Beta.
* Filtros pasa banda con scipy.signal.
* Umbrales de control y acciones visuales.
* Interfaz interactiva con PyGame/Tkinter.

### 11. Espacios proyectivos y matrices de proyección

* Coordenadas homogéneas y proyecciones.
* Matrices ortográfica y perspectiva (Python o Three.js).
* Visualización de profundidad y conmutación de cámaras.

---

## Herramientas

* Unity (versión LTS)
* Three.js / React Three Fiber
* Python (Colab o local)
* Processing (2D/3D)
* Complementos: MediaPipe, SpeechRecognition, OSC, OpenCV, PyGame, Tkinter

---


## Estructura general del repositorio

```
yyyy-mm-dd_taller_integrado_computacion_visual/
├── unity/
├── threejs/
├── python/
├── processing/
├── renders/
├── media/
└── README.md
```

Cada subcarpeta puede contener los experimentos correspondientes a las secciones A–K.

---

## Contenido del README.md

* Concepto del proyecto o experimento visual.
* Herramientas y entorno usado (Unity, Python, Three.js).
* Descripción de los módulos aplicados (A–K).
* Código relevante o fragmentos clave.
* Evidencias gráficas:

  * Luz y materiales con presets distintos.
  * Modelado procedural y shaders dinámicos.
  * Interacción por voz, gestos o colisiones.
  * Visualizaciones 360° o respuestas EEG simuladas.
* Prompts o ideas base (si se usaron modelos generativos).
* Reflexión: aprendizajes, retos técnicos y mejoras posibles.

---

## Entrega y evidencias

* Taller por grupos
* Imágenes: 6 capturas de escenas distintas.
* GIFs obligatorios (mínimo 6):

  * Interacción multimodal o shader dinámico.
  * Cambio de cámara o luz.
  * Respuesta visual ante voz/gesto/señal.
* Video corto (30–60 s) de la experiencia completa.
* Código ejecutable o notebook.
* README completo y documentado.

---

## Criterios de evaluación

| Criterio                                | Descripción                                   | Peso |
| --------------------------------------- | --------------------------------------------- | ---- |
| Organización                            | Estructura de carpetas y README claros        | 10%  |
| Modelado y geometría procedural         | Generación y coherencia de formas             | 10%  |
| Materiales e iluminación PBR            | Realismo, coherencia y respuesta a la luz     | 15%  |
| Shaders y texturizado dinámico          | Efectos visuales y complejidad técnica        | 15%  |
| Interacción multimodal (voz/gestos/EEG) | Integración funcional y creativa              | 15%  |
| Cámaras y proyección                    | Uso correcto de perspectiva/orto y movimiento | 10%  |
| Animaciones y partículas                | Movimiento expresivo, sincronización visual   | 10%  |
| Evidencias visuales                     | GIFs, videos y capturas claras                | 10%  |
| Código y documentación                  | Claridad, comentarios y commits en inglés     | 5%   |
| Total                                   |                                               | 100% |

---

## Invitación

Construye un ecosistema visual donde color, forma, gesto y sonido dialoguen. El objetivo es articular el pipeline gráfico con entradas naturales para crear experiencias interactivas claras, reproducibles y estéticamente fundamentadas.
