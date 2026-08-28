import { useCallback, useEffect, useRef, useState } from 'react'

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export function useVoiceRecognition(language: string) {
  const [supported, setSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)
  const langRef = useRef(language)
  const onFinalRef = useRef<((text: string) => void) | null>(null)
  const listeningRef = useRef(false)

  useEffect(() => {
    langRef.current = language
    if (recRef.current) recRef.current.lang = language
  }, [language])

  useEffect(() => {
    const Ctor = getRecognitionCtor()
    setSupported(Boolean(Ctor))
    if (!Ctor) return

    const rec = new Ctor()
    rec.continuous = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.lang = langRef.current

    rec.onstart = () => {
      listeningRef.current = true
      setIsListening(true)
      setError(null)
    }
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let interimText = ''
      let finalText = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i]
        const transcript = result[0]?.transcript ?? ''
        if (result.isFinal) finalText += transcript
        else interimText += transcript
      }
      setInterim(interimText || finalText)
      if (finalText.trim()) onFinalRef.current?.(finalText.trim())
    }
    rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
      if (ev.error === 'no-speech') setError('No speech detected. Please try again.')
      else if (ev.error === 'not-allowed') setError('Microphone access was denied.')
      else if (ev.error !== 'aborted') setError(`Speech error: ${ev.error}`)
      listeningRef.current = false
      setIsListening(false)
    }
    rec.onend = () => {
      listeningRef.current = false
      setIsListening(false)
    }

    recRef.current = rec
    return () => {
      rec.abort()
      recRef.current = null
    }
  }, [])

  const start = useCallback((onFinal: (text: string) => void) => {
    const rec = recRef.current
    if (!rec) {
      setError('Voice input requires Chrome or Edge browser.')
      return
    }
    // Prevent calling start() if already listening
    if (listeningRef.current) return

    onFinalRef.current = onFinal
    setInterim('')
    rec.lang = langRef.current
    try {
      rec.start()
    } catch {
      // If start fails, abort first then retry after a brief delay
      rec.abort()
      setTimeout(() => {
        try {
          rec.start()
        } catch {
          setError('Could not start voice recognition. Please try again.')
        }
      }, 100)
    }
  }, [])

  const stop = useCallback(() => {
    recRef.current?.stop()
  }, [])

  return { supported, isListening, interim, error, start, stop, setError }
}
