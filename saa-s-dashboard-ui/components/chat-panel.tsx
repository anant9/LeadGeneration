"use client"

import { useEffect, useRef } from "react"
import { useDashboard } from "@/lib/dashboard-context"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { TypingIndicator } from "@/components/typing-indicator"
import { BrainCircuit, Sparkles } from "lucide-react"

export function ChatPanel() {
  const { messages, isTyping } = useDashboard()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, isTyping])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="relative">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          AI Extraction Agent
        </h2>
        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          Online
        </span>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-primary/5 blur-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-foreground">
                AI Agent Ready
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Describe the businesses you want to extract in natural language.
                The agent will parse your intent and configure extraction automatically.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Try a query:
              </p>
              <div className="flex flex-col gap-1.5">
                {[
                  "Find top 200 restaurants in Manhattan with 4+ stars",
                  "Parking lots in downtown LA with 100+ reviews",
                  "Coffee shops in San Francisco with email addresses",
                  "Dentists in Chicago, scrape reviews and social profiles",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="group flex items-center gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-accent hover:text-foreground hover:shadow-sm hover:shadow-primary/5"
                    onClick={() => {
                      const event = new CustomEvent("suggestion-click", {
                        detail: suggestion,
                      })
                      window.dispatchEvent(event)
                    }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </div>

      <ChatInput />
    </div>
  )
}
