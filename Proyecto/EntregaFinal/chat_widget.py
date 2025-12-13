"""
chat_widget.py - Chat Interface Widget

Provides a complete chat interface for interacting with Gemini AI.
"""

import customtkinter as ctk
from tkinter import messagebox
from typing import Callable, Optional, List
from datetime import datetime
import threading

from gemini_analyzer import ChatMessage


class ChatBubble(ctk.CTkFrame):
    """A single chat message bubble."""

    def __init__(self, master, message: ChatMessage, **kwargs):
        """
        Initialize a chat bubble.

        Args:
            master: Parent widget
            message: ChatMessage object
        """
        super().__init__(master, **kwargs)

        self.message = message

        # Configure colors based on role
        if message.role == "user":
            bg_color = "#0084ff"
            text_color = "white"
            anchor = "e"  # FIXED: Use anchor instead of side
        else:  # assistant
            bg_color = "#e4e6eb"
            text_color = "black"
            anchor = "w"  # FIXED: Use anchor instead of side

        # Message frame
        self.configure(fg_color="transparent")

        # Content frame - FIXED: Use anchor parameter correctly
        content_frame = ctk.CTkFrame(self, fg_color=bg_color, corner_radius=15)
        content_frame.pack(anchor=anchor, padx=10, pady=5)

        # Message text
        message_label = ctk.CTkLabel(
            content_frame,
            text=message.content,
            wraplength=500,
            justify="left",
            text_color=text_color,
            anchor="w",
        )
        message_label.pack(padx=15, pady=10, fill="x")

        # Timestamp
        timestamp_text = message.timestamp.strftime("%H:%M")
        timestamp_label = ctk.CTkLabel(
            content_frame,
            text=timestamp_text,
            font=ctk.CTkFont(size=9),
            text_color=text_color if message.role == "user" else "gray",
            anchor="e",
        )
        timestamp_label.pack(padx=15, pady=(0, 5), anchor="e")


