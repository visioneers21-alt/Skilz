'use client'

import { getVoiceService } from './voice-service'

/** Only speak once a sentence has real punctuation (not end-of-string). */
const COMPLETE_SENTENCE = /[^.!?\n]+[.!?]+/g
const MIN_CLAUSE_CHARS = 48
const PAUSE_BETWEEN_MS = 180

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

/** Speaks complete sentences as they arrive during a streaming reply. */
export class StreamSpeaker {
  private spokenIndex = 0
  private queue: string[] = []
  private speaking = false
  private onIdle: (() => void) | null = null
  private cancelled = false
  private drainGeneration = 0

  reset() {
    this.spokenIndex = 0
    this.queue = []
    this.speaking = false
    this.cancelled = false
    this.onIdle = null
    this.drainGeneration++
    getVoiceService().cancelSpeaking()
  }

  cancel() {
    this.cancelled = true
    this.queue = []
    this.speaking = false
    this.onIdle = null
    this.drainGeneration++
    getVoiceService().cancelSpeaking()
  }

  isActive() {
    return !this.cancelled && (this.speaking || this.queue.length > 0)
  }

  feed(fullText: string) {
    if (this.cancelled) return
    this.enqueueCompleteSentences(fullText)
    void this.drain()
  }

  flush(fullText: string, onAllSpoken?: () => void) {
    if (this.cancelled) return
    if (onAllSpoken) this.onIdle = onAllSpoken

    this.enqueueCompleteSentences(fullText)

    const tail = fullText.slice(this.spokenIndex).trim()
    if (tail) {
      this.queue.push(tail)
      this.spokenIndex = fullText.length
    }

    if (!this.speaking && this.queue.length === 0) {
      this.invokeIdle()
      return
    }

    void this.drain()
  }

  private invokeIdle() {
    const cb = this.onIdle
    this.onIdle = null
    cb?.()
  }

  private enqueueCompleteSentences(fullText: string) {
    const remainder = fullText.slice(this.spokenIndex)
    if (!remainder) return

    let consumed = 0

    COMPLETE_SENTENCE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = COMPLETE_SENTENCE.exec(remainder)) !== null) {
      const sentence = match[0].replace(/\n+/g, ' ').trim()
      if (sentence) this.queue.push(sentence)
      consumed = match.index + match[0].length
    }

    // Speak long clause chunks at natural pauses (commas) once enough text buffered.
    const pending = remainder.slice(consumed)
    if (pending.length >= MIN_CLAUSE_CHARS) {
      const clauseMatch = pending.match(/^[\s\S]{48,}?[,;:](?=\s)/)
      if (clauseMatch) {
        const clause = clauseMatch[0].replace(/\n+/g, ' ').trim()
        if (clause) {
          this.queue.push(clause)
          consumed += clauseMatch[0].length
        }
      }
    }

    if (consumed > 0) this.spokenIndex += consumed
  }

  private async drain() {
    if (this.speaking || this.queue.length === 0 || this.cancelled) return

    this.speaking = true
    const generation = this.drainGeneration
    const svc = getVoiceService()

    while (this.queue.length > 0 && !this.cancelled && generation === this.drainGeneration) {
      const sentence = this.queue.shift()!
      await svc.speakAndWait(sentence)
      if (this.queue.length > 0 && !this.cancelled && generation === this.drainGeneration) {
        await sleep(PAUSE_BETWEEN_MS)
      }
    }

    if (generation !== this.drainGeneration || this.cancelled) return

    this.speaking = false
    if (this.queue.length === 0) {
      this.invokeIdle()
    }
  }
}
