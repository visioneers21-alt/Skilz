'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getVoiceService } from './voice-service'

export type VoicePermission = 'unknown' | 'granted' | 'denied'

interface UseVoiceReturn {
  recognitionSupported: boolean
  synthesisSupported: boolean
  listening: boolean
  speaking: boolean
  transcript: string
  interim: string
  liveText: string
  permission: VoicePermission
  start: () => Promise<boolean>
  stop: () => void
  stopAndCapture: () => string
  reset: () => void
  speak: (text: string, onEnd?: () => void) => void
  cancelSpeak: () => void
  interruptForListening: () => Promise<boolean>
}

export function useVoice(): UseVoiceReturn {
  const serviceRef = useRef(
    typeof window !== 'undefined' ? getVoiceService() : null,
  )
  const transcriptRef = useRef('')
  const interimRef = useRef('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [permission, setPermission] = useState<VoicePermission>('unknown')
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [synthesisSupported, setSynthesisSupported] = useState(false)

  const syncLiveText = useCallback(() => {
    return [transcriptRef.current, interimRef.current].filter(Boolean).join(' ').trim()
  }, [])

  useEffect(() => {
    const svc = serviceRef.current
    if (!svc) return
    setRecognitionSupported(svc.isRecognitionSupported())
    setSynthesisSupported(svc.isSynthesisSupported())
    return () => {
      svc.stopListening()
      svc.cancelSpeaking()
    }
  }, [])

  const start = useCallback(async (): Promise<boolean> => {
    const svc = serviceRef.current
    if (!svc) return false

    // Release the audio output device before grabbing the mic (Chrome conflict).
    svc.cancelSpeaking()

    const allowed = await svc.requestMicrophonePermission()
    if (!allowed) {
      setPermission('denied')
      setListening(false)
      interimRef.current = ''
      setInterim('')
      return false
    }

    setPermission('granted')
    interimRef.current = ''
    setInterim('')
    setListening(true)

    svc.startListening({
      onResult: (finalText, interimText) => {
        if (finalText) {
          transcriptRef.current = (transcriptRef.current + ' ' + finalText).trim()
          setTranscript(transcriptRef.current)
        }
        interimRef.current = interimText
        setInterim(interimText)
      },
      onError: (error) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setPermission('denied')
        }
        setListening(false)
        interimRef.current = ''
        setInterim('')
      },
      onEnd: () => {
        setListening(false)
        interimRef.current = ''
        setInterim('')
      },
    })
    return true
  }, [])

  const stop = useCallback(() => {
    serviceRef.current?.stopListening()
    setListening(false)
    interimRef.current = ''
    setInterim('')
  }, [])

  const stopAndCapture = useCallback(() => {
    const captured = syncLiveText()
    serviceRef.current?.stopListening()
    setListening(false)
    interimRef.current = ''
    setInterim('')
    return captured
  }, [syncLiveText])

  const reset = useCallback(() => {
    transcriptRef.current = ''
    interimRef.current = ''
    setTranscript('')
    setInterim('')
  }, [])

  const speak = useCallback((text: string, onEnd?: () => void) => {
    const svc = serviceRef.current
    if (!svc) {
      onEnd?.()
      return
    }
    setSpeaking(true)
    svc.speak(text, () => {
      setSpeaking(false)
      onEnd?.()
    })
  }, [])

  const cancelSpeak = useCallback(() => {
    serviceRef.current?.cancelSpeaking()
    setSpeaking(false)
  }, [])

  const interruptForListening = useCallback(async (): Promise<boolean> => {
    serviceRef.current?.cancelSpeaking()
    setSpeaking(false)
    transcriptRef.current = ''
    interimRef.current = ''
    setTranscript('')
    setInterim('')
    return start()
  }, [start])

  const liveText = [transcript, interim].filter(Boolean).join(' ').trim()

  return {
    recognitionSupported,
    synthesisSupported,
    listening,
    speaking,
    transcript,
    interim,
    liveText,
    permission,
    start,
    stop,
    stopAndCapture,
    reset,
    speak,
    cancelSpeak,
    interruptForListening,
  }
}
