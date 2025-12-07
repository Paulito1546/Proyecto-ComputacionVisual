# Semana 13 - Interfaz Completa de Análisis Postural

## Descripción General

Este sistema implementa una **interfaz gráfica completa** para el análisis de calidad postural durante la marcha, integrado con el pipeline de análisis de la semana 8.

**Funcionalidades implementadas:**

✅ **1. Carga de video y selección de paciente**
- Crear nuevos pacientes con ID y nombre
- Cargar pacientes existentes
- Seleccionar videos MP4 para análisis

✅ **2. Análisis automático (Semana 8 integrado)**
- Extracción de ángulos articulares con MediaPipe
- Cálculo de métricas de simetría (diferencia absoluta, SI, RMSE, correlación)
- Detección de alertas con clasificación de severidad (ALTA/MEDIA/BAJA)
- Visualización en tiempo real con barra de progreso

✅ **3. Generación de reportes CSV**
- `resumen_simetria.csv`: Tabla con métricas globales por articulación
- `alertas_por_frame.csv`: Detalle de cada alerta detectada
- Descarga desde la interfaz con un click

✅ **4. Visualización de video anotado**
- `output_alerts.mp4`: Video con squeleto y alertas dibujadas
- Se abre automáticamente en el reproductor predeterminado
- Muestra articulaciones en color según severidad

✅ **5. Historique del paciente**
- Guarda todas las sesiones por paciente
- Permite cargar y comparar análisis anteriores
- Estructura organizada: `patients_data/{patient_id}/sessions/`

---

## Instalación

### Requisitos previos

Python 3.8+

### Paso 1: Instalar dependencias

```bash

# Dependencias de pip
chmod u+x setup.sh
./setup.sh

```

### Paso 2: Descargar archivos

Asegúrate de tener en el mismo directorio:
- `pipeline_semana8.py` - Module del pipeline de análisis
- `semana_13_app.py` - Interfaz gráfica principal
- Video(s) para analizar

---

## Uso

### Ejecutar la aplicación

#### Probar la aplicaciốn

```bash
python test_setup.py
```
Verificar que todas la dependencias son descargadas. 

```bash
python semana_13_app.py
```

Se abrirá la ventana principal de la interfaz.

### Flujo de uso paso a paso

#### **Paso 1: Seleccionar Paciente**

1. Haz click en "Seleccionar/Crear Paciente"
2. Opción A: Selecciona un paciente existente de la lista
3. Opción B: Crea uno nuevo ingresando:
   - **ID**: Identificador único (ej: "PAC001")
   - **Nombre**: Nombre del paciente (ej: "Juan Pérez")

**Resultado:** Label mostrará ✅ Paciente seleccionado

#### **Paso 2: Cargar Video**

1. Haz click en "Cargar Video"
2. Selecciona un archivo MP4 desde tu computadora
3. El sistema validará y mostrará el nombre del video

**Resultado:** Label mostrará ✅ Video cargado + botón "Iniciar Análisis" se habilitará

#### **Paso 3: Iniciar Análisis**

1. Haz click en el botón "▶ Iniciar Análisis"
2. La barra de progreso mostrará el avance (0-100%)
3. Espera a que termine (tiempo depende de duración del video)

**Durante el análisis:**
- Se procesa frame por frame
- Se calculan ángulos articulares
- Se generan alertas automáticamente
- Se exportan videos y CSVs

**Resultado:** Cuando termina, aparecen automáticamente resultados en las pestañas

#### **Paso 4: Visualizar Resultados**

**Pestaña "Resumen de Simetría":**
- Tabla con todas las articulaciones analizadas
- Columnas: Diferencia Media, Diferencia Máxima, Índice Sim %, RMSE, Correlación, Umbral Diff, Umbral Sim, Estado
- Estado: ✅ Normal | 🟡 Leve | 🔴 Crítico

**Pestaña "Alertas Detectadas":**
- Lista detallada de todas las alertas generadas
- Formato: [SEVERIDAD] Frame X: Articulación → Tipo de alerta + mensaje

#### **Paso 5: Descargar CSVs**

1. Haz click en "⬇ Descargar CSV"
2. Selecciona la carpeta donde guardar
3. Se descargan dos archivos:
   - `resumen_simetria.csv`
   - `alertas_por_frame.csv`

Estos archivos se pueden abrir en Excel/Calc para análisis posterior.

#### **Paso 6: Ver Video Anotado**

1. Abrir VLC 
2. Haz click en "▶ Ver Video Análisis"
3. Se abrirá automáticamente en VLC
4. El video muestra:
   - Squeleto en vivo de la pose
   - Alertas codificadas por color en panel lateral
   - Articulaciones problemáticas resaltadas en rojo

#### **Paso 7 (Opcional): Consultar Historique**

1. Accede a Menú → Paciente → Ver Historique
2. Se listarán todas las sesiones anteriores del paciente
3. Selecciona una sesión anterior para cargar sus resultados
4. Puedes comparar métricas entre diferentes fechas

---

## Estructura de Archivos

### Árbol de directorios generado

```
proyecto/
├── semana_9_app.py              # Aplicación principal
├── pipeline_semana8.py          # Module pipeline
├── patients_data/               # Directorio de historique
│   ├── ID/
│   │   ├── metadata.json        # Datos del paciente
│   │   └── sessions/
│   │       ├── 20251110_105030/
│   │       │   ├── resumen_simetria.csv
│   │       │   ├── alertas_por_frame.csv
│   │       │   ├── output_alerts.mp4
│   │       │   └── session_metadata.json
│   │       └── 20251110_110500/
│   │           ├── ...
│   └── PAC002/
│       └── ...
└── video_entrada.mp4            # Videos de entrada
```

