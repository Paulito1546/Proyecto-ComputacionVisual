# Ejercicio 7 - Importando el Mundo (OBJ/STL/GLTF)

**Autor:** Deibyd Santiago Barragan Gaitan

## Qué se hizo y por qué

Se desarrolló una aplicación web interactiva que compara tres formatos 3D (OBJ, STL, GLTF) para entender sus diferencias técnicas y visuales. Se utilizó Three.js con React porque permite cargar múltiples formatos y renderizarlos con WebGL. Se incluyó un script Python con trimesh para generar los modelos y garantizar que todos tengan la misma geometría base.

El proyecto permite alternar entre formatos, activar wireframe, y ver estadísticas en tiempo real. La idea era demostrar que aunque la geometría sea idéntica, cada formato maneja colores, materiales y compresión de forma diferente.

## Evidencias

### Selector de Formatos
![Selector de Formatos](./gifs/formatos.gif)

### Modo Wireframe
![Modo Wireframe](./gifs/wireframe.gif)

### Tabla Comparativa Principal

| Métrica | OBJ | STL | GLTF |
|---------|-----|-----|------|
| Vértices | 1,220 | 1,220 | 1,220 |
| Caras | 2,432 | 2,432 | 2,432 |
| Tamaño | 116.41 KB | 118.83 KB | 48.50 KB |
| Colores | Sí (.mtl) | No | Sí (integrado) |
| Animaciones | No | No | Sí |
| Compresión | No | No | Binaria (GLB) |

### Conclusiones

Los tres formatos presentan geometría idéntica (1,220 vértices, 2,432 caras) porque se exportaron del mismo mesh usando trimesh. Esta igualdad en las estadísticas geométricas es esperada y demuestra que la conversión preserva la forma del modelo. La diferencia real está en cómo cada formato almacena y organiza esa información.

**GLTF** es 60% más pequeño que los otros dos (48.50 KB vs ~117 KB) gracias a su compresión binaria y uso eficiente de índices para evitar duplicar vértices. Además, integra colores, materiales PBR y hasta animaciones en un solo archivo. Esto lo hace ideal para aplicaciones web modernas donde el tamaño de descarga y la velocidad de carga son críticos.

**STL** guarda únicamente triángulos y normales, sin información de color, UVs o materiales. Cada triángulo se almacena con sus tres vértices completos, incluso si esos vértices ya aparecieron en otros triángulos, generando redundancia. Sin embargo, esta simplicidad es intencional: STL está optimizado para fabricación digital (impresoras 3D, CNC) donde solo importa la forma física del objeto.

**OBJ** usa formato de texto plano, lo que lo hace legible y editable manualmente, pero también más pesado. Separa los materiales en un archivo .mtl adicional, lo cual puede complicar la distribución pero permite mayor flexibilidad. Su compatibilidad universal lo convierte en el formato de intercambio estándar entre diferentes aplicaciones de modelado 3D.

Para este proyecto de visualización web, GLTF demostró ser la mejor opción por su eficiencia, soporte nativo en Three.js y capacidad de preservar materiales PBR que se renderizan correctamente sin configuración adicional.

## Dependencias y Cómo Ejecutar

### Dependencias

**Node.js:**
```bash
npm install
```

**Python:**
```bash
pip install trimesh numpy
```

### Ejecución

1. Generar modelos:
```bash
python convert_models.py
```

2. Iniciar aplicación:
```bash
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Enlace al Código

[Ver código en el repositorio](./src)

## Prompts Utilizados

**Para implementación:**
- "Cómo se cargan diferentes formatos 3D en Three.js usando React?"
- "Cómo aplicar materiales wireframe a objetos cargados desde archivos externos?"
- "Qué librerías de Python permiten exportar modelos 3D a múltiples formatos y cómo se usan?"

**Para debugging:**
- "Por qué el wireframe solo funciona en STL pero no en OBJ ni GLTF?"
- "Cómo centrar modelos 3D de diferentes formatos para que se vean del mismo tamaño en Three.js?"

**Para optimización:**
- "Explica las diferencias de tamaño entre archivos OBJ, STL y GLTF del mismo modelo"
- "Qué método usa GLTF para comprimir geometría y reducir el tamaño de archivo?"

Los modelos 3D se generaron programáticamente sin IA, solo primitivas geométricas de trimesh (icosphere, cylinder, torus).

## Comentarios

### Aprendizaje
- Los formatos 3D no son simplemente "archivos diferentes", cada uno fue diseñado con un propósito específico en mente.
- GLTF maneja compresión binaria de forma eficiente, lo cual explica por qué se ha convertido en el estándar para aplicaciones web.
- STL está realmente optimizado solo para fabricación, no para visualización, lo que explica su simplicidad estructural.

### Retos
- Lograr que el wireframe funcionara en OBJ y GLTF. Estos formatos crean jerarquías de objetos anidados, no geometrías directas como STL. Fue necesario usar `traverse()` para aplicar wireframe recursivamente a todos los meshes de la escena.
- Centrar los modelos correctamente usando Box3 para que todos se visualizaran con el mismo tamaño aparente, independientemente de su formato.

### Mejoras Futuras
- Permitir cargar modelos personalizados desde archivos locales mediante drag & drop.
- Agregar más estadísticas como área de superficie, volumen y densidad de malla.
- Comparar tiempos de carga real de cada formato con modelos de diferentes tamaños.

## Estructura del Repo

```
07_conversion_formatos_3d/
├── public/
│   └── models/
│       ├── model.obj
│       ├── model.mtl
│       ├── model.stl
│       └── model.glb
├── src/
│   ├── components/
│   │   ├── Scene.jsx
│   │   ├── Controls.jsx
│   │   ├── HUD.jsx
│   │   └── ComparisonTable.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── convert_models.py
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## Créditos/Referencias

- **Three.js Documentation**: [threejs.org](https://threejs.org)
- **React Three Fiber**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- **Trimesh Library**: [trimesh.org](https://trimsh.org)
- Modelos generados proceduralmente, sin uso de datasets externos.

## 🐛 Troubleshooting

Si los modelos no cargan:
1. Verifica que los archivos existan en `public/models/`
2. Ejecuta `python convert_models.py` para generarlos
3. Revisa la consola del navegador para errores
4. Asegúrate de que las rutas sean correctas

## 👨‍💻 Autor

Ejercicio 7 - Computación Visual 2025-2
