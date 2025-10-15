import os
import numpy as np
from PIL import Image
import math
import time

# Crear carpeta outputs
os.makedirs("outputs", exist_ok=True)
# -------------------------
# Funciones auxiliares
# -------------------------
def set_pixel(img, x, y, color):
    """img: array numpy que va a representar una imagen y tiene color
        x, y: coordenadas del píxel a modificar
        color: tupla (R,G,B)
    """
    h, w = img.shape[:2]
    if 0 <= x < w and 0 <= y < h:#pixel dentro de la imagen
        img[y, x] = color#lo cambiamos de color

def save_image(img, path):
    """Guarda img, el array de numpy en el path especificado"""
    Image.fromarray(img).save(path)#Pill convierte el arreglo de Numpy en imagen

# 1. Bresenham (línea)
def bresenham_line(img, x0, y0, x1, y1, color):
    steep = abs(y1 - y0) > abs(x1 - x0)
    if steep:
        x0, y0 = y0, x0
        x1, y1 = y1, x1
    if x0 > x1:
        x0, x1 = x1, x0
        y0, y1 = y1, y0
    dx = x1 - x0
    dy = abs(y1 - y0)
    error = dx // 2
    ystep = 1 if y0 < y1 else -1
    y = y0
    for x in range(x0, x1 + 1):
        if steep:
            set_pixel(img, y, x, color)
        else:
            set_pixel(img, x, y, color)
        error -= dy
        if error < 0:
            y += ystep
            error += dx

# -------------------------
# 2. Punto medio (círculo)
# -------------------------
def plot_circle_symmetry(img, xc, yc, x, y, color):
    pts = [#8 puntos a partir de (x,y) en el primer octante como indica el metodo
        (xc + x, yc + y), (xc - x, yc + y),
        (xc + x, yc - y), (xc - x, yc - y),
        (xc + y, yc + x), (xc - y, yc + x),
        (xc + y, yc - x), (xc - y, yc - x),
    ]
    for px, py in pts:
        set_pixel(img, px, py, color)

def midpoint_circle(img, xc, yc, r, color):
    x = 0
    y = r
    d = 1 - r
    while x <= y:#1 octante
        plot_circle_symmetry(img, xc, yc, x, y, color)
        if d < 0:#parametro de decision
            d += 2*x + 3
        else:
            d += 2*(x - y) + 5
            y -= 1
        x += 1

# -------------------------
# 3. Scanline (relleno de triángulo)
# -------------------------
def fill_triangle_scanline(img, v0, v1, v2, color):
    # Ordenar por y
    verts = sorted([v0, v1, v2], key=lambda v: v[1])#vertices v0 es el inferior
    x0, y0 = verts[0]; x1, y1 = verts[1]; x2, y2 = verts[2]

    def interp_x(y, xa, ya, xb, yb):#donde en x hay una linea entre (xa,ya) y (xb,yb) que corta y
        if ya == yb: 
            return None
        return xa + (y - ya) * (xb - xa) / (yb - ya)

    for y in range(y0, y2 + 1):
        xs = []
        for (xa, ya, xb, yb) in [(x0, y0, x1, y1), (x1, y1, x2, y2), (x0, y0, x2, y2)]:
            if ya <= y <= yb or yb <= y <= ya:
                x = interp_x(y, xa, ya, xb, yb)
                if x is not None:
                    xs.append(x)
        if len(xs) >= 2:
            x_left, x_right = sorted(xs)[:2]
            for x in range(math.ceil(x_left), math.floor(x_right) + 1):
                set_pixel(img, x, y, color)

# -------------------------
# 4. Generar imágenes de evidencia
# -------------------------
W, H = 400, 300
color_white = (255, 255, 255)
color_red = (255, 0, 0)
color_green = (0, 255, 0)
color_blue = (0, 0, 255)

# Imagen para líneas
img_lines = np.zeros((H, W, 3), dtype=np.uint8)
bresenham_line(img_lines, 0, 120, 380, 280, color_white)
bresenham_line(img_lines, 210, 405, 400, 20, color_red)
bresenham_line(img_lines, 200, 0, 200, 250, color_green)
save_image(img_lines, "outputs/bresenham_lines.png")

# Imagen para círculos
img_circles = np.zeros((H, W, 3), dtype=np.uint8)
midpoint_circle(img_circles, 230, 230, 50, color_white)
midpoint_circle(img_circles, 170, 170, 90, color_red)
midpoint_circle(img_circles, 200, 200, 70, color_blue)
save_image(img_circles, "outputs/midpoint_circles.png")

# Imagen para triángulos
img_triangles = np.zeros((H, W, 3), dtype=np.uint8)
fill_triangle_scanline(img_triangles, (50, 50), (300, 80), (200, 250), color_white)
fill_triangle_scanline(img_triangles, (100, 200), (50, 280), (180, 270), color_red)
fill_triangle_scanline(img_triangles, (250, 50), (350, 100), (300, 200), color_blue)
save_image(img_triangles, "outputs/scanline_triangles.png")

# -------------------------
# 5. Ejemplo de medición de eficiencia
# -------------------------
start = time.perf_counter()
for _ in range(1000):
    bresenham_line(img_lines, 0, 0, 399, 299, color_white)
end = time.perf_counter()
print(f"Bresenham 1000 líneas: {end - start:.4f} s")

start = time.perf_counter()
for _ in range(1000):
    midpoint_circle(img_circles, 200, 150, 50, color_white)
end = time.perf_counter()
print(f"Círculo punto medio 1000 veces: {end - start:.4f} s")

start = time.perf_counter()
for _ in range(500):
    fill_triangle_scanline(img_triangles, (50,50),(300,80),(200,250), color_white)
end = time.perf_counter()
print(f"Triángulo scanline 500 veces: {end - start:.4f} s")

