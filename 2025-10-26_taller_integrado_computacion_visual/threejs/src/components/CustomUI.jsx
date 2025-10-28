export default function CustomUI({
  setTimeOfDay,
  setCommand,
  setUsedDayBtn,
  setUsedNightBtn,
  setUsedFlorBtn
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
          setTimeOfDay('day');
          setCommand('luz');
          setUsedDayBtn(true);               // mark day button as used
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        ☀️ Día
      </button>

      {/* NIGHT BUTTON */}
      <button
        onClick={() => {
          setTimeOfDay('night');
          setCommand('noche');
          setUsedNightBtn(true);             // mark night button as used
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        🌙 Noche
      </button>

      {/* FLOR BUTTON */}
      <button
        onClick={() => {
          setCommand('flor');
          setUsedFlorBtn(true);              // mark flor button as used
        }}
        style={{ margin: '0 5px', padding: '8px 12px' }}
      >
        🌸 Flor
      </button>

      {/* EEG SLIDER */}
      <div style={{ marginTop: '10px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          defaultValue="0.5"
          onChange={(e) => setCommand(`eeg:${e.target.value}`)}
          style={{ width: '150px' }}
        />
        <span style={{ marginLeft: '8px' }}>EEG Simulado</span>
      </div>
    </div>
  );
}