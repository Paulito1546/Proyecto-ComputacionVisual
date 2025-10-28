import { useEffect, useState } from 'react'

/**
 * Hook personnalisé : reconnaissance vocale + simulation EEG
 */
export default function useVoiceAndEEG() {
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
  useEffect(() => {
    let val = 0.5
    const id = setInterval(() => {
      val += (Math.random() - 0.5) * 0.15
      val = Math.max(0, Math.min(1, val))
      setEegValue(val)
    }, 400)
    return () => clearInterval(id)
  }, [])

  return { command, setCommand, eegValue }
}
