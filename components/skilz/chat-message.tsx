"use client"

import { cn } from "@/lib/utils"
import { SkilzMark } from "@/components/skilz/logo"

export type ChatRole = "user" | "assistant"

interface ChatMessageProps {
  role: ChatRole
  content: string
  userInitial?: string
  streaming?: boolean
  className?: string
}

export function ChatMessage({
  role,
  content,
  userInitial = "Y",
  streaming = false,
  className,
}: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div
      className={cn(
        "animate-message-in flex gap-2.5",
        isUser ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? (
          userInitial.charAt(0).toUpperCase()
        ) : (
          <SkilzMark className="size-5 text-[10px]" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[min(100%,28rem)] space-y-1",
          isUser ? "items-end" : "items-start",
        )}
      >
        <p className="px-1 text-[11px] font-medium text-muted-foreground">
          {isUser ? "You" : "SKILZ"}
        </p>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border/60 bg-card text-foreground",
          )}
        >
          <p className="text-pretty whitespace-pre-wrap">{content}</p>
          {streaming && !content && (
            <span className="mt-1 inline-flex items-center gap-1" aria-label="SKILZ is typing">
              <TypingDots />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatTypingIndicator() {
  return (
    <div className="animate-message-in flex gap-2.5">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SkilzMark className="size-5 text-[10px]" />
      </div>
      <div className="space-y-1">
        <p className="px-1 text-[11px] font-medium text-muted-foreground">SKILZ</p>
        <div className="rounded-2xl rounded-tl-md border border-border/60 bg-card px-4 py-3 shadow-sm">
          <TypingDots />
        </div>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary/70 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  )
}

interface ChatHeroMessageProps {
  content: string
  streaming?: boolean
}

/** Large centered card for voice-first mode. */
export function ChatHeroMessage({ content, streaming }: ChatHeroMessageProps) {
  return (
    <div className="animate-fade-up w-full max-w-md">
      <div className="rounded-3xl border border-primary/10 bg-gradient-to-b from-card to-card/80 p-6 text-center shadow-[0_8px_30px_-12px_rgba(88,60,180,0.25)]">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10">
          <SkilzMark className="size-6 text-sm" />
        </div>
        <p className="text-pretty text-base leading-relaxed text-foreground md:text-[17px]">
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
          )}
        </p>
      </div>
    </div>
  )
}
