# README.md

## Concepto del proyecto o experimento visual

Este proyecto, titulado "Jardín Sinestésico Interactivo", consiste en una experiencia visual inmersiva que integra elementos de computación gráfica, interacción multimodal y simulación sensorial. El usuario se sumerge en un jardín virtual tridimensional donde puede manipular el entorno mediante gestos manuales detectados por cámara web, comandos de voz, señales EEG sintéticas y entradas de teclado. El objetivo es explorar la sinestesia entre inputs sensoriales y respuestas visuales: por ejemplo, un gesto de puño activa la noche con iluminación tenue, mientras que una mano abierta invoca el día con luz vibrante; comandos vocales como "flor" generan partículas florales, y valores EEG modulan efectos dinámicos. Esta experiencia fusiona modelado 3D procedural, materiales PBR reactivos y shaders personalizados para crear un ecosistema visual que responde de manera orgánica a la interacción humana, promoviendo una reflexión sobre la percepción multisensorial en entornos digitales.

## Herramientas y entorno usado

- **Three.js / React Three Fiber**: Utilizado como framework principal para la renderización 3D en el navegador, permitiendo la integración de escenas interactivas con componentes React. Versión de Three.js: implícita en la dependencia de @react-three/fiber.
- **MediaPipe Hands**: Para la detección de gestos en tiempo real a través de la cámara web, implementado en el componente HandTracker.
- **Web Speech API y simulador EEG**: Hook personalizado (useVoiceAndEEG) para reconocimiento de voz basado en Web Speech API y generación sintética de valores EEG.
- **Entorno de desarrollo**: React.js con Vite o Create React App, ejecutado en navegador web (compatible con Chrome para cámara y audio). No se utilizaron herramientas adicionales como Unity o Python en esta implementación, priorizando la accesibilidad web.
- **Librerías complementarias**: @react-three/fiber para Canvas 3D, MediaPipe para tracking de manos, y hooks de React para manejo de estado.

## Descripción de los módulos aplicados (A–K)

A continuación, se describe la implementación de cada módulo del taller, adaptada al proyecto. Algunos módulos no se implementaron completamente debido a limitaciones de tiempo o enfoque web; en tales casos, se indica el enfoque conceptual.

### 1. Materiales, luz y color (PBR y modelos cromáticos)
Se aplicaron materiales PBR en la escena 3D (componente Scene), con texturas de albedo para el suelo y vegetación, roughness variable para simular superficies orgánicas, y normal maps para detalles topográficos. Iluminación múltiple: luz direccional (key light) que varía según el tiempo del día (día: intensidad alta en amarillo; noche: baja en azul), fill light ambiental y HDRI simulado vía environment map. La paleta cromática se basa en HSV para transiciones suaves (día: saturación alta en verdes/verdes; noche: baja en azules), con contraste validado en CIELAB para accesibilidad. Animaciones exponen cambios: al alternar día/noche, las luces se animan con easing para revelar variaciones en specular y diffuse.

### 2. Modelado procedural desde código
La geometría del jardín se genera proceduralmente usando algoritmos en Three.js: rejillas para el terreno con modificaciones de vértices basadas en ruido Perlin (para colinas y variaciones), espirales para tallos de flores y bucles para patrones de hojas. Comparativa: el modelado por código permite dinamicidad (e.g., crecimiento aleatorio de plantas), versus manual que sería estático; aquí se prioriza lo procedural para reactividad.

### 3. Shaders personalizados y efectos
Shaders en GLSL integrados vía ShaderMaterial en React Three Fiber: un shader básico modula color por posición y tiempo (gradientes de día/noche), con toon shading para contornos estilizados y distorsión UV en partículas florales. Mezcla dinámica de mapas: emissive para glow nocturno.

### 4. Texturizado dinámico y partículas
Materiales reactivos: texturas emissive animadas por tiempo (e.g., flores que pulsan con EEG) y offset UV basado en gestos. Sistema de partículas (usando Points en Three.js) sincronizado: al comando "flor", emite partículas con trayectorias procedurales, coordinadas con shaders para bloom effects.

### 5. Visualización de imágenes y video 360°
[Espacio para implementación pendiente: Se planea una esfera invertida para equirectangulares, con video 360° como textura dinámica en skybox. Controles de cámara orbit para navegación.]

### 6. Entrada e interacción (UI, input y colisiones)
Captura de teclado (e.g., 'd' para día, 'n' para noche, 'f' para flor) y gestos via MediaPipe. UI personalizada (CustomUI) con botones y sliders en overlay HTML/CSS para alternar estados. Colisiones: raycasting simple detecta interacciones con objetos 3D, disparando efectos como animaciones de crecimiento.

### 7. Gestos con cámara web (MediaPipe Hands)
Detección en tiempo real con MediaPipe: identifica "fist" (puño) para noche y "open" (mano abierta) para día, midiendo distancias entre landmarks. Mapeo a acciones: gesto → cambio de iluminación y comando vocal simulado. Interfaz gestual como minijuego: acumula puntaje por uso de gestos.

