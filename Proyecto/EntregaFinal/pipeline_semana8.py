"""
PIPELINE_SEMANA8.PY - Module réutilisable du pipeline d'analyse

Contient les classes et fonctions principales du code semaine 8
pour pouvoir être appelées depuis d'autres scripts (interface graphique, etc.)
"""

import os
import cv2
import numpy as np
import pandas as pd
from collections import deque, defaultdict
from typing import Tuple, Dict, List
from scipy import stats
import mediapipe as mp
from datetime import datetime


# ============================================================================
# CONSTANTES
# ============================================================================

WINDOW_SIZE = 30  # frames dans la fenêtre glissante
ANALYZE_EVERY = 10  # chaque combien de frames analyser
MIN_LANDMARKS = 33  # MediaPipe Pose retourne 33 landmarks


# ============================================================================
# FONCTIONS DE BASE
# ============================================================================


def calc_angle(a, b, c):
    """Calcule l'angle en point b formé par les points a-b-c (en degrés)."""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    denom = np.linalg.norm(ba) * np.linalg.norm(bc)
    if denom == 0:
        return 0.0

    cosine_angle = np.dot(ba, bc) / denom
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))

    return float(np.degrees(angle))


def compute_all_angles_from_keypoints(keypoints):
    """
    Reçoit keypoints list (len 33) avec [x,y,z] normalisés.
    Retourne dict avec tous les angles nommés.
    """
    kp = [kp if kp is not None else [0, 0, 0] for kp in keypoints]

    angles = {}

    try:
        # Genoux: hanche-genou-cheville (izq: 23-25-27, der: 24-26-28)
        angles["rodilla_izquierda"] = calc_angle(kp[23], kp[25], kp[27])
        angles["rodilla_derecha"] = calc_angle(kp[24], kp[26], kp[28])

        # Chevilles: genou-cheville-pied (izq: 25-27-31, der: 26-28-32)
        angles["tobillo_izquierdo"] = calc_angle(
            kp[25], kp[27], kp[31] if len(kp) > 31 else kp[27]
        )
        angles["tobillo_derecho"] = calc_angle(
            kp[26], kp[28], kp[32] if len(kp) > 32 else kp[28]
        )

        # Hanches: épaule-hanche-genou (izq: 11-23-25, der: 12-24-26)
        angles["cadera_izquierda"] = calc_angle(kp[11], kp[23], kp[25])
        angles["cadera_derecha"] = calc_angle(kp[12], kp[24], kp[26])

        # Coudes: épaule-coude-poignet (izq: 11-13-15, der: 12-14-16)
        angles["codo_izquierdo"] = calc_angle(kp[11], kp[13], kp[15])
        angles["codo_derecho"] = calc_angle(kp[12], kp[14], kp[16])

        # Poignets: coude-poignet-doigt (izq: 13-15-19, der: 14-16-20)
        angles["muneca_izquierda"] = calc_angle(
            kp[13], kp[15], kp[19] if len(kp) > 19 else kp[15]
        )
        angles["muneca_derecha"] = calc_angle(
            kp[14], kp[16], kp[20] if len(kp) > 20 else kp[16]
        )

        # Épaules: hanche-épaule-coude (izq: 23-11-13, der: 24-12-14)
        angles["hombro_izquierdo"] = calc_angle(kp[23], kp[11], kp[13])
        angles["hombro_derecho"] = calc_angle(kp[24], kp[12], kp[14])

    except Exception as e:
        print(f"Warning: erreur calcul angles: {e}")
        for name in [
            "rodilla_izquierda",
            "rodilla_derecha",
            "tobillo_izquierdo",
            "tobillo_derecho",
            "cadera_izquierda",
            "cadera_derecha",
            "codo_izquierdo",
            "codo_derecho",
            "muneca_izquierda",
            "muneca_derecha",
            "hombro_izquierdo",
            "hombro_derecho",
        ]:
            if name not in angles:
                angles[name] = 0.0

    return angles


