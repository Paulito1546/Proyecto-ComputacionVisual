import cv2
import numpy as np
import imageio

# Paso 1: Cargar imagen en escala de grises
imagen = cv2.imread('imagen.jpg', cv2.IMREAD_GRAYSCALE)

# Paso 2: Umbral fijo
_, umbral_fijo = cv2.threshold(imagen, 230, 255, cv2.THRESH_BINARY_INV)


# Paso 3: Umbral adaptativo
umbral_adaptativo = cv2.adaptiveThreshold(imagen, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)

# Paso 4: Encontrar contornos en imagen umbralizada fija
contornos, _ = cv2.findContours(umbral_fijo, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print(f"Nombre de contours trouvés : {len(contornos)}")

# Convertir imagen a color para dibujo
imagen_contornos = cv2.cvtColor(imagen, cv2.COLOR_GRAY2BGR)

altura, ancho = imagen.shape
area_total = altura * ancho

for cnt in contornos:
    area = cv2.contourArea(cnt)
    # Exclure contours très petits et contours trop grands (proche de la surface entière)
    if area > 0.95 * area_total:
        continue

    # Dibujar contorno verde
    cv2.drawContours(imagen_contornos, [cnt], 0, (0,255,0), 2)

    # Calcular momentos para centroide
    momentos = cv2.moments(cnt)
    if momentos["m00"] != 0:
        cx = int(momentos["m10"] / momentos["m00"])
        cy = int(momentos["m01"] / momentos["m00"])
        cv2.circle(imagen_contornos, (cx, cy), 5, (0,0,255), -1)  # centroide rojo

        # Calcular área y perímetro 
        area = cv2.contourArea(cnt)
        perimetro = cv2.arcLength(cnt, True)

        # Mostrar área y perímetro
        cv2.putText(imagen_contornos, f"A:{int(area)}", (cx + 10, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        cv2.putText(imagen_contornos, f"P:{int(perimetro)}", (cx + 10, cy + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        # Paso bonus: Clasificación por número de vértices
        epsilon = 0.02 * perimetro
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        vertices = len(approx)
        cv2.putText(imagen_contornos, f"V:{vertices}", (cx+10, cy+30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)

# Paso 5: Guardar imágenes para el GIF
imageio.imwrite('original.png', imagen)
imageio.imwrite('umbral_fijo.png', umbral_fijo)
imageio.imwrite('umbral_adaptativo.png', umbral_adaptativo)
imageio.imwrite('contornos.png', cv2.cvtColor(imagen_contornos, cv2.COLOR_BGR2RGB))

# Crear GIF combinando imágenes
imagenes = [
    np.stack([imagen]*3, axis=-1),        # Image originale (gris -> RGB)
    np.stack([umbral_fijo]*3, axis=-1),  # Image seuillée (binaire)
    np.stack([umbral_adaptativo]*3, axis=-1),
    cv2.cvtColor(imagen_contornos, cv2.COLOR_BGR2RGB)  # Image avec contours
]

imageio.mimsave('resultado.gif', imagenes, duration=1500)

print('Proceso terminado. Archivos: original.png, umbral_fijo.png, umbral_adaptativo.png, contornos.png, resultado.gif.')

