# Guía de Integración con Otros Módulos

## Ejecutar Módulo A (Python) y Módulo C (Three.js)

---

## Requisitos

### Módulo Python (A)
- Python 3.8+
- Webcam para detección en tiempo real

### Módulo Three.js (C)
- Node.js 18+
- Navegador moderno (Chrome/Firefox)
- Webcam para modo AR (opcional)

---

## Instalación

### 1. Configurar Módulo Python

```powershell
cd c:\Proyecto-ComputacionVisual\2025-12-01_super_taller_cv
pip install -r requirements.txt
```

### 2. Configurar Módulo Three.js

```powershell
cd c:\Proyecto-ComputacionVisual\2025-12-01_super_taller_cv\threejs
npm install
```

---

## Ejecución

### Terminal 1: Backend Python

```powershell
python python/main.py
```

### Terminal 2: Frontend Three.js

```powershell
cd threejs
npm run dev
```

Abrir: **http://localhost:3000**

---

## Demostración Individual

### Módulo A (Python/YOLO)
1. Ejecutar `python python/main.py`
2. Se abre ventana con webcam
3. Muestra detecciones YOLO en tiempo real
4. Presionar 'q' para salir

### Módulo C (Three.js)
1. Ejecutar `npm run dev` en carpeta threejs
2. Abrir navegador en `http://localhost:3000`
3. Interactuar con escena 3D
4. Probar modo AR:
   - Descargar e imprimir marcador Hiro
   - Apuntar cámara al marcador
   - Ver objetos 3D sobre el marcador

---

## Integración Futura (WebSocket)

## Integración Futura (WebSocket)

### Lado Python (Módulo A)

Agregar servidor WebSocket en `python/main.py`:

```python
import asyncio
import websockets
import json

async def handler(websocket, path):
    # Manejar conexiones
    pass

async def broadcast_detection(data):
    # Enviar detecciones a clientes
    message = json.dumps({
        'type': 'detection',
        'payload': data
    })
    # await client.send(message)

# Iniciar servidor WebSocket
# start_server = websockets.serve(handler, "localhost", 8000)
```

### Lado Three.js (Módulo C)

Descomentar código WebSocket en `src/App.jsx`:

```javascript
import VisionBackendClient from './utils/backend-client'

useEffect(() => {
  const client = new VisionBackendClient('ws://localhost:8000')
  
  client.on('onDetection', (data) => {
    // Mapear detección a objeto 3D
    const objectMap = {
      'person': 'cube',
      'car': 'sphere',
      'dog': 'torus'
    }
    setSceneConfig({ activeObject: objectMap[data.class] })
  })
  
  client.connect()
  return () => client.disconnect()
}, [])
```

**Flujo**: Python detecta → WebSocket → Three.js actualiza objeto 3D

---

## Solución de Problemas

### Python
- **Error de imports**: `pip install --upgrade ultralytics opencv-python`
- **Webcam no detectada**: Verificar permisos, cerrar otras apps
- **FPS bajo**: Reducir resolución o usar GPU

### Three.js
- **npm install falla**: `Remove-Item -Recurse node_modules; npm install`
- **Puerto 3000 ocupado**: Vite usa automáticamente el siguiente puerto
- **Pantalla negra**: Verificar consola del navegador (F12)

### Integración
- **WebSocket falla**: Verificar que Python esté corriendo primero
- **Sin datos**: Revisar consola del navegador y terminal de Python

---

## Configuración de Puertos

| Módulo | Puerto | URL |
|--------|--------|-----|
| Python WebSocket | 8000 | ws://localhost:8000 |
| Three.js Dev | 3000 | http://localhost:3000 |

---

## Detener el Sistema

- **Python**: Presionar `Ctrl+C` o tecla 'q' en ventana
- **Three.js**: Presionar `Ctrl+C` en terminal

---

## Grabación para Evidencias

### Herramientas Recomendadas
- **OBS Studio**: Grabación de pantalla completa
- **ShareX**: Screenshots y GIFs rápidos
- **Windows Game Bar** (Win+G): Grabación rápida

### Qué Grabar
1. **Módulo Python** (30s): Detecciones YOLO en tiempo real
2. **Módulo Three.js** (30s): Escena 3D con controles
3. **Sistema integrado** (60s): Detecciones controlando objetos 3D

### Configuración
- Resolución: 1920x1080 (1080p)
- FPS: 30 o 60
- Formato: MP4 (H.264)

---

## Estructura del Proyecto

```
2025-12-01_super_taller_cv/
├── python/              # Módulo A: Detección YOLO
│   ├── main.py
│   └── detection/
├── threejs/             # Módulo C: Visualización 3D
│   ├── src/
│   └── package.json
└── requirements.txt
```

---

**Para más información**:
- Ver `INICIO_RAPIDO.md` - Guía de uso del módulo 3D
- Ver `RESUMEN_EJECUTIVO.md` - Resumen completo del módulo
