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

const PREFERRED_VOICE_NAMES = [
  'google us english',
  'google uk english female',
  'samantha',
  'karen',
  'daniel',
  'microsoft zira',
  'microsoft david',
]

const SPEAK_TIMEOUT_MS = 45_000

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const english = voices.filter((v) => v.lang.startsWith('en'))
  if (english.length === 0) return voices[0]

  for (const name of PREFERRED_VOICE_NAMES) {
    const match = english.find((v) => v.name.toLowerCase().includes(name))
    if (match) return match
  }

  return (
    english.find((v) => v.localService && v.lang.startsWith('en-US')) ??
    english.find((v) => v.localService) ??
    english.find((v) => v.lang.startsWith('en-US')) ??
    english[0]
  )
}

export class VoiceService {
  private recognition: SpeechRecognition | null = null
  private synth: SpeechSynthesis | null = null
  private listeningActive = false
  private callbacks: RecognitionCallbacks | null = null
  private voicesReady: Promise<void>
  private preferredVoice: SpeechSynthesisVoice | undefined
  private speakGeneration = 0

  constructor() {
    if (typeof window === 'undefined') {
      this.voicesReady = Promise.resolve()
      return
    }

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
    this.voicesReady = this.loadVoices()
  }

  private loadVoices(): Promise<void> {
    if (!this.synth) return Promise.resolve()

    const resolveVoice = () => {
      const voices = this.synth!.getVoices()
      if (voices.length > 0) {
        this.preferredVoice = pickVoice(voices)
        return true
      }
      return false
    }

    if (resolveVoice()) return Promise.resolve()

    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        resolveVoice()
        resolve()
      }

      this.synth!.onvoiceschanged = finish
      window.setTimeout(finish, 800)
    })
  }

  isRecognitionSupported() {
    return this.recognition !== null
  }

  isSynthesisSupported() {
    return this.synth !== null
  }

  async requestMicrophonePermission(): Promise<boolean> {
    if (!this.recognition) return false
    if (!navigator.mediaDevices?.getUserMedia) {
      return this.isRecognitionSupported()
    }
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
      this.callbacks?.onResult(finalText.trim(), interimText.trim())
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = event.error
      if (this.listeningActive && (code === 'no-speech' || code === 'aborted')) {
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
    void this.speakAndWait(text).then(() => onEnd?.())
  }

  /** Speak and resolve when done, cancelled, or timed out. */
  speakAndWait(text: string): Promise<void> {
    return this.speakInternal(text)
  }

  private async speakInternal(text: string): Promise<void> {
    const trimmed = text.trim()
    if (!this.synth || !trimmed) return

    await this.voicesReady

    const generation = ++this.speakGeneration
    this.synth.cancel()
    this.synth.resume()

    const utterance = new SpeechSynthesisUtterance(trimmed)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.lang = 'en-US'

    const voice = this.preferredVoice ?? pickVoice(this.synth.getVoices())
    if (voice) utterance.voice = voice

    return new Promise((resolve) => {
      let settled = false
      const finish = () => {
        if (settled || generation !== this.speakGeneration) return
        settled = true
        window.clearTimeout(timer)
        resolve()
      }

      const timer = window.setTimeout(finish, SPEAK_TIMEOUT_MS)
      utterance.onend = finish
      utterance.onerror = finish
      this.synth!.speak(utterance)

      // Chrome sometimes pauses the synthesis queue without speaking.
      window.setTimeout(() => {
        if (!settled && generation === this.speakGeneration) {
          this.synth?.resume()
        }
      }, 250)
    })
  }

  cancelSpeaking() {
    this.speakGeneration++
    this.synth?.cancel()
  }
}

let singleton: VoiceService | null = null
export function getVoiceService() {
  if (!singleton) singleton = new VoiceService()
  return singleton
}
