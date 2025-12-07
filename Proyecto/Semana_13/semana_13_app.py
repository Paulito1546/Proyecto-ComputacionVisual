# -*- coding: utf-8 -*-
"""
SEMANA_13_APP.PY - Complete Graphical Interface for Postural Analysis

Integrates:
1. Video and patient loading
2. Analysis according to week 8 pipeline
3. Automatic CSV export (with manual download option)
4. Annotated video display (output.mp4)
5. Patient history with comparisons

Installation:
pip install tkinter opencv-python numpy pandas matplotlib seaborn reportlab Pillow
sudo apt-get install python3-tk  # On Ubuntu/Linux
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import cv2
from PIL import Image, ImageTk
import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
import threading
from pathlib import Path
from pipeline_semana8 import run_pipeline
import shutil
import subprocess


# ============================================================================
# 1. PATIENT HISTORY MANAGER
# ============================================================================

class PatientHistoryManager:
    """Manages patient analysis history."""
    
    def __init__(self, base_dir="patients_data"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
    
    def create_patient(self, patient_id, patient_name=""):
        """Creates a patient folder."""
        patient_dir = self.base_dir / patient_id
        patient_dir.mkdir(exist_ok=True)
        
        metadata = {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "date_created": datetime.now().isoformat(),
            "sessions": []
        }
        
        with open(patient_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=4)
        
        return patient_dir
    
    def patient_exists(self, patient_id):
        """Checks if patient exists."""
        return (self.base_dir / patient_id).exists()
    
    def save_session(self, patient_id, session_name, results_dict):
        """Saves an analysis session."""
        patient_dir = self.base_dir / patient_id
        session_dir = patient_dir / "sessions" / session_name
        session_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate files directly in session_dir to avoid duplicates
        results_dict['alerts_csv'] = str(session_dir / "alertas_por_frame.csv")
        results_dict['resumen_csv'] = str(session_dir / "resumen_simetria.csv")
        results_dict['video_output'] = str(session_dir / "output_alerts.mp4")
        
        # Session metadata
        session_metadata = {
            "session_name": session_name,
            "date": datetime.now().isoformat(),
            "video_input": results_dict.get('video_input', ''),
            "total_frames": results_dict.get('total_frames', 0),
            "fps": results_dict.get('fps', 0)
        }
        
        with open(session_dir / "session_metadata.json", "w") as f:
            json.dump(session_metadata, f, indent=4)
        
        # Update patient metadata
        with open(patient_dir / "metadata.json", "r") as f:
            metadata = json.load(f)
        
        metadata["sessions"].append({
            "session_name": session_name,
            "date": datetime.now().isoformat()
        })
        
        with open(patient_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=4)
    
    def load_patient_sessions(self, patient_id):
        """Loads patient sessions."""
        patient_dir = self.base_dir / patient_id
        
        if not patient_dir.exists():
            return None, []
        
        with open(patient_dir / "metadata.json", "r") as f:
            metadata = json.load(f)
        
        sessions = []
        sessions_dir = patient_dir / "sessions"
        
        if sessions_dir.exists():
            for session_folder in sorted(sessions_dir.iterdir()):
                if session_folder.is_dir():
                    session_data = {
                        "name": session_folder.name,
                        "path": session_folder,
                        "resumen_csv": session_folder / "resumen_simetria.csv",
                        "alerts_csv": session_folder / "alertas_por_frame.csv",
                        "video": session_folder / "output_alerts.mp4"
                    }
                    if all([session_data["resumen_csv"].exists(), session_data["alerts_csv"].exists()]):
                        sessions.append(session_data)
        
        return metadata, sessions
    
    def get_all_patients(self):
        """Lists all patients."""
        patients = []
        for patient_dir in self.base_dir.iterdir():
            if patient_dir.is_dir():
                metadata_file = patient_dir / "metadata.json"
                if metadata_file.exists():
                    with open(metadata_file, "r") as f:
                        metadata = json.load(f)
                    patients.append(metadata)
        return sorted(patients, key=lambda x: x.get('patient_name', ''))


# ============================================================================
# 2. MAIN GRAPHICAL APPLICATION
# ============================================================================

class PostureAnalysisApp:
    """Graphical interface for postural analysis."""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Sistema de Análisis Postural - Semana 13")
        self.root.geometry("1400x800")
        
        # History manager
        self.history_manager = PatientHistoryManager()
        
        # Application state
        self.current_patient = None
        self.current_patient_name = None
        self.current_video_path = None
        self.current_results = None
        self.analysis_thread = None
        self.selected_sessions_for_comparison = []  # For comparisons
        
        # Setup UI
        self._setup_ui()
    
    def _setup_ui(self):
        """Initializes the user interface."""
        
        # --- MENU BAR ---
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Archivo", menu=file_menu)
        file_menu.add_command(label="Salir", command=self.root.quit)
        
        patient_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Paciente", menu=patient_menu)
        patient_menu.add_command(label="Nuevo paciente", command=self._create_new_patient)
        patient_menu.add_command(label="Cargar paciente", command=self._load_patient)
        patient_menu.add_command(label="Ver historico", command=self._show_history)
        
        # --- MAIN FRAME ---
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # --- TOP PANEL: Patient and video selection ---
        top_frame = ttk.LabelFrame(main_frame, text="1. Seleccionar Paciente y Video")
        top_frame.pack(fill=tk.X, pady=5)
        
        top_left = ttk.Frame(top_frame)
        top_left.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10, pady=10)
        
        ttk.Label(top_left, text="Paciente:", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        self.patient_label = ttk.Label(top_left, text="[Sin seleccionar]", font=("Arial", 10, "italic"), foreground="red")
        self.patient_label.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(top_left, text="Seleccionar/Crear Paciente", command=self._select_patient_dialog).pack(side=tk.LEFT, padx=5)
        
        top_right = ttk.Frame(top_frame)
        top_right.pack(side=tk.RIGHT, fill=tk.X, expand=True, padx=10, pady=10)
        
        ttk.Label(top_right, text="Video:", font=("Arial", 10, "bold")).pack(side=tk.LEFT, padx=5)
        self.video_label = ttk.Label(top_right, text="[No cargado]", font=("Arial", 10, "italic"), foreground="red")
        self.video_label.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(top_right, text="Cargar Video", command=self._load_video).pack(side=tk.LEFT, padx=5)
        
        # --- ANALYSIS PANEL ---
        analysis_frame = ttk.LabelFrame(main_frame, text="2. Análisis de Movimiento")
        analysis_frame.pack(fill=tk.X, pady=5)
        
        button_frame = ttk.Frame(analysis_frame)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        self.analyze_button = ttk.Button(button_frame, text="▶ Iniciar Análisis", command=self._run_analysis, state=tk.DISABLED)
        self.analyze_button.pack(side=tk.LEFT, padx=5)
        
        self.download_csv_button = ttk.Button(button_frame, text="⬇ Descargar CSV", command=self._download_csv, state=tk.DISABLED)
        self.download_csv_button.pack(side=tk.LEFT, padx=5)
        
        self.download_video_button = ttk.Button(button_frame, text="⬇ Descargar Video", command=self._download_video, state=tk.DISABLED)
        self.download_video_button.pack(side=tk.LEFT, padx=5)
        
        self.view_video_button = ttk.Button(button_frame, text="▶ Ver Video Análisis", command=self._view_video, state=tk.DISABLED)
        self.view_video_button.pack(side=tk.LEFT, padx=5)
        
        self.progress = ttk.Progressbar(button_frame, mode='determinate', maximum=100)
        self.progress.pack(side=tk.LEFT, padx=20, fill=tk.X, expand=True)
        
        self.progress_label = ttk.Label(button_frame, text="")
        self.progress_label.pack(side=tk.LEFT, padx=5)
        
        # --- RESULTS PANEL ---
        results_frame = ttk.LabelFrame(main_frame, text="3. Resultados", height=300)
        results_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # Notebook (tabs)
        self.notebook = ttk.Notebook(results_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Summary tab
        summary_tab = ttk.Frame(self.notebook)
        self.notebook.add(summary_tab, text="Resumen de Simetría")
        
        self.summary_text = scrolledtext.ScrolledText(summary_tab, height=12, font=("Courier", 9))
        self.summary_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Alerts tab
        alerts_tab = ttk.Frame(self.notebook)
        self.notebook.add(alerts_tab, text="Alertas Detectadas")
        
        self.alerts_text = scrolledtext.ScrolledText(alerts_tab, height=12, font=("Courier", 9))
        self.alerts_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Comparisons tab
        comparisons_tab = ttk.Frame(self.notebook)
        self.notebook.add(comparisons_tab, text="Comparaciones")
        
        self.comparisons_text = scrolledtext.ScrolledText(comparisons_tab, height=12, font=("Courier", 9))
        self.comparisons_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # --- STATUS BAR ---
        self.status_var = tk.StringVar(value="Listo")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN)
        status_bar.pack(fill=tk.X, padx=5, pady=5)
    
    def _select_patient_dialog(self):
        """Dialog for selecting/creating patient."""
        dialog = tk.Toplevel(self.root)
        dialog.title("Seleccionar Paciente")
        dialog.geometry("500x450")  # Slightly taller to ensure button visibility
        
        # Add canvas for scrolling if needed
        canvas = tk.Canvas(dialog)
        scrollbar = ttk.Scrollbar(dialog, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(
                scrollregion=canvas.bbox("all")
            )
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        patients = self.history_manager.get_all_patients()
        
        ttk.Label(scrollable_frame, text="Pacientes Existentes:", font=("Arial", 10, "bold")).pack(pady=10)
        
        # Patient listbox
        frame = ttk.Frame(scrollable_frame)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        scrollbar_list = ttk.Scrollbar(frame)
        scrollbar_list.pack(side=tk.RIGHT, fill=tk.Y)
        
        listbox = tk.Listbox(frame, yscrollcommand=scrollbar_list.set, height=10)
        listbox.pack(fill=tk.BOTH, expand=True)
        scrollbar_list.config(command=listbox.yview)
        
        for p in patients:
            display_text = f"{p['patient_id']} - {p.get('patient_name', 'N/A')}"
            listbox.insert(tk.END, display_text)
        
        def select_from_list():
            sel = listbox.curselection()
            if sel:
                self.current_patient = patients[sel[0]]['patient_id']
                self.current_patient_name = patients[sel[0]].get('patient_name', 'N/A')
                self._update_patient_label()
                messagebox.showinfo("Éxito", f"Paciente seleccionado: {self.current_patient}")
                dialog.destroy()
        
        ttk.Button(scrollable_frame, text="Seleccionar", command=select_from_list).pack(pady=10)
        
        # Create new
        separator = ttk.Separator(scrollable_frame, orient=tk.HORIZONTAL)
        separator.pack(fill=tk.X, padx=10, pady=10)
        
        ttk.Label(scrollable_frame, text="Crear Nuevo Paciente:", font=("Arial", 10, "bold")).pack(pady=5)
        
        frame_new = ttk.Frame(scrollable_frame)
        frame_new.pack(fill=tk.X, padx=10, pady=5)
        
        ttk.Label(frame_new, text="ID:").pack(side=tk.LEFT, padx=5)
        entry_id = ttk.Entry(frame_new, width=15)
        entry_id.pack(side=tk.LEFT, padx=5)
        
        ttk.Label(frame_new, text="Nombre:").pack(side=tk.LEFT, padx=5)
        entry_name = ttk.Entry(frame_new, width=20)
        entry_name.pack(side=tk.LEFT, padx=5)
        
        def create_new():
            pid = entry_id.get().strip()
            pname = entry_name.get().strip()
            
            if not pid or not pname:
                messagebox.showwarning("Error", "ID y Nombre del paciente son requeridos")
                return
            
            if self.history_manager.patient_exists(pid):
                messagebox.showwarning("Error", f"Paciente {pid} ya existe")
                return
            
            self.history_manager.create_patient(pid, pname)
            self.current_patient = pid
            self.current_patient_name = pname
            self._update_patient_label()
            messagebox.showinfo("Éxito", f"Paciente {pid} creado")
            dialog.destroy()
        
        ttk.Button(scrollable_frame, text="Crear Paciente", command=create_new).pack(pady=10)
    
    def _load_patient(self):
        """Loads an existing patient."""
        self._select_patient_dialog()
    
    def _create_new_patient(self):
        """Opens dialog to create patient."""
        self._select_patient_dialog()
    
    def _update_patient_label(self):
        """Updates patient label."""
        if self.current_patient:
            self.patient_label.config(text=f"✅ {self.current_patient} ({self.current_patient_name})", foreground="green")
        else:
            self.patient_label.config(text="[Sin seleccionar]", foreground="red")
    
    def _load_video(self):
        """Loads a video."""
        if not self.current_patient:
            messagebox.showwarning("Error", "Por favor, primero selecciona un paciente")
            return
        
        file_path = filedialog.askopenfilename(
            filetypes=[("Videos MP4", "*.mp4"), ("Todos", "*.*")]
        )
        
        if file_path:
            self.current_video_path = file_path
            video_name = os.path.basename(file_path)
            self.video_label.config(text=f"✅ {video_name}", foreground="green")
            self.analyze_button.config(state=tk.NORMAL)
            self.status_var.set(f"Video cargado: {video_name}")
    
    def _run_analysis(self):
        """Starts the analysis."""
        if not self.current_video_path or not self.current_patient:
            messagebox.showwarning("Error", "Video y paciente requeridos")
            return
        
        self.analyze_button.config(state=tk.DISABLED)
        self.download_csv_button.config(state=tk.DISABLED)
        self.download_video_button.config(state=tk.DISABLED)
        self.view_video_button.config(state=tk.DISABLED)
        self.progress['value'] = 0
        self.status_var.set("Análisis en progreso...")
        
        # Run analysis in separate thread
        self.analysis_thread = threading.Thread(target=self._analysis_worker)
        self.analysis_thread.start()
    
    def _analysis_worker(self):
        """Worker thread for analysis."""
        try:
            # Create session name early
            session_name = datetime.now().strftime("%Y%m%d_%H%M%S")
            session_dir = os.path.join("patients_data", self.current_patient, "sessions", session_name)
            os.makedirs(session_dir, exist_ok=True)  # Ensure directory exists
            
            def progress_callback(frame_idx, total):
                pct = int((frame_idx / total * 100)) if total > 0 else 0
                self.root.after(0, lambda: self.progress_label.config(text=f"{pct}%"))
                self.root.after(0, lambda: setattr(self.progress, 'value', pct))
            
            # Run pipeline with output directly in session_dir
            results = run_pipeline(
                input_path=self.current_video_path,
                tpose_path=None,
                output_base_dir=session_dir,
                progress_callback=progress_callback
            )
            
            results['video_input'] = self.current_video_path
            
            # Explicitly save DataFrames to CSV if pipeline doesn't do it (redundancy)
            alerts_csv_path = os.path.join(session_dir, "alertas_por_frame.csv")
            resumen_csv_path = os.path.join(session_dir, "resumen_simetria.csv")
            video_output_path = os.path.join(session_dir, "output_alerts.mp4")
            
            if 'alerts_df' in results:
                results['alerts_df'].to_csv(alerts_csv_path, index=False)
            if 'resumen_df' in results:
                results['resumen_df'].to_csv(resumen_csv_path, index=False)
            
            # Assume pipeline saves video; if not, add logic here if possible
            
            results['alerts_csv'] = alerts_csv_path
            results['resumen_csv'] = resumen_csv_path
            results['video_output'] = video_output_path
            
            self.current_results = results
            
            # Save session metadata
            self.history_manager.save_session(self.current_patient, session_name, results)
            
            # Update UI in main thread
            self.root.after(0, self._update_results_display)
            
        except Exception as e:
            print(f"DEBUG: Error in analysis: {str(e)}")  # Logging for debug
            self.root.after(0, lambda: messagebox.showerror("Error", f"Error en análisis:\n{str(e)}"))
        
        finally:
            self.root.after(0, self._analysis_complete)
    
    def _analysis_complete(self):
        """Called when analysis completes."""
        self.analyze_button.config(state=tk.NORMAL)
        self.status_var.set("Análisis completado")
        
        # Only enable buttons if files exist
        if self.current_results and os.path.exists(self.current_results.get('resumen_csv', '')) and os.path.exists(self.current_results.get('alerts_csv', '')):
            self.download_csv_button.config(state=tk.NORMAL)
        else:
            self.status_var.set("Análisis completado, pero CSVs no generados")
        
        if self.current_results and os.path.exists(self.current_results.get('video_output', '')):
            self.download_video_button.config(state=tk.NORMAL)
            self.view_video_button.config(state=tk.NORMAL)
        else:
            self.status_var.set("Análisis completado, pero video no generado")
    
    def _update_results_display(self):
        """Updates results display."""
        if not self.current_results:
            return
        
        # Clear texts
        self.summary_text.delete(1.0, tk.END)
        self.alerts_text.delete(1.0, tk.END)
        
        # Display summary
        resumen_df = self.current_results['resumen_df']
        self.summary_text.insert(tk.END, "RESUMEN DE SIMETRÍA\n")
        self.summary_text.insert(tk.END, "=" * 80 + "\n\n")
        self.summary_text.insert(tk.END, resumen_df.to_string(index=False))
        
        # Display alerts
        alerts_df = self.current_results['alerts_df']
        if alerts_df.empty:
            self.alerts_text.insert(tk.END, "✅ No se detectaron alertas\n")
        else:
            self.alerts_text.insert(tk.END, "ALERTAS DETECTADAS\n")
            self.alerts_text.insert(tk.END, "=" * 80 + "\n\n")
            for _, row in alerts_df.iterrows():
                emoji = "🔴" if row['severidad'] == 'ALTA' else "🟡"
                alert_line = f"{emoji} [{row['severidad']}] Frame {int(row['frame'])}: {row['articulacion']}\n"
                alert_line += f"   Tipo: {row['tipo']}\n"
                alert_line += f"   {row['mensaje']}\n\n"
                self.alerts_text.insert(tk.END, alert_line)
    
    def _download_csv(self):
        """Downloads CSV files."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return
        
        if not all(os.path.exists(f) for f in [self.current_results['resumen_csv'], self.current_results['alerts_csv']]):
            messagebox.showwarning("Error", "Archivos CSV no encontrados")
            return
        
        save_dir = filedialog.askdirectory(title="Selecciona carpeta para guardar")
        if not save_dir:
            return
        
        try:
            # Copy files
            shutil.copy(
                self.current_results['resumen_csv'],
                os.path.join(save_dir, "resumen_simetria.csv")
            )
            shutil.copy(
                self.current_results['alerts_csv'],
                os.path.join(save_dir, "alertas_por_frame.csv")
            )
            
            messagebox.showinfo("Éxito", "Archivos CSV descargados")
            self.status_var.set("CSV descargados correctamente")
        except Exception as e:
            messagebox.showerror("Error", f"Error al descargar: {str(e)}")
    
    def _download_video(self):
        """Downloads the analysis video at 0.15x speed."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return
        
        video_path = self.current_results['video_output']
        if not os.path.exists(video_path):
            messagebox.showwarning("Error", "Video no encontrado")
            return
        
        try:
            # Create semana_13 if not exists
            os.makedirs('semana_13', exist_ok=True)
            
            # Generate slow-motion video (repeat each frame 7 times for 0.15x)
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            slow_path = os.path.join('semana_13', 'slow_output_alerts.mp4')
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(slow_path, fourcc, fps, (width, height))
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                for _ in range(7):  # Repeat 7 times for 0.15x speed
                    out.write(frame)
            
            cap.release()
            out.release()
            
            # Download the slow video
            save_dir = filedialog.askdirectory(title="Selecciona carpeta para guardar")
            if not save_dir:
                return
            
            shutil.copy(
                slow_path,
                os.path.join(save_dir, "slow_output_alerts.mp4")
            )
            messagebox.showinfo("Éxito", "Video lento (0.15x) descargado")
            self.status_var.set("Video lento descargado correctamente")
        except Exception as e:
            messagebox.showerror("Error", f"Error al generar/descargar el video lento: {str(e)}")
    
    def _view_video(self):
        """Opens the analysis video at 0.15x speed by generating a slow-motion version in semana_13."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return
        
        video_path = self.current_results['video_output']
        if not os.path.exists(video_path):
            messagebox.showwarning("Error", "Video no encontrado")
            return
        
        try:
            # Create semana_13 if not exists
            os.makedirs('semana_13', exist_ok=True)
            
            # Generate slow-motion video (repeat each frame 7 times for 0.15x)
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            slow_path = os.path.join('semana_13', 'slow_output_alerts.mp4')
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(slow_path, fourcc, fps, (width, height))
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                for _ in range(7):  # Repeat 7 times for 0.15x speed
                    out.write(frame)
            
            cap.release()
            out.release()
            
            # Open the slow video
            subprocess.Popen(['xdg-open', slow_path])  # Linux
        except:
            try:
                subprocess.Popen(['vlc', slow_path])  # VLC direct
            except:
                try:
                    subprocess.Popen(['open', slow_path])  # macOS
                except:
                    try:
                        os.startfile(slow_path)  # Windows
                    except:
                        messagebox.showwarning("Info", f"Video lento disponible en:\n{slow_path}")
    
    def _show_history(self):
        """Shows patient history."""
        if not self.current_patient:
            messagebox.showwarning("Error", "Selecciona un paciente primero")
            return
        
        metadata, sessions = self.history_manager.load_patient_sessions(self.current_patient)
        
        if not sessions:
            messagebox.showinfo("Info", "Este paciente no tiene sesiones")
            return
        
        hist_window = tk.Toplevel(self.root)
        hist_window.title(f"Historico - {self.current_patient}")
        hist_window.geometry("600x500")
        
        ttk.Label(hist_window, text=f"Paciente: {self.current_patient_name}", font=("Arial", 11, "bold")).pack(pady=10)
        
        ttk.Label(hist_window, text=f"Sesiones ({len(sessions)}):", font=("Arial", 10)).pack(pady=5)
        
        frame = ttk.Frame(hist_window)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)
        
        scrollbar = ttk.Scrollbar(frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        listbox = tk.Listbox(frame, yscrollcommand=scrollbar.set, selectmode=tk.EXTENDED)
        listbox.pack(fill=tk.BOTH, expand=True)
        scrollbar.config(command=listbox.yview)
        
        for session in reversed(sessions):
            listbox.insert(tk.END, session['name'])
        
        def load_session():
            sel = listbox.curselection()
            if sel:
                session_idx = -(sel[0] + 1)  # Invert index for reversed list
                session = sessions[session_idx]
                if os.path.exists(session['resumen_csv']) and os.path.exists(session['alerts_csv']):
                    resumen_df = pd.read_csv(session['resumen_csv'])
                    alerts_df = pd.read_csv(session['alerts_csv'])
                    self.current_results = {
                        'resumen_df': resumen_df,
                        'alerts_df': alerts_df,
                        'resumen_csv': str(session['resumen_csv']),
                        'alerts_csv': str(session['alerts_csv']),
                        'video_output': str(session['video'])
                    }
                    self._update_results_display()
                    # Update buttons based on file existence for historical sessions
                    self.download_csv_button.config(state=tk.NORMAL if os.path.exists(self.current_results['resumen_csv']) and os.path.exists(self.current_results['alerts_csv']) else tk.DISABLED)
                    self.download_video_button.config(state=tk.NORMAL if os.path.exists(self.current_results['video_output']) else tk.DISABLED)
                    self.view_video_button.config(state=tk.NORMAL if os.path.exists(self.current_results['video_output']) else tk.DISABLED)
                    messagebox.showinfo("Éxito", f"Sesión cargada: {session['name']}")
                else:
                    messagebox.showwarning("Error", "Archivos de sesión no encontrados")
        
        def compare_sessions():
            sel = listbox.curselection()
            if len(sel) < 2:
                messagebox.showwarning("Error", "Selecciona al menos 2 sesiones para comparar")
                return
            
            self.comparisons_text.delete(1.0, tk.END)
            comparison_dfs = []
            for idx in sel:
                session_idx = -(idx + 1)  # Invert for reversed
                session = sessions[session_idx]
                if os.path.exists(session['resumen_csv']):
                    df = pd.read_csv(session['resumen_csv'])
                    df['Sesión'] = session['name']
                    comparison_dfs.append(df)
            
            if comparison_dfs:
                combined_df = pd.concat(comparison_dfs, ignore_index=True)
                self.comparisons_text.insert(tk.END, "COMPARACIÓN DE SESIONES\n")
                self.comparisons_text.insert(tk.END, "=" * 80 + "\n\n")
                self.comparisons_text.insert(tk.END, combined_df.to_string(index=False))
                self.notebook.select(2)  # Switch to comparisons tab
                messagebox.showinfo("Éxito", f"{len(sel)} sesiones comparadas")
            else:
                messagebox.showwarning("Error", "No se pudieron cargar los datos para comparación")
        
        button_frame = ttk.Frame(hist_window)
        button_frame.pack(pady=10)
        
        ttk.Button(button_frame, text="Cargar Sesión", command=load_session).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Comparar Sesiones", command=compare_sessions).pack(side=tk.LEFT, padx=5)


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    root = tk.Tk()
    app = PostureAnalysisApp(root)
    root.mainloop()
