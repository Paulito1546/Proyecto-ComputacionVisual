"""
analysis_worker.py - Analysis Thread Management

Handles background analysis operations:
- Running the pipeline in a separate thread
- Progress callbacks
- Result handling
"""

import os
import pandas as pd
from datetime import datetime
from typing import Callable, Optional, Dict
from pathlib import Path

from pipeline_semana8 import run_pipeline
from config import AppConfig


class AnalysisWorker:
    """
    Manages the analysis workflow in a background thread.

    This class encapsulates the analysis process, handling:
    - Session directory creation
    - Pipeline execution
    - Progress reporting
    - Result validation
    """

    def __init__(
        self,
        patient_id: str,
        video_path: str,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ):
        """
        Initialize the analysis worker.

        Args:
            patient_id: ID of the patient being analyzed
            video_path: Path to the input video file
            progress_callback: Optional callback for progress updates (frame_idx, total)
        """
        self.patient_id = patient_id
        self.video_path = video_path
        self.progress_callback = progress_callback
        self.session_name = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.session_dir = self._create_session_directory()

    def _create_session_directory(self) -> Path:
        """
        Creates and returns the session directory path.

        Returns:
            Path object for the session directory
        """
        session_dir = (
            Path(AppConfig.PATIENTS_BASE_DIR)
            / self.patient_id
            / "sessions"
            / self.session_name
        )
        session_dir.mkdir(parents=True, exist_ok=True)
        return session_dir

    def run_analysis(self) -> Dict:
        """
        Executes the analysis pipeline.

        Returns:
            Dictionary containing analysis results and file paths

        Raises:
            Exception: If analysis fails
        """
        # Run the pipeline
        results = run_pipeline(
            input_path=self.video_path,
            tpose_path=None,
            output_base_dir=str(self.session_dir),
            progress_callback=self.progress_callback,
        )

        # Add metadata
        results["video_input"] = self.video_path
        results["session_name"] = self.session_name

        # Ensure CSV files are saved
        self._ensure_csv_files(results)

        # Validate results
        self._validate_results(results)

        return results

    def _ensure_csv_files(self, results: Dict) -> None:
        """
        Ensures CSV files are properly saved from DataFrames.

        Args:
            results: Results dictionary from pipeline
        """
        alerts_csv = self.session_dir / "alertas_por_frame.csv"
        resumen_csv = self.session_dir / "resumen_simetria.csv"

        # Save alerts CSV if not exists
        if "alerts_df" in results and not alerts_csv.exists():
            results["alerts_df"].to_csv(alerts_csv, index=False)

        # Save resumen CSV if not exists
        if "resumen_df" in results and not resumen_csv.exists():
            results["resumen_df"].to_csv(resumen_csv, index=False)

        # Update paths in results
        results["alerts_csv"] = str(alerts_csv)
        results["resumen_csv"] = str(resumen_csv)

    def _validate_results(self, results: Dict) -> None:
        """
        Validates that all required output files exist.

        Args:
            results: Results dictionary to validate

        Raises:
            FileNotFoundError: If required files are missing
        """
        required_files = ["alerts_csv", "resumen_csv", "video_output"]

        for file_key in required_files:
            if file_key not in results:
                raise ValueError(f"Missing required result key: {file_key}")

            file_path = results[file_key]
            if not os.path.exists(file_path):
                print(f"Warning: Expected file not found: {file_path}")

    def get_session_info(self) -> Dict:
        """
        Returns session information.

        Returns:
            Dictionary with session metadata
        """
        return {
            "session_name": self.session_name,
            "session_dir": str(self.session_dir),
            "patient_id": self.patient_id,
            "video_path": self.video_path,
        }


class AnalysisResultsFormatter:
    """
    Formats analysis results for display.

    Converts DataFrames and results into human-readable text.
    """

    @staticmethod
    def format_summary(resumen_df: pd.DataFrame) -> str:
        """
        Formats the summary DataFrame for display.

        Args:
            resumen_df: Summary DataFrame from analysis

        Returns:
            Formatted string for display
        """
        output = "RESUMEN DE SIMETRÍA\n"
        output += "=" * 80 + "\n\n"
        output += resumen_df.to_string(index=False)
        return output

    @staticmethod
    def format_alerts(alerts_df: pd.DataFrame) -> str:
        """
        Formats the alerts DataFrame for display.

        Args:
            alerts_df: Alerts DataFrame from analysis

        Returns:
            Formatted string for display
        """
        if alerts_df.empty:
            return "✅ No se detectaron alertas en el análisis\n"

        output = "ALERTAS DETECTADAS\n"
        output += "=" * 80 + "\n\n"

        for _, row in alerts_df.iterrows():
            emoji = "🔴" if row["severidad"] == "ALTA" else "🟡"
            output += f"{emoji} [{row['severidad']}] Frame {int(row['frame'])}: {row['articulacion']}\n"
            output += f"   Tipo: {row['tipo']}\n"
            output += f"   {row['mensaje']}\n\n"

        return output

    @staticmethod
    def format_comparison(sessions_data: list) -> str:
        """
        Formats multiple sessions for comparison.

        Args:
            sessions_data: List of session DataFrames with session names

        Returns:
            Formatted comparison string
        """
        output = "COMPARACIÓN DE SESIONES\n"
        output += "=" * 100 + "\n\n"

        comparison_dfs = []
        for session in sessions_data:
            df = session["resumen_df"].copy()
            df["Sesión"] = session["session_name"]
            comparison_dfs.append(df)

        if comparison_dfs:
            combined_df = pd.concat(comparison_dfs, ignore_index=True)
            output += combined_df.to_string(index=False)

            # Add statistical summary
            output += "\n\n" + "=" * 100 + "\n"
            output += "RESUMEN ESTADÍSTICO\n"
            output += "=" * 100 + "\n\n"

            output += AnalysisResultsFormatter._format_statistics(combined_df)

        return output

    @staticmethod
    def _format_statistics(combined_df: pd.DataFrame) -> str:
        """Formats statistical summary from combined sessions"""
        output = ""

        if "Articulación" in combined_df.columns:
            for articulation in combined_df["Articulación"].unique():
                art_data = combined_df[combined_df["Articulación"] == articulation]
                output += f"\n{articulation}:\n"
                output += f"  Sesiones analizadas: {len(art_data)}\n"

                if "Diff Media (°)" in art_data.columns:
                    try:
                        diffs = pd.to_numeric(
                            art_data["Diff Media (°)"], errors="coerce"
                        )
                        output += f"  Diferencia media promedio: {diffs.mean():.2f}°\n"
                        output += f"  Diferencia media mínima: {diffs.min():.2f}°\n"
                        output += f"  Diferencia media máxima: {diffs.max():.2f}°\n"
                    except:
                        pass

        return output