def draw_skeleton(frame, keypoints, img_shape, alert_joints=None, thickness=2):
    """Dessine le squelette et les marqueurs."""
    h, w = img_shape[:2]
    if alert_joints is None:
        alert_joints = set()

    connections = [
        # Torso
        (11, 12),
        (11, 23),
        (12, 24),
        (23, 24),
        # Bras droit
        (12, 14),
        (14, 16),
        (16, 18),
        (16, 20),
        (16, 22),
        # Bras gauche
        (11, 13),
        (13, 15),
        (15, 17),
        (15, 19),
        (15, 21),
        # Jambe droite
        (24, 26),
        (26, 28),
        (28, 30),
        (28, 32),
        # Jambe gauche
        (23, 25),
        (25, 27),
        (27, 29),
        (27, 31),
        # Tête
        (0, 1),
        (1, 2),
        (2, 3),
        (3, 7),
        (0, 4),
        (4, 5),
        (5, 6),
        (6, 8),
    ]

    # Dessiner les lignes
    for s, e in connections:
        if s < len(keypoints) and e < len(keypoints):
            sx, sy = int(keypoints[s][0] * w), int(keypoints[s][1] * h)
            ex, ey = int(keypoints[e][0] * w), int(keypoints[e][1] * h)
            cv2.line(frame, (sx, sy), (ex, ey), (255, 200, 100), thickness)

    # Dessiner les joints
    for idx, kp in enumerate(keypoints):
        x, y = int(kp[0] * w), int(kp[1] * h)
        if idx in alert_joints:
            cv2.circle(frame, (x, y), 7, (0, 0, 255), -1)  # Rouge alerte
            cv2.circle(frame, (x, y), 7, (0, 0, 0), 2)
        elif idx in [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]:
            cv2.circle(frame, (x, y), 6, (0, 255, 0), -1)
            cv2.circle(frame, (x, y), 6, (0, 0, 0), 2)
        else:
            cv2.circle(frame, (x, y), 4, (0, 200, 255), -1)


def draw_alert_panel(frame, frame_alerts, width, height):
    """Affiche les alertes sur le frame."""
    if not frame_alerts:
        # Panel vert "BUENA POSTURA"
        margin = 15
        panel_w = int(width * 0.5)
        panel_h = 50
        y_pos = margin + 15

        good_color = (80, 220, 80)
        text_color = (255, 255, 255)

        overlay = frame.copy()
        cv2.rectangle(
            overlay,
            (margin, y_pos),
            (margin + panel_w, y_pos + panel_h),
            good_color,
            -1,
        )
        frame = cv2.addWeighted(overlay, 0.85, frame, 0.15, 0)

        cv2.rectangle(
            frame, (margin, y_pos), (margin + panel_w, y_pos + panel_h), good_color, 3
        )

        cv2.putText(
            frame,
            "POSTURA BUENA",
            (margin + 20, y_pos + 30),
            cv2.FONT_HERSHEY_DUPLEX,
            0.65,
            text_color,
            2,
            cv2.LINE_AA,
        )

        return frame

    # Panel avec alertes
    max_alerts = 5
    margin = 15
    item_height = 40
    panel_w = int(width * 0.5)

    severity_map = {
        "ALTA": ((255, 255, 255), (40, 40, 255)),  # Rouge
        "MEDIA": ((255, 255, 255), (0, 200, 255)),  # Orange
        "BAJA": ((255, 255, 255), (80, 220, 80)),  # Vert
    }

    y_pos = margin + 15
    for i, alert in enumerate(frame_alerts[:max_alerts]):
        sev = alert["severidad"].upper()
        art = alert["articulacion"].upper()

        text_color, bg_color = severity_map.get(sev, ((255, 255, 255), (100, 100, 100)))

        overlay = frame.copy()
        cv2.rectangle(
            overlay,
            (margin, y_pos),
            (margin + panel_w, y_pos + item_height),
            bg_color,
            -1,
        )
        frame = cv2.addWeighted(overlay, 0.85, frame, 0.15, 0)

        cv2.rectangle(
            frame, (margin, y_pos), (margin + panel_w, y_pos + item_height), bg_color, 3
        )

        cv2.putText(
            frame,
            f"{sev}: {art}",
            (margin + 15, y_pos + 25),
            cv2.FONT_HERSHEY_DUPLEX,
            0.6,
            text_color,
            1,
            cv2.LINE_AA,
        )

        y_pos += item_height + 8

    return frame


