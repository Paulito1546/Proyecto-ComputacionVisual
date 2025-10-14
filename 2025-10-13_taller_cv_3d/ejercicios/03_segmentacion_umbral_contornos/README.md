# Ejercicio 3 - Segmentando el Mundo (Binarización y Contornos)

## Breve explicación

En este ejercicio implementamos la segmentación de una imagen utilizando técnicas de umbralización fija y adaptativa.
El objetivo fue detectar las formas presentes (esferas) mediante la detección de contornos en la imagen binarizada.
Calculamos las propiedades geométricas claves: centroide (usando momentos), área y perímetro de cada contorno.
Además, hicimos una clasificación básica por número de vértices para aproximar la forma de cada contorno.
Se descartaron contornos excesivamente grandes (como bordes de la imagen) para evitar falsos positivos.

## GIF(s) animado(s)

El GIF generado muestra secuencialmente:

- La imagen original en escala de grises,
- La imagen con umbral fijo invertido,
- La imagen con umbral adaptativo,
- Finalmente, la imagen con los contornos dibujados y la información de centroide, área, perímetro y vértices anotada.


## Enlace al código/escena/notebook dentro del repo

El código está en el archivo `ejercicio_3.py` dentro del repositorio en la carpeta correspondiente.

## Prompts utilizados

No se utilizaron prompts automáticamente; el desarrollo fue realizado manualmente con conocimiento de OpenCV y procesamiento de imágenes.

## Comentarios personales: aprendizaje, retos, mejoras futuras

- Aprendizaje: Comprendí cómo aplicar umbralización fija y adaptativa, junto con detección y análisis de contornos usando OpenCV.
- Retos: Ajustar correctamente los parámetros de umbral para diferentes condiciones de imagen y filtrar los contornos no deseados.
- Mejoras futuras: Integrar un sistema de clasificación de formas más avanzado, implementación de más técnicas de filtrado de ruido y ampliación para trabajar con imágenes en color.

