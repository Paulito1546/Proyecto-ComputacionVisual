import { useEffect } from 'react'
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision'

export default function HandTracker({ onGesture, onCameraStatusChange }) {
  useEffect(() => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Styles (inchangés)
    Object.assign(video.style, {
      position: 'fixed',
      right: '10px',
      bottom: '10px',
      width: '200px',
      zIndex: 9,
      border: '2px solid white',
      borderRadius: '8px'
    });
    Object.assign(canvas.style, {
      position: 'fixed',
      right: '10px',
      bottom: '10px',
      width: '200px',
      zIndex: 10,
      pointerEvents: 'none'
    });

    document.body.appendChild(video);
    document.body.appendChild(canvas);

    let handLandmarker;
    let lastGesture = '—';
    let animationFrameId;

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: '/models/hand_landmarker.task' // Chemin public
          },
          numHands: 1,
          runningMode: 'video',
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        onCameraStatusChange('ready');
      } catch (error) {
        onCameraStatusChange('error');
        console.error('Erreur initialisation MediaPipe:', error);
      }
    };

    const detectHands = () => {
      if (video.readyState < 2) {
        animationFrameId = requestAnimationFrame(detectHands);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const detections = handLandmarker.detectForVideo(video, performance.now());

      if (detections.landmarks?.length > 0) {
        const lm = detections.landmarks[0];
        const drawingUtils = new DrawingUtils(ctx);
        drawingUtils.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawingUtils.drawLandmarks(lm, { color: '#FF0000', lineWidth: 1 });

        // Logique geste (inchangée)
        const tips = [4, 8, 12, 16, 20];
        let extended = 0;
        for (let t of tips) {
          const tip = lm[t];
          const pip = lm[t - 2];
          if (t === 4) {
            if (Math.abs(tip.x - pip.x) > 0.03) extended++;
          } else if (tip.y < pip.y) extended++;
        }

        if (extended >= 4) lastGesture = 'open';
        else if (extended <= 1) lastGesture = 'fist';
        else lastGesture = 'other';

        onGesture(lastGesture);
      }

      // Affichage geste
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, 200, 25);
      ctx.fillStyle = 'white';
      ctx.font = '14px monospace';
      ctx.fillText(`Gesture: ${lastGesture}`, 8, 18);

      animationFrameId = requestAnimationFrame(detectHands);
    };

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' }
        });
        video.srcObject = stream;
        video.play();
        onCameraStatusChange('starting');
        await initializeHandDetection();
        detectHands();
      } catch (err) {
        onCameraStatusChange('error');
        console.error('Erreur caméra:', err);
      }
    };

    startWebcam();

    return () => {
      if (video.srcObject) video.srcObject.getTracks().forEach(track => track.stop());
      video.remove();
      canvas.remove();
      if (handLandmarker) handLandmarker.close();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [onGesture, onCameraStatusChange]);

  return null;
}