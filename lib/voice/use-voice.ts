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
  reset: () => void
  speak: (text: string, onEnd?: () => void) => void
  cancelSpeak: () => void
}

export function useVoice(): UseVoiceReturn {
  const serviceRef = useRef(
    typeof window !== 'undefined' ? getVoiceService() : null,
  )
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [permission, setPermission] = useState<VoicePermission>('unknown')
  const [recognitionSupported, setRecognitionSupported] = useState(false)
  const [synthesisSupported, setSynthesisSupported] = useState(false)

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

    const allowed = await svc.requestMicrophonePermission()
    if (!allowed) {
      setPermission('denied')
      setListening(false)
      setInterim('')
      return false
    }

    setPermission('granted')
    setInterim('')
    setListening(true)

    svc.startListening({
      onResult: (finalText, interimText) => {
        if (finalText) {
          setTranscript((prev) => (prev + ' ' + finalText).trim())
        }
        setInterim(interimText)
      },
      onError: (error) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setPermission('denied')
        }
        setListening(false)
        setInterim('')
      },
      onEnd: () => {
        setListening(false)
        setInterim('')
      },
    })
    return true
  }, [])

  const stop = useCallback(() => {
    serviceRef.current?.stopListening()
    setListening(false)
    setInterim('')
  }, [])

  const reset = useCallback(() => {
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
    reset,
    speak,
    cancelSpeak,
  }
}
