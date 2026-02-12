"use client"

import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/lib/types"
import { FilterCard } from "@/components/filter-card"
import { BrainCircuit, User } from "lucide-react"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <BrainCircuit className="h-4 w-4" />
        )}
      </div>

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {!isUser && (
          <span className="px-1 text-[10px] font-medium text-primary/70">
            AI Agent
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md bg-primary text-primary-foreground"
              : "rounded-tl-md bg-muted text-foreground"
          )}
        >
          {message.content}
        </div>

        {message.filterCard && <FilterCard filter={message.filterCard} />}

        <span className="px-1 text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}
