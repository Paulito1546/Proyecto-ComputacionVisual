"""
patient_manager.py - Patient Data Management

Handles all patient-related data operations including:
- Creating new patients
- Loading patient information
- Managing analysis sessions
- Storing session results
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

from config import AppConfig


class PatientHistoryManager:
    """
    Manages patient data and analysis sessions.

    Directory structure:
        patients_data/
            patient_id/
                metadata.json
                sessions/
                    20241201_143022/
                        session_metadata.json
                        resumen_simetria.csv
                        alertas_por_frame.csv
                        output_alerts.mp4
    """

    def __init__(self, base_dir: str = AppConfig.PATIENTS_BASE_DIR):
        """
        Initialize the patient history manager.

        Args:
            base_dir: Base directory for patient data storage
        """
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)

    def create_patient(self, patient_id: str, patient_name: str = "") -> Path:
        """
        Creates a new patient directory with metadata.

        Args:
            patient_id: Unique identifier for the patient
            patient_name: Full name of the patient

        Returns:
            Path to the created patient directory
        """
        patient_dir = self.base_dir / patient_id
        patient_dir.mkdir(exist_ok=True)

        metadata = {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "date_created": datetime.now().isoformat(),
            "sessions": [],
        }

        self._save_metadata(patient_dir, metadata)
        return patient_dir

    def patient_exists(self, patient_id: str) -> bool:
        """
        Checks if a patient exists in the database.

        Args:
            patient_id: Patient identifier to check

        Returns:
            True if patient exists, False otherwise
        """
        return (self.base_dir / patient_id / "metadata.json").exists()

    def save_session(self, patient_id: str, session_name: str, results: Dict) -> None:
        """
        Saves an analysis session for a patient.

        Args:
            patient_id: Patient identifier
            session_name: Name of the session (typically timestamp)
            results: Dictionary containing analysis results
        """
        patient_dir = self.base_dir / patient_id
        session_dir = patient_dir / "sessions" / session_name
        session_dir.mkdir(parents=True, exist_ok=True)

        # Update results with session paths
        results["alerts_csv"] = str(session_dir / "alertas_por_frame.csv")
        results["resumen_csv"] = str(session_dir / "resumen_simetria.csv")
        results["video_output"] = str(session_dir / "output_alerts.mp4")

        # Save session metadata
        session_metadata = {
            "session_name": session_name,
            "date": datetime.now().isoformat(),
            "video_input": results.get("video_input", ""),
            "total_frames": results.get("total_frames", 0),
            "fps": results.get("fps", 0),
        }

        self._save_json(session_dir / "session_metadata.json", session_metadata)

        # Update patient metadata with new session
        self._add_session_to_patient(patient_dir, session_name)

    def load_patient_sessions(
        self, patient_id: str
    ) -> Tuple[Optional[Dict], List[Dict]]:
        """
        Loads all sessions for a patient.

        Args:
            patient_id: Patient identifier

        Returns:
            Tuple of (patient_metadata, list_of_sessions)
        """
        patient_dir = self.base_dir / patient_id

        if not patient_dir.exists():
            return None, []

        metadata = self._load_metadata(patient_dir)
        sessions = self._get_session_list(patient_dir)

        return metadata, sessions

    def get_all_patients(self) -> List[Dict]:
        """
        Returns list of all patients in the database.

        Returns:
            List of patient metadata dictionaries
        """
        patients = []

        for patient_dir in self.base_dir.iterdir():
            if not patient_dir.is_dir():
                continue

            metadata_file = patient_dir / "metadata.json"
            if metadata_file.exists():
                metadata = self._load_json(metadata_file)
                patients.append(metadata)

        return sorted(patients, key=lambda x: x.get("patient_name", ""))

    # ========================================================================
    # PRIVATE HELPER METHODS
    # ========================================================================

    def _save_metadata(self, patient_dir: Path, metadata: Dict) -> None:
        """Saves patient metadata to JSON file"""
        self._save_json(patient_dir / "metadata.json", metadata)

    def _load_metadata(self, patient_dir: Path) -> Dict:
        """Loads patient metadata from JSON file"""
        return self._load_json(patient_dir / "metadata.json")

    def _save_json(self, filepath: Path, data: Dict) -> None:
        """Generic JSON save method"""
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

    def _load_json(self, filepath: Path) -> Dict:
        """Generic JSON load method"""
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    def _add_session_to_patient(self, patient_dir: Path, session_name: str) -> None:
        """Updates patient metadata with new session entry"""
        metadata = self._load_metadata(patient_dir)

        metadata["sessions"].append(
            {"session_name": session_name, "date": datetime.now().isoformat()}
        )

        self._save_metadata(patient_dir, metadata)

    def _get_session_list(self, patient_dir: Path) -> List[Dict]:
        """
        Gets list of sessions with file paths.
        Only includes sessions where required files exist.
        """
        sessions = []
        sessions_dir = patient_dir / "sessions"

        if not sessions_dir.exists():
            return sessions

        for session_folder in sorted(sessions_dir.iterdir()):
            if not session_folder.is_dir():
                continue

            session_data = {
                "name": session_folder.name,
                "path": session_folder,
                "resumen_csv": session_folder / "resumen_simetria.csv",
                "alerts_csv": session_folder / "alertas_por_frame.csv",
                "video": session_folder / "output_alerts.mp4",
            }

            # Only add if required CSV files exist
            if (
                session_data["resumen_csv"].exists()
                and session_data["alerts_csv"].exists()
            ):
                sessions.append(session_data)

        return sessions
