import time
import psutil
import cv2

class Calidad_Monitor:
    def __init__(self):
        self.prev_time = 0
        self.now_time = 0
        self.fps = 0
        self.frame_conteo = 0
        self.start_time = time.time()

    def update(self):
        self.now_time = time.time()
        dif = self.now_time - self.prev_time
        if dif > 0:
            self.fps = 1 / dif
        self.prev_time = self.now_time
        self.frame_conteo += 1

    def uso_sistema(self):
        cpu_uso = psutil.cpu_percent()
        ram_uso = psutil.virtual_memory().percent
        return cpu_uso, ram_uso

    def mostrar_metricas(self, frame):
        cpu, ram = self.uso_sistema()
        
        text_lines = [
            f"FPS: {int(self.fps)}",
            f"Latencia: {round((1/self.fps if self.fps > 0 else 0)*1000, 2)}ms",
            f"CPU: {cpu}% | RAM: {ram}%"
        ]

        for i, line in enumerate(text_lines):
            cv2.putText(frame, line, (10, 20 + (i * 20)), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        return frame

    def optimizar_frame(self, frame, scale_percent=50):
        ancho = int(frame.shape[1] * scale_percent / 100)
        largo = int(frame.shape[0] * scale_percent / 100)
        dim = (ancho, largo)
        return cv2.resize(frame, dim, interpolation=cv2.INTER_AREA)