---

## Interpretación de Resultados

### Resumen de Simetría

| Articulación | Diff Media | Diff Máx | Índice Sim | Estado | Umbral Diff | Umbral Sim | Estado
|---|---|---|---|---|
| Rodilla | 8.5° | 15.2° | 12.3% | ✅ Normal |
| Cadera | 18.2° | 25.0° | 22.5% | 🟡 Leve |
| Hombro | 35.0° | 50.1° | 40.2% | 🔴 Crítico |

**Interpretación:**
- **Diff Media < Umbral** → ✅ Normal (movimiento simétrico)
- **Diff Media > Umbral** → 🟡 Leve (asimetría moderada)
- **Diff Media > 1.5 × Umbral** → 🔴 Crítico (asimetría severa)

### Umbrales por Defecto

| Articulación | Umbral Diff | Umbral SI |
|---|---|---|
| Rodilla | 20° | 25% |
| Tobillo | 15° | 20% |
| Cadera | 18° | 22% |
| Codo | 50° | 40% |
| Muñeca | 50° | 40% |
| Hombro | 50° | 45% |

---

## Detalles Técnicos

### Pipeline de Análisis (semana_8_pipeline.py)

1. **Captura de frames**: Lee video MP4 frame a frame
2. **Pose detection**: MediaPipe Pose extrae 33 landmarks del cuerpo
3. **Cálculo de ángulos**: Trigonometría 3D para obtener ángulos articulares
4. **Ventana glissante**: Analiza cada 10 frames sobre una ventana de 30 frames
5. **Métricas de asimetría**:
   - **Diferencia absoluta**: |Derecha - Izquierda|
   - **Índice Simetría (SI)**: ((Der - Izq) / Promedio) × 100
   - **RMSE**: √(Media((Der - Izq)²))
   - **Correlación Pearson**: Mide sincronización bilateral
6. **Generación alertas**: Compara métricas con umbrales predefinidos
7. **Exportación**: Video anotado + CSVs con resultados

### Estructura de datos

**Archivo CSV: resumen_simetria.csv**
```
Articulación,Diff Media (°),Diff Máx (°),Índice Sim (%),RMSE (°),Correlación,Estado
Rodilla,8.52,15.23,12.30,9.10,0.987,✅ Normal
Cadera,18.20,25.01,22.50,19.50,0.925,🟡 Leve
...
```

**Archivo CSV: alertas_por_frame.csv**
```
frame,articulacion,severidad,tipo,mensaje
100,Rodilla,MEDIA,DIFERENCIA ELEVADA,Diff media 20.5° > 20°
150,Hombro,ALTA,PICO DE ASIMETRÍA,Diff máx puntual 52.3°
...
```

---

## Troubleshooting

### Error: "tkinter not found"

**Solución:**
```bash
# Ubuntu/Debian
sudo apt-get install python3-tk

# Fedora
sudo dnf install python3-tkinter

# macOS (si no está instalado)
brew install python-tk
```

### Error: "No module named pipeline_semana8"

**Verificar:** pipeline_semana8.py está en el mismo directorio que semana_9_app.py

```bash
ls -la
# Debe haber:
# - semana_9_app.py
# - pipeline_semana8.py
```

### Video no se abre

**Posibles causas:**
- Reproductor de video no configurado en el sistema
- Ruta con espacios o caracteres especiales

**Solución:** Los archivos siguen guardados en la carpeta de sesión:
```
patients_data/[PATIENT_ID]/sessions/[TIMESTAMP]/output_alerts.mp4
```

Abre manualmente con VLC o tu reproductor favorito.

### Análisis muy lento

**Causas:**
- Video de muy alta resolución
- Computadora con pocos recursos

**Soluciones:**
- Reducir resolución del video (720p recomendado)
- Cerrar otras aplicaciones
- Aumentar `ANALYZE_EVERY` en `pipeline_semana8.py` (ej: 15 en lugar de 10)

---

## Extensiones Futuras

Funcionalidades que se pueden agregar:

1. **Análisis por fase del ciclo** - Segmentación stance/swing
2. **Base de datos normativa** - Comparar con valores de referencia poblacionales
3. **Reportes PDF** - Generar informes automáticos
4. **Gráficos de tendencia** - Mostrar evolución del paciente en el tiempo
5. **Clasificación de patologías** - Diagnosticar tipo de desviación (hemi-paresia, etc.)
6. **Exportación 3D** - Generar modelos 3D del movimiento
7. **Multijugador** - Analizar a múltiples personas simultáneamente
8. **Exportación a DICOM** - Integración con sistemas médicos

---

## Referencias

**Artículos científicos implementados:**

1. Robinson, R. O., & Smidt, G. L. (1981). Quantitative gait assessment in periodically non-stationarysystems. *IEEE Transactions on Biomedical Engineering*, BME-28(9), 612-621.

2. Perry, J., & Burnfield, J. M. (2010). *Gait analysis: normal and pathological function* (2nd ed.). Slack.

3. Winter, D. A. (2009). *Biomechanics and motor control of human movement* (4th ed.). Wiley.

4. Trumble, M., Gilbert, A., Malleson, C., Hilton, A., & Collomosse, J. (2017). Total capture: 3D human pose estimation fusing video and inertial sensors. *BMVC*, 2017.


