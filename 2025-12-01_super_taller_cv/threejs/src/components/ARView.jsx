import { useEffect, useRef, useState } from 'react'

function ARView() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [arReady, setArReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let stream = null

    const initAR = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setArReady(true)
        }
      } catch (err) {
        console.error('AR initialization error:', err)
        setError('Camera access denied or not available')
      }
    }

    initAR()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!arReady || !canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const video = videoRef.current

    // Set canvas size to match video
    const setCanvasSize = () => {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    video.addEventListener('loadedmetadata', setCanvasSize)

    let animationId

    const render = () => {
      if (!ctx || !video.videoWidth) {
        animationId = requestAnimationFrame(render)
        return
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Draw AR overlay (simulated marker detection)
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 3
      ctx.font = '20px Arial'
      ctx.fillStyle = '#00d4ff'

      // Simulate marker detection in center
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const markerSize = 150

      // Draw marker frame
      ctx.strokeRect(
        centerX - markerSize / 2,
        centerY - markerSize / 2,
        markerSize,
        markerSize
      )

      // Draw 3D cube wireframe (simulated)
      drawWireframeCube(ctx, centerX, centerY, 100, Date.now() * 0.001)

      // AR info
      ctx.fillText('AR Mode Active', 10, 30)
      ctx.fillText('Point camera at marker', 10, 60)

      animationId = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      video.removeEventListener('loadedmetadata', setCanvasSize)
    }
  }, [arReady])

  const drawWireframeCube = (ctx, cx, cy, size, rotation) => {
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ]

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]

    // Rotate and project vertices
    const projected = vertices.map(([x, y, z]) => {
      // Simple rotation
      const rx = x * Math.cos(rotation) - z * Math.sin(rotation)
      const rz = x * Math.sin(rotation) + z * Math.cos(rotation)
      const ry = y * Math.cos(rotation * 0.7) - rz * Math.sin(rotation * 0.7)

      // Project to 2D
      const scale = size / (3 + rz * 0.5)
      return [cx + rx * scale, cy + ry * scale]
    })

    // Draw edges
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    edges.forEach(([start, end]) => {
      ctx.beginPath()
      ctx.moveTo(projected[start][0], projected[start][1])
      ctx.lineTo(projected[end][0], projected[end][1])
      ctx.stroke()
    })
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
        flexDirection: 'column'
      }}>
        <h2>AR Mode</h2>
        <p style={{ color: '#ff6b6b' }}>{error}</p>
        <p style={{ fontSize: '14px', marginTop: '20px' }}>
          Please allow camera access and try again
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      {!arReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          textAlign: 'center'
        }}>
          <div className="spinner" />
          <p>Initializing AR...</p>
        </div>
      )}
    </div>
  )
}

export default ARView
