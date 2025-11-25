function HUD({ data }) {
  return (
    <div className="overlay">
      <div className="hud-container">
        <h3>Scene Metrics</h3>
        <div className="hud-item">
          <span className="hud-label">FPS:</span>
          <span className="hud-value" style={{ color: data.fps > 50 ? '#0f0' : '#ff0' }}>
            {data.fps}
          </span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Objects:</span>
          <span className="hud-value">{data.objectCount}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Camera:</span>
          <span className="hud-value">{data.activeCamera}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Lighting:</span>
          <span className="hud-value">{data.lightingMode}</span>
        </div>
        <div className="hud-item">
          <span className="hud-label">Animation:</span>
          <span className="hud-value">{data.animationState}</span>
        </div>
      </div>
    </div>
  )
}

export default HUD
