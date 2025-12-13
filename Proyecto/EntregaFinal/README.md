# Sistema de Análisis Postural con IA

Sistema profesional de análisis biomecánico que detecta asimetrías posturales en videos utilizando Computer Vision (MediaPipe) e inteligencia artificial (Google Gemini) para proporcionar evaluaciones fisioterapéuticas detalladas.

## Características Principales

- **Análisis de Video**: Procesamiento frame-by-frame con detección de 33 puntos anatómicos (MediaPipe Pose)
- **Detección de Asimetrías**: Análisis bilateral de 6 pares articulares (rodillas, tobillos, caderas, codos, muñecas, hombros)
- **Análisis con IA**: Interpretación profesional automática usando Google Gemini 2.5
- **Chat Inteligente**: Interfaz conversacional para consultas sobre los resultados
- **Seguimiento Histórico**: Gestión de pacientes con comparación de sesiones múltiples
- **Video Anotado**: Generación de video en cámara lenta con visualización de alertas
- **Exportación de Datos**: Reportes en CSV con métricas detalladas

## Inicio Rápido

### Requisitos Previos

- Python 3.12 o superior
- Webcam o videos pregrabados para análisis
- API Key de Google Gemini ([obtener aquí](https://makersuite.google.com/app/apikey))

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd postural-analysis-system
```

2. **Crear entorno virtual**

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

3. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

4. **Configurar API Key**

Crear archivo `.env` en la raíz del proyecto:

```env
GEMINI_API_KEY=tu_api_key_aqui
```

5. **Ejecutar aplicación**

```bash
python main.py
```

## Estructura del Proyecto

```
postural-analysis-system/
│
├── main.py                      # Punto de entrada de la aplicación
├── main_app.py                  # Clase principal de la aplicación
├── config.py                    # Configuración centralizada
├── requirements.txt             # Dependencias del proyecto
├── .env                         # Variables de entorno (API keys)
│
├── Core Analysis/
│   ├── pipeline_semana8.py      # Pipeline de análisis de video
│   ├── analysis_worker.py       # Gestión de análisis en threads
│   └── video_processor.py       # Procesamiento y exportación de videos
│
├── AI Integration/
│   ├── gemini_analyzer.py       # Integración con Google Gemini
│   └── api_key_manager.py       # Gestión segura de API keys
│
├── Data Management/
│   └── patient_manager.py       # Gestión de pacientes y sesiones
│
├── User Interface/
│   ├── ui_components.py         # Componentes reutilizables (CustomTkinter)
│   ├── chat_widget.py           # Interfaz de chat con IA
│   └── dialogs.py               # Ventanas de diálogo (pacientes, historial)
│
├── Data Storage/
│   └── patients_data/           # Datos de pacientes (auto-generado)
│       └── {patient_id}/
│           ├── metadata.json
│           └── sessions/
│               └── {timestamp}/
│                   ├── session_metadata.json
│                   ├── resumen_simetria.csv
│                   ├── alertas_por_frame.csv
│                   ├── output_alerts.mp4
│                   └── chat_history.json
│
└── Output/
    └── semana_13/               # Archivos temporales de procesamiento
```

## Arquitectura del Sistema

### Flujo de Datos

```
1. Selección de Paciente
   └─> PatientDialog → PatientHistoryManager
   
2. Carga de Video
   └─> VideoProcessor (validación)
   
3. Análisis de Movimiento
   └─> AnalysisWorker
       └─> pipeline_semana8.py
           ├─> MediaPipe Pose (detección de landmarks)
           ├─> Cálculo de ángulos articulares
           ├─> AsimetriaAnalyzer (detección de asimetrías)
           └─> Generación de video anotado
           
4. Análisis con IA
   └─> GeminiAnalyzer
       ├─> Análisis inicial (interpretación profesional)
       └─> Chat conversacional (contexto persistente)
       
5. Almacenamiento
   └─> PatientHistoryManager
       ├─> Guardar CSVs
       ├─> Guardar video procesado
       └─> Guardar historial de chat
```

### Componentes Principales

#### 1. **Pipeline de Análisis** (`pipeline_semana8.py`)

El núcleo del sistema que procesa videos frame-by-frame:

- **Detección de Pose**: MediaPipe detecta 33 landmarks corporales
- **Cálculo de Ángulos**: Geometría vectorial para ángulos articulares
- **Análisis de Ventana Deslizante**: Ventana de 30 frames, análisis cada 10 frames
- **Métricas de Asimetría**:
  - Diferencia media entre lados (°)
  - Índice de simetría (%)
  - Correlación de Pearson
  - RMSE (Root Mean Square Error)

**Umbrales Adaptativos por Articulación**:

```python
{
    "rodilla": {"diferencia": 20°, "simetria": 25%, "correlacion": -0.3},
    "tobillo": {"diferencia": 15°, "simetria": 20%, "correlacion": -0.2},
    "cadera":  {"diferencia": 18°, "simetria": 22%, "correlacion": -0.3},
    "codo":    {"diferencia": 50°, "simetria": 40%, "correlacion": -0.4},
    "muneca":  {"diferencia": 50°, "simetria": 40%, "correlacion": -0.4},
    "hombro":  {"diferencia": 50°, "simetria": 45%, "correlacion": -0.3}
}
```

#### 2. **Análisis con IA** (`gemini_analyzer.py`)

Integración con Google Gemini para interpretación profesional:

- **Análisis Inicial**: Evaluación completa con 8 secciones:
  1. Evaluación general
  2. Hallazgos principales
  3. Análisis biomecánico
  4. Posibles causas
  5. Recomendaciones terapéuticas
  6. Precauciones
  7. Plan de seguimiento
  8. Clasificación de riesgo

- **Chat Conversacional**:
  - Contexto persistente del análisis
  - Respuestas especializadas en fisioterapia
  - Historial guardado por sesión

#### 3. **Gestión de Pacientes** (`patient_manager.py`)

Sistema jerárquico de almacenamiento:

```
patients_data/
├── {patient_id}/
│   ├── metadata.json          # Info del paciente
│   └── sessions/
│       ├── 20241213_143022/   # Timestamp de sesión
│       │   ├── session_metadata.json
│       │   ├── resumen_simetria.csv
│       │   ├── alertas_por_frame.csv
│       │   ├── output_alerts.mp4
│       │   └── chat_history.json
│       └── 20241214_091530/
```

#### 4. **Interfaz de Usuario** (`main_app.py`)

Aplicación GUI construida con CustomTkinter:

**Workflow en 3 Paneles**:

1. **Selección**: Paciente y video
2. **Análisis**: Controles y barra de progreso
3. **Resultados**: 5 pestañas
   - Resumen de Simetría
   - Alertas Detectadas
   - Comparaciones (sesiones múltiples)
   - Análisis IA
   - Chat IA

## Formato de Datos

### CSV de Resumen de Simetría

```csv
Articulación,Diff Media (°),Diff Máx (°),Índice Sim (%),RMSE (°),Correlación,Umbral Diff,Umbral Sim,Estado
Rodilla,12.45,28.30,18.67,15.23,0.82,20°,25%,✅ Normal
Tobillo,8.90,19.45,14.23,11.34,0.88,15°,20%,✅ Normal
Cadera,22.10,35.67,28.45,25.12,0.65,18°,22%,🔴 Crítico
```

### CSV de Alertas por Frame

```csv
frame,articulacion,severidad,tipo,mensaje
45,rodilla,MEDIA,DIF_MEDIA,"Dif media 25.3° > 20°"
67,cadera,ALTA,SIM_INDICE,"Índ sim 32.1% > 22%"
89,tobillo,ALTA,CORR_BAJA,"Corr 0.45 < -0.2"
```

## Casos de Uso

### 1. Evaluación Inicial de Paciente

```python
# Flujo típico:
1. Crear/seleccionar paciente
2. Cargar video de evaluación
3. Ejecutar análisis (5-10 min)
4. Revisar análisis IA
5. Hacer preguntas en el chat
6. Exportar reportes (CSV + video)
```

### 2. Seguimiento de Progreso

```python
# Comparar múltiples sesiones:
1. Seleccionar paciente existente
2. Ver historial de sesiones
3. Seleccionar 2+ sesiones
4. "Comparar Sesiones"
5. Ver tendencias en métricas
```

### 3. Análisis Detallado

```python
# Exploración profunda:
1. Cargar sesión
2. Revisar alertas específicas
3. Consultar con IA sobre ejercicios
4. Ver video en cámara lenta (0.14x)
5. Identificar frames problemáticos
```

## Configuración Avanzada

### `config.py`

```python
# Parámetros de análisis
WINDOW_SIZE_FRAMES = 30        # Tamaño de ventana deslizante
ANALYZE_EVERY = 10             # Analizar cada N frames
SLOW_MOTION_FACTOR = 7         # Factor de cámara lenta (1/7 = 0.14x)

# Apariencia
APPEARANCE_MODE = "dark"       # "dark", "light", "system"
COLOR_THEME = "blue"           # "blue", "green", "dark-blue"
```

### Modelos Gemini Disponibles

```python
# Opción 1: Más rápido (recomendado)
"models/gemini-2.5-flash"

# Opción 2: Más ligero
"models/gemini-2.5-flash-lite"

# Opción 3: Más capaz
"models/gemini-2.5-pro"

# Opción 4: Experimental
"models/gemini-2.0-flash-exp"
```

## Testing

### Verificar Instalación

```bash
# Test de modelos disponibles
python test_gemini_models.py
```

### Análisis de Prueba

```bash
# Usar video de ejemplo
python main.py
# Cargar: video_example/output_alerts.mp4
```

## 🐛 Solución de Problemas

### Error: "models/gemini-X not found"

```bash
# Verificar versión del SDK
pip show google-generativeai

# Actualizar si es necesario
pip install --upgrade google-generativeai

# Listar modelos disponibles
python test_gemini_models.py
```

### Error: "MediaPipe initialization failed"

```bash
# Reinstalar MediaPipe
pip uninstall mediapipe
pip install mediapipe==0.10.0
```

### Video no se procesa

- Verificar formato: MP4 preferido
- Verificar codec: H.264 recomendado
- Verificar resolución: 320x240 a 1920x1080
- FPS: 24-60 recomendado

### Chat no responde

- Verificar API Key en `.env`
- Verificar cuota de API en Google Cloud Console
- Revisar logs de consola para errores específicos

## Métricas del Sistema

### Rendimiento

- **Procesamiento**: ~30-60 FPS en CPU moderna
- **Detección MediaPipe**: ~15-20ms por frame
- **Análisis IA**: 5-15 segundos (primera consulta)
- **Chat**: 1-3 segundos por respuesta

### Capacidad

- **Pacientes**: Ilimitados
- **Sesiones por paciente**: Ilimitadas
- **Duración de video**: 1 seg - 30 min recomendado
- **Tamaño de video**: Hasta 2GB

## 🔒 Seguridad y Privacidad

- API Keys almacenadas en `.env` (no versionadas)
- Datos de pacientes locales (no en la nube)
- No se envían videos a Gemini (solo métricas)
- IDs de pacientes personalizables
