"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function AnimatedList({
  children,
  className,
  staggerDelay = 50,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const childArray = Array.isArray(children) ? children : [children]
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {childArray.map((child, index) => (
        <div
          key={index}
          className="animate-slide-up opacity-0 [animation-fill-mode:forwards]"
          style={{ animationDelay: `${(index + 1) * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

function AnimatedCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  )
}

export { AnimatedList, AnimatedCard }
