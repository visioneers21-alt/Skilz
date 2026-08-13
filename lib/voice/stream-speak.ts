'use client'

import { getVoiceService } from './voice-service'

/** Speaks complete sentences as they arrive during a streaming reply. */
export class StreamSpeaker {
  private spokenIndex = 0
  private queue: string[] = []
  private speaking = false
  private onIdle: (() => void) | null = null
  private cancelled = false

  reset() {
    this.spokenIndex = 0
    this.queue = []
    this.speaking = false
    this.cancelled = false
    this.onIdle = null
    getVoiceService().cancelSpeaking()
  }

  cancel() {
    this.cancelled = true
    this.queue = []
    this.speaking = false
    getVoiceService().cancelSpeaking()
  }

  feed(fullText: string, onAllSpoken?: () => void) {
    if (this.cancelled) return
    if (onAllSpoken) this.onIdle = onAllSpoken

    const remainder = fullText.slice(this.spokenIndex)
    const regex = /[^.!?]+[.!?]+/g
    let match: RegExpExecArray | null
    let consumed = 0

    while ((match = regex.exec(remainder)) !== null) {
      const sentence = match[0].trim()
      if (sentence) this.queue.push(sentence)
      consumed = match.index + match[0].length
    }

    if (consumed > 0) this.spokenIndex += consumed
    void this.drain()
  }

  flush(fullText: string, onAllSpoken?: () => void) {
    if (this.cancelled) return
    if (onAllSpoken) this.onIdle = onAllSpoken

    const tail = fullText.slice(this.spokenIndex).trim()
    if (tail) this.queue.push(tail)
    this.spokenIndex = fullText.length
    void this.drain()
  }

  private async drain() {
    if (this.speaking || this.queue.length === 0) return
    this.speaking = true
    const svc = getVoiceService()

    while (this.queue.length > 0 && !this.cancelled) {
      const sentence = this.queue.shift()!
      await new Promise<void>((resolve) => {
        svc.speak(sentence, () => resolve())
      })
    }

    this.speaking = false
    if (!this.cancelled && this.queue.length === 0) {
      this.onIdle?.()
      this.onIdle = null
    }
  }
}
