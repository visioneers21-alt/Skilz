'use client'

// VoiceService — a thin abstraction over the browser Web Speech APIs.
//
// Speech-to-text uses SpeechRecognition (webkit-prefixed in most browsers).
// Text-to-speech uses speechSynthesis. Recognition auto-restarts while active
// so brief pauses don't cut the user off. Swapping in a hosted provider later
// means reimplementing this class only.

export type RecognitionCallbacks = {
  onResult: (finalText: string, interimText: string) => void
  onError: (error: string) => void
  onEnd: () => void
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null
  private synth: SpeechSynthesis | null = null
  private listeningActive = false
  private callbacks: RecognitionCallbacks | null = null

  constructor() {
    if (typeof window === 'undefined') return

    const SR =
      window.SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition

    if (SR) {
      this.recognition = new SR()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
      this.recognition.maxAlternatives = 1
    }

    this.synth = window.speechSynthesis ?? null
    if (this.synth) {
      this.synth.getVoices()
      this.synth.onvoiceschanged = () => this.synth?.getVoices()
    }
  }

  isRecognitionSupported() {
    return this.recognition !== null
  }

  isSynthesisSupported() {
    return this.synth !== null
  }

  async requestMicrophonePermission(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch {
      return false
    }
  }

  startListening(cb: RecognitionCallbacks) {
    if (!this.recognition) {
      cb.onError('not-supported')
      return
    }

    this.listeningActive = true
    this.callbacks = cb
    this.attachHandlers()
    this.startRecognition()
  }

  private attachHandlers() {
    if (!this.recognition) return

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0]?.transcript ?? ''
        if (event.results[i].isFinal) finalText += chunk
        else interimText += chunk
      }
      this.callbacks?.onResult(finalText, interimText)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error
      if (
        this.listeningActive &&
        (code === 'no-speech' || code === 'aborted')
      ) {
        this.startRecognition()
        return
      }
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        this.listeningActive = false
        this.callbacks?.onError(code)
        return
      }
      if (this.listeningActive) {
        this.startRecognition()
        return
      }
      this.callbacks?.onError(code)
    }

    this.recognition.onend = () => {
      if (this.listeningActive) {
        this.startRecognition()
        return
      }
      this.callbacks?.onEnd()
    }
  }

  private startRecognition() {
    if (!this.recognition || !this.listeningActive) return
    try {
      this.recognition.start()
    } catch {
      // start() throws if already running — safe to ignore
    }
  }

  stopListening() {
    this.listeningActive = false
    try {
      this.recognition?.stop()
    } catch {
      // ignore
    }
  }

  speak(text: string, onEnd?: () => void) {
    if (!this.synth || !text.trim()) {
      onEnd?.()
      return
    }

    this.synth.cancel()
    if (this.synth.paused) this.synth.resume()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.lang = 'en-US'

    const voices = this.synth.getVoices()
    const voice =
      voices.find((v) => v.lang.startsWith('en') && v.localService) ??
      voices.find((v) => v.lang.startsWith('en-US')) ??
      voices.find((v) => v.lang.startsWith('en'))
    if (voice) utterance.voice = voice

    utterance.onend = () => onEnd?.()
    utterance.onerror = () => onEnd?.()
    this.synth.speak(utterance)
  }

  cancelSpeaking() {
    this.synth?.cancel()
  }
}

let singleton: VoiceService | null = null
export function getVoiceService() {
  if (!singleton) singleton = new VoiceService()
  return singleton
}
