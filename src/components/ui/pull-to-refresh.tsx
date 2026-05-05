"use client"

import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

export function PullToRefresh({
  children,
  onRefresh,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useState(0)

  const handlePull = useCallback(async (diffY: number) => {
    if (diffY > 0) {
      setPullDistance(Math.min(diffY * 0.5, 80))
    }
  }, [])

  const handleRelease = useCallback(async () => {
    if (pullDistance >= 60) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  const pullProgress = Math.min(pullDistance / 60, 1)

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(e) => handlePull(e.clientY - (startY as unknown as number))}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
    >
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex h-16 items-center justify-center overflow-hidden transition-transform duration-300",
          pullDistance > 10 ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 text-primary",
            isRefreshing && "animate-spin",
            !isRefreshing && `opacity-${pullProgress}`
          )}
          style={{ opacity: isRefreshing ? 1 : pullProgress }}
        />
      </div>
      <div
        className={cn(
          "transition-transform duration-300",
          pullDistance > 0 && `translate-y-${Math.min(pullDistance, 20)}px`
        )}
        style={{
          transform: `translateY(${Math.min(pullDistance, 20)}px)`,
        }}
      >
        {children}
      </div>
      
      {pullDistance > 10 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-primary transition-all duration-300"
          style={{ width: `${pullProgress * 100}%` }}
        />
      )}
    </div>
  )
}