### 8. Reconocimiento de voz y control por comandos
Usando Web Speech API en el hook useVoiceAndEEG: reconoce comandos como "luz" (día), "noche" (noche), "flor" (partículas). Diccionario limitado para robustez; enlace directo a estado React para acciones visuales. Retroalimentación: texto overlay muestra comando detectado.

### 9. Interfaces multimodales (voz + gestos)
Integración simultánea: hilos via hooks React manejan voz, gestos y EEG en paralelo. Lógica condicional: e.g., gesto + voz compuesta activa efectos combinados (noche + flor = partículas lunares). Retroalimentación visual: overlay muestra inputs en tiempo real.

### 10. Simulación BCI (EEG sintético y control)
Señales EEG sintéticas generadas en useVoiceAndEEG (bandas Alpha/Beta simuladas con ruido aleatorio). Filtros: umbrales simples para control (e.g., EEG > 0.5 modula intensidad de partículas). Interfaz: valor EEG mostrado en overlay, afectando shaders dinámicos.

### 11. Espacios proyectivos y matrices de proyección
Cámara en Canvas con posición [0,5,15] y FOV 60; matrices perspectiva implementadas por defecto en Three.js. Visualización: conmutación día/noche altera profundidad percibida vía fog; coordenadas homogéneas usadas internamente para transforms.

## Código relevante o fragmentos clave

### Fragmento de App.jsx (integración multimodal)
```jsx
import { Canvas } from '@react-three/fiber'
import { useState, useCallback, useEffect, useMemo } from 'react'
import Scene from './components/Scene'
import useVoiceAndEEG from './hooks/useVoiceAndEEG'
import HandTracker from './components/HandTracker'
import CustomUI from './components/CustomUI'

function App() {
  const [timeOfDayState, setTimeOfDayState] = useState('day');
  const { command, setCommand, eegValue } = useVoiceAndEEG();
  const [gesture, setGesture] = useState(null);

  // Lógica de gestos
  const handleGesture = useCallback((g) => {
    setGesture(g);
    if (g === 'open') {
      setTimeOfDayState('day');
      setCommand('luz');
    } else if (g === 'fist') {
      setTimeOfDayState('night');
      setCommand('noche');
    }
  }, [setCommand]);

  // Teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'd') { setTimeOfDayState('day'); setCommand('luz'); }
      if (e.key === 'n') { setTimeOfDayState('night'); setCommand('noche'); }
      if (e.key === 'f') { setCommand('flor'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <HandTracker onGesture={handleGesture} />
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }} shadows>
        <Scene timeOfDay={timeOfDayState} command={command} eegValue={eegValue} />
      </Canvas>
      <CustomUI setTimeOfDay={setTimeOfDayState} setCommand={setCommand} />
    </div>
  );
}
```

### Fragmento de index.css (estilos base)
```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  color-scheme: light dark;
  background-color: #242424;
}
```

## Evidencias gráficas

### Luz y materiales con presets distintos
- Captura 1: Día con materiales PBR brillantes (albedo verde, roughness bajo).
- Captura 2: Noche con emissive glow y metalness alto en elementos.
- [Espacios para más capturas: presets de iluminación rim y fill.]

### Modelado procedural y shaders dinámicos
- GIF 1: Generación de terreno procedural con ruido, shader gradiente animado.
- GIF 2: Shaders toon aplicados a plantas, distorsión por tiempo.

### Interacción por voz, gestos o colisiones
- GIF 3: Gesto de puño activando noche; voz "flor" emitiendo partículas.
- GIF 4: Teclado 'd' cambiando a día, con colisión raycast en UI.

### Visualizaciones 360° o respuestas EEG simuladas
- [Espacio para GIF 5: Skybox 360° con video dinámico.]
- GIF 6: EEG modulando intensidad de partículas en tiempo real.

## Prompts o ideas base (si se usaron modelos generativos)

No se utilizaron modelos generativos como IA para código o assets; ideas base derivan de prompts conceptuales internos: "Crear un jardín 3D reactivo a sinestesia humana-máquina, integrando gestos para luz, voz para crecimiento y EEG para pulsos orgánicos."

## Reflexión: aprendizajes, retos técnicos y mejoras posibles

Este proyecto ha profundizado nuestra comprensión del pipeline gráfico en entornos web, destacando la integración de Three.js con inputs sensoriales para experiencias inmersivas. Aprendizajes clave incluyen la optimización de shaders para rendimiento real-time y la sincronización multimodal, que enriquece la interacción humano-computadora. Retos técnicos: latencia en detección de gestos (solucionado con thresholds en MediaPipe) y simulación EEG precisa sin hardware real, lo que limitó la fidelidad. Mejoras posibles: incorporar Unity para física avanzada, agregar OSC para enlace con Python (e.g., EEG real via Muse), y expandir a VR para inmersión 360° completa. En suma, el taller revela el potencial de la computación visual para interfaces naturales, aunque exige equilibrio entre complejidad técnica y usabilidad.