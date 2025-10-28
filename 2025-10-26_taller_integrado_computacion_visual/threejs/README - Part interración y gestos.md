## Synesthetic Garden: Jardín Sinestésico Interactivo

### Descripción general
Synesthetic Garden es una aplicación web interactiva desarrollada para el Taller 3 de visión por computadora. Integra detección de gestos mediante cámara web, reconocimiento de voz, simulación de EEG y controles de entrada multimodal (teclado, mouse, touch) para manipular una escena 3D de un jardín virtual. Los usuarios pueden cambiar entre modo día/noche, activar efectos visuales en plantas y luces, y completar un minijuego que requiere explorar todos los métodos de interacción para alcanzar el 100% de puntaje. El proyecto cumple con los puntos 6 (entrada e interacción: UI, input y colisiones) y 7 (gestos con cámara web: detección de manos, conteo de dedos, mapeo a acciones visuales, minijuego gestual sin hardware adicional).

El enfoque principal es la sinestesia: gestos y voz afectan visuales (e.g., "flor" hace crecer plantas), mientras EEG simulada altera colores. Se corrigieron errores en la detección de cámara y gestos, migrando a la API moderna de MediaPipe para mayor precisión.

### Tecnologías utilizadas
- **Frontend y 3D**: React, @react-three/fiber y Three.js para renderizado de escena, modelos GLB de plantas y efectos de iluminación/emisivos.
- **Detección de gestos**: @mediapipe/tasks-vision (HandLandmarker) para procesamiento en tiempo real de video, conteo de dedos y mapeo a comandos ('open' → día, 'fist' → noche).
- **Reconocimiento de voz**: Web Speech API para comandos en español ("luz", "flor", "noche").
- **Simulación EEG**: Valores aleatorios que interpolan colores (lerp entre frío/cálido) en fondo y materiales.
- **Interacción**: Eventos de teclado/mouse/touch, UI HTML con botones y slider, colisiones en modelos 3D via onClick.
- **Minijuego**: Estado de puntaje con useMemo, tracking de acciones únicas (gestos, botones, teclas) para victoria al 100%.
- **Herramientas de desarrollo**: Vite para build, Leva (opcional para controles iniciales, reemplazado por UI custom).

### Instalación
1. Clona el repositorio: `git clone [URL del repositorio]`.
2. Instala dependencias: `npm install`.
3. Descarga el modelo de MediaPipe: Ve a [https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task] y colócalo en `/public/models/hand_landmarker.task`.
4. Ejecuta la app: `npm run dev`. Abre en http://localhost:5173.
5. Permite acceso a la cámara y micrófono en el navegador para gestos y voz.

**Requisitos**: Navegador moderno (Chrome recomendado para Web Speech y getUserMedia). HTTPS para despliegue en producción (e.g., Vercel/Netlify).

### Uso
- **Gestos con cámara**: La cámara se inicializa en la esquina inferior derecha. Abre la mano ('open') para modo "día" + comando 'luz' (flash luminoso). Cierra el puño ('fist') para "noche" + 'noche' (oscurecimiento temporal). Se dibujan landmarks y conexiones en el canvas overlay.
- **Comandos de voz**: Habla en español: "luz" para flash, "flor" para crecer plantas, "noche" para dim. El micrófono escucha continuamente.
- **EEG simulado**: Valores oscilan automáticamente (0-1), cambiando colores de escena (azul frío a rojo cálido). Usa el slider en UI para simular manualmente.
- **UI personalizada**: Botones para Día ('luz'), Noche ('noche'), Flor ('flor'). Slider para EEG.
- **Atajos de teclado**: 'd' para día, 'n' para noche, 'f' para flor.
- **Colisiones**: Haz clic en plantas 3D para activar 'flor' (escala temporal + animación).
- **Overlay de información**: Muestra tiempo, comando, gesto, EEG, cámara, puntaje y estado de acciones (✔/❌ para gestos, botones, teclas).

### Minijuego
El minijuego transforma la app en una experiencia gamificada: el objetivo es "activar" el jardín explorando todos los inputs. Para 100% de puntaje:
- Gestos: Puño y mano abierta (20% cada uno).
- Botones: Día, Noche, Flor (20% cada uno).
- Teclas: 'd', 'n', 'f' (20% cada uno, ajustado a 8 acciones totales para incrementos de 12.5%).
Cada acción única suma puntos. El puntaje se calcula en tiempo real con useMemo. Al 100%, alerta "¡Ganaste!" con mención de acciones completadas. El overlay muestra progreso detallado con ✔/❌.

| Acción Requerida | Input | Efecto | Contribución al Puntaje |
|------------------|-------|--------|-------------------------|
| Puño | Gesto (fist) | Modo noche + 'noche' | 12.5% (primera vez) |
| Mano abierta | Gesto (open) | Modo día + 'luz' | 12.5% (primera vez) |
| Día | Botón o 'd' | Flash luminoso | 12.5% (por botón/tecla) |
| Noche | Botón o 'n' | Oscurecimiento | 12.5% (por botón/tecla) |
| Flor | Botón o 'f' | Crecimiento plantas | 12.5% (por botón/tecla) |

### Créditos y notas
- Basado en tutoriales de MediaPipe y React Three Fiber.
- Modelos 3D: Fuentes libres (GLB para plantas y skybox).
- Desarrollado para Taller 3: Cumple entrada/interacción (punto 6) y gestos/minijuego (punto 7).
- Limitaciones: Detección de gestos sensible a iluminación; voz solo en español (configurable).
- Contribuciones: Abre issues o PR en el repositorio para mejoras.