"""
config.py - Application Configuration

Central configuration file for the postural analysis application.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class AppConfig:
    """Application configuration constants"""

    # Application Info
    APP_NAME = "Sistema de Análisis Postural"
    VERSION = "Semana 13 - Refactored"
    WINDOW_SIZE = "1400x800"

    # Theme Colors
    COLOR_SUCCESS = "#28a745"
    COLOR_WARNING = "#ffc107"
    COLOR_ERROR = "#dc3545"
    COLOR_INFO = "#17a2b8"

    # Video Processing
    SLOW_MOTION_FACTOR = 7  # 1/7 = ~0.14x speed

    # Directory Structure
    PATIENTS_BASE_DIR = "patients_data"
    OUTPUT_DIR = "semana_13"

    # UI Settings
    APPEARANCE_MODE = "dark"  # "dark", "light", or "system"
    COLOR_THEME = "blue"  # "blue", "green", or "dark-blue"

    # Font Settings
    FONT_FAMILY = "Arial"
    FONT_SIZE_TITLE = 14
    FONT_SIZE_NORMAL = 11
    FONT_SIZE_SMALL = 9
    FONT_FAMILY_MONO = "Courier"

    # Analysis Settings (from pipeline_semana8)
    WINDOW_SIZE_FRAMES = 30  # frames in sliding window
    ANALYZE_EVERY = 10  # analyze every N frames
    MIN_LANDMARKS = 33  # MediaPipe Pose landmarks

    # Gemini API Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_ENABLED = bool(GEMINI_API_KEY)  # Auto-enable if key exists
