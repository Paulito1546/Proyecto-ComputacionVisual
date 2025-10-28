import { Canvas } from '@react-three/fiber'
import { useState, useCallback } from 'react'
import { useControls } from 'leva'
import Scene from './components/Scene'
import useVoiceAndEEG from './hooks/useVoiceAndEEG'
import HandTracker from './components/HandTracker'
import './App.css'

function App() {
  // États contrôlés pour Leva
  const [timeOfDayState, setTimeOfDayState] = useState('day');
  const [cameraTypeState, setCameraTypeState] = useState('perspective');
  const [showDepthState, setShowDepthState] = useState(false);

  // Contrôles Leva synchronisés
  const { timeOfDay, cameraType, showDepth } = useControls('Global Controls', {
    timeOfDay: { value: timeOfDayState, options: ['day', 'night'], label: 'Time of Day', onChange: setTimeOfDayState },
    cameraType: { value: cameraTypeState, options: ['perspective', 'orthographic'], label: 'Camera Type', onChange: setCameraTypeState },
    showDepth: { value: showDepthState, label: 'Show Depth Visualization', onChange: setShowDepthState }
  });

  const [cameraStatus, setCameraStatus] = useState('waiting');
  const { command, setCommand, eegValue } = useVoiceAndEEG();
  const [gesture, setGesture] = useState(null);

  // Geste → Mode + Commande (direct et prévisible)
  const handleGesture = useCallback(
    (g) => {
      setGesture(g);

      if (g === 'open') {
        setTimeOfDayState('day');   // Main ouverte = Jour
        setCommand('luz');          // Flash lumineux en bonus
      } else if (g === 'fist') {
        setTimeOfDayState('night'); // Poing = Nuit
        setCommand('noche');        // Dim temporaire
      }
    },
    [setCommand]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Détection gestes + caméra */}
      <HandTracker onGesture={handleGesture} onCameraStatusChange={setCameraStatus} />

      {/* Scène 3D */}
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }} shadows>
        <Scene
          timeOfDay={timeOfDayState}
          cameraType={cameraType}
          showDepth={showDepth}
          command={command}
          eegValue={eegValue}
        />
      </Canvas>

      {/* Interface utilisateur (overlay à gauche) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'white',
          fontFamily: 'monospace',
          textShadow: '1px 1px 2px black'
        }}
      >
        <h2>Synesthetic Garden</h2>
        <p>Time: {timeOfDayState === 'day' ? 'Day' : 'Night'}</p>
        <p>Camera: {cameraType === 'perspective' ? 'Perspective' : 'Orthographic'}</p>
        <p>Commande: {command || '—'}</p>
        <p>Geste: {gesture || '—'}</p>
        <p>EEG: {eegValue.toFixed(2)}</p>
        <p>
          Caméra:{' '}
          {cameraStatus === 'ready'
            ? 'Détectée'
            : cameraStatus === 'starting'
            ? 'Initialisation...'
            : cameraStatus === 'error'
            ? 'Erreur'
            : 'En attente...'}
        </p>
        {showDepth && <p>Depth Mode Active</p>}
      </div>
    </div>
  );
}

export default App;