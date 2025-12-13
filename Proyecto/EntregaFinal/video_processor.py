"""
video_processor.py - Video Processing Utilities

Handles video-related operations including:
- Creating slow-motion videos
- Opening videos in system player
- Video format conversions
"""

import os
import subprocess
import cv2
from tkinter import messagebox

from config import AppConfig


class VideoProcessor:
    """
    Handles all video processing operations.

    This class provides utilities for creating slow-motion videos
    and opening videos in the system's default player.
    """

    @staticmethod
    def create_slow_motion_video(
        input_path: str, output_path: str, factor: int = AppConfig.SLOW_MOTION_FACTOR
    ) -> bool:
        """
        Creates a slow-motion version of a video by repeating frames.

        This method reads each frame from the input video and writes it
        multiple times to create a slow-motion effect. The slowdown factor
        determines how many times each frame is repeated.

        Args:
            input_path: Path to the input video file
            output_path: Path where the slow-motion video will be saved
            factor: Number of times to repeat each frame (default: 7 for ~0.14x speed)

        Returns:
            True if successful, False otherwise

        Example:
            >>> processor = VideoProcessor()
            >>> processor.create_slow_motion_video("input.mp4", "output.mp4", factor=7)
            True
        """
        try:
            # Open input video
            cap = cv2.VideoCapture(input_path)

            if not cap.isOpened():
                print(f"Error: Could not open video {input_path}")
                return False

            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            # Create output video writer
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

            if not out.isOpened():
                print(f"Error: Could not create output video {output_path}")
                cap.release()
                return False

            # Process frames
            frame_count = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Write the same frame 'factor' times for slow motion
                for _ in range(factor):
                    out.write(frame)

                frame_count += 1

            # Cleanup
            cap.release()
            out.release()

            print(
                f"Successfully created slow-motion video: {frame_count} frames processed"
            )
            return True

        except Exception as e:
            print(f"Error creating slow motion video: {e}")
            return False

    @staticmethod
    def open_video_in_player(video_path: str) -> None:
        """
        Opens a video in the system's default player.

        This method attempts to open the video using platform-specific
        commands. It tries multiple methods to ensure compatibility
        across different operating systems.

        Args:
            video_path: Path to the video file to open

        Note:
            - Linux: Uses 'xdg-open'
            - macOS: Uses 'open'
            - Windows: Uses 'os.startfile'
        """
        if not os.path.exists(video_path):
            messagebox.showerror("Error", f"Video no encontrado:\n{video_path}")
            return

        try:
            # Try platform-specific commands
            if VideoProcessor._try_linux_open(video_path):
                return

            if VideoProcessor._try_macos_open(video_path):
                return

            if VideoProcessor._try_windows_open(video_path):
                return

            # If all methods fail, show the path
            messagebox.showinfo(
                "Info",
                f"No se pudo abrir automáticamente.\nVideo disponible en:\n{video_path}",
            )

        except Exception as e:
            messagebox.showerror("Error", f"No se pudo abrir el video:\n{str(e)}")

    @staticmethod
    def _try_linux_open(video_path: str) -> bool:
        """Attempts to open video using Linux xdg-open"""
        try:
            subprocess.Popen(["xdg-open", video_path])
            return True
        except (FileNotFoundError, OSError):
            return False

    @staticmethod
    def _try_macos_open(video_path: str) -> bool:
        """Attempts to open video using macOS open command"""
        try:
            subprocess.Popen(["open", video_path])
            return True
        except (FileNotFoundError, OSError):
            return False

    @staticmethod
    def _try_windows_open(video_path: str) -> bool:
        """Attempts to open video using Windows startfile"""
        try:
            os.startfile(video_path)
            return True
        except (AttributeError, OSError):
            return False

    @staticmethod
    def get_video_info(video_path: str) -> dict:
        """
        Extracts metadata from a video file.

        Args:
            video_path: Path to the video file

        Returns:
            Dictionary containing video metadata (fps, width, height, frame_count)
        """
        try:
            cap = cv2.VideoCapture(video_path)

            if not cap.isOpened():
                return {}

            info = {
                "fps": cap.get(cv2.CAP_PROP_FPS),
                "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
                "duration_seconds": int(
                    cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
                ),
            }

            cap.release()
            return info

        except Exception as e:
            print(f"Error getting video info: {e}")
            return {}