# ============================================================================
# CLASSE AngleTracker
# ============================================================================


class AngleTracker:
    """Sauvegarde les angles par frame en mémoire."""

    def __init__(self):
        self.data = defaultdict(list)
        self.data["frame"] = []

    def add_frame_angles(self, frame_idx, angles_dict):
        """Ajoute les angles d'un frame."""
        self.data["frame"].append(frame_idx)
        for k, v in angles_dict.items():
            self.data[k].append(float(v))

    def to_dataframe(self):
        return pd.DataFrame(self.data)

    def tail_dataframe(self, last_n):
        df = self.to_dataframe()
        if df.shape[0] == 0:
            return df
        return df.tail(last_n).reset_index(drop=True)


# ============================================================================
# CLASSE AsimetriaAnalyzer
# ============================================================================


class AsimetriaAnalyzer:
    """Analyse les asymétries et génère les alertes."""

    def __init__(
        self, umbral_diferencia=10, umbral_simetria=15, umbral_correlacion=0.7
    ):
        self.umbral_diferencia = umbral_diferencia
        self.umbral_simetria = umbral_simetria
        self.umbral_correlacion = umbral_correlacion
        self.alertas = []
        self.metricas = {}

        self.umbrales_por_articulacion = {
            "rodilla": {"diferencia": 20, "simetria": 25, "correlacion": -0.3},
            "tobillo": {"diferencia": 15, "simetria": 20, "correlacion": -0.2},
            "cadera": {"diferencia": 18, "simetria": 22, "correlacion": -0.3},
            "codo": {"diferencia": 50, "simetria": 40, "correlacion": -0.4},
            "muneca": {"diferencia": 50, "simetria": 40, "correlacion": -0.4},
            "hombro": {"diferencia": 50, "simetria": 45, "correlacion": -0.3},
        }

    def analizar_articulacion(
        self, nombre: str, derecha: np.array, izquierda: np.array
    ) -> Dict:
        """Analyse une paire bilatérale."""
        if len(derecha) != len(izquierda) or len(derecha) < 2:
            return {}

        diferencias = np.abs(derecha - izquierda)
        diferencia_media = float(np.mean(diferencias))
        diferencia_maxima = float(np.max(diferencias))

        rmse = float(np.sqrt(np.mean(diferencias**2)))

        # Modified to match semana_8: *2 in numerator for Symmetry Index
        indice_simetria = (
            100 * (2 * diferencias) / (np.abs(derecha) + np.abs(izquierda) + 1e-6)
        )
        indice_simetria_medio = float(np.mean(indice_simetria))

        correlacion, _ = stats.pearsonr(derecha, izquierda)
        correlacion = float(correlacion)

        metricas = {
            "diferencia_media": diferencia_media,
            "diferencia_maxima": diferencia_maxima,
            "rmse": rmse,
            "indice_simetria_medio": indice_simetria_medio,
            "correlacion": correlacion,
        }

        self.metricas[nombre] = metricas

        # Détection alertes
        alertas_frame = []

        if nombre in self.umbrales_por_articulacion:
            umbrales = self.umbrales_por_articulacion[nombre]
        else:
            umbrales = {
                "diferencia": self.umbral_diferencia,
                "simetria": self.umbral_simetria,
                "correlacion": self.umbral_correlacion,
            }

        if diferencia_media > umbrales["diferencia"]:
            severidad = (
                "ALTA" if diferencia_media > umbrales["diferencia"] * 2 else "MEDIA"
            )
            alertas_frame.append(
                {
                    "severidad": severidad,
                    "tipo": "DIF_MEDIA",
                    "mensaje": f"Dif media {diferencia_media:.1f}° > {umbrales['diferencia']}°",
                }
            )

        if indice_simetria_medio > umbrales["simetria"]:
            severidad = (
                "ALTA" if indice_simetria_medio > umbrales["simetria"] * 2 else "MEDIA"
            )
            alertas_frame.append(
                {
                    "severidad": severidad,
                    "tipo": "SIM_INDICE",
                    "mensaje": f"Índ sim {indice_simetria_medio:.1f}% > {umbrales['simetria']}%",
                }
            )

        if correlacion < umbrales["correlacion"]:
            severidad = "ALTA" if correlacion < umbrales["correlacion"] * 2 else "MEDIA"
            alertas_frame.append(
                {
                    "severidad": severidad,
                    "tipo": "CORR_BAJA",
                    "mensaje": f"Corr {correlacion:.2f} < {umbrales['correlacion']}",
                }
            )

        if alertas_frame:
            self.alertas.append({"articulacion": nombre, "alertas": alertas_frame})

        return metricas

    def generar_tabla_resumen(self) -> pd.DataFrame:
        """Génère tableau résumé de toutes les articulations analysées."""
        data = []
        for nombre, metricas in self.metricas.items():
            if nombre in self.umbrales_por_articulacion:
                umbrales = self.umbrales_por_articulacion[nombre]
            else:
                umbrales = {
                    "diferencia": self.umbral_diferencia,
                    "simetria": self.umbral_simetria,
                }
            data.append(
                {
                    "Articulación": nombre.replace("_", " ").title(),
                    "Diff Media (°)": f"{metricas['diferencia_media']:.2f}",
                    "Diff Máx (°)": f"{metricas['diferencia_maxima']:.2f}",
                    "Índice Sim (%)": f"{metricas['indice_simetria_medio']:.2f}",
                    "RMSE (°)": f"{metricas['rmse']:.2f}",
                    "Correlación": f"{metricas['correlacion']:.3f}",
                    "Umbral Diff": f"{umbrales['diferencia']}°",
                    "Umbral Sim": f"{umbrales['simetria']}%",
                    "Estado": self._evaluar_estado(metricas, nombre),
                }
            )

        return pd.DataFrame(data)

    def _evaluar_estado(self, metricas: Dict, nombre: str = None) -> str:
        problemas = 0

        if nombre and nombre in self.umbrales_por_articulacion:
            umbrales = self.umbrales_por_articulacion[nombre]
        else:
            umbrales = {
                "diferencia": self.umbral_diferencia,
                "simetria": self.umbral_simetria,
                "correlacion": self.umbral_correlacion,
            }

        if metricas["diferencia_media"] > umbrales["diferencia"]:
            problemas += 2

        if metricas["indice_simetria_medio"] > umbrales["simetria"]:
            problemas += 2

        # Removed the diff_maxima check to match semana_8 logic

        if problemas == 0:
            return "✅ Normal"
        elif problemas <= 2:
            return "🟡 Leve"
        else:
            return "🔴 Crítico"


