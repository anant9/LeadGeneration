"use client"

import React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useDashboard } from "@/lib/dashboard-context"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

const MAX_CHARS = 500

export function ChatInput() {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, isTyping, extraction } = useDashboard()
  const isDisabled = isTyping || extraction.status === "loading"

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as string
      if (detail && !isDisabled) {
        sendMessage(detail)
      }
    }
    window.addEventListener("suggestion-click", handler)
    return () => window.removeEventListener("suggestion-click", handler)
  }, [isDisabled, sendMessage])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    sendMessage(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [value, isDisabled, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARS) {
      setValue(newValue)
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className="border-t border-border/50 bg-background/80 p-4 backdrop-blur-sm">
      <div className="flex items-end gap-2 rounded-xl border border-border/70 bg-card p-2 transition-colors focus-within:border-primary/40">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={
            isDisabled
              ? "Please wait..."
              : "Describe what businesses you want to find..."
          }
          disabled={isDisabled}
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Chat message input"
        />
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {value.length}/{MAX_CHARS}
          </span>
          <Button
            size="icon"
            className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            onClick={handleSubmit}
            disabled={!value.trim() || isDisabled}
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
