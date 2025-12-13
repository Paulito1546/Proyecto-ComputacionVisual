"""
gemini_analyzer.py - Gemini API Integration with Chat

Provides AI-powered analysis interpretation and conversational chat interface.
"""

import google.generativeai as genai
from typing import Dict, Optional, List
import pandas as pd
from datetime import datetime
import json
from pathlib import Path


class ChatMessage:
    """Represents a single chat message."""

    def __init__(self, role: str, content: str, timestamp: datetime = None):
        """
        Initialize a chat message.

        Args:
            role: 'user' or 'assistant'
            content: Message content
            timestamp: Message timestamp
        """
        self.role = role
        self.content = content
        self.timestamp = timestamp or datetime.now()

    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "ChatMessage":
        """Create from dictionary."""
        return cls(
            role=data["role"],
            content=data["content"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
        )


class GeminiAnalyzer:
    """
    Integrates with Google Gemini API for AI-powered analysis interpretation
    and conversational chat.
    """

    def __init__(self, api_key: str):
        """
        Initialize Gemini analyzer.

        Args:
            api_key: Google API key for Gemini
        """
        genai.configure(api_key=api_key)
        # FIXED: Use the correct model name with models/ prefix
        self.model = genai.GenerativeModel("models/gemini-2.5-flash")
        self.chat_session = None
        self.chat_history: List[ChatMessage] = []
        self.current_analysis_context = ""

    def analyze_results(
        self, resumen_df: pd.DataFrame, alerts_df: pd.DataFrame, patient_id: str
    ) -> str:
        """
        Sends analysis results to Gemini for interpretation.

        Args:
            resumen_df: Summary DataFrame with symmetry metrics
            alerts_df: Alerts DataFrame with detected issues
            patient_id: Patient identifier

        Returns:
            Gemini's analysis and recommendations as string
        """
        try:
            # Build context for future chat
            self.current_analysis_context = self._build_analysis_context(
                resumen_df, alerts_df, patient_id
            )

            # Build initial analysis prompt
            prompt = self._build_analysis_prompt(resumen_df, alerts_df, patient_id)

            # Get analysis
            response = self.model.generate_content(prompt)
            analysis_text = response.text

            # Initialize chat session with this context
            self._initialize_chat_session(self.current_analysis_context)

            # Add initial analysis to chat history
            self.chat_history = [ChatMessage("assistant", analysis_text)]

            return analysis_text

        except Exception as e:
            return f"Error al obtener análisis de IA: {str(e)}"

    def _build_analysis_context(
        self, resumen_df: pd.DataFrame, alerts_df: pd.DataFrame, patient_id: str
    ) -> str:
        """Builds context string for chat session."""

        context = f"""CONTEXTO DEL ANÁLISIS POSTURAL

PACIENTE: {patient_id}

DATOS DE SIMETRÍA:
{resumen_df.to_string(index=False)}

ALERTAS DETECTADAS: {len(alerts_df)} total
"""

        if not alerts_df.empty:
            # Group by articulation
            for articulation in alerts_df["articulacion"].unique():
                art_alerts = alerts_df[alerts_df["articulacion"] == articulation]
                context += f"\n{articulation.upper()}:\n"
                for _, alert in art_alerts.head(10).iterrows():
                    context += f"  [{alert['severidad']}] Frame {int(alert['frame'])}: {alert['mensaje']}\n"

        return context

    def _build_analysis_prompt(
        self, resumen_df: pd.DataFrame, alerts_df: pd.DataFrame, patient_id: str
    ) -> str:
        """Builds the initial analysis prompt for Gemini."""

        prompt = f"""Eres un fisioterapeuta experto analizando datos de simetría postural de un paciente.

PACIENTE: {patient_id}

RESUMEN DE SIMETRÍA:
{resumen_df.to_string(index=False)}

ALERTAS DETECTADAS ({len(alerts_df)} total):
"""

        if alerts_df.empty:
            prompt += "✅ No se detectaron alertas en este análisis.\n"
        else:
            # Group alerts by articulation
            for articulation in alerts_df["articulacion"].unique():
                art_alerts = alerts_df[alerts_df["articulacion"] == articulation]
                prompt += f"\n{articulation.upper()}:\n"
                for _, alert in art_alerts.head(5).iterrows():
                    prompt += f"  - [{alert['severidad']}] {alert['mensaje']}\n"

        prompt += """

Por favor proporciona un análisis profesional con:

1. **EVALUACIÓN GENERAL** 
   Resumen ejecutivo del estado postural (2-3 frases)

2. **HALLAZGOS PRINCIPALES**
   Las 3 asimetrías más significativas y sus implicaciones

3. **ANÁLISIS BIOMECÁNICO**
   Qué patrones de movimiento están comprometidos

4. **POSIBLES CAUSAS**
   Hipótesis sobre etiología de las asimetrías detectadas

5. **RECOMENDACIONES TERAPÉUTICAS**
   - Ejercicios específicos (con descripción breve)
   - Técnicas de corrección postural
   - Modalidades terapéuticas sugeridas

6. **PRECAUCIONES**
   Movimientos o actividades a evitar

7. **PLAN DE SEGUIMIENTO**
   Frecuencia recomendada de evaluación

8. **CLASIFICACIÓN DE RIESGO**
   🟢 Bajo / 🟡 Medio / 🔴 Alto

Usa formato claro con emojis para mejor legibilidad. Sé específico y basado en evidencia."""

        return prompt

    def _initialize_chat_session(self, context: str) -> None:
        """Initialize a new chat session with context."""
        system_instruction = f"""Eres un fisioterapeuta experto especializado en análisis postural y biomecánica. 

Estás conversando sobre un análisis específico que ya realizaste. El usuario puede hacerte preguntas sobre:
- Los hallazgos del análisis
- Ejercicios específicos
- Detalles sobre las asimetrías detectadas
- Progresión del tratamiento
- Dudas sobre las recomendaciones

CONTEXTO DEL ANÁLISIS ACTUAL:
{context}

Mantén un tono profesional pero cercano. Responde basándote en evidencia científica cuando sea posible.
Si el usuario pregunta algo fuera del análisis postural, redirige amablemente al tema."""

        # Create chat session with system context
        self.chat_session = self.model.start_chat(history=[])
        # Send system context as first message (Gemini doesn't have system role, so we use it as context)
        self._system_context = system_instruction

    def send_message(self, message: str) -> str:
        """
        Send a message in the chat session.

        Args:
            message: User's message

        Returns:
            Gemini's response
        """
        try:
            if not self.chat_session:
                return "⚠️ No hay una sesión de análisis activa. Primero realiza un análisis."

            # Add system context to first user message
            if len(self.chat_history) <= 1:  # Only assistant's initial analysis
                full_message = f"{self._system_context}\n\nUSUARIO: {message}"
            else:
                full_message = message

            # Send message
            response = self.chat_session.send_message(full_message)
            response_text = response.text

            # Add to history
            self.chat_history.append(ChatMessage("user", message))
            self.chat_history.append(ChatMessage("assistant", response_text))

            return response_text

        except Exception as e:
            error_msg = f"❌ Error en chat: {str(e)}"
            self.chat_history.append(ChatMessage("user", message))
            self.chat_history.append(ChatMessage("assistant", error_msg))
            return error_msg

    def get_chat_history(self) -> List[ChatMessage]:
        """Returns the current chat history."""
        return self.chat_history

    def clear_chat(self) -> None:
        """Clears the chat history and session."""
        self.chat_session = None
        self.chat_history = []
        self.current_analysis_context = ""

    def save_chat_history(self, filepath: Path) -> bool:
        """
        Save chat history to JSON file.

        Args:
            filepath: Path to save the chat history

        Returns:
            True if successful, False otherwise
        """
        try:
            data = {
                "timestamp": datetime.now().isoformat(),
                "context": self.current_analysis_context,
                "messages": [msg.to_dict() for msg in self.chat_history],
            }

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

            return True
        except Exception as e:
            print(f"Error saving chat history: {e}")
            return False

    def load_chat_history(self, filepath: Path) -> bool:
        """
        Load chat history from JSON file.

        Args:
            filepath: Path to load the chat history from

        Returns:
            True if successful, False otherwise
        """
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            self.current_analysis_context = data.get("context", "")
            self.chat_history = [
                ChatMessage.from_dict(msg) for msg in data.get("messages", [])
            ]

            # Reinitialize chat session with context
            if self.current_analysis_context:
                self._initialize_chat_session(self.current_analysis_context)

            return True
        except Exception as e:
            print(f"Error loading chat history: {e}")
            return False
