"""
ui_components.py - Custom UI Components

Reusable CustomTkinter widgets for the application:
- StatusLabel: Color-coded status display
- ProgressPanel: Progress bar with percentage
- SessionListItem: Individual session item in history
"""

import customtkinter as ctk
from config import AppConfig


class StatusLabel(ctk.CTkLabel):
    """
    Custom label with color-coded status display.

    Provides visual feedback through color changes based on
    the status type (success, warning, error, info).
    """

    def __init__(self, master, **kwargs):
        """
        Initialize the status label.

        Args:
            master: Parent widget
            **kwargs: Additional CTkLabel arguments
        """
        super().__init__(master, **kwargs)

    def set_status(self, text: str, status_type: str = "info") -> None:
        """
        Updates status text with appropriate color.

        Args:
            text: Status message to display
            status_type: Type of status ("success", "warning", "error", "info")
        """
        color_map = {
            "success": AppConfig.COLOR_SUCCESS,
            "warning": AppConfig.COLOR_WARNING,
            "error": AppConfig.COLOR_ERROR,
            "info": AppConfig.COLOR_INFO,
        }

        color = color_map.get(status_type, "gray")
        self.configure(text=text, text_color=color)


class ProgressPanel(ctk.CTkFrame):
    """
    Progress display panel with progress bar and percentage label.

    Combines a progress bar and text label to show analysis progress.
    """

    def __init__(self, master, **kwargs):
        """
        Initialize the progress panel.

        Args:
            master: Parent widget
            **kwargs: Additional CTkFrame arguments
        """
        super().__init__(master, **kwargs)

        # Progress bar
        self.progressbar = ctk.CTkProgressBar(self)
        self.progressbar.pack(side="left", fill="x", expand=True, padx=5)
        self.progressbar.set(0)

        # Percentage label
        self.label = ctk.CTkLabel(self, text="0%", width=50)
        self.label.pack(side="left", padx=5)

    def update_progress(self, current: int, total: int) -> None:
        """
        Updates progress bar and percentage label.

        Args:
            current: Current progress value
            total: Total/maximum value
        """
        if total > 0:
            percentage = current / total
            self.progressbar.set(percentage)
            self.label.configure(text=f"{int(percentage * 100)}%")
        else:
            self.reset()

    def reset(self) -> None:
        """Resets progress to zero."""
        self.progressbar.set(0)
        self.label.configure(text="0%")


class SectionFrame(ctk.CTkFrame):
    """
    Frame with a title label for organizing UI sections.

    Creates a consistent look for major sections of the interface.
    """

    def __init__(self, master, title: str, **kwargs):
        """
        Initialize section frame.

        Args:
            master: Parent widget
            title: Section title text
            **kwargs: Additional CTkFrame arguments
        """
        super().__init__(master, **kwargs)

        self.title_label = ctk.CTkLabel(
            self,
            text=title,
            font=ctk.CTkFont(size=AppConfig.FONT_SIZE_TITLE, weight="bold"),
        )
        self.title_label.pack(pady=10)

        # Content frame where children will be added
        self.content_frame = ctk.CTkFrame(self)
        self.content_frame.pack(fill="both", expand=True, padx=10, pady=5)

    def get_content_frame(self) -> ctk.CTkFrame:
        """Returns the content frame for adding child widgets."""
        return self.content_frame


class InfoRow(ctk.CTkFrame):
    """
    A row displaying a label and value side-by-side.

    Useful for displaying patient info, video info, etc.
    """

    def __init__(self, master, label_text: str, value_text: str = "", **kwargs):
        """
        Initialize info row.

        Args:
            master: Parent widget
            label_text: Label text (e.g., "Patient:")
            value_text: Initial value text
            **kwargs: Additional CTkFrame arguments
        """
        super().__init__(master, **kwargs)

        self.label = ctk.CTkLabel(
            self, text=label_text, font=ctk.CTkFont(weight="bold")
        )
        self.label.pack(side="left", padx=5)

        self.value_label = StatusLabel(self, text=value_text)
        self.value_label.pack(side="left", padx=5)

    def set_value(self, text: str, status_type: str = "info") -> None:
        """
        Updates the value label.

        Args:
            text: New value text
            status_type: Status type for color coding
        """
        self.value_label.set_status(text, status_type)


class ButtonRow(ctk.CTkFrame):
    """
    Container for a horizontal row of buttons.

    Provides consistent spacing and alignment for button groups.
    """

    def __init__(self, master, **kwargs):
        """
        Initialize button row.

        Args:
            master: Parent widget
            **kwargs: Additional CTkFrame arguments
        """
        super().__init__(master, **kwargs)
        self.buttons = []

    def add_button(self, text: str, command, **kwargs) -> ctk.CTkButton:
        """
        Adds a button to the row.

        Args:
            text: Button text
            command: Button command/callback
            **kwargs: Additional CTkButton arguments

        Returns:
            The created button widget
        """
        button = ctk.CTkButton(self, text=text, command=command, **kwargs)
        button.pack(side="left", padx=5)
        self.buttons.append(button)
        return button

    def enable_all(self) -> None:
        """Enables all buttons in the row."""
        for button in self.buttons:
            button.configure(state="normal")

    def disable_all(self) -> None:
        """Disables all buttons in the row."""
        for button in self.buttons:
            button.configure(state="disabled")


class ResultsTextBox(ctk.CTkTextbox):
    """
    Custom textbox for displaying analysis results.

    Pre-configured with monospace font and helper methods.
    """

    def __init__(self, master, **kwargs):
        """
        Initialize results textbox.

        Args:
            master: Parent widget
            **kwargs: Additional CTkTextbox arguments
        """
        # Set default font if not provided
        if "font" not in kwargs:
            kwargs["font"] = ctk.CTkFont(
                family=AppConfig.FONT_FAMILY_MONO, size=AppConfig.FONT_SIZE_SMALL
            )

        super().__init__(master, **kwargs)

    def clear(self) -> None:
        """Clears all text from the textbox."""
        self.delete("1.0", "end")

    def append(self, text: str) -> None:
        """
        Appends text to the textbox.

        Args:
            text: Text to append
        """
        self.insert("end", text)

    def set_text(self, text: str) -> None:
        """
        Replaces all text in the textbox.

        Args:
            text: New text content
        """
        self.clear()
        self.insert("1.0", text)

    def add_header(self, title: str, separator_char: str = "=") -> None:
        """
        Adds a formatted header to the textbox.

        Args:
            title: Header title
            separator_char: Character to use for separator line
        """
        separator = separator_char * 80
        self.append(f"{title}\n{separator}\n\n")
