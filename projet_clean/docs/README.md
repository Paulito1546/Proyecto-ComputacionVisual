# Taller 4 computacion visual

- Deibyd Santiago Barragán Gaitán.
- Paul Marie Emptoz.
- Juan Felipe Hernandez Ochoa.
- Juan Diego Mendoza Torres.
- Julián David Osorio Amaya.

## Explicación de los Módulos

### A. Percepción y Visión
* **YOLOv8-Seg** (Ultralytics) para realizar simultáneamente:
* **Detección de Objetos:** Bounding boxes en tiempo real.
* **Segmentación de Instancia:** Máscaras sobre los objetos detectados.
* **Exportación de Datos:** Los metadatos de detección se exportan a `python/results/data_log.json`.

### C. Visualización 3D
* **Three.js + React:** Escena 3D interactiva con React Three Fiber
* **Objetos Interactivos:** Cubo, esfera y toro con materiales avanzados (Wobble, Distortion)
* **Iluminación Dinámica:** Luces direccionales, spotlights y point lights animados
* **Sistema de Partículas:** 200+ partículas animadas con blending aditivo
* **Overlays Dinámicos:** HUD con métricas en tiempo real (FPS, objetos, estado)
* **Controles Interactivos:** Panel de control para ajustar velocidad, intensidad de luz y selección de objetos
* **Integración AR.js:** Vista de realidad aumentada con detección de marcadores simulada
* **Optimización Visual:** Stats en tiempo real, sombras de alta calidad, environment mapping

### F. Optimización Visual
* **Clase de optimización** Se implementó una clase `PerformanceMonitor` que gestiona la eficiencia del sistema:
* **LOD (Level of Detail) Dinámico:** Redimensionamiento de entrada (Input Scaling) para mejorar la velocidad de inferencia.
* **Métricas en Tiempo Real:** Cálculo y visualización de FPS (Frames por Segundo) y latencia (ms).
* **Monitoreo de Recursos:** Visualización del uso de CPU y RAM en el video.

## Estructura del Proyecto

```
2025-12-01_super_taller_cv/
 ├── python/ 
 │ ├── detection/
 │ ├── utils/
 │ ├── results/
 │ └── main.py
 ├── threejs/
 │ ├── src/
 │ │ ├── components/
 │ │ ├── config/
 │ │ ├── utils/
 │ │ ├── App.jsx
 │ │ └── main.jsx
 │ ├── public/
 │ ├── package.json
 │ └── README.md
 ├── docs/
 ├── data/
 └── requirements.txt
 ```


## Instalación y Ejecución

### Python (Módulo A: Detección)

```bash
pip install -r requirements.txt
python python/main.py
```

### Three.js (Módulo C: Visualización 3D)

```bash
cd threejs
npm install
npm run dev
```

Luego abre tu navegador en `http://localhost:3000`

Ver documentación completa en:
- **Python**: `python/detection/README.md`
- **Three.js**: `threejs/README.md`
- **Documentación técnica**: `docs/THREEJS_TECHNICAL.md`
