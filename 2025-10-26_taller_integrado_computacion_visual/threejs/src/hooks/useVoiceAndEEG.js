import { useEffect, useState } from 'react'

/**
 * Hook personnalisé : reconnaissance vocale + simulation EEG
 */
// options: { simulateEEG: boolean, intervalMs: number, delta: number }
export default function useVoiceAndEEG(options = {}) {
  const { simulateEEG = false, intervalMs = 400, delta = 0.15 } = options

  const [command, setCommand] = useState(null)
  const [eegValue, setEegValue] = useState(0.5)

  // --- Reconnaissance vocale ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('API de reconnaissance vocale non disponible dans ce navigateur.')
      return
    }

    const recog = new SpeechRecognition()
    recog.lang = 'es-ES'
    recog.continuous = true
    recog.interimResults = false

    recog.onresult = (event) => {
      const last = event.results[event.results.length - 1][0].transcript.trim().toLowerCase()
      console.log('Commande détectée :', last)

      if (last.includes('luz')) setCommand('luz')
      else if (last.includes('flor') || last.includes('color')) setCommand('flor')
      else if (last.includes('noche')) setCommand('noche')
    }

    recog.onend = () => recog.start()
    recog.start()

    return () => recog.abort()
  }, [])

  // --- Simulation EEG (valeur entre 0 et 1) ---
  // --- Simulation EEG (valeur entre 0 et 1) ---
  // By default simulation is disabled. Pass { simulateEEG: true } to enable it.
  useEffect(() => {
    if (!simulateEEG) return

    let val = 0.5
    const id = setInterval(() => {
      // small random walk, clamped to [0,1]
      val += (Math.random() - 0.5) * delta
      val = Math.max(0, Math.min(1, val))
      setEegValue(val)
    }, intervalMs)

    return () => clearInterval(id)
  }, [simulateEEG, intervalMs, delta])

  // expose setter so real EEG input or tests can set the value
  return { command, setCommand, eegValue, setEegValue }
}
