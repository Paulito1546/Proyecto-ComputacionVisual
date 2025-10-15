import cv2 as cv

#Binarizacion de la imagen
img = cv.imread('Proyecto-ComputacionVisual\\2025-10-13_taller_cv_3d\\ejercicios\\06_analisis_figuraas_geometricas\\Homero.png')
img = cv.resize(img, (int(img.shape[1]*0.5), int(img.shape[0]*0.5)), interpolation=cv.INTER_AREA)

img_area = img.copy()

img_bin  = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
Umbral, img_bin = cv.threshold(img_bin , 80, 255, cv.THRESH_BINARY)

#Contornos
Contornos, Jerarquia = cv.findContours(img_bin , cv.RETR_TREE, cv.CHAIN_APPROX_NONE)
cv.drawContours(img , Contornos, -1, (0, 0, 255), 3)

#Area
Areas = []
Perimetros = []
Centroides = []
for i in range(len(Contornos)):
    Area = cv.contourArea(Contornos[i])
    Perimetro = cv.arcLength(Contornos[i], True)
    if Area not in Areas:
        Areas.append(Area)
        Perimetros.append(Perimetro)
        Centroides.append(Contornos[i])

Area_max = max(Areas)
Index = Areas.index(Area_max)
Perimetro_max = Perimetros[Index]
cv.drawContours(img_area , Contornos, Index, (0, 255, 0), 3)

#Centroide
Momentos = cv.moments(Centroides[Index])
cX=int(Momentos["m10"] / Momentos["m00"])
cY=int(Momentos["m01"] / Momentos["m00"])
cv.circle(img_area, (cX, cY), 5, (255, 0, 0), -1)
cv.putText(img_area, "Centroide", (cX + 20, cY), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
cv.putText(img_area, "X:"+str(cX)+" Y:"+str(cY), (cX + 20, cY + 20), cv.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
cv.putText(img_area, 'Perimetro area mayor: '+str(Perimetro_max), (450, 20), cv.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

#impresion
cv.imshow('Imagen', img)
cv.waitKey(0)
cv.imshow('Imagen binaria', img_bin)
cv.waitKey(0)
cv.imshow('Imagen Area', img_area)
cv.waitKey(0)
cv.destroyAllWindows()