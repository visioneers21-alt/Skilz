"use client"

import { useState } from "react"
import { Check, Copy, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { SkilzMark } from "@/components/skilz/logo"
import { Button } from "@/components/ui/button"

export type ChatRole = "user" | "assistant"

interface ChatMessageProps {
  role: ChatRole
  content: string
  userInitial?: string
  streaming?: boolean
  className?: string
  onCopy?: () => void
  onEdit?: () => void
}

export function ChatMessage({
  role,
  content,
  userInitial = "Y",
  streaming = false,
  className,
  onCopy,
  onEdit,
}: ChatMessageProps) {
  const isUser = role === "user"
  const showActions = !streaming && content.trim().length > 0

  return (
    <div
      className={cn(
        "group animate-message-in flex gap-2.5",
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
        <div
          className={cn(
            "flex items-center gap-2 px-1",
            isUser ? "flex-row-reverse" : "flex-row",
          )}
        >
          <p className="text-[11px] font-medium text-muted-foreground">
            {isUser ? "You" : "SKILZ"}
          </p>
          {showActions && (onCopy || onEdit) && (
            <MessageActions onCopy={onCopy} onEdit={onEdit} isUser={isUser} />
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md border border-border/60 bg-card text-foreground",
          )}
        >
          <p className="select-text text-pretty whitespace-pre-wrap">{content}</p>
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
  onCopy?: () => void
}

/** Large centered card for voice-first mode. */
export function ChatHeroMessage({ content, streaming, onCopy }: ChatHeroMessageProps) {
  return (
    <div className="animate-fade-up w-full max-w-md">
      <div className="rounded-3xl border border-primary/10 bg-gradient-to-b from-card to-card/80 p-6 text-center shadow-[0_8px_30px_-12px_rgba(88,60,180,0.25)]">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-2xl bg-primary/10">
          <SkilzMark className="size-6 text-sm" />
        </div>
        {onCopy && content.trim() && !streaming && (
          <div className="mb-3 flex justify-center">
            <CopyButton onCopy={onCopy} />
          </div>
        )}
        <p className="select-text text-pretty text-base leading-relaxed text-foreground md:text-[17px]">
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
          )}
        </p>
      </div>
    </div>
  )
}

function MessageActions({
  onCopy,
  onEdit,
  isUser,
}: {
  onCopy?: () => void
  onEdit?: () => void
  isUser: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
        isUser && "flex-row-reverse",
      )}
    >
      {onCopy && <CopyButton onCopy={onCopy} compact />}
      {onEdit && isUser && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Edit message"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

function CopyButton({ onCopy, compact = false }: { onCopy: () => void | Promise<void>; compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await onCopy()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full text-muted-foreground hover:text-foreground",
        compact ? "size-7" : "size-8",
      )}
      aria-label={copied ? "Copied" : "Copy message"}
      onClick={() => void handleCopy()}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  )
}
