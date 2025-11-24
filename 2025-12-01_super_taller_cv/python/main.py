import cv2
import sys
import os

sys.path.append(os.getcwd())

def main():
    from python.detection.vision_core import Deteccion_Video
    from python.utils.metrics import Calidad_Monitor
    
    #                     CONFIGURACIÓN DE ENTRADA
    # VIDEO_SOURCE: 0 para webcam, o pon la ruta del archivo entre comillas
    VIDEO_SOURCE = 0
    
    OPTIMIZATION = True 

    vision = Deteccion_Video(model_path='yolov8n-seg.pt') 
    monitor = Calidad_Monitor()
    
    if VIDEO_SOURCE == 0:
        print("Abriendo webcam...")
    else:
        print(f"Abriendo fuente de video: {VIDEO_SOURCE}")
        
    cap = cv2.VideoCapture(VIDEO_SOURCE)

    if not cap.isOpened():
        print(f"Error: No se puede abrir la fuente: {VIDEO_SOURCE}")
        return

    frame_id = 0
    print("Iniciando Sistema Integrado (Presiona 'q' para salir)...")
    cv2.namedWindow('Sistema Integrado', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Sistema Integrado', 1280, 720)

    while True:
        retorno, frame = cap.read()
        
        if not retorno:
            break

        if OPTIMIZATION:
            frame = monitor.optimizar_frame(frame, scale_percent=60)

        resultados = vision.Procesar_frame(frame)
        resultados_lista = list(resultados)
        annotated_frame = vision.anotar_frame(frame, resultados_lista)
        
        vision.exportar_data(resultados_lista, frame_id)

        monitor.update()
        final_frame = monitor.mostrar_metricas(annotated_frame)

        cv2.imshow('Sistema Integrado', final_frame)

        frame_id += 1
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()