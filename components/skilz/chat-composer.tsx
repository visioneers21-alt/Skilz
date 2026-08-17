"use client"

import { Mic, MicOff, Send, Volume2, VolumeX, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  hint?: string
  muted?: boolean
  onMuteToggle?: () => void
  showTranscript?: boolean
  onTranscriptToggle?: () => void
  listening?: boolean
  thinking?: boolean
  speaking?: boolean
  micDisabled?: boolean
  onMicToggle?: () => void
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your answer…",
  disabled = false,
  hint,
  muted = false,
  onMuteToggle,
  showTranscript = false,
  onTranscriptToggle,
  listening = false,
  thinking = false,
  speaking = false,
  micDisabled = false,
  onMicToggle,
}: ChatComposerProps) {
  return (
    <div className="space-y-2.5">
      {hint && (
        <p className="text-center text-xs text-muted-foreground">{hint}</p>
      )}

      <div className="flex items-center justify-center gap-2">
        {onMuteToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMuteToggle}
            aria-label={muted ? "Unmute SKILZ voice" : "Mute SKILZ voice"}
            className="size-10 rounded-full text-muted-foreground"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </Button>
        )}

        {onMicToggle && (
          <Button
            type="button"
            size="icon"
            onClick={onMicToggle}
            disabled={micDisabled}
            aria-label={
              listening
                ? "Stop and send"
                : speaking
                  ? "Interrupt and speak"
                  : "Start speaking"
            }
            className={cn(
              "size-14 rounded-full shadow-md transition-all",
              listening && "scale-105 bg-destructive text-destructive-foreground hover:bg-destructive/90",
              speaking && !listening && "ring-2 ring-primary/25",
            )}
          >
            {thinking ? (
              <Loader2 className="size-5 animate-spin" />
            ) : listening ? (
              <MicOff className="size-5" />
            ) : (
              <Mic className="size-5" />
            )}
          </Button>
        )}

        {onTranscriptToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onTranscriptToggle}
            aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
            className={cn(
              "size-10 rounded-full text-muted-foreground",
              showTranscript && "bg-accent text-accent-foreground",
            )}
          >
            <MessageSquare className="size-4" />
          </Button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card p-1.5 pl-4 shadow-sm"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              onSubmit()
            }
          }}
          placeholder={placeholder}
          aria-label="Type your answer"
          disabled={disabled}
          className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || disabled}
          className="size-10 shrink-0 rounded-xl"
          aria-label="Send answer"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
