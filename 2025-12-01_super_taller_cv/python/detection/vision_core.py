import json
import os
import time
from ultralytics import YOLO

class Deteccion_Video:
    def __init__(self, model_path='yolov8n-seg.pt'):

        print(f"Cargando modelo {model_path}...")
        self.modelo = YOLO(model_path)  
        self.path_resultados = "python/results"
        os.makedirs(self.path_resultados, exist_ok=True)

    def Procesar_frame(self, frame):
        resultados = self.modelo(frame, stream=True, verbose=False, conf=0.5)
        return resultados

    def exportar_data(self, detection, frame_id):
        data = []
        for r in detection:
            cajas = r.boxes
            for caja in cajas:
                x1, y1, x2, y2 = caja.xyxy[0].tolist()
                cls = int(caja.cls[0])
                conf = float(caja.conf[0])
                label = self.modelo.names[cls]
                
                data.append({
                    "frame_id": frame_id,
                    "timestamp": time.time(),
                    "label": label,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2]
                })
        
        if data:
            json_filename = os.path.join(self.path_resultados, f"data_log.json")
            with open(json_filename, 'a') as f:
                json.dump(data, f)
                f.write('\n')

    def anotar_frame(self, frame, resultados):
        for r in resultados:

            annotated_frame = r.plot() 
            return annotated_frame
        return frame