# ============================================================================
# FONCTION PRINCIPALE: run_pipeline
# ============================================================================


def run_pipeline(
    input_path: str,
    tpose_path: str = None,
    output_base_dir: str = ".",
    window_size: int = WINDOW_SIZE,
    analyze_every: int = ANALYZE_EVERY,
    progress_callback=None,
):
    """
    Ejecuta el pipeline de análisis completo.

    Args:
        input_path: ruta al video de entrada
        tpose_path: ruta a imagen de T-pose (opcional)
        output_base_dir: directorio para guardar salidas
        window_size: tamaño de ventana para análisis
        analyze_every: cada cuantos frames analizar
        progress_callback: función para reportar progreso (frame, total)

    Returns:
        dict con resultados y rutas de archivos
    """

    # Validaciones
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Video no encontrado: {input_path}")

    # Crear directorio si no existe
    os.makedirs(output_base_dir, exist_ok=True)

    # Rutas de salida sans timestamp pour matcher l'app
    output_video_path = os.path.join(output_base_dir, "output_alerts.mp4")
    alerts_csv_path = os.path.join(output_base_dir, "alertas_por_frame.csv")
    resumen_csv_path = os.path.join(output_base_dir, "resumen_simetria.csv")

    # Abrir video
    cap = cv2.VideoCapture(input_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    print(f"Video: {width}x{height} @ {fps:.2f} FPS - {total_frames} frames")

    # VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

    # MediaPipe Pose
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(
        static_image_mode=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    # Buffers
    angle_tracker = AngleTracker()
    analyzer = AsimetriaAnalyzer()
    alerts_per_frame = []

    # Pares bilaterales
    bilateral_pairs = [
        ("rodilla", "rodilla_derecha", "rodilla_izquierda"),
        ("tobillo", "tobillo_derecho", "tobillo_izquierdo"),
        ("cadera", "cadera_derecha", "cadera_izquierda"),
        ("codo", "codo_derecho", "codo_izquierdo"),
        ("muneca", "muneca_derecha", "muneca_izquierda"),
        ("hombro", "hombro_derecho", "hombro_izquierdo"),
    ]

    # Procesamiento frame a frame
    frame_idx = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(img_rgb)

            current_alert_joints = set()
            frame_alerts = []

            if results.pose_landmarks:
                keypoints = [
                    [lm.x, lm.y, lm.z] for lm in results.pose_landmarks.landmark
                ]
                angles = compute_all_angles_from_keypoints(keypoints)
                angle_tracker.add_frame_angles(frame_idx, angles)

                # Análisis periódico
                if (
                    frame_idx % analyze_every == 0
                    and len(angle_tracker.to_dataframe()) >= 2
                ):
                    window_df = angle_tracker.tail_dataframe(window_size)
                    analyzer.metricas = {}
                    analyzer.alertas = []

                    for nombre, col_d, col_i in bilateral_pairs:
                        if col_d in window_df.columns and col_i in window_df.columns:
                            derecha = window_df[col_d].values
                            izquierda = window_df[col_i].values
                            metricas = analyzer.analizar_articulacion(
                                nombre, derecha, izquierda
                            )

                            if analyzer.alertas:
                                for item in analyzer.alertas:
                                    if item["articulacion"] == nombre:
                                        for alerta in item["alertas"]:
                                            frame_alert = {
                                                "frame": frame_idx,
                                                "articulacion": nombre,
                                                "severidad": alerta["severidad"],
                                                "tipo": alerta["tipo"],
                                                "mensaje": alerta["mensaje"],
                                            }
                                            frame_alerts.append(frame_alert)
                                            alerts_per_frame.append(frame_alert)

                    # Marcar joints alertados
                    for a in frame_alerts:
                        nombre = a["articulacion"]
                        if nombre == "rodilla":
                            current_alert_joints.update([25, 26])
                        elif nombre == "tobillo":
                            current_alert_joints.update([27, 28])
                        elif nombre == "cadera":
                            current_alert_joints.update([23, 24])
                        elif nombre == "codo":
                            current_alert_joints.update([13, 14])
                        elif nombre == "muneca":
                            current_alert_joints.update([15, 16])
                        elif nombre == "hombro":
                            current_alert_joints.update([11, 12])

                draw_skeleton(
                    frame, keypoints, frame.shape, alert_joints=current_alert_joints
                )

            frame = draw_alert_panel(frame, frame_alerts, width, height)
            out.write(frame)

            frame_idx += 1

            # Callback progreso
            if progress_callback:
                progress_callback(frame_idx, total_frames)

    finally:
        cap.release()
        out.release()
        pose.close()

    # Postprocesamiento
    if alerts_per_frame:
        df_alerts = pd.DataFrame(alerts_per_frame)
        df_alerts.to_csv(alerts_csv_path, index=False)
    else:
        df_alerts = pd.DataFrame(
            columns=["frame", "articulacion", "severidad", "tipo", "mensaje"]
        )
        df_alerts.to_csv(alerts_csv_path, index=False)

    resumen_df = analyzer.generar_tabla_resumen()
    resumen_df.to_csv(resumen_csv_path, index=False)

    print(f"✅ Análisis completo")
    print(f"   Video: {output_video_path}")
    print(f"   CSV alertas: {alerts_csv_path}")
    print(f"   Resumen: {resumen_csv_path}")

    return {
        "video_output": output_video_path,
        "alerts_csv": alerts_csv_path,
        "resumen_csv": resumen_csv_path,
        "alerts_df": df_alerts,
        "resumen_df": resumen_df,
        "fps": fps,
        "total_frames": total_frames,
    }
