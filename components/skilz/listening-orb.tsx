"use client"

import { cn } from "@/lib/utils"

type OrbState = "idle" | "listening" | "thinking" | "speaking"

const STATE_LABEL: Record<OrbState, string> = {
  idle: "Tap the mic and speak your answer",
  listening: "Listening… tap again when you're done",
  thinking: "SKILZ is thinking…",
  speaking: "SKILZ is responding…",
}

export function ListeningOrb({
  state,
  caption,
}: {
  state: OrbState
  caption?: string
}) {
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
            "absolute inset-2 rounded-full bg-primary/20 transition-transform duration-700",
            state === "speaking" ? "animate-pulse scale-105" : "scale-100",
          )}
        />
        <div
          className={cn(
            "relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25 transition-all duration-500",
            state === "thinking" && "animate-spin-slow",
            state === "listening" && "scale-110",
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
      <p className="text-center text-sm font-medium text-muted-foreground">
        {STATE_LABEL[state]}
      </p>
      {caption && (
        <p className="min-h-[3rem] w-full rounded-2xl border border-primary/15 bg-card px-4 py-3 text-center text-sm leading-relaxed text-foreground">
          {caption}
        </p>
      )}
    </div>
  )
}
