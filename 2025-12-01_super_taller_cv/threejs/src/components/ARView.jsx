import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function ARObjects() {
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
        sphereRef.current.position.y = 1.5 + Math.sin(Date.now() * 0.003) * 0.3
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <group>
      {/* Cubo */}
      <mesh ref={cubeRef} position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial transparent opacity={0.8} />
      </mesh>

      {/* Toro */}
      <mesh ref={torusRef} position={[0, 1.5, 0]} castShadow>
        <torusGeometry args={[0.5, 0.2, 16, 100]} />
        <meshNormalMaterial transparent opacity={0.8} />
      </mesh>

      {/* Esfera */}
      <mesh ref={sphereRef} position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshNormalMaterial transparent opacity={0.9} />
      </mesh>

      {/* Luz */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
    </group>
  )
}

function ARView() {
  const videoRef = useRef(null)
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState(null)
  const [showObjects, setShowObjects] = useState(true)

  useEffect(() => {
    let stream = null

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
        }
      } catch (err) {
        console.error('Error accediendo a la cámara:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

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

      {/* Canvas 3D encima del video */}
      {arReady && showObjects && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2
        }}>
          <Canvas
            camera={{ position: [0, 2, 5], fov: 75 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true }}
          >
            <ARObjects />
            <OrbitControls enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>
      )}

      {/* Instrucciones */}
      {arReady && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#00d4ff' }}>
            🎯 Modo AR Simplificado
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Objetos 3D superpuestos sobre video en vivo
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#aaa' }}>
            Usa los controles para rotar la vista
          </p>
        </div>
      )}

      {/* Control de visibilidad */}
      {arReady && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }}>
          <button
            onClick={() => setShowObjects(!showObjects)}
            style={{
              background: showObjects ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)',
              color: showObjects ? '#000' : '#fff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {showObjects ? '👁️ Ocultar Objetos 3D' : '👁️‍🗨️ Mostrar Objetos 3D'}
          </button>
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
