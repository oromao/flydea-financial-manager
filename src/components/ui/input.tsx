import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-outline/50 bg-surface px-4 py-2 text-base text-on-surface transition-all outline-none placeholder:text-on-surface-variant/40 focus:border-secondary focus:ring-4 focus:ring-secondary/5 md:text-sm disabled:opacity-50 disabled:bg-surface-variant",
        className
      )}
      {...props}
    />
  )
}

export { Input }
