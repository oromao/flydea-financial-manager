"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: ReactNode
  className?: string
  "aria-live"?: "off" | "polite" | "assertive"
  "aria-atomic"?: "true" | "false"
}

export function PageTransition({ children, className, ...aria }: PageTransitionProps) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return <div className={className} {...aria}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
      {...aria}
    >
      {children}
    </motion.div>
  )
}

export { useReducedMotion as usePrefersReducedMotion }
