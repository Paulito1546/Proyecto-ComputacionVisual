import cv2
import numpy as np
import matplotlib.pyplot as plt

# Cargar imagen
image = cv2.imread('imagen.jpg')

# ---------- MODIFICAR UNA REGIÓN CON COPIA/PEGADO ROJO ----------
y1, y2, x1, x2 = 100, 200, 100, 200
image[y1:y2, x1:x2] = (0, 0, 255)  # rojo puro

y3, y4, x3, x4 = 200, 300, 200, 300
region_roja = image[y1:y2, x1:x2].copy()
image[y3:y4, x3:x4] = region_roja

# ---------- HISTOGRAMAS GLOBALES ANTES DE MODIFICAR CONTRASTE/BRILLO ----------
hsv_orig = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
hist_v_orig = cv2.calcHist([hsv_orig], [2], None, [256], [0,256])
hist_r_orig = cv2.calcHist([image], [2], None, [256], [0,256])

# ---------- HISTOGRAMAS POR REGIÓN ANTES DE MODIFICAR CONTRASTE/BRILLO ----------
region_orig = image[y1:y2, x1:x2]
hsv_region_orig = cv2.cvtColor(region_orig, cv2.COLOR_BGR2HSV)
hist_v_reg_orig = cv2.calcHist([hsv_region_orig], [2], None, [256], [0,256])
hist_r_reg_orig = cv2.calcHist([region_orig], [2], None, [256], [0,256])

# ---------- VENTANA INTERACTIVA CONTRASTE/BRILLO ----------
def nothing(x): pass
cv2.namedWindow('Control')
cv2.createTrackbar('Alpha', 'Control', 10, 30, nothing)
cv2.createTrackbar('Beta', 'Control', 50, 100, nothing)

while True:
    alpha = cv2.getTrackbarPos('Alpha', 'Control') / 10
    beta = cv2.getTrackbarPos('Beta', 'Control') - 50
    modified = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
    cv2.imshow('Control', modified)
    key = cv2.waitKey(1) & 0xFF
    if key == 27:
        break

cv2.destroyAllWindows()

# ---------- HISTOGRAMAS GLOBALES DESPUÉS DE MODIFICAR CONTRASTE/BRILLO ----------
hsv_modif = cv2.cvtColor(modified, cv2.COLOR_BGR2HSV)
hist_v_modif = cv2.calcHist([hsv_modif], [2], None, [256], [0,256])
hist_r_modif = cv2.calcHist([modified], [2], None, [256], [0,256])

# ---------- HISTOGRAMAS POR REGIÓN DESPUÉS DE MODIFICAR CONTRASTE/BRILLO ----------
region_modif = modified[y1:y2, x1:x2]
hsv_region_modif = cv2.cvtColor(region_modif, cv2.COLOR_BGR2HSV)
hist_v_reg_modif = cv2.calcHist([hsv_region_modif], [2], None, [256], [0,256])
hist_r_reg_modif = cv2.calcHist([region_modif], [2], None, [256], [0,256])

# ---------- MOSTRAR HISTOGRAMAS GLOBALES ----------
plt.figure(figsize=(14, 8))
plt.subplot(2,2,1)
plt.title('GLOBAL ANTES - canal V')
plt.plot(hist_v_orig)
plt.xlim([0,256])
plt.subplot(2,2,2)
plt.title('GLOBAL DESPUÉS - canal V')
plt.plot(hist_v_modif)
plt.xlim([0,256])
plt.subplot(2,2,3)
plt.title('GLOBAL ANTES - canal R')
plt.plot(hist_r_orig)
plt.xlim([0,256])
plt.subplot(2,2,4)
plt.title('GLOBAL DESPUÉS - canal R')
plt.plot(hist_r_modif)
plt.xlim([0,256])
plt.tight_layout()
plt.show()

# ---------- MOSTRAR HISTOGRAMAS POR REGIÓN ----------
plt.figure(figsize=(14, 8))
plt.subplot(2,2,1)
plt.title('REGIÓN ANTES - canal V')
plt.plot(hist_v_reg_orig)
plt.xlim([0,256])
plt.subplot(2,2,2)
plt.title('REGIÓN DESPUÉS - canal V')
plt.plot(hist_v_reg_modif)
plt.xlim([0,256])
plt.subplot(2,2,3)
plt.title('REGIÓN ANTES - canal R')
plt.plot(hist_r_reg_orig)
plt.xlim([0,256])
plt.subplot(2,2,4)
plt.title('REGIÓN DESPUÉS - canal R')
plt.plot(hist_r_reg_modif)
plt.xlim([0,256])
plt.tight_layout()
plt.show()
