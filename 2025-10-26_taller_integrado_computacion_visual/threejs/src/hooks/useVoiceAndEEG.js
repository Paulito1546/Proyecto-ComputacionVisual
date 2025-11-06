// hooks/useVoiceAndEEG.js
import { useEffect, useState, useRef } from 'react'

/**
 * Hook: reconocimiento de voz (Web Speech API) + EEG sintético
 * - Devuelve { command, setCommand, eegValue }
 * - Mapea variantes en español a comandos: 'luz'|'noche'|'flor'
 * - Provee feedback hablado con SpeechSynthesis
 */
export default function useVoiceAndEEG() {
  const [command, setCommand] = useState(null)
  const [eegValue, setEegValue] = useState(0.5)
  const recognitionRef = useRef(null)

  // --- Reconocimiento de voz (Web Speech API) ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not available on browser')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'es-ES'
    rec.continuous = true
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (evt) => {
      try {
        const last = evt.results[evt.results.length - 1][0].transcript.trim().toLowerCase()

        const triggerCommand = (cmd) => {
          setCommand('') // allow repetition
          setTimeout(() => setCommand(cmd), 10)
        }

        if (last.includes('día') || last.includes('luz') || last.includes('claro')) {
          triggerCommand('day flash')
          speakFeedback('flash diurno')
        } else if (last.includes('noche') || last.includes('oscuro') || last.includes('apagar')) {
          triggerCommand('night flash')
          speakFeedback('Flash nocturno')
        } else if (last.includes('flor') || last.includes('plant') || last.includes('crece')) {
          triggerCommand('flor')
          speakFeedback('Floreciendo')
        } else {
          console.debug('Not recognized in list', last)
        }
      } catch (e) {
        console.error('onresult error', e)
      }
    }

    rec.onerror = (e) => {
      console.warn('SpeechRecognition error', e)
    }

    rec.onend = () => {
      // intenta reconectar para experiencia continua (si el usuario no detuvo)
      try { rec.start() } catch (e) { /*ignore*/ }
    }

    recognitionRef.current = rec
    try {
      rec.start()
    } catch (e) {
      console.warn('Cant start voice recognition', e)
    }

    return () => {
      try {
        rec.onresult = null
        rec.onend = null
        rec.onerror = null
        rec.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Feedback por voz (speechSynthesis) ---
  const speakFeedback = (text) => {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }

  // --- Simulation EEG (val entre 0 y 1) ---
  useEffect(() => {
    let t0 = performance.now()
    const id = setInterval(() => {
      const t = (performance.now() - t0) / 1000
      const alpha = 0.5 + 0.4 * Math.sin(2 * Math.PI * 8 * t) // 8 Hz approx α
      const beta  = 0.5 + 0.3 * Math.sin(2 * Math.PI * 20 * t) // 20 Hz β
      let val = 0.6 * alpha + 0.4 * beta + (Math.random()-0.5)*0.05
      val = Math.max(0, Math.min(1, val))
      setEegValue(Number(val.toFixed(3)))
    }, 50)
    return () => clearInterval(id)
  }, [])

  return { command, setCommand, eegValue }
}

