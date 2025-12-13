"""
dialogs.py - Dialog Windows

Custom dialog windows for:
- Patient selection/creation
- Session history viewing
- Session comparison
"""

import customtkinter as ctk
from tkinter import messagebox
import pandas as pd
import os
from typing import Optional, Dict, List

from config import AppConfig
from patient_manager import PatientHistoryManager
from analysis_worker import AnalysisResultsFormatter


class PatientDialog:
    """
    Dialog for selecting or creating a patient.

    Displays list of existing patients and provides form for creating new ones.
    """

    def __init__(self, parent, history_manager: PatientHistoryManager):
        """
        Initialize patient dialog.

        Args:
            parent: Parent window
            history_manager: PatientHistoryManager instance
        """
        self.parent = parent
        self.history_manager = history_manager
        self.result = None
        self.dialog = None

    def show(self) -> Optional[Dict]:
        """
        Shows the dialog and returns the result.

        Returns:
            Dictionary with 'patient_id' and 'patient_name' if selected, None otherwise
        """
        self.dialog = ctk.CTkToplevel(self.parent)
        self.dialog.title("Seleccionar Paciente")
        self.dialog.geometry("600x550")

        self._build_dialog()

        # Wait for window to be drawn before grabbing focus
        self.dialog.update_idletasks()  # Force window to render
        self.dialog.after(10, self.dialog.grab_set)  # Delay grab_set slightly

        # Make dialog modal
        self.dialog.transient(self.parent)  # Set parent window
        self.dialog.focus_set()  # Set focus to dialog

        # Wait for dialog to close
        self.parent.wait_window(self.dialog)

        return self.result

    def _build_dialog(self) -> None:
        """Builds the dialog interface."""
        # Header
        header = ctk.CTkLabel(
            self.dialog,
            text="Gestión de Pacientes",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        header.pack(pady=15)

        # Existing patients section
        self._build_existing_patients_section()

        # Separator
        separator = ctk.CTkLabel(self.dialog, text="─" * 60)
        separator.pack(pady=15)

        # New patient section
        self._build_new_patient_section()

    def _build_existing_patients_section(self) -> None:
        """Builds the existing patients list section."""
        label = ctk.CTkLabel(
            self.dialog,
            text="Pacientes Existentes:",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        label.pack(pady=5)

        # Scrollable frame for patient list
        list_frame = ctk.CTkScrollableFrame(self.dialog, height=250)
        list_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Get patients
        patients = self.history_manager.get_all_patients()

        if not patients:
            no_patients_label = ctk.CTkLabel(
                list_frame, text="No hay pacientes registrados", text_color="gray"
            )
            no_patients_label.pack(pady=20)
        else:
            for patient in patients:
                self._create_patient_button(list_frame, patient)

    def _create_patient_button(self, parent, patient: Dict) -> None:
        """Creates a button for a patient."""
        pid = patient["patient_id"]
        pname = patient.get("patient_name", "N/A")

        button = ctk.CTkButton(
            parent,
            text=f"{pid} - {pname}",
            command=lambda: self._select_patient(pid, pname),
        )
        button.pack(fill="x", pady=2, padx=5)

    def _select_patient(self, patient_id: str, patient_name: str) -> None:
        """Handles patient selection."""
        self.result = {"patient_id": patient_id, "patient_name": patient_name}
        messagebox.showinfo("Éxito", f"Paciente seleccionado: {patient_id}")
        self.dialog.destroy()

    def _build_new_patient_section(self) -> None:
        """Builds the new patient creation section."""
        label = ctk.CTkLabel(
            self.dialog,
            text="Crear Nuevo Paciente:",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        label.pack(pady=5)

        # Form frame
        form_frame = ctk.CTkFrame(self.dialog)
        form_frame.pack(fill="x", padx=20, pady=10)

        # ID field
        ctk.CTkLabel(form_frame, text="ID:").grid(
            row=0, column=0, padx=5, pady=10, sticky="e"
        )
        self.id_entry = ctk.CTkEntry(form_frame, width=150)
        self.id_entry.grid(row=0, column=1, padx=5, pady=10)

        # Name field
        ctk.CTkLabel(form_frame, text="Nombre:").grid(
            row=0, column=2, padx=5, pady=10, sticky="e"
        )
        self.name_entry = ctk.CTkEntry(form_frame, width=200)
        self.name_entry.grid(row=0, column=3, padx=5, pady=10)

        # Create button
        create_button = ctk.CTkButton(
            self.dialog, text="Crear Paciente", command=self._create_new_patient
        )
        create_button.pack(pady=10)

    def _create_new_patient(self) -> None:
        """Handles new patient creation."""
        pid = self.id_entry.get().strip()
        pname = self.name_entry.get().strip()

        # Validation
        if not pid or not pname:
            messagebox.showwarning("Error", "ID y Nombre son requeridos")
            return

        if self.history_manager.patient_exists(pid):
            messagebox.showwarning("Error", f"Paciente {pid} ya existe")
            return

        # Create patient
        self.history_manager.create_patient(pid, pname)
        self.result = {"patient_id": pid, "patient_name": pname}
        messagebox.showinfo("Éxito", f"Paciente {pid} creado exitosamente")
        self.dialog.destroy()


class HistoryDialog:
    """
    Dialog for viewing patient history and comparing sessions.

    Allows selecting sessions to load or compare.
    """

    def __init__(
        self,
        parent,
        patient_id: str,
        patient_name: str,
        history_manager: PatientHistoryManager,
        load_callback,
        compare_callback,
    ):
        """
        Initialize history dialog.

        Args:
            parent: Parent window
            patient_id: Current patient ID
            patient_name: Current patient name
            history_manager: PatientHistoryManager instance
            load_callback: Callback for loading a session
            compare_callback: Callback for comparing sessions
        """
        self.parent = parent
        self.patient_id = patient_id
        self.patient_name = patient_name
        self.history_manager = history_manager
        self.load_callback = load_callback
        self.compare_callback = compare_callback
        self.dialog = None
        self.session_vars = []

    def show(self) -> None:
        """Shows the history dialog."""
        # Load sessions
        metadata, sessions = self.history_manager.load_patient_sessions(self.patient_id)

        if not sessions:
            messagebox.showinfo("Info", "Este paciente no tiene sesiones")
            return

        self.sessions = sessions

        # Create dialog
        self.dialog = ctk.CTkToplevel(self.parent)
        self.dialog.title(f"Histórico - {self.patient_id}")
        self.dialog.geometry("750x650")

        self._build_dialog()

        # Wait for window to be drawn before grabbing focus
        self.dialog.update_idletasks()
        self.dialog.after(10, self.dialog.grab_set)

        # Make dialog modal
        self.dialog.transient(self.parent)
        self.dialog.focus_set()

    def _build_dialog(self) -> None:
        """Builds the dialog interface."""
        # Header
        header = ctk.CTkLabel(
            self.dialog,
            text=f"Paciente: {self.patient_name}",
            font=ctk.CTkFont(size=16, weight="bold"),
        )
        header.pack(pady=15)

        info = ctk.CTkLabel(
            self.dialog,
            text=f"Total de sesiones: {len(self.sessions)}",
            font=ctk.CTkFont(size=12),
        )
        info.pack(pady=5)

        # Instructions
        instructions = ctk.CTkLabel(
            self.dialog,
            text="Selecciona sesiones con las casillas de verificación",
            text_color="gray",
        )
        instructions.pack(pady=5)

        # Sessions list
        self._build_sessions_list()

        # Buttons
        self._build_buttons()

    def _build_sessions_list(self) -> None:
        """Builds the scrollable list of sessions."""
        list_frame = ctk.CTkScrollableFrame(self.dialog, height=350)
        list_frame.pack(fill="both", expand=True, padx=20, pady=10)

        # Create checkbox for each session (reversed for newest first)
        for session in reversed(self.sessions):
            var = ctk.BooleanVar()
            self.session_vars.append((var, session))

            frame = ctk.CTkFrame(list_frame)
            frame.pack(fill="x", pady=3)

            checkbox = ctk.CTkCheckBox(
                frame,
                text=session["name"],
                variable=var,
                font=ctk.CTkFont(family="Courier", size=11),
            )
            checkbox.pack(side="left", padx=10, pady=5)

    def _build_buttons(self) -> None:
        """Builds the action buttons."""
        button_frame = ctk.CTkFrame(self.dialog)
        button_frame.pack(fill="x", padx=20, pady=15)

        ctk.CTkButton(
            button_frame, text="Cargar Sesión", command=self._load_selected
        ).pack(side="left", padx=5)

        ctk.CTkButton(
            button_frame, text="Comparar Sesiones", command=self._compare_selected
        ).pack(side="left", padx=5)

        ctk.CTkButton(button_frame, text="Cerrar", command=self.dialog.destroy).pack(
            side="right", padx=5
        )

    def _load_selected(self) -> None:
        """Loads the selected session."""
        selected = [s for v, s in self.session_vars if v.get()]

        if len(selected) != 1:
            messagebox.showwarning(
                "Error", "Selecciona exactamente 1 sesión para cargar"
            )
            return

        session = selected[0]
        self.load_callback(session)
        messagebox.showinfo("Éxito", f"Sesión cargada: {session['name']}")

    def _compare_selected(self) -> None:
        """Compares the selected sessions."""
        selected = [s for v, s in self.session_vars if v.get()]

        if len(selected) < 2:
            messagebox.showwarning(
                "Error", "Selecciona al menos 2 sesiones para comparar"
            )
            return

        self.compare_callback(selected)
        messagebox.showinfo("Éxito", f"{len(selected)} sesiones comparadas")
        self.dialog.destroy()
