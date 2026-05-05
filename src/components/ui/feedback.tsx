"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedbackToastProps {
  type: "success" | "error"
  message: string
  show: boolean
  onClose: () => void
  duration?: number
}

export function FeedbackToast({
  type,
  message,
  show,
  onClose,
  duration = 3000,
}: FeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show && !isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        type === "success"
          ? "bg-success text-success-foreground"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {type === "success" ? (
        <Check className="h-4 w-4 animate-checkmark" />
      ) : (
        <X className="h-4 w-4 animate-shake" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

interface ValidationErrorProps {
  error: string
  show: boolean
  className?: string
}

export function ValidationError({ error, show, className }: ValidationErrorProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!isVisible) return null

  return (
    <p
      className={cn(
        "text-sm text-destructive animate-shake mt-1",
        className
      )}
    >
      {error}
    </p>
  )
}

interface SuccessBadgeProps {
  children: React.ReactNode
  isNew?: boolean
  className?: string
}

export function SuccessBadge({
  children,
  isNew = false,
  className,
}: SuccessBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success",
        isNew && "animate-pulse-once",
        className
      )}
    >
      {children}
    </span>
  )
}