let recognition;
let onCommand = null;

export function initVoice(callback) {
    onCommand = callback;

    // Verificar soporte
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error("Web Speech API no soportada en este navegador.");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true; // Seguir escuchando
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.trim().toLowerCase();
        
        console.log("Voz detectada:", text);

        if (text.includes("día") || text.includes("dia")) {
            if(onCommand) onCommand("DIA");
        } else if (text.includes("noche")) {
            if(onCommand) onCommand("NOCHE");
        }
    };

    recognition.onend = () => {
        // Reiniciar automáticamente si se detiene
        recognition.start();
    };

    recognition.onerror = (event) => {
        console.warn("Error voz:", event.error);
    };

    recognition.start();
}