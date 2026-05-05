"use client"

import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

const animations = cva("animate-slide-up", {
  variants: {
    animation: {
      fade: "animate-fade-in",
      "slide-up": "animate-slide-up",
      "slide-down": "animate-slide-down",
      "scale-in": "animate-scale-in",
    },
    stagger: {
      none: "",
      1: "delay-[50ms]",
      2: "delay-[100ms]",
      3: "delay-[150ms]",
      4: "delay-[200ms]",
      5: "delay-[250ms]",
      6: "delay-[300ms]",
      7: "delay-[350ms]",
      8: "delay-[400ms]",
      9: "delay-[450ms]",
      10: "delay-[500ms]",
    },
  },
  defaultVariants: {
    animation: "slide-up",
    stagger: "none",
  },
})

function AnimatedList({
  children,
  className,
  staggerDelay = 0,
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
          className={cn("animate-slide-up", {
            ["delay-[" + ((index + 1) * staggerDelay) + "ms]"]: staggerDelay > 0,
          })}
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
        "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  )
}

export { animations, AnimatedList, AnimatedCard }