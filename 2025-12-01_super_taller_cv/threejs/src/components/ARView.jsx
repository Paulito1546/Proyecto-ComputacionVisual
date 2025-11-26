import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function ARObjects({ trackedPosition }) {
  const cubeRef = useRef()
  const torusRef = useRef()
  const sphereRef = useRef()

  useEffect(() => {
    const animate = () => {
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01
        cubeRef.current.rotation.y += 0.01
      }
      if (torusRef.current) {
        torusRef.current.rotation.x += 0.02
        torusRef.current.rotation.z += 0.01
      }
      if (sphereRef.current) {
        sphereRef.current.rotation.y += 0.03
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  // Convertir coordenadas 2D de pantalla a 3D
  const get3DPosition = (x, y) => {
    const xPos = (x - 0.5) * 10 // Rango -5 a 5
    const yPos = -(y - 0.5) * 8 // Rango -4 a 4 (invertido)
    return { x: xPos, y: yPos }
  }

  const pos = trackedPosition ? get3DPosition(trackedPosition.x, trackedPosition.y) : { x: 0, y: 0 }

  return (
    <group position={[pos.x, pos.y, 0]}>
      {/* Cubo */}
      <mesh ref={cubeRef} position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#00d4ff" transparent opacity={0.9} />
      </mesh>

      {/* Toro */}
      <mesh ref={torusRef} position={[0, 1.2, 0]} castShadow>
        <torusGeometry args={[0.4, 0.15, 16, 100]} />
        <meshStandardMaterial color="#ff6b00" transparent opacity={0.9} />
      </mesh>

      {/* Esfera */}
      <mesh ref={sphereRef} position={[0, -1.2, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#00ff88" transparent opacity={0.95} />
      </mesh>

      {/* Indicador de tracking */}
      {trackedPosition && (
        <mesh position={[0, 0, -0.5]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.6} side={2} />
        </mesh>
      )}

      {/* Luz */}
      <pointLight position={[0, 0, 2]} intensity={1.5} color="#ffffff" />
      <ambientLight intensity={0.4} />
    </group>
  )
}

function ARView() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState(null)
  const [showObjects, setShowObjects] = useState(true)
  const [trackedPosition, setTrackedPosition] = useState(null)
  const [trackingMode, setTrackingMode] = useState('color') // 'color', 'motion', 'face'
  const [detectionCount, setDetectionCount] = useState(0)

  useEffect(() => {
    let stream = null
    let animationId = null

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setArReady(true)
          
          // Iniciar detección cuando el video esté listo
          videoRef.current.onloadedmetadata = () => {
            startTracking()
          }
        }
      } catch (err) {
        console.error('Error accediendo a la cámara:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
      }
    }

    const startTracking = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      let previousFrame = null

      const detectObject = () => {
        if (!video.videoWidth || !video.videoHeight) {
          animationId = requestAnimationFrame(detectObject)
          return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        if (trackingMode === 'color') {
          // Detectar color rojo/naranja (como un objeto brillante)
          let maxIntensity = 0
          let maxX = 0
          let maxY = 0
          let foundColor = false

          for (let y = 0; y < canvas.height; y += 8) {
            for (let x = 0; x < canvas.width; x += 8) {
              const i = (y * canvas.width + x) * 4
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]

              // Detectar colores cálidos (rojo, naranja, amarillo)
              const isWarmColor = r > 150 && r > g * 1.3 && r > b * 1.5
              
              if (isWarmColor) {
                const intensity = r + g
                if (intensity > maxIntensity) {
                  maxIntensity = intensity
                  maxX = x
                  maxY = y
                  foundColor = true
                }
              }
            }
          }

          if (foundColor && maxIntensity > 200) {
            setTrackedPosition({
              x: maxX / canvas.width,
              y: maxY / canvas.height
            })
            setDetectionCount(prev => prev + 1)
          }

        } else if (trackingMode === 'motion') {
          // Detectar movimiento
          if (previousFrame) {
            let maxDiff = 0
            let maxX = 0
            let maxY = 0
            let foundMotion = false

            for (let y = 0; y < canvas.height; y += 10) {
              for (let x = 0; x < canvas.width; x += 10) {
                const i = (y * canvas.width + x) * 4
                
                const diff = Math.abs(data[i] - previousFrame[i]) +
                           Math.abs(data[i + 1] - previousFrame[i + 1]) +
                           Math.abs(data[i + 2] - previousFrame[i + 2])

                if (diff > maxDiff && diff > 100) {
                  maxDiff = diff
                  maxX = x
                  maxY = y
                  foundMotion = true
                }
              }
            }

            if (foundMotion) {
              setTrackedPosition({
                x: maxX / canvas.width,
                y: maxY / canvas.height
              })
              setDetectionCount(prev => prev + 1)
            }
          }
          previousFrame = new Uint8ClampedArray(data)

        } else if (trackingMode === 'face') {
          // Detección simple de rostro (buscar regiones con piel)
          let maxSkinArea = 0
          let maxX = 0
          let maxY = 0
          let foundSkin = false

          for (let y = 0; y < canvas.height; y += 12) {
            for (let x = 0; x < canvas.width; x += 12) {
              const i = (y * canvas.width + x) * 4
              const r = data[i]
              const g = data[i + 1]
              const b = data[i + 2]

              // Detectar tonos de piel
              const isSkin = r > 95 && g > 40 && b > 20 &&
                           r > g && r > b &&
                           Math.abs(r - g) > 15
              
              if (isSkin) {
                const skinScore = r + g + b
                if (skinScore > maxSkinArea) {
                  maxSkinArea = skinScore
                  maxX = x
                  maxY = y
                  foundSkin = true
                }
              }
            }
          }

          if (foundSkin) {
            setTrackedPosition({
              x: maxX / canvas.width,
              y: maxY / canvas.height
            })
            setDetectionCount(prev => prev + 1)
          }
        }

        animationId = requestAnimationFrame(detectObject)
      }

      detectObject()
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [trackingMode])

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>❌ Error en Modo AR</h2>
        <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{error}</p>
        <p style={{ fontSize: '14px', marginTop: '20px', color: '#aaa' }}>
          Por favor permite el acceso a la cámara en la configuración del navegador
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      {/* Video de cámara como fondo */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* Canvas oculto para procesamiento */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Canvas 3D encima del video */}
      {arReady && showObjects && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
        }}>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true }}
          >
            <ARObjects trackedPosition={trackedPosition} />
          </Canvas>
        </div>
      )}

      {/* Indicador visual de tracking */}
      {arReady && trackedPosition && (
        <div style={{
          position: 'absolute',
          left: `${trackedPosition.x * 100}%`,
          top: `${trackedPosition.y * 100}%`,
          width: '40px',
          height: '40px',
          border: '3px solid #ff0000',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
          pointerEvents: 'none',
          boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
        }} />
      )}

      {/* Instrucciones */}
      {arReady && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '90%'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#00d4ff' }}>
            🎯 Modo AR con Tracking
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {trackingMode === 'color' && '🔴 Siguiendo objetos rojos/naranjas'}
            {trackingMode === 'motion' && '🏃 Siguiendo movimiento'}
            {trackingMode === 'face' && '👤 Siguiendo rostros'}
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: trackedPosition ? '#00ff88' : '#ff6b6b' }}>
            {trackedPosition ? `✅ Detectando (${detectionCount} frames)` : '⏳ Buscando objetivo...'}
          </p>
        </div>
      )}

      {/* Controles */}
      {arReady && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '90%'
        }}>
          <button
            onClick={() => setShowObjects(!showObjects)}
            style={{
              background: showObjects ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)',
              color: showObjects ? '#000' : '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {showObjects ? '👁️ Ocultar' : '👁️‍🗨️ Mostrar'}
          </button>
          
          <select
            value={trackingMode}
            onChange={(e) => {
              setTrackingMode(e.target.value)
              setDetectionCount(0)
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 15px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            <option value="color">🔴 Color Rojo</option>
            <option value="motion">🏃 Movimiento</option>
            <option value="face">👤 Rostro</option>
          </select>
        </div>
      )}

      {/* Loading */}
      {!arReady && !error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          textAlign: 'center',
          zIndex: 10
        }}>
          <div className="spinner" />
          <p style={{ marginTop: '20px' }}>Iniciando cámara...</p>
        </div>
      )}
    </div>
  )
}

export default ARView
