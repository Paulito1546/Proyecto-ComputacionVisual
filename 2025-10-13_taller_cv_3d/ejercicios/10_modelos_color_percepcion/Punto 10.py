import cv2
import numpy as np

def simular_daltonismo(imagen_rgb, tipo='protanopia'):
    if tipo == 'protanopia':
        matriz_transformacion = np.array([
            [0.567, 0.433, 0.000],
            [0.558, 0.442, 0.000],
            [0.000, 0.242, 0.758]
        ])
    else:
        matriz_transformacion = np.array([
            [0.625, 0.375, 0.000],
            [0.700, 0.300, 0.000],
            [0.000, 0.300, 0.700]
        ])

    imagen_bgr = cv2.cvtColor(imagen_rgb, cv2.COLOR_RGB2BGR)
    daltonizada_rgb = cv2.transform(imagen_bgr, matriz_transformacion)
    
    daltonizada_bgr = cv2.cvtColor(daltonizada_rgb, cv2.COLOR_RGB2BGR)
    return daltonizada_bgr

def simular_baja_iluminacion(imagen, factor_brillo=0.5):
    hsv = cv2.cvtColor(imagen, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    
    v = np.clip(v * factor_brillo, 0, 255).astype(np.uint8)
    
    final_hsv = cv2.merge((h, s, v))
    imagen_oscura = cv2.cvtColor(final_hsv, cv2.COLOR_HSV2BGR)
    return imagen_oscura

def ajustar_temperatura(imagen, calidez=20):
    lut_rojo = np.arange(256, dtype=np.uint8)
    lut_azul = np.arange(256, dtype=np.uint8)

    for i in range(256):
        lut_rojo[i] = np.clip(i + calidez, 0, 255)
        lut_azul[i] = np.clip(i - calidez, 0, 255)

    b, g, r = cv2.split(imagen)
    r = cv2.LUT(r, lut_rojo)
    b = cv2.LUT(b, lut_azul)

    imagen_calida = cv2.merge((b, g, r))
    return imagen_calida


# Cargar imagen
imagen_original = cv2.imread('Proyecto-ComputacionVisual\\2025-10-13_taller_cv_3d\\ejercicios\\10_modelos_color_percepcion\\Paisaje.png')

imagen_original = cv2.resize(imagen_original, (600, 400)) 

# Imprimir instrucciones
print("--- Explorador de Color Interactivo ---")
print("Presiona una tecla para aplicar un filtro:")
print("  o - Mostrar Original")
print("  h - Visualizar canales HSV")
print("  l - Visualizar canales CIE Lab")
print("  d - Simular Deuteranopía (daltonismo verde)")
print("  p - Simular Protanopía (daltonismo rojo)")
print("  b - Simular Baja Iluminación")
print("  t - Aumentar Temperatura (cálido)")
print("  f - Bajar Temperatura (frío)")
print("  i - Invertir Colores (negativo)")
print("  g - Monocromo (escala de grises)")
print("  ESC - Salir")

cv2.imshow('Original', imagen_original)

while True:
    key = cv2.waitKey(0) & 0xFF

    if key == 27: # Tecla ESC
        break
    elif key == ord('o'):
        cv2.imshow('Resultado', imagen_original)
        cv2.setWindowTitle('Resultado', 'Original')
    
    elif key == ord('h'):
        hsv = cv2.cvtColor(imagen_original, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        resultado = np.hstack([h, s, v])
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Canales HSV: H | S | V')
        
    elif key == ord('l'):
        lab = cv2.cvtColor(imagen_original, cv2.COLOR_BGR2LAB)
        L, a, b = cv2.split(lab)
        resultado = np.hstack([L, a, b])
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Canales CIE Lab: L* | a* | b*')
        
    # --- Simulaciones de Visión ---
    elif key == ord('d'):
        resultado = simular_daltonismo(imagen_original, tipo='deuteranopia')
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Simulación: Deuteranopía')
        
    elif key == ord('p'):
        resultado = simular_daltonismo(imagen_original, tipo='protanopia')
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Simulación: Protanopía')
        
    elif key == ord('b'):
        resultado = simular_baja_iluminacion(imagen_original)
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Simulación: Baja Iluminación')

    # --- Filtros ---
    elif key == ord('t'):
        resultado = ajustar_temperatura(imagen_original, calidez=30)
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Filtro: Cálido')
        
    elif key == ord('f'):
        resultado = ajustar_temperatura(imagen_original, calidez=-30)
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Filtro: Frío')
        
    elif key == ord('i'):
        resultado = cv2.bitwise_not(imagen_original)
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Filtro: Invertido (Negativo)')

    elif key == ord('g'):
        resultado = cv2.cvtColor(imagen_original, cv2.COLOR_BGR2GRAY)
        cv2.imshow('Resultado', resultado)
        cv2.setWindowTitle('Resultado', 'Filtro: Monocromo')

cv2.destroyAllWindows()