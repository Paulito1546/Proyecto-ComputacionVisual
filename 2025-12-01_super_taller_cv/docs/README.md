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

### F. Optimización Visual
* **Clase de optimización** Se implementó una clase `PerformanceMonitor` que gestiona la eficiencia del sistema:
* **LOD (Level of Detail) Dinámico:** Redimensionamiento de entrada (Input Scaling) para mejorar la velocidad de inferencia.
* **Métricas en Tiempo Real:** Cálculo y visualización de FPS (Frames por Segundo) y latencia (ms).
* **Monitoreo de Recursos:** Visualización del uso de CPU y RAM en el video.

## Estructura del Proyecto

```
2025-11-23_super_taller_cv/
 ├── python/ 
 │ ├── detection/
 │ ├── utils/
 │ ├── results/
 │ └── main.py
 ├── docs/
 ├── data/
 └── requirements.txt
 ```


## Instalación de librerias y ejecución

```bash
pip install -r requirements.txt
python python/main.py
```
