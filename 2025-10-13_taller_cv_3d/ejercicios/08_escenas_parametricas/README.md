# Taller 2 - Ejercicio 8: Escenas Paramétricas

## Resumen

Este ejercicio implementa generación de geometría 3D a partir de datos estructurados en JSON usando Three.js con React Three Fiber. La meta es mapear arrays de objetos JavaScript a componentes `<mesh>` parametrizando posición, escala y color directamente desde archivos de datos. Se implementaron tres escenas diferentes: una con objetos variados posicionados manualmente, un patrón de grilla generado proceduralmente, y una espiral 3D con gradiente de color. Se incluyeron controles GUI con Leva para modificar parámetros en tiempo real y exportar las configuraciones.

## Ejercicio Realizado

### Escena 1: Objetos desde JSON

Leí un array de objetos desde `sceneData.json` y mapeé cada elemento a un componente `<mesh>` con geometría, posición, escala y color parametrizados. Soporta 8 tipos de primitivas (box, sphere, cone, cylinder, torus, octahedron, tetrahedron, icosahedron).

**Qué hice**: Creé un componente `ParametricObject` que toma datos JSON y los convierte en geometrías Three.js. Usé un switch para seleccionar el tipo de geometría y apliqué las propiedades directamente desde el objeto de datos.

**Código**: [`src/components/ParametricObjects.jsx`](src/components/ParametricObjects.jsx) líneas 4-46

**Datos**: [`src/data/sceneData.json`](src/data/sceneData.json)

![Escena 1 - Objetos desde JSON](gifs/escena_1.gif)

---

### Escena 2: Patrón de Grilla Procedural

Generé una matriz NxN de esferas en el plano XZ calculando posiciones mediante bucles anidados. Los parámetros `gridSize` y `spacing` en el JSON controlan la cantidad y separación de objetos.

**Qué hice**: El componente `GridPattern` lee parámetros y genera posiciones automáticamente usando `(i - center) * spacing` para centrar la grilla. Agregué variación de escala basada en la distancia al centro para crear efecto visual.

**Código**: [`src/components/ParametricObjects.jsx`](src/components/ParametricObjects.jsx) líneas 48-79

**Datos**: [`src/data/gridPattern.json`](src/data/gridPattern.json)

![Escena 2 - Patrón de Grilla](gifs/escena_2.gif)

---

### Escena 3: Espiral Paramétrica 3D

Distribuí objetos en forma helicoidal usando funciones trigonométricas. Las posiciones se calculan con `cos(angle)` y `sin(angle)` para el movimiento circular, mientras la coordenada Y aumenta linealmente para crear altura.

**Qué hice**: Implementé el algoritmo de espiral paramétrica donde cada objeto tiene un ángulo `θ = (i / count) * rotations * 2π`. Agregué interpolación de color entre `colorStart` y `colorEnd` usando el índice normalizado.

**Código**: [`src/components/ParametricObjects.jsx`](src/components/ParametricObjects.jsx) líneas 81-123

**Datos**: [`src/data/spiralPattern.json`](src/data/spiralPattern.json)

![Escena 3 - Espiral Paramétrica](gifs/escena_3.gif)

---

### GUI Interactivo con Leva

Implementé controles para cambiar entre escenas, ajustar escala global, animación, cámara, iluminación y exportar JSON. El botón "Export Scene" descarga la configuración actual como archivo.

**Qué hice**: Usé `useControls` de Leva para crear sliders, selectores y botones. El control de distancia de cámara lo hice funcional con un componente `CameraController` que actualiza la posición usando `useThree()`.

**Código**: [`src/components/Scene.jsx`](src/components/Scene.jsx)

![GUI Interactivo con Leva](gifs/controles.gif)

## Prompts Utilizados

- "Crea un proyecto React con Vite que use Three.js y React Three Fiber para renderizar escenas 3D"
- "Cómo generar una grilla NxN de objetos 3D en el plano XZ usando bucles en React Three Fiber"
- "Algoritmo para distribuir objetos en forma de espiral 3D usando trigonometría (seno y coseno)"
- "Cómo interpolar colores en formato hexadecimal entre dos valores usando un índice normalizado"
- "Integrar Leva para crear controles GUI en React Three Fiber"
- "Hacer que la distancia de cámara en Three.js se actualice dinámicamente cuando cambia un slider usando useThree hook"
- "Implementar botón de reset para OrbitControls en React"
- "Función para exportar objeto JavaScript como archivo JSON descargable desde el navegador"

## Comentarios Personales

**Aprendizaje**: Entendí cómo transformar datos estructurados en representaciones visuales 3D. Me quedó claro que mapear arrays a componentes React es directo, pero controlar aspectos como la cámara requiere trabajar fuera del ciclo de renderizado normal de React usando hooks específicos de R3F.

**Retos**: El control dinámico de la cámara fue problemático porque las props del `<Canvas>` son estáticas. Tuve que crear un componente interno que accede al contexto de Three.js con `useThree()` para actualizar la posición en cada cambio del slider. También ajusté cómo sincronizar el estado de React con los controles de Leva.

**Mejoras futuras**: Agregar importación de CSV para generar escenas desde datasets reales, implementar más algoritmos generativos (fractales, noise), y permitir editar visualmente la posición de objetos con gizmos tipo editor 3D.

## Dependencias y Cómo Ejecutar

**Entorno**: Three.js con React Three Fiber + Vite

**Requisitos**: Node.js 16+

**Dependencias**:
- `three` (^0.180.0) - Librería 3D
- `@react-three/fiber` (^9.4.0) - React renderer para Three.js
- `@react-three/drei` (^10.7.6) - Helpers (OrbitControls, Environment, Grid)
- `leva` (^0.10.0) - GUI de controles
- `react` (^19.1.1) y `react-dom` (^19.1.1)

**Comandos**:

```bash
# Instalar
npm install

# Ejecutar
npm run dev
```

Abre `http://localhost:5173` en el navegador.

## Estructura del Repo

```
08_escenas_parametricas/
├── .github/
│   └── copilot-instructions.md
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ParametricObjects.jsx    # Componentes de geometrías y patrones
│   │   └── Scene.jsx                # Escena principal con controles
│   ├── data/
│   │   ├── sceneData.json          # Escena personalizada
│   │   ├── gridPattern.json        # Patrón de grilla
│   │   └── spiralPattern.json      # Patrón espiral
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Créditos y Referencias

- [Three.js](https://threejs.org/) - Librería de renderizado 3D
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer para Three.js
- [@react-three/drei](https://github.com/pmndrs/drei) - Helpers (OrbitControls, Environment, Grid)
- [Leva](https://github.com/pmndrs/leva) - GUI de controles

Datos JSON y algoritmos de generación de patrones: autoría propia.
