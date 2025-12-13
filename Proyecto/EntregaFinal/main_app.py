"""
main_app.py - Main Application Entry Point

The main application class that orchestrates all components.
This file contains the core application logic and UI assembly.
"""

import customtkinter as ctk
from tkinter import filedialog, messagebox
import os
import threading
import shutil
import pandas as pd
from typing import Optional, Dict, List

from config import AppConfig
from patient_manager import PatientHistoryManager
from video_processor import VideoProcessor
from ui_components import (
    StatusLabel,
    ProgressPanel,
    SectionFrame,
    InfoRow,
    ButtonRow,
    ResultsTextBox,
)
from analysis_worker import AnalysisWorker, AnalysisResultsFormatter
from dialogs import PatientDialog, HistoryDialog
from gemini_analyzer import GeminiAnalyzer
from chat_widget import ChatWidget
import os
from pathlib import Path


# ... rest of initialization ...
class PostureAnalysisApp:
    """
    Main application class for postural analysis.

    This class orchestrates all components and manages the application lifecycle.
    """

    def __init__(self, root: ctk.CTk):
        """
        Initialize the application.

        Args:
            root: The root CTk window
        """
        self.gemini_analyzer = None
        api_key = os.getenv("GEMINI_API_KEY", "")

        if api_key:
            try:
                self.gemini_analyzer = GeminiAnalyzer(api_key)
                print("✅ Gemini AI habilitado")
            except Exception as e:
                print(f"⚠️ No se pudo inicializar Gemini: {e}")
        else:
            print("ℹ️ Gemini AI no configurado (falta GEMINI_API_KEY en .env)")

        self.root = root
        self._setup_window()

        # Initialize managers
        self.history_manager = PatientHistoryManager()
        self.video_processor = VideoProcessor()
        self.results_formatter = AnalysisResultsFormatter()

        # Application state
        self.current_patient_id: Optional[str] = None
        self.current_patient_name: Optional[str] = None
        self.current_video_path: Optional[str] = None
        self.current_results: Optional[Dict] = None
        self.analysis_thread: Optional[threading.Thread] = None

        # Build UI
        self._build_interface()

    # ========================================================================
    # GEMINI
    # ========================================================================

    def _get_gemini_analysis(self) -> None:
        """Gets AI analysis from Gemini in background."""
        if not self.gemini_analyzer or not self.current_results:
            return

        # Show loading message
        self.gemini_textbox.set_text(
            "🤖 Analizando resultados con IA...\n\nEsto puede tomar unos segundos..."
        )
        self.tabview.set("🤖 Análisis IA")  # Switch to AI tab

        # Disable chat while processing
        self.chat_widget.enable_input(False)

        # Run in thread to avoid blocking UI
        def get_analysis():
            try:
                analysis = self.gemini_analyzer.analyze_results(
                    self.current_results["resumen_df"],
                    self.current_results["alerts_df"],
                    self.current_patient_id,
                )

                # Update UI in main thread
                self.root.after(0, lambda: self._on_gemini_analysis_complete(analysis))

            except Exception as e:
                error_msg = f"❌ Error al obtener análisis de IA:\n\n{str(e)}"
                self.root.after(0, lambda: self.gemini_textbox.set_text(error_msg))

        thread = threading.Thread(target=get_analysis, daemon=True)
        thread.start()

    def _on_gemini_analysis_complete(self, analysis: str) -> None:
        """Called when Gemini analysis is complete."""
        # Display analysis
        self.gemini_textbox.set_text(analysis)

        # Enable chat
        self.chat_widget.enable_input(True)

        # Load chat history into widget
        self.chat_widget.load_history(self.gemini_analyzer.get_chat_history())

        # Save chat history with session
        self._save_chat_history()

    def _save_chat_history(self) -> None:
        """Saves chat history to the current session."""
        if not self.gemini_analyzer or not self.current_results:
            return

        try:
            # Get session directory from current results
            video_path = self.current_results.get("video_output", "")
            if not video_path:
                return

            session_dir = Path(video_path).parent
            chat_file = session_dir / "chat_history.json"

            self.gemini_analyzer.save_chat_history(chat_file)

        except Exception as e:
            print(f"Error saving chat history: {e}")

    def _send_chat_message(self, message: str) -> str:
        """
        Callback for chat widget to send messages.

        Args:
            message: User's message

        Returns:
            Gemini's response
        """
        if not self.gemini_analyzer:
            return "❌ Gemini AI no está configurado"

        return self.gemini_analyzer.send_message(message)

    # ========================================================================
    # INITIALIZATION
    # ========================================================================

    def _setup_window(self) -> None:
        """Configures the main window."""
        self.root.title(f"{AppConfig.APP_NAME} - {AppConfig.VERSION}")
        self.root.geometry(AppConfig.WINDOW_SIZE)

        # Set theme
        ctk.set_appearance_mode(AppConfig.APPEARANCE_MODE)
        ctk.set_default_color_theme(AppConfig.COLOR_THEME)

    def _build_interface(self) -> None:
        """Builds the complete user interface."""
        # Main container
        main_container = ctk.CTkFrame(self.root)
        main_container.pack(fill="both", expand=True, padx=10, pady=10)

        # Build sections
        self._build_patient_section(main_container)
        self._build_analysis_section(main_container)
        self._build_results_section(main_container)
        self._build_status_bar()

    # ========================================================================
    # UI SECTIONS
    # ========================================================================

    def _build_patient_section(self, parent) -> None:
        """Builds the patient and video selection section."""
        section = SectionFrame(parent, "1. Seleccionar Paciente y Video")
        section.pack(fill="x", pady=(0, 10))
        content = section.get_content_frame()

        # Patient info row
        patient_row = InfoRow(content, "Paciente:")
        patient_row.pack(fill="x", padx=10, pady=5)
        self.patient_info = patient_row
        self.patient_info.set_value("[Sin seleccionar]", "error")

        ctk.CTkButton(
            patient_row, text="Seleccionar/Crear", command=self._show_patient_dialog
        ).pack(side="left", padx=5)

        # Video info row
        video_row = InfoRow(content, "Video:")
        video_row.pack(fill="x", padx=10, pady=5)
        self.video_info = video_row
        self.video_info.set_value("[No cargado]", "error")

        ctk.CTkButton(video_row, text="Cargar Video", command=self._load_video).pack(
            side="left", padx=5
        )

    def _build_analysis_section(self, parent) -> None:
        """Builds the analysis control section."""
        section = SectionFrame(parent, "2. Análisis de Movimiento")
        section.pack(fill="x", pady=(0, 10))
        content = section.get_content_frame()

        # Button row
        button_row = ButtonRow(content)
        button_row.pack(fill="x", padx=10, pady=5)

        self.analyze_button = button_row.add_button(
            "▶ Iniciar Análisis", self._start_analysis, state="disabled"
        )

        self.download_csv_button = button_row.add_button(
            "⬇ Descargar CSV", self._download_csv, state="disabled"
        )

        self.download_video_button = button_row.add_button(
            "⬇ Descargar Video", self._download_video, state="disabled"
        )

        self.view_video_button = button_row.add_button(
            "▶ Ver Video", self._view_video, state="disabled"
        )

        button_row.add_button("📊 Ver Histórico", self._show_history)

        # Progress panel
        self.progress_panel = ProgressPanel(button_row)
        self.progress_panel.pack(side="left", fill="x", expand=True, padx=20)

    def _build_results_section(self, parent) -> None:
        """Builds the results display section."""
        section = SectionFrame(parent, "3. Resultados")
        section.pack(fill="both", expand=True)
        content = section.get_content_frame()

        # Create tabview
        self.tabview = ctk.CTkTabview(content)
        self.tabview.pack(fill="both", expand=True, padx=5, pady=5)

        # Create tabs
        self.tabview.add("Resumen de Simetría")
        self.tabview.add("Alertas Detectadas")
        self.tabview.add("Comparaciones")

        # Add Gemini tabs if enabled
        if self.gemini_analyzer:
            self.tabview.add("🤖 Análisis IA")
            self.tabview.add("💬 Chat IA")

        # Create textboxes
        self.summary_textbox = ResultsTextBox(self.tabview.tab("Resumen de Simetría"))
        self.summary_textbox.pack(fill="both", expand=True, padx=5, pady=5)

        self.alerts_textbox = ResultsTextBox(self.tabview.tab("Alertas Detectadas"))
        self.alerts_textbox.pack(fill="both", expand=True, padx=5, pady=5)

        self.comparisons_textbox = ResultsTextBox(self.tabview.tab("Comparaciones"))
        self.comparisons_textbox.pack(fill="both", expand=True, padx=5, pady=5)

        # Gemini tabs
        if self.gemini_analyzer:
            # Initial analysis tab
            self.gemini_textbox = ResultsTextBox(self.tabview.tab("🤖 Análisis IA"))
            self.gemini_textbox.pack(fill="both", expand=True, padx=5, pady=5)

            # Chat interface tab
            self.chat_widget = ChatWidget(
                self.tabview.tab("💬 Chat IA"), send_callback=self._send_chat_message
            )
            self.chat_widget.pack(fill="both", expand=True)
            self.chat_widget.enable_input(False)  # Disabled until analysis is done

    def _send_chat_message(self, message: str) -> str:
        """
        Callback for chat widget to send messages.

        Args:
            message: User's message

        Returns:
            Gemini's response
        """
        if not self.gemini_analyzer:
            return "❌ Gemini AI no está configurado"

        return self.gemini_analyzer.send_message(message)

    def _build_status_bar(self) -> None:
        """Builds the status bar at the bottom."""
        self.status_label = StatusLabel(self.root, text="Listo", anchor="w")
        self.status_label.pack(fill="x", padx=10, pady=5)
        self.status_label.set_status("Listo", "info")

    # ========================================================================
    # PATIENT MANAGEMENT
    # ========================================================================

    def _show_patient_dialog(self) -> None:
        """Shows the patient selection/creation dialog."""
        dialog = PatientDialog(self.root, self.history_manager)
        result = dialog.show()

        if result:
            self.current_patient_id = result["patient_id"]
            self.current_patient_name = result["patient_name"]
            self._update_patient_display()

    def _update_patient_display(self) -> None:
        """Updates the patient information display."""
        if self.current_patient_id:
            text = f"✅ {self.current_patient_id} ({self.current_patient_name})"
            self.patient_info.set_value(text, "success")
            self._check_enable_analysis()
        else:
            self.patient_info.set_value("[Sin seleccionar]", "error")

    def _load_video(self) -> None:
        """Loads a video file."""
        if not self.current_patient_id:
            messagebox.showwarning("Error", "Primero selecciona un paciente")
            return

        file_path = filedialog.askopenfilename(
            title="Seleccionar Video",
            filetypes=[("Videos MP4", "*.mp4"), ("Todos los archivos", "*.*")],
        )

        if file_path:
            self.current_video_path = file_path
            video_name = os.path.basename(file_path)
            self.video_info.set_value(f"✅ {video_name}", "success")
            self.status_label.set_status(f"Video cargado: {video_name}", "success")
            self._check_enable_analysis()

    def _check_enable_analysis(self) -> None:
        """Enables analysis button if patient and video are loaded."""
        if self.current_patient_id and self.current_video_path:
            self.analyze_button.configure(state="normal")

    # ========================================================================
    # ANALYSIS
    # ========================================================================

    def _start_analysis(self) -> None:
        """Starts the analysis process."""
        if not self.current_video_path or not self.current_patient_id:
            messagebox.showwarning("Error", "Video y paciente requeridos")
            return

        self._set_controls_state(analyzing=True)
        self.progress_panel.reset()
        self.status_label.set_status("Análisis en progreso...", "info")

        # Start analysis thread
        self.analysis_thread = threading.Thread(target=self._run_analysis_worker)
        self.analysis_thread.daemon = True
        self.analysis_thread.start()

    def _run_analysis_worker(self) -> None:
        """Worker thread for running analysis."""
        try:
            # Create analysis worker
            worker = AnalysisWorker(
                patient_id=self.current_patient_id,
                video_path=self.current_video_path,
                progress_callback=self._update_progress,
            )

            # Run analysis
            results = worker.run_analysis()
            self.current_results = results

            # Save session
            self.history_manager.save_session(
                self.current_patient_id, worker.session_name, results
            )

            # Update UI (must be done in main thread)
            self.root.after(0, self._on_analysis_complete)

        except Exception as e:
            error_msg = f"Error en análisis:\n{str(e)}"
            self.root.after(0, lambda: self._on_analysis_error(error_msg))

    def _update_progress(self, current: int, total: int) -> None:
        """Updates progress display (called from worker thread)."""
        self.root.after(0, lambda: self.progress_panel.update_progress(current, total))

    def _on_analysis_complete(self) -> None:
        """Called when analysis completes successfully."""
        self._set_controls_state(analyzing=False)
        self._display_results()
        self.status_label.set_status("✅ Análisis completado", "success")
        self._enable_result_buttons()

    def _on_analysis_error(self, error_msg: str) -> None:
        """Called when analysis encounters an error."""
        self._set_controls_state(analyzing=False)
        self.status_label.set_status("❌ Error en análisis", "error")
        messagebox.showerror("Error", error_msg)

    def _set_controls_state(self, analyzing: bool) -> None:
        """Enables or disables controls during analysis."""
        state = "disabled" if analyzing else "normal"
        self.analyze_button.configure(state=state)

        if analyzing:
            self.download_csv_button.configure(state="disabled")
            self.download_video_button.configure(state="disabled")
            self.view_video_button.configure(state="disabled")

    def _enable_result_buttons(self) -> None:
        """Enables result buttons based on file existence."""
        if not self.current_results:
            return

        csv_exists = os.path.exists(
            self.current_results.get("resumen_csv", "")
        ) and os.path.exists(self.current_results.get("alerts_csv", ""))
        video_exists = os.path.exists(self.current_results.get("video_output", ""))

        self.download_csv_button.configure(state="normal" if csv_exists else "disabled")
        self.download_video_button.configure(
            state="normal" if video_exists else "disabled"
        )
        self.view_video_button.configure(state="normal" if video_exists else "disabled")

    # ========================================================================
    # RESULTS DISPLAY
    # ========================================================================

    def _display_results(self) -> None:
        """Displays analysis results in the UI."""
        if not self.current_results:
            return

        # Display summary
        summary_text = self.results_formatter.format_summary(
            self.current_results["resumen_df"]
        )
        self.summary_textbox.set_text(summary_text)

        # Display alerts
        alerts_text = self.results_formatter.format_alerts(
            self.current_results["alerts_df"]
        )
        self.alerts_textbox.set_text(alerts_text)

        # Get Gemini analysis if enabled
        if self.gemini_analyzer:
            self._get_gemini_analysis()

    # ========================================================================
    # EXPORT FUNCTIONS
    # ========================================================================

    def _download_csv(self) -> None:
        """Downloads CSV files to user-selected directory."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return

        save_dir = filedialog.askdirectory(title="Selecciona carpeta")
        if not save_dir:
            return

        try:
            shutil.copy(
                self.current_results["resumen_csv"],
                os.path.join(save_dir, "resumen_simetria.csv"),
            )
            shutil.copy(
                self.current_results["alerts_csv"],
                os.path.join(save_dir, "alertas_por_frame.csv"),
            )

            messagebox.showinfo("Éxito", "Archivos CSV descargados")
            self.status_label.set_status("CSV descargados correctamente", "success")
        except Exception as e:
            messagebox.showerror("Error", f"Error al descargar: {str(e)}")

    def _download_video(self) -> None:
        """Downloads slow-motion video."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return

        video_path = self.current_results["video_output"]
        if not os.path.exists(video_path):
            messagebox.showwarning("Error", "Video no encontrado")
            return

        try:
            os.makedirs(AppConfig.OUTPUT_DIR, exist_ok=True)
            slow_path = os.path.join(AppConfig.OUTPUT_DIR, "slow_output_alerts.mp4")

            if self.video_processor.create_slow_motion_video(video_path, slow_path):
                save_dir = filedialog.askdirectory(title="Selecciona carpeta")
                if save_dir:
                    shutil.copy(
                        slow_path, os.path.join(save_dir, "slow_output_alerts.mp4")
                    )
                    messagebox.showinfo("Éxito", "Video lento (0.14x) descargado")
                    self.status_label.set_status("Video descargado", "success")
            else:
                messagebox.showerror("Error", "No se pudo crear video lento")
        except Exception as e:
            messagebox.showerror("Error", f"Error al descargar video: {str(e)}")

    def _view_video(self) -> None:
        """Opens slow-motion video in player."""
        if not self.current_results:
            messagebox.showwarning("Error", "Primero realiza un análisis")
            return

        video_path = self.current_results["video_output"]
        if not os.path.exists(video_path):
            messagebox.showwarning("Error", "Video no encontrado")
            return

        try:
            os.makedirs(AppConfig.OUTPUT_DIR, exist_ok=True)
            slow_path = os.path.join(AppConfig.OUTPUT_DIR, "slow_output_alerts.mp4")

            if self.video_processor.create_slow_motion_video(video_path, slow_path):
                self.video_processor.open_video_in_player(slow_path)
            else:
                messagebox.showerror("Error", "No se pudo crear video lento")
        except Exception as e:
            messagebox.showerror("Error", f"Error al ver video: {str(e)}")

    # ========================================================================
    # HISTORY
    # ========================================================================

    def _show_history(self) -> None:
        """Shows patient history dialog."""
        if not self.current_patient_id:
            messagebox.showwarning("Error", "Selecciona un paciente primero")
            return

        dialog = HistoryDialog(
            parent=self.root,
            patient_id=self.current_patient_id,
            patient_name=self.current_patient_name,
            history_manager=self.history_manager,
            load_callback=self._load_session_data,
            compare_callback=self._compare_sessions,
        )
        dialog.show()

    def _load_session_data(self, session: Dict) -> None:
        """Loads data from a historical session."""
        try:
            if not os.path.exists(session["resumen_csv"]) or not os.path.exists(
                session["alerts_csv"]
            ):
                messagebox.showwarning("Error", "Archivos de sesión no encontrados")
                return

            # Load DataFrames
            resumen_df = pd.read_csv(session["resumen_csv"])
            alerts_df = pd.read_csv(session["alerts_csv"])

            # Update current results
            self.current_results = {
                "resumen_df": resumen_df,
                "alerts_df": alerts_df,
                "resumen_csv": str(session["resumen_csv"]),
                "alerts_csv": str(session["alerts_csv"]),
                "video_output": str(session["video"]),
            }

            # Display results
            self._display_results()

            # Enable appropriate buttons
            self._enable_result_buttons()

            # Load chat history if available and Gemini is enabled
            if self.gemini_analyzer:
                chat_file = Path(session["path"]) / "chat_history.json"
                if chat_file.exists():
                    if self.gemini_analyzer.load_chat_history(chat_file):
                        # Load initial analysis (first message)
                        history = self.gemini_analyzer.get_chat_history()
                        if history:
                            self.gemini_textbox.set_text(history[0].content)
                            self.chat_widget.load_history(history)
                            self.chat_widget.enable_input(True)

            self.status_label.set_status(
                f"Sesión cargada: {session['name']}", "success"
            )

        except Exception as e:
            messagebox.showerror("Error", f"Error al cargar sesión:\n{str(e)}")

    def _compare_sessions(self, sessions: List[Dict]) -> None:
        """Compares multiple sessions."""
        try:
            sessions_data = []

            for session in sessions:
                if os.path.exists(session["resumen_csv"]):
                    df = pd.read_csv(session["resumen_csv"])
                    sessions_data.append(
                        {"session_name": session["name"], "resumen_df": df}
                    )

            if not sessions_data:
                messagebox.showwarning("Error", "No se pudieron cargar datos")
                return

            # Format comparison
            comparison_text = self.results_formatter.format_comparison(sessions_data)

            # Display in comparisons tab
            self.comparisons_textbox.set_text(comparison_text)
            self.tabview.set("Comparaciones")

            self.status_label.set_status(
                f"Comparación realizada: {len(sessions)} sesiones", "success"
            )

        except Exception as e:
            messagebox.showerror("Error", f"Error al comparar:\n{str(e)}")
