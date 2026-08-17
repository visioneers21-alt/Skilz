"use client"

import { cn } from "@/lib/utils"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

const STATE_LABEL: Record<OrbState, { default: string; voiceMode?: string }> = {
  idle: {
    default: "Tap the mic and speak your answer",
    voiceMode: "Ready for your answer — tap the mic when you're ready",
  },
  listening: {
    default: "Listening… tap again when you're done",
    voiceMode: "I'm listening — tap the mic when you've finished",
  },
  thinking: {
    default: "SKILZ is thinking…",
  },
  speaking: {
    default: "SKILZ is responding…",
    voiceMode: "SKILZ is speaking — tap the mic to jump in",
  },
}

export function ListeningOrb({
  state,
  caption,
  voiceMode = false,
}: {
  state: OrbState
  caption?: string
  voiceMode?: boolean
}) {
  const labels = STATE_LABEL[state]
  const label = voiceMode && labels.voiceMode ? labels.voiceMode : labels.default

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4" aria-live="polite">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-primary/15 transition-opacity duration-500",
            state === "listening" ? "animate-ping opacity-100" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute inset-2 rounded-full transition-transform duration-700",
            state === "speaking" ? "animate-pulse scale-105 bg-primary/25" : "scale-100 bg-primary/20",
            state === "listening" && "scale-110 bg-primary/30",
          )}
        />
        <div
          className={cn(
            "relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 transition-all duration-500",
            state === "thinking" && "animate-spin-slow",
            state === "listening" && "scale-110 ring-4 ring-primary/20",
          )}
        >
          <div className="flex items-end gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 rounded-full bg-primary-foreground/90 transition-all",
                  state === "listening" || state === "speaking" ? "animate-wave" : "h-3",
                )}
                style={{
                  height: state === "listening" || state === "speaking" ? undefined : "0.75rem",
                  animationDelay: `${i * 0.12}s`,
                }}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-sm font-medium text-muted-foreground">{label}</p>
      {caption && (
        <p className="min-h-[3rem] w-full rounded-2xl border border-primary/15 bg-card/90 px-4 py-3 text-center text-sm leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
          {caption}
        </p>
      )}
    </div>
  )
}
