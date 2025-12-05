import { FilesetResolver, GestureRecognizer } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

let gestureRecognizer;
let runningMode = "VIDEO";
let webcamElement;
let canvasElement;
let canvasCtx;
let lastVideoTime = -1;
let lastGesture = "";

// Callback para notificar al main
let onGestureDetected = null;

export async function initGestures(videoEl, canvasEl, callback) {
    webcamElement = videoEl;
    canvasElement = canvasEl;
    canvasCtx = canvasElement.getContext("2d");
    onGestureDetected = callback;

    // Cargar modelo
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
        },
        runningMode: runningMode
    });

    // Iniciar cámara
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamElement.srcObject = stream;
        webcamElement.addEventListener("loadeddata", predictWebcam);
    }
}

async function predictWebcam() {
    if (!gestureRecognizer) return;

    // Ajustar tamaño del canvas al video
    if(canvasElement.width !== webcamElement.videoWidth) {
        canvasElement.width = webcamElement.videoWidth;
        canvasElement.height = webcamElement.videoHeight;
    }

    let nowInMs = Date.now();
    
    // Detectar
    if (webcamElement.currentTime !== lastVideoTime) {
        lastVideoTime = webcamElement.currentTime;
        const results = gestureRecognizer.recognizeForVideo(webcamElement, nowInMs);

        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.gestures.length > 0) {
            const primaryGesture = results.gestures[0][0]; // Mejor match
            const categoryName = primaryGesture.categoryName;
            const score = primaryGesture.score;

            // Dibujar Landmarks (Simplificado)
            if(results.landmarks) {
                drawLandmarks(results.landmarks[0]);
            }

            // Filtrar y notificar solo si hay certeza > 50%
            if(score > 0.5 && categoryName !== lastGesture) {
                lastGesture = categoryName;
                if(onGestureDetected) onGestureDetected(categoryName);
            }
        } else {
            // Reset si no hay mano
            if(lastGesture !== "None") {
                lastGesture = "None";
            }
        }
    }
    
    window.requestAnimationFrame(predictWebcam);
}

function drawLandmarks(landmarks) {
    // Dibujo simple de puntos rojos en las articulaciones
    canvasCtx.fillStyle = "#00bcd4";
    for (const point of landmarks) {
        canvasCtx.beginPath();
        canvasCtx.arc(point.x * canvasElement.width, point.y * canvasElement.height, 5, 0, 2 * Math.PI);
        canvasCtx.fill();
    }
}