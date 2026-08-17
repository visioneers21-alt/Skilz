"use client"

import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatSessionHeaderProps {
  title?: string
  subtitle?: string
  progress: number
  progressLabel: string
  statusMessage?: string
  statusTone?: "muted" | "primary" | "success"
  onEnd?: () => void
  badge?: string
}

export function ChatSessionHeader({
  title = "SKILZ AI",
  subtitle = "Skills Discovery Session",
  progress,
  progressLabel,
  statusMessage,
  statusTone = "muted",
  onEnd,
  badge,
}: ChatSessionHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </span>
            <div>
              <h1 className="font-display text-base font-bold leading-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">
                {subtitle}
                {badge && (
                  <span className="ml-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {badge}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        {onEnd && (
          <Button variant="ghost" size="sm" onClick={onEnd} className="shrink-0 text-muted-foreground">
            <X className="mr-1 size-4" />
            End
          </Button>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Session progress</span>
          <span>{progressLabel}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {statusMessage && (
          <p
            className={cn(
              "mt-2 text-xs",
              statusTone === "primary" && "font-medium text-primary",
              statusTone === "success" && "font-medium text-success",
              statusTone === "muted" && "text-muted-foreground",
            )}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </header>
  )
}
