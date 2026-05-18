import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ripple",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:brightness-110 shadow-sm",
        outline:
          "border-border bg-background text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        secondary:
          "bg-secondary text-on-secondary hover:opacity-90",
        ghost:
          "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "max-md:min-h-[44px] h-11 md:h-10 gap-1.5 px-5",
        xs: "max-md:min-h-[44px] h-8 md:h-7 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "max-md:min-h-[44px] h-10 md:h-9 gap-1 px-4 text-[0.8rem]",
        lg: "max-md:min-h-[44px] h-13 md:h-12 gap-1.5 px-7 text-base",
        icon: "max-md:min-h-[44px] max-md:min-w-[44px] size-10 md:size-10",
        "icon-sm": "max-md:min-h-[44px] max-md:min-w-[44px] size-9 md:size-9",
        "icon-lg": "max-md:min-h-[44px] max-md:min-w-[44px] size-12 md:size-12",
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
