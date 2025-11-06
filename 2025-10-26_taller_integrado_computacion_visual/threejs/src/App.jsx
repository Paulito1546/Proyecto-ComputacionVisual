import { Canvas } from '@react-three/fiber'
import { useState, useCallback, useEffect, useMemo } from 'react'
import Scene from './components/Scene'
import useVoiceAndEEG from './hooks/useVoiceAndEEG'
import HandTracker from './components/HandTracker'
import CustomUI from './components/CustomUI'
import './App.css'

function App() {
  const [timeOfDayState, setTimeOfDayState] = useState('day')
  const [cameraStatus, setCameraStatus] = useState('waiting')
  const { command, setCommand, eegValue } = useVoiceAndEEG()
  const [gesture, setGesture] = useState(null)

  // === EEG CONTROL ===
  const [useSimulatedEEG, setUseSimulatedEEG] = useState(true)
  const [manualEEG, setManualEEG] = useState(0.5)
  const effectiveEEG = useSimulatedEEG ? eegValue : manualEEG

  // === ACTION TRACKING ===
  const [usedFist, setUsedFist] = useState(false)
  const [usedOpen, setUsedOpen] = useState(false)
  const [usedDayBtn, setUsedDayBtn] = useState(false)
  const [usedNightBtn, setUsedNightBtn] = useState(false)
  const [usedFlorBtn, setUsedFlorBtn] = useState(false)

  // === VOICE COMMAND TRACKING ===
  const [usedVoiceNight, setUsedVoiceNight] = useState(false)
  const [usedVoiceDay, setUsedVoiceDay] = useState(false)
  const [usedVoiceFlower, setUsedVoiceFlower] = useState(false)

  // === KEYBOARD TRACKING ===
  const [usedDKey, setUsedDKey] = useState(false)
  const [usedNKey, setUsedNKey] = useState(false)
  const [usedFKey, setUsedFKey] = useState(false)

  // === HELPER: allow repeated commands ===
  const triggerCommand = useCallback(
    (newCommand) => {
      setCommand('')
      setTimeout(() => setCommand(newCommand), 10)
    },
    [setCommand]
  )

  // === SCORE ===
  const score = useMemo(() => {
    const completed = [
      usedFist, usedOpen,
      usedVoiceNight, usedVoiceDay, usedVoiceFlower,
      usedDayBtn, usedNightBtn, usedFlorBtn,
      usedDKey, usedNKey, usedFKey
    ].filter(Boolean).length
    return (completed / 11) * 100
  }, [
    usedFist, usedOpen, usedVoiceNight, usedVoiceDay, usedVoiceFlower,
    usedDayBtn, usedNightBtn, usedFlorBtn, usedDKey, usedNKey, usedFKey
  ])

  // === VICTORY ===
  useEffect(() => {
    if (score === 100) {
      setTimeout(() => {
        alert('Congratulations! You used every gesture/interface command in the simulator.')
      }, 300)
    }
  }, [score])

  // === GESTURES ===
  const handleGesture = useCallback(
    (g) => {
      setGesture(g)
      if (g === 'open') {
        setTimeOfDayState('day')
        triggerCommand('luz')
        if (!usedOpen) setUsedOpen(true)
      } else if (g === 'fist') {
        setTimeOfDayState('night')
        triggerCommand('noche')
        if (!usedFist) setUsedFist(true)
      }
    },
    [triggerCommand, usedOpen, usedFist]
  )

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'd') {
        setTimeOfDayState('day')
        triggerCommand('luz')
        if (!usedDKey) setUsedDKey(true)
      }
      if (e.key === 'n') {
        setTimeOfDayState('night')
        triggerCommand('noche')
        if (!usedNKey) setUsedNKey(true)
      }
      if (e.key === 'f') {
        triggerCommand('flower')
        if (!usedFKey) setUsedFKey(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [triggerCommand, usedDKey, usedNKey, usedFKey])

  // === VOICE COMMANDS ===
  useEffect(() => {
    if (!command) return
    const cmd = command.toLowerCase()

    if (cmd.includes('day flash') && !usedVoiceDay) setUsedVoiceDay(true)
    if (cmd.includes('night flash') && !usedVoiceNight) setUsedVoiceNight(true)
    if (cmd.includes('flor') && !usedVoiceFlower) setUsedVoiceFlower(true)
  }, [command, usedVoiceDay, usedVoiceNight, usedVoiceFlower])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <HandTracker onGesture={handleGesture} onCameraStatusChange={setCameraStatus} />

      <Canvas camera={{ position: [0, 5, 15], fov: 60 }} shadows>
        <Scene timeOfDay={timeOfDayState} command={command} eegValue={effectiveEEG} />
      </Canvas>

      {/* HUD Overlay */}
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
        <h2>🌿 Synesthetic Garden</h2>
        <p>🗓️ Time: {timeOfDayState === 'day' ? '☀️ Day' : '🌙 Night'}</p>
        <p>🗣️ Command: {command || '—'}</p>
        <p>✋ Gesture: {gesture || '—'}</p>
        <p>
          🧠 EEG:{' '}
          {useSimulatedEEG
            ? `${eegValue.toFixed(2)} (simulated)`
            : `${manualEEG.toFixed(2)} (manual)`}
        </p>
        <p>📷 Camera: {cameraStatus === 'ready' ? '✅ Detected' : '...'}</p>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>🏆 Score: {score}%</p>

        <div style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.4' }}>
          <div>Gestures → Fist: {usedFist ? '✔' : '❌'} | Open hand: {usedOpen ? '✔' : '❌'}</div>
          <div>
            Buttons → Day: {usedDayBtn ? '✔' : '❌'} | Night: {usedNightBtn ? '✔' : '❌'} | Growth:{' '}
            {usedFlorBtn ? '✔' : '❌'}
          </div>
          <div>
            Voice → Day flash: {usedVoiceDay ? '✔' : '❌'} | Night flash:{' '}
            {usedVoiceNight ? '✔' : '❌'} | Growth: {usedVoiceFlower ? '✔' : '❌'}
          </div>
          <div>
            Keyboard → D: {usedDKey ? '✔' : '❌'} | N: {usedNKey ? '✔' : '❌'} | F:{' '}
            {usedFKey ? '✔' : '❌'}
          </div>
        </div>

        {/* EEG Controls */}
      </div>

      <CustomUI
        setTimeOfDay={setTimeOfDayState}
        setCommand={triggerCommand}
        setUsedDayBtn={setUsedDayBtn}
        setUsedNightBtn={setUsedNightBtn}
        setUsedFlorBtn={setUsedFlorBtn}
        useSimulatedEEG={useSimulatedEEG}
        setUseSimulatedEEG={setUseSimulatedEEG}
        manualEEG={manualEEG}
        setManualEEG={setManualEEG}
      />
    </div>
  )
}

export default App


