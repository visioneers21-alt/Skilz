"use client"

import { useSkilz } from "@/lib/data/store"
import { DiscoverySession } from "./discovery-session"
import { Loader2 } from "lucide-react"

export default function DiscoverPage() {
  const { hydrated } = useSkilz()

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <DiscoverySession />
}
