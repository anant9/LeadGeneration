"use client"

import { BrainCircuit } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BrainCircuit className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="px-1 text-[10px] font-medium text-primary/70">
          AI Agent
        </span>
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-muted px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            Analyzing query...
          </span>
        </div>
      </div>
    </div>
  )
}
