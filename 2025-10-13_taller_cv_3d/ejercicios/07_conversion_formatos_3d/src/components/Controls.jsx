function Controls({
  currentFormat,
  onFormatChange,
  showWireframe,
  onWireframeToggle,
  onTableToggle
}) {
  return (
    <div className="controls-panel">
      <h2>Controles</h2>
      
      <div className="format-buttons">
        <button
          className={`format-btn ${currentFormat === 'obj' ? 'active' : ''}`}
          onClick={() => onFormatChange('obj')}
        >
          OBJ
        </button>
        <button
          className={`format-btn ${currentFormat === 'stl' ? 'active' : ''}`}
          onClick={() => onFormatChange('stl')}
        >
          STL
        </button>
        <button
          className={`format-btn ${currentFormat === 'gltf' ? 'active' : ''}`}
          onClick={() => onFormatChange('gltf')}
        >
          GLTF
        </button>
      </div>

      <div className="control-item">
        <label>
          <input
            type="checkbox"
            checked={showWireframe}
            onChange={(e) => onWireframeToggle(e.target.checked)}
          />
          Mostrar Wireframe
        </label>
      </div>

      <button className="table-btn" onClick={onTableToggle}>
        Ver Tabla Comparativa
      </button>

      <div className="hint-text">
        <p>Usa el mouse para rotar la cámara</p>
      </div>
    </div>
  )
}

export default Controls
