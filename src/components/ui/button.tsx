"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary/95 shadow-sm",
        outline:
          "border-outline bg-surface text-on-surface hover:bg-surface-variant",
        secondary:
          "bg-secondary text-on-secondary hover:bg-secondary/95 shadow-sm",
        ghost:
          "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface",
        destructive:
          "bg-red-500/10 text-red-600 hover:bg-red-500/20",
        link: "text-secondary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 gap-2",
        xs: "h-7 px-3 text-xs gap-1.5",
        sm: "h-8.5 px-4 text-[0.85rem] gap-2",
        lg: "h-12 px-8 text-base gap-2.5",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8.5",
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
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
