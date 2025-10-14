function HUD({ stats, currentFormat }) {
  if (!stats) return null

  // File sizes for each format
  const fileSizes = {
    obj: '116.41 KB',
    stl: '118.83 KB',
    gltf: '48.50 KB'
  }

  return (
    <div className="hud">
      <h3>Estadísticas</h3>
      
      <div className="stat-item">
        <span className="stat-label">Formato:</span>
        <span className="stat-value">{currentFormat.toUpperCase()}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Vértices:</span>
        <span className="stat-value">{stats.vertices.toLocaleString()}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Caras:</span>
        <span className="stat-value">{stats.faces.toLocaleString()}</span>
      </div>

      <div className="stat-item">
        <span className="stat-label">Tamaño:</span>
        <span className="stat-value">{fileSizes[currentFormat]}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Normales:</span>
        <span className="stat-value">{stats.normals ? 'Sí' : 'No'}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">UVs:</span>
        <span className="stat-value">{stats.uvs ? 'Sí' : 'No'}</span>
      </div>
      
      <div className="stat-item">
        <span className="stat-label">Materiales:</span>
        <span className="stat-value">{stats.materials ? 'Sí' : 'No'}</span>
      </div>
    </div>
  )
}

export default HUD
