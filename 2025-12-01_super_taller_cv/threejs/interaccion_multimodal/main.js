import { initScene, setBackgroundColor, setRotationState, updateFromEEG } from './modules/scene.js';
import { initGestures } from './modules/gestures.js';
import { initVoice } from './modules/voice.js';
import { initEEG } from './modules/eeg.js';

// Utilidad para logs
const logContainer = document.getElementById('log-container');
function addLog(msg, type) {
    const p = document.createElement('p');
    p.className = `log-entry ${type}`;
    p.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logContainer.prepend(p);
}

// 1. Iniciar Escena 3D
initScene('scene-container');
addLog('Escena 3D cargada.', 'system');

// 2. Iniciar EEG (Simulado)
initEEG((eegData) => {
    // Callback cuando se mueve un slider
    updateFromEEG(eegData);
    // No logueamos cada movimiento para no saturar, solo aplicamos visualmente
});
addLog('Módulo EEG activo.', 'system');

// 3. Iniciar Gestos (MediaPipe)
const videoEl = document.getElementById('webcam');
const canvasEl = document.getElementById('output_canvas');

initGestures(videoEl, canvasEl, (gestureName) => {
    addLog(`Gesto detectado: ${gestureName}`, 'gesture');

    switch(gestureName) {
        case 'Thumb_Up':
            setRotationState('SPEED_UP');
            break;
        case 'Closed_Fist':
            setRotationState('FREEZE');
            break;
        case 'Open_Palm':
            setRotationState('REVERSE');
            break;
        default:
            setRotationState('NORMAL');
            break;
    }
});
addLog('Cargando visión por computador...', 'system');

// 4. Iniciar Voz
initVoice((command) => {
    addLog(`Comando de voz: ${command}`, 'voice');
    
    if (command === 'DIA') {
        setBackgroundColor('day');
    } else if (command === 'NOCHE') {
        setBackgroundColor('night');
    }
});
addLog('Escuchando voz (di "Día" o "Noche")...', 'system');

// main.js - Añadir al final del archivo

// Bloquear zoom con Ctrl + Rueda del ratón
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

// Bloquear gestos de trackpad que causan zoom
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});