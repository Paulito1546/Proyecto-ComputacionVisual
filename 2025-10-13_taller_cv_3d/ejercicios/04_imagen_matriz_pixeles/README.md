# Ejercicio 4 — Manipulación de Región y Histogramas

## Breve explicación (qué hice y por qué)

En este ejercicio trabajé directamente sobre los píxeles y regiones de una imagen usando Python con OpenCV y NumPy. Seleccioné una zona específica, la coloreé de rojo puro, y la copié en otra parte de la imagen para demostrar la manipulación básica por regiones. Posteriormente, realicé ajustes de brillo y contraste con una interfaz interactiva. Para analizar los efectos de cada manipulación, calculé y mostré los histogramas globales y por región (antes y después de las modificaciones), utilizando tanto el canal de luminosidad (V en HSV) como el canal rojo (R en BGR). Este análisis evidencia cómo las transformaciones afectan la distribución de los valores de los píxeles de la imagen.

## GIF animado mostrando el resultado clave

El GIF muestra la imagen original, luego la imagen con el cuadrado rojo y la copia, seguido de la imagen modificada por brillo/contraste. Cada paso evidencia visualmente los cambios realizados en el procesamiento.

## Enlace al código/notebook dentro del repositorio

El código completo se encuentra en la carpeta `ejercicio_4`, bajo el nombre `ejercicio_4.py`.

## Prompts utilizados (si aplican)

No se emplearon prompts automáticos. Todo el código y los assets fueron desarrollados manualmente, siguiendo las consignas y ajustando cada paso para observar su efecto en los histogramas.

## Comentarios personales: aprendizaje, retos, mejoras futuras

- Aprendizaje: Aprendí a manipular directamente los píxeles y regiones de una imagen y a analizar los efectos en los histogramas globales y locales.
- Retos: Tuve que entender cómo calcular los histogramas por regiones específicas y adaptar el código para incluir ambos tipos (global y por región). También integré el sistema de copia y pegado para asegurar cambios visuales detectables.
- Mejoras futuras: Agregar análisis automatizado sobre más regiones; implementar sliders para ver los histogramas en tiempo real; y crear una visualización que compare directamente la evolución del histograma en cada paso del procesamiento.


