# Proyecto React Three Fiber - Ejercicio de Jerarquía con dat.GUI

## Ejercicios Realizados

### Breve explicación  
Creé una escena 3D usando React Three Fiber que muestra una jerarquía de objetos: un objeto padre que contiene un hijo y un nieto.  
Implementé controles independientes usando la librería dat.GUI para rotar cada nivel (padre, hijo y nieto) y observar cómo las rotaciones se comportan en la jerarquía, lo que permite entender la herencia y composición de transformaciones en gráficos 3D.  
Decidí reorganizar los objetos para que el pequeño nieto (un cono azul) tenga una rotación visible clara, separándolo de otros hijos, y traducir toda la interfaz al español para facilitar el entendimiento.

### GIF(s) animado(s)  
(Inserta aquí los GIFs animados generados mostrando los movimientos independientes del padre, hijo y nieto rotando)

Enlace al código / escena  
El código fuente está disponible dentro del repositorio, en el archivo:  
src/App.jsx  
(Agregar enlace directo si el repo está en línea)

### Prompts utilizados  
Ninguno, el código fue escrito manualmente y guiado por la lógica de React y React Three Fiber para creación de jerarquías visuales.

### Comentarios personales  
- Aprendizaje: Este ejercicio me permitió comprender en profundidad cómo funcionan las transformaciones jerárquicas en Three.js/React Three Fiber, y cómo controlar visualmente cada elemento con dat.GUI.  
- Retos: Configurar el entorno de desarrollo y resolver problemas con la versión de Node.js para hacer funcionar Vite. También entender la correcta configuración de las rotaciones independientes.  
- Mejoras futuras: Agregar animaciones automáticas, crear más niveles de jerarquía, y experimentar con otras propiedades (escala, posición, materiales dinámicos). Mejorar la interfaz de usuario para hacerla más intuitiva.
