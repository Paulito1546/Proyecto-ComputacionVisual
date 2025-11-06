
import { useState } from 'react'

export default function CustomUI({
  setTimeOfDay,
  setCommand,
  setUsedDayBtn,
  setUsedNightBtn,
  setUsedFlorBtn,
  setUseSimulatedEEG,   
  useSimulatedEEG,      
  manualEEG,            
  setManualEEG          
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'monospace'
      }}
    >
      {/* DAY BUTTON */}
      <button
        onClick={() => {
          setTimeOfDay('day')
          setCommand('day')
          setUsedDayBtn(true)
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        ☀️ Day
      </button>

      {/* NIGHT BUTTON */}
      <button
        onClick={() => {
          setTimeOfDay('night')
          setCommand('night')
          setUsedNightBtn(true)
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        🌙 Night
      </button>

      {/* FLOWER BUTTON */}
      <button
        onClick={() => {
          setCommand('flower')
          setUsedFlorBtn(true)
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        🌸 Flower
      </button>

      {/* EEG TOGGLE + SLIDER */}
      <div style={{ marginTop: '15px' }}>
        <label>
          <input
            type="checkbox"
            checked={useSimulatedEEG}
            onChange={(e) => setUseSimulatedEEG(e.target.checked)}
          />{' '}
          Use Simulated EEG
        </label>

        {!useSimulatedEEG && (
          <div style={{ marginTop: '8px' }}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={manualEEG}
              onChange={(e) => setManualEEG(parseFloat(e.target.value))}
              style={{ width: '150px' }}
            />
            <span style={{ marginLeft: '8px' }}>
              Manual EEG: {manualEEG.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

