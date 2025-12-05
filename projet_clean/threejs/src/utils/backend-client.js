/**
 * WebSocket Integration Example
 * 
 * This file demonstrates how to connect the 3D visualization
 * with the Python detection backend (Module A)
 */

class VisionBackendClient {
  constructor(url = 'ws://localhost:8000') {
    this.url = url
    this.ws = null
    this.callbacks = {
      onDetection: null,
      onMetrics: null,
      onConnect: null,
      onError: null
    }
  }

  connect() {
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      console.log('Connected to vision backend')
      if (this.callbacks.onConnect) {
        this.callbacks.onConnect()
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
    }

    this.ws.onclose = () => {
      console.log('Disconnected from vision backend')
      // Attempt reconnection after 3 seconds
      setTimeout(() => this.connect(), 3000)
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'detection':
        // Handle YOLO detection results
        if (this.callbacks.onDetection) {
          this.callbacks.onDetection(data.payload)
        }
        break

      case 'metrics':
        // Handle performance metrics
        if (this.callbacks.onMetrics) {
          this.callbacks.onMetrics(data.payload)
        }
        break

      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }))
    }
  }

  on(event, callback) {
    this.callbacks[event] = callback
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export default VisionBackendClient

/**
 * Usage Example:
 * 
 * import VisionBackendClient from './utils/backend-client'
 * 
 * const client = new VisionBackendClient('ws://localhost:8000')
 * 
 * client.on('onDetection', (data) => {
 *   console.log('Detected objects:', data.detections)
 *   // Update 3D scene based on detections
 *   setSceneConfig({ 
 *     activeObject: data.detections[0]?.class 
 *   })
 * })
 * 
 * client.on('onMetrics', (data) => {
 *   console.log('Backend FPS:', data.fps)
 *   setSceneData({ fps: data.fps })
 * })
 * 
 * client.connect()
 */