class ChatWidget(ctk.CTkFrame):
    """
    Complete chat interface widget with history and input.
    """

    def __init__(self, master, send_callback: Callable[[str], str], **kwargs):
        """
        Initialize chat widget.

        Args:
            master: Parent widget
            send_callback: Function to call when sending a message
                          Should return the assistant's response
        """
        super().__init__(master, **kwargs)

        self.send_callback = send_callback
        self.is_processing = False

        self._build_interface()

    def _build_interface(self) -> None:
        """Build the chat interface."""

        # Header
        header_frame = ctk.CTkFrame(self, height=60, fg_color="#0084ff")
        header_frame.pack(fill="x", padx=0, pady=0)
        header_frame.pack_propagate(False)

        header_label = ctk.CTkLabel(
            header_frame,
            text="🤖 Chat con Gemini AI",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color="white",
        )
        header_label.pack(side="left", padx=20, pady=10)

        # Info button
        info_button = ctk.CTkButton(
            header_frame,
            text="ℹ️",
            width=40,
            command=self._show_info,
            fg_color="transparent",
            hover_color="#006acc",
        )
        info_button.pack(side="right", padx=10)

        # Clear button
        clear_button = ctk.CTkButton(
            header_frame,
            text="🗑️ Limpiar",
            width=100,
            command=self._clear_chat,
            fg_color="transparent",
            hover_color="#006acc",
        )
        clear_button.pack(side="right", padx=5)

        # Chat history (scrollable)
        self.chat_frame = ctk.CTkScrollableFrame(self, fg_color="#f0f2f5")
        self.chat_frame.pack(fill="both", expand=True, padx=0, pady=0)

        # Input area
        input_frame = ctk.CTkFrame(self, height=100, fg_color="transparent")
        input_frame.pack(fill="x", padx=10, pady=10)
        input_frame.pack_propagate(False)

        # Text input
        self.input_textbox = ctk.CTkTextbox(
            input_frame, height=60, wrap="word", font=ctk.CTkFont(size=12)
        )
        self.input_textbox.pack(side="left", fill="both", expand=True, padx=(0, 10))

        # Bind Enter key
        self.input_textbox.bind("<Return>", self._on_enter_key)
        self.input_textbox.bind("<Shift-Return>", self._on_shift_enter)

        # Send button
        self.send_button = ctk.CTkButton(
            input_frame,
            text="Enviar ➤",
            width=100,
            height=60,
            command=self._send_message,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color="#0084ff",
            hover_color="#006acc",
        )
        self.send_button.pack(side="right")

        # Status label
        self.status_label = ctk.CTkLabel(
            self,
            text="Escribe tu pregunta sobre el análisis...",
            font=ctk.CTkFont(size=10),
            text_color="gray",
        )
        self.status_label.pack(pady=(0, 5))

    def _on_enter_key(self, event) -> str:
        """Handle Enter key press (send message)."""
        self._send_message()
        return "break"  # Prevent newline

    def _on_shift_enter(self, event) -> None:
        """Handle Shift+Enter (new line)."""
        # Allow default behavior (newline)
        pass

    def _send_message(self) -> None:
        """Send user message and get response."""
        if self.is_processing:
            return

        # Get message text
        message_text = self.input_textbox.get("1.0", "end-1c").strip()

        if not message_text:
            return

        # Clear input
        self.input_textbox.delete("1.0", "end")

        # Add user message to UI
        self._add_message_bubble(ChatMessage("user", message_text))

        # Show processing status
        self.is_processing = True
        self.send_button.configure(state="disabled", text="...")
        self.status_label.configure(text="🤔 Gemini está pensando...")

        # Scroll to bottom
        self.chat_frame._parent_canvas.yview_moveto(1.0)

        # Process in background thread
        thread = threading.Thread(
            target=self._process_message, args=(message_text,), daemon=True
        )
        thread.start()

    def _process_message(self, message: str) -> None:
        """Process message in background thread."""
        try:
            # Call the send callback
            response = self.send_callback(message)

            # Update UI in main thread
            self.after(0, lambda: self._on_response_received(response))

        except Exception as e:
            error_msg = f"❌ Error: {str(e)}"
            self.after(0, lambda: self._on_response_received(error_msg))

    def _on_response_received(self, response: str) -> None:
        """Handle response received from Gemini."""
        # Add assistant message to UI
        self._add_message_bubble(ChatMessage("assistant", response))

        # Reset processing state
        self.is_processing = False
        self.send_button.configure(state="normal", text="Enviar ➤")
        self.status_label.configure(text="Escribe tu siguiente pregunta...")

        # Scroll to bottom
        self.chat_frame._parent_canvas.yview_moveto(1.0)

        # Focus input
        self.input_textbox.focus()

    def _add_message_bubble(self, message: ChatMessage) -> None:
        """Add a message bubble to the chat."""
        bubble = ChatBubble(self.chat_frame, message)
        bubble.pack(fill="x", pady=2)

    def load_history(self, messages: List[ChatMessage]) -> None:
        """
        Load chat history into the interface.

        Args:
            messages: List of ChatMessage objects
        """
        # Clear existing messages
        for widget in self.chat_frame.winfo_children():
            widget.destroy()

        # Add all messages
        for message in messages:
            self._add_message_bubble(message)

        # Scroll to bottom
        self.after(100, lambda: self.chat_frame._parent_canvas.yview_moveto(1.0))

    def _clear_chat(self) -> None:
        """Clear the chat history."""
        result = messagebox.askyesno(
            "Limpiar Chat", "¿Estás seguro de que quieres limpiar el historial de chat?"
        )

        if result:
            for widget in self.chat_frame.winfo_children():
                widget.destroy()
            self.status_label.configure(
                text="Chat limpiado. Escribe una nueva pregunta..."
            )

    def _show_info(self) -> None:
        """Show information about the chat."""
        info_text = """🤖 Chat con Gemini AI

Puedes hacer preguntas sobre:
- Los hallazgos del análisis
- Ejercicios específicos recomendados
- Detalles sobre asimetrías detectadas
- Progresión del tratamiento
- Dudas sobre recomendaciones

Consejos:
✓ Sé específico en tus preguntas
✓ Usa Shift+Enter para nueva línea
✓ Enter para enviar mensaje

El chat mantiene contexto de toda la conversación."""

        messagebox.showinfo("Información del Chat", info_text)

    def enable_input(self, enabled: bool = True) -> None:
        """Enable or disable chat input."""
        state = "normal" if enabled else "disabled"
        self.input_textbox.configure(state=state)
        self.send_button.configure(state=state)

