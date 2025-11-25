# Módulo C: Visualización 3D - Inicio Rápido

## 🚀 Instalación y Ejecución (3 pasos)

### 1. Instalar Dependencias

Abre PowerShell en la carpeta `threejs`:

```powershell
cd threejs
npm install
```

⏱️ Esto tomará 2-3 minutos la primera vez.

### 2. Iniciar el Servidor

```powershell
npm run dev
```

### 3. Abrir en el Navegador

Abre tu navegador en: **http://localhost:3000**

---

## 🎮 Cómo Usar

### Vista 3D (Por Defecto)

La escena muestra tres objetos 3D con animaciones:
- **Cubo** (izquierda): Material metálico con animación de color
- **Esfera** (centro): Material ondulante con movimiento flotante  
- **Toro** (derecha): Material distorsionado con rotación dual

### Controles Interactivos

**Con el Mouse:**
- **Rotar cámara**: Click izquierdo + arrastrar
- **Zoom**: Rueda del mouse
- **Pan**: Click derecho + arrastrar

**Panel de Control (esquina inferior izquierda):**
- 🎮 **Vista 3D / Vista AR**: Cambia entre modos
- 🎯 **Botones Cube/Sphere/Torus**: Selecciona objeto (se agranda)
- ▶️ **Play/Pause**: Activa/pausa animaciones
- ✅ **Grid**: Muestra/oculta cuadrícula
- 🎚️ **Rotation Speed**: Velocidad de rotación (0-3x)
- 💡 **Light Intensity**: Intensidad de iluminación (0.1-3x)

### HUD (Métricas en Tiempo Real)

**Esquina superior izquierda muestra:**
- **FPS**: Cuadros por segundo (verde si >50)
- **Objects**: Número de objetos en escena
- **Camera**: Tipo de cámara activa
- **Lighting**: Modo de iluminación
- **Animation**: Estado de animaciones

### Modo AR

1. Click en **"📱 AR View"**
2. Permite acceso a la cámara
3. Apunta la cámara a una superficie plana
4. Verás un cubo 3D simulado sobre el video
5. Click en **"🎮 3D View"** para volver

---

## ✨ Características Implementadas

### Visualización 3D
- ✅ Escena interactiva con React Three Fiber
- ✅ 3 objetos 3D con materiales avanzados
- ✅ Sistema de iluminación dinámica (4 luces)
- ✅ Sistema de partículas (200+ partículas animadas)
- ✅ Sombras en tiempo real de alta calidad
- ✅ Environment mapping (entorno sunset)
- ✅ Cuadrícula infinita personalizable

### Interactividad
- ✅ Controles de órbita con damping
- ✅ Selección de objetos
- ✅ Ajuste de velocidad de animación
- ✅ Control de intensidad de luz
- ✅ Toggle de cuadrícula
- ✅ Cambio entre vistas 3D/AR

### AR (Realidad Aumentada)
- ✅ Acceso a cámara del dispositivo
- ✅ Overlay de canvas sobre video
- ✅ Detección de marcadores (simulada)
- ✅ Proyección 3D en tiempo real

### Optimización
- ✅ Reutilización de geometrías
- ✅ Caché de materiales
- ✅ Loop de animación único
- ✅ Renderizado condicional
- ✅ Estadísticas de rendimiento
- ✅ Mapas de sombras optimizados (2048x2048)

---

## 📁 Estructura del Proyecto

```
threejs/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Scene3D.jsx      # Escena principal
│   │   ├── InteractiveObjects.jsx  # Objetos 3D
│   │   ├── Lighting.jsx     # Sistema de luces
│   │   ├── AnimatedParticles.jsx   # Partículas
│   │   ├── HUD.jsx          # Métricas en pantalla
│   │   ├── ControlsPanel.jsx       # Panel de control
│   │   └── ARView.jsx       # Vista AR
│   ├── config/
│   │   └── scene-config.js  # Configuración
│   ├── utils/
│   │   └── backend-client.js  # Cliente WebSocket
│   ├── App.jsx              # App principal
│   └── main.jsx             # Punto de entrada
├── public/
│   └── markers/             # Marcadores AR
├── package.json
└── README.md                # Documentación completa
```

---

## 🔧 Comandos Disponibles

```powershell
# Desarrollo (con hot reload)
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Linting
npm run lint
```

## 🔗 Integración con Otros Módulos

### Conexión con Módulo A (Detección YOLO)

El proyecto incluye un cliente WebSocket (`src/utils/backend-client.js`) listo para conectar con el backend de Python:

```javascript
// Ejemplo de uso
import VisionBackendClient from './utils/backend-client'

const client = new VisionBackendClient('ws://localhost:8000')

client.on('onDetection', (data) => {
  // Actualizar escena según detecciones
  setSceneConfig({ activeObject: data.class })
})

client.connect()
```

Esto permite que las detecciones de YOLO controlen los objetos 3D en tiempo real.

---

## ❓ Solución de Problemas

### El servidor no inicia
```powershell
# Limpiar caché e reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Pantalla negra en el navegador
- Verificar consola del navegador (F12)
- Comprobar que WebGL está habilitado
- Probar en Chrome o Firefox

### FPS bajo
- Reducir partículas en `AnimatedParticles.jsx`
- Desactivar sombras temporalmente
- Cerrar otras aplicaciones pesadas

### AR no funciona
- Permitir acceso a cámara en configuración del navegador
- Usar HTTPS o localhost
- Probar en Chrome (mejor soporte)

---

## 👥 Equipo

- Deibyd Santiago Barragán Gaitán
- Paul Marie Emptoz
- Juan Felipe Hernandez Ochoa
- Juan Diego Mendoza Torres
- Julián David Osorio Amaya

---

## ✅ Estado del Módulo

**Estado**: ✅ COMPLETO Y FUNCIONAL

Todos los requisitos del Punto C han sido implementados:
- ✅ Escena 3D interactiva
- ✅ Modelos 3D con animaciones
- ✅ Overlays dinámicos
- ✅ Integración AR.js
- ✅ Optimización visual
- ✅ Documentación completa
