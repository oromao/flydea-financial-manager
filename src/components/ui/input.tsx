import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-2 text-sm text-on-surface transition-all duration-200 outline-none placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:bg-surface-container disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Input }
