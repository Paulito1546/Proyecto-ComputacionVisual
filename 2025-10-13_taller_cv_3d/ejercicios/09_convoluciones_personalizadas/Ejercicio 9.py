import numpy as np
import cv2 as cv

def Convolucion(Frame, Kernel):
    # Obtener las dimensiones del kernel
    k_alto, k_ancho = Kernel.shape
    pad_alto = k_alto // 2
    pad_ancho = k_ancho // 2

    # Obtener las dimensiones del frame
    f_alto, f_ancho = Frame.shape

    # Crear una imagen de salida con las mismas dimensiones que el frame original
    Salida = np.zeros((f_alto, f_ancho), dtype=np.float32)

    # Rellenar los bordes del frame para manejar los bordes durante la convolución
    Pad_frame = cv.copyMakeBorder(Frame, pad_alto, pad_alto, pad_ancho, pad_ancho, cv.BORDER_REPLICATE)

    # Realizar la convolución
    for i in range(f_alto):
        for j in range(f_ancho):
            region = Pad_frame[i:i + k_alto, j:j + k_ancho]
            Salida[i, j] = np.sum(region * Kernel)

    Salida = np.clip(Salida, 0, 255).astype(np.uint8)

    return Salida


#Definicion de filtros
Sharpen = np.array([[0, -1, 0],
                    [-1,  5, -1],
                    [0, -1, 0]], dtype='int')

Esquina_vertical = np.array([[-1, 0, 1],
                             [-2, 0, 2],
                             [-1, 0, 1]], dtype='int')

Esquina_horizontal = np.array([[-1, -2, -1],
                               [0, 0, 0],
                               [1, 2, 1]], dtype='int')

Blur = (1/16) * np.array([[1, 2, 1],
                         [2, 4, 2],
                         [1, 2, 1]], dtype='int')

B_kernel = (
           ('Sharpen', Sharpen),
           ('Esquina_vertical', Esquina_vertical),
           ('Esquina_horizontal', Esquina_horizontal),
           ('Blur', Blur),
         )


#Imagen de entrada
Imagen = cv.imread('Proyecto-ComputacionVisual\\2025-10-13_taller_cv_3d\\ejercicios\\09_convoluciones_personalizadas\\Gato.png')
Imagen_gris = cv.cvtColor(Imagen, cv.COLOR_BGR2GRAY)

for nombre, Kernel in B_kernel:
    Imagen_filtrada_manual = Convolucion(Imagen_gris, Kernel)
    Imagen_filtrada_automatica = cv.filter2D(Imagen_gris, -1, Kernel)

    cv.imshow('Original', Imagen_gris)
    cv.imshow('Filtro Manual', Imagen_filtrada_manual)
    cv.imshow('Filtro Automatico', Imagen_filtrada_automatica)
    cv.waitKey(0)
    cv.destroyAllWindows()