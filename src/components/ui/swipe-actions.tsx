"use client"

import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SwipeAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
}

interface SwipeActionsProps {
  children: React.ReactNode
  actions: SwipeAction[]
  className?: string
}

export function SwipeActions({
  children,
  actions,
  className,
}: SwipeActionsProps) {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  )
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const diff = startX.current - currentX

    if (Math.abs(diff) > 50) {
      setSwipeDirection(diff > 0 ? "left" : "right")
      setIsSwipeOpen(true)
    } else {
      setSwipeDirection(null)
      setIsSwipeOpen(false)
    }
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsSwipeOpen(false)
      setSwipeDirection(null)
    }, 3000)
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    setIsSwipeOpen(false)
    setSwipeDirection(null)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden touch-pan-y",
        isSwipeOpen && "touch-none",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "flex transition-transform duration-200",
          isSwipeOpen && swipeDirection === "left"
            ? "-translate-x-[80px]"
            : isSwipeOpen && swipeDirection === "right"
              ? "translate-x-[80px]"
              : "translate-x-0"
        )}
      >
        <div className="flex shrink-0 gap-1">
          {actions.map((action, index) => (
            <Button
              key={index}
              size="icon-sm"
              variant={action.variant === "destructive" ? "destructive" : "secondary"}
              onClick={() => handleActionClick(action)}
              className="h-10 w-10"
            >
              {action.icon}
            </Button>
          ))}
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}