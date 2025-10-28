import { Canvas } from '@react-three/fiber'
import { useState, useCallback, useEffect, useMemo } from 'react'
import Scene from './components/Scene'
import useVoiceAndEEG from './hooks/useVoiceAndEEG'
import HandTracker from './components/HandTracker'
import CustomUI from './components/CustomUI'
import './App.css'

function App() {
  const [timeOfDayState, setTimeOfDayState] = useState('day');
  const [cameraStatus, setCameraStatus] = useState('waiting');
  const { command, setCommand, eegValue } = useVoiceAndEEG();
  const [gesture, setGesture] = useState(null);

  // === ACTION TRACKING ===
  const [usedFist, setUsedFist] = useState(false);
  const [usedOpen, setUsedOpen] = useState(false);
  const [usedDayBtn, setUsedDayBtn] = useState(false);
  const [usedNightBtn, setUsedNightBtn] = useState(false);
  const [usedFlorBtn, setUsedFlorBtn] = useState(false);
  const [usedDKey, setUsedDKey] = useState(false); // New for 'd' key
  const [usedNKey, setUsedNKey] = useState(false); // New for 'n' key
  const [usedFKey, setUsedFKey] = useState(false); // New for 'f' key

  // === SCORE CALCULATED IN useMemo (recalculated on each change) ===
  const score = useMemo(() => {
    const completed = [
      usedFist,
      usedOpen,
      usedDayBtn,
      usedNightBtn,
      usedFlorBtn,
      usedDKey, // New
      usedNKey, // New
      usedFKey  // New
    ].filter(Boolean).length;
    return (completed / 8) * 100; // Adjusted for 8 actions
  }, [usedFist, usedOpen, usedDayBtn, usedNightBtn, usedFlorBtn, usedDKey, usedNKey, usedFKey]);

  // === VICTORY ===
  useEffect(() => {
    if (score === 100) {
      setTimeout(() => {
        alert('¡Ganaste! 🌟 Has usado pu²no,, mano abierta, los tres butones y los atajos de teclado d, n, f');
      }, 300);
    }
  }, [score]);

  // === GESTURES ===
  const handleGesture = useCallback(
    (g) => {
      setGesture(g);
      if (g === 'open') {
        setTimeOfDayState('day');
        setCommand('luz');
        if (!usedOpen) setUsedOpen(true);
      } else if (g === 'fist') {
        setTimeOfDayState('night');
        setCommand('noche');
        if (!usedFist) setUsedFist(true);
      }
    },
    [setCommand]
  );

  // === KEYBOARD (optional) ===
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'd') { 
        setTimeOfDayState('day'); 
        setCommand('luz'); 
        if (!usedDKey) setUsedDKey(true); // New tracking for 'd'
      }
      if (e.key === 'n') { 
        setTimeOfDayState('night'); 
        setCommand('noche'); 
        if (!usedNKey) setUsedNKey(true); // New tracking for 'n'
      }
      if (e.key === 'f') { 
        setCommand('flor'); 
        if (!usedFKey) setUsedFKey(true); // New tracking for 'f'
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [usedDKey, usedNKey, usedFKey]); // Updated deps

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <HandTracker onGesture={handleGesture} onCameraStatusChange={setCameraStatus} />
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }} shadows>
        <Scene timeOfDay={timeOfDayState} command={command} eegValue={eegValue} />
      </Canvas>

      {/* Left overlay */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontFamily: 'monospace', textShadow: '1px 1px 2px black' }}>
        <h2>🌿 Synesthetic Garden</h2>
        <p>🗓️ Time: {timeOfDayState === 'day' ? '☀️ Day' : '🌙 Night'}</p>
        <p>🗣️ Comando: {command || '—'}</p>
        <p>✋ Gesto: {gesture || '—'}</p>
        <p>🧠 EEG: {eegValue.toFixed(2)}</p>
        <p>📷 Cámara: {cameraStatus === 'ready' ? '✅ Detectada' : '...'}</p>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>🏆 Puntaje: {score}%</p>
        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
          <div>✅ Puño: {usedFist ? '✔' : '❌'} | Mano abierta: {usedOpen ? '✔' : '❌'}</div>
          <div>Botones → Día: {usedDayBtn ? '✔' : '❌'} | Noche: {usedNightBtn ? '✔' : '❌'} | Flor: {usedFlorBtn ? '✔' : '❌'}</div>
          <div>Teclas → D: {usedDKey ? '✔' : '❌'} | N: {usedNKey ? '✔' : '❌'} | F: {usedFKey ? '✔' : '❌'}</div>  
        </div>
      </div>

      {/* Custom UI – props correctly passed */}
      <CustomUI
        setTimeOfDay={setTimeOfDayState}
        setCommand={setCommand}
        setUsedDayBtn={setUsedDayBtn}
        setUsedNightBtn={setUsedNightBtn}
        setUsedFlorBtn={setUsedFlorBtn}
      />
    </div>
  );
}

export default App;