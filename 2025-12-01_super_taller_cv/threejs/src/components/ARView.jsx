import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

function ARView() {
  const containerRef = useRef(null)
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState(null)
  const [markerFound, setMarkerFound] = useState(false)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const arToolkitSourceRef = useRef(null)
  const arToolkitContextRef = useRef(null)
  const markerRootRef = useRef(null)

  useEffect(() => {
    let animationId = null

    const initAR = async () => {
      try {
        if (!containerRef.current) return

        // Create Three.js scene
        const scene = new THREE.Scene()
        sceneRef.current = scene

        // Create camera
        const camera = new THREE.Camera()
        scene.add(camera)
        cameraRef.current = camera

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true
        })
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        renderer.setSize(640, 480)
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        containerRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Setup ARToolkitSource (webcam)
        const arToolkitSource = new window.THREEx.ArToolkitSource({
          sourceType: 'webcam',
        })

        arToolkitSource.init(() => {
          onResize()
          setArReady(true)
        }, (err) => {
          console.error('AR Source error:', err)
          setError('No se pudo acceder a la cámara')
        })

        arToolkitSourceRef.current = arToolkitSource

        // Handle resize
        const onResize = () => {
          arToolkitSource.onResizeElement()
          arToolkitSource.copyElementSizeTo(renderer.domElement)
          if (arToolkitContext?.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
          }
        }

        window.addEventListener('resize', onResize)

        // Setup ARToolkitContext
        const arToolkitContext = new window.THREEx.ArToolkitContext({
          cameraParametersUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/data/camera_para.dat',
          detectionMode: 'mono'
        })

        arToolkitContext.init(() => {
          camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix())
        })

        arToolkitContextRef.current = arToolkitContext

        // Create marker root
        const markerRoot = new THREE.Group()
        scene.add(markerRoot)
        markerRootRef.current = markerRoot

        // Setup marker controls for Hiro marker
        const markerControls = new window.THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
          type: 'pattern',
          patternUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/data/patt.hiro'
        })

        markerControls.addEventListener('markerFound', () => {
          setMarkerFound(true)
          console.log('Marcador detectado!')
        })

        markerControls.addEventListener('markerLost', () => {
          setMarkerFound(false)
          console.log('Marcador perdido')
        })

        // Add 3D objects to marker
        addARObjects(markerRoot)

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate)

          if (arToolkitSource.ready === false) return

          arToolkitContext.update(arToolkitSource.domElement)
          renderer.render(scene, camera)
        }

        animate()

        return () => {
          window.removeEventListener('resize', onResize)
        }

      } catch (err) {
        console.error('AR initialization error:', err)
        setError('Error al inicializar AR: ' + err.message)
      }
    }

    // Load AR.js scripts
    const loadARScripts = async () => {
      if (window.THREEx) {
        initAR()
        return
      }

      const script1 = document.createElement('script')
      script1.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/aframe/build/aframe-ar.js'
      script1.async = true
      
      script1.onload = () => {
        const script2 = document.createElement('script')
        script2.src = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/build/ar-threex.js'
        script2.async = true
        
        script2.onload = () => {
          setTimeout(initAR, 100)
        }
        
        script2.onerror = () => {
          setError('Error al cargar AR.js')
        }
        
        document.head.appendChild(script2)
      }
      
      script1.onerror = () => {
        setError('Error al cargar dependencias AR')
      }
      
      document.head.appendChild(script1)
    }

    loadARScripts()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (arToolkitSourceRef.current) {
        const video = arToolkitSourceRef.current.domElement
        if (video && video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop())
        }
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [])

  const addARObjects = (markerRoot) => {
    // Add animated cube
    const geometry1 = new THREE.BoxGeometry(1, 1, 1)
    const material1 = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    const cube = new THREE.Mesh(geometry1, material1)
    cube.position.y = 0.5
    markerRoot.add(cube)

    // Add rotating torus
    const geometry2 = new THREE.TorusGeometry(0.5, 0.2, 16, 100)
    const material2 = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.8
    })
    const torus = new THREE.Mesh(geometry2, material2)
    torus.position.y = 1.5
    markerRoot.add(torus)

    // Add sphere
    const geometry3 = new THREE.SphereGeometry(0.3, 32, 32)
    const material3 = new THREE.MeshNormalMaterial({
      transparent: true,
      opacity: 0.9
    })
    const sphere = new THREE.Mesh(geometry3, material3)
    sphere.position.y = 2.5
    markerRoot.add(sphere)

    // Animate objects
    const animate = () => {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      
      torus.rotation.x += 0.02
      torus.rotation.z += 0.01

      sphere.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.3

      requestAnimationFrame(animate)
    }
    animate()
  }

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
          Por favor permite el acceso a la cámara y recarga la página
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {!arReady && (
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
          <p style={{ marginTop: '20px' }}>Inicializando AR...</p>
          <p style={{ fontSize: '12px', color: '#aaa' }}>Cargando AR.js</p>
        </div>
      )}

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
            🎯 Modo AR Activo
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Apunta la cámara al <strong>marcador Hiro</strong>
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#aaa' }}>
            Descarga el marcador abajo ↓
          </p>
        </div>
      )}

      {arReady && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '90%'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            📄 <strong>Necesitas el marcador Hiro</strong>
          </p>
          <a 
            href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#00d4ff',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            Descargar Marcador Hiro
          </a>
          <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#aaa' }}>
            Imprime el marcador y apunta la cámara hacia él
          </p>
        </div>
      )}
    </div>
  )
}

export default ARView
