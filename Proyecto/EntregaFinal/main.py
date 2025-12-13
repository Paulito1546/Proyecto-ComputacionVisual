"""
main.py - Application Entry Point

Main entry point for the Postural Analysis System.
Initializes the application and starts the GUI.

Usage:
    python main.py
"""

import sys
import customtkinter as ctk

from config import AppConfig
from main_app import PostureAnalysisApp


def main():
    """
    Main application entry point.

    Sets up the theme and creates the main application window.
    """
    try:
        # Set appearance before creating window
        ctk.set_appearance_mode(AppConfig.APPEARANCE_MODE)
        ctk.set_default_color_theme(AppConfig.COLOR_THEME)

        # Create root window
        root = ctk.CTk()

        # Create application
        app = PostureAnalysisApp(root)

        # Start main event loop
        root.mainloop()

    except KeyboardInterrupt:
        print("\n\nAplicación cerrada por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"Error fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
