"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "gradient-primary text-on-primary shadow-sm hover:brightness-110 hover:shadow-md",
        outline:
          "border-outline-variant bg-transparent text-on-surface hover:bg-surface-container hover:border-outline",
        secondary:
          "bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high",
        ghost:
          "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        destructive:
          "bg-error/5 text-error border-error/10 hover:bg-error/10",
        success:
          "bg-success/5 text-success border-success/10 hover:bg-success/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 gap-2",
        xs: "h-8 px-2.5 text-xs gap-1.5 rounded-md",
        sm: "h-9 px-3.5 text-[13px] gap-1.5",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
