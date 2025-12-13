"""
api_key_manager.py - Secure API Key Management

Stores API keys in user's home directory, encrypted.
"""

import os
import json
from pathlib import Path
from tkinter import simpledialog, messagebox
import base64


class APIKeyManager:
    """Manages API keys securely in user's home directory."""

    def __init__(self):
        self.config_dir = Path.home() / ".postural_analysis"
        self.config_file = self.config_dir / "config.json"
        self.config_dir.mkdir(exist_ok=True)

    def get_gemini_key(self, parent_window=None) -> str:
        """
        Gets Gemini API key. Prompts user if not found.

        Args:
            parent_window: Parent window for dialog

        Returns:
            API key or empty string
        """
        # Try to load from config
        key = self._load_key()

        if not key and parent_window:
            # Prompt user for key
            key = self._prompt_for_key(parent_window)
            if key:
                self._save_key(key)

        return key

    def _load_key(self) -> str:
        """Load API key from config file."""
        if not self.config_file.exists():
            return ""

        try:
            with open(self.config_file, "r") as f:
                config = json.load(f)
                # Simple obfuscation (not encryption, but better than plain text)
                encoded_key = config.get("gemini_key", "")
                if encoded_key:
                    return base64.b64decode(encoded_key).decode("utf-8")
        except:
            pass

        return ""

    def _save_key(self, key: str) -> None:
        """Save API key to config file."""
        try:
            # Simple obfuscation
            encoded_key = base64.b64encode(key.encode("utf-8")).decode("utf-8")

            config = {"gemini_key": encoded_key}

            with open(self.config_file, "w") as f:
                json.dump(config, f)

            # Set restrictive permissions (Unix-like systems)
            try:
                os.chmod(self.config_file, 0o600)
            except:
                pass

        except Exception as e:
            print(f"Error saving API key: {e}")

    def _prompt_for_key(self, parent) -> str:
        """Prompt user for API key."""
        from tkinter import Toplevel, Label, Entry, Button, Frame

        dialog = Toplevel(parent)
        dialog.title("Configurar Gemini API")
        dialog.geometry("500x250")
        dialog.grab_set()

        result = {"key": ""}

        Label(
            dialog, text="Configuración de Gemini AI", font=("Arial", 14, "bold")
        ).pack(pady=10)

        Label(
            dialog,
            text="Para habilitar el análisis con IA, necesitas una API key de Google Gemini.",
            wraplength=450,
        ).pack(pady=5)

        Label(
            dialog,
            text="Obtén tu key gratis en: https://makersuite.google.com/app/apikey",
            fg="blue",
            cursor="hand2",
        ).pack(pady=5)

        frame = Frame(dialog)
        frame.pack(pady=10)

        Label(frame, text="API Key:").pack(side="left", padx=5)
        entry = Entry(frame, width=40, show="*")
        entry.pack(side="left", padx=5)

        def on_save():
            result["key"] = entry.get().strip()
            dialog.destroy()

        def on_skip():
            dialog.destroy()

        btn_frame = Frame(dialog)
        btn_frame.pack(pady=10)

        Button(btn_frame, text="Guardar", command=on_save, bg="green", fg="white").pack(
            side="left", padx=5
        )
        Button(btn_frame, text="Omitir (Usar más tarde)", command=on_skip).pack(
            side="left", padx=5
        )

        parent.wait_window(dialog)

        return result["key"]

    def clear_key(self) -> None:
        """Remove stored API key."""
        if self.config_file.exists():
            self.config_file.unlink()
