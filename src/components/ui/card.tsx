import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { 
  size?: "default" | "sm"
  variant?: "default" | "elevated" | "outlined"
}) {
  return (
    <div
      role="region"
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-surface-container-lowest text-on-surface transition-all duration-200",
        "data-[size=sm]:gap-3 data-[size=sm]:p-3 sm:data-[size=sm]:p-4",
        "data-[variant=default]:border data-[variant=default]:border-outline-variant/50 data-[variant=default]:shadow-xs data-[variant=default]:p-4 sm:data-[variant=default]:p-6",
        "data-[variant=elevated]:border-0 data-[variant=elevated]:shadow-md data-[variant=elevated]:p-4 sm:data-[variant=elevated]:p-6",
        "data-[variant=outlined]:border data-[variant=outlined]:border-outline-variant data-[variant=outlined]:shadow-none data-[variant=outlined]:p-4 sm:data-[variant=outlined]:p-6",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header flex flex-col gap-1 sticky top-0",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="heading"
      data-slot="card-title"
      className={cn(
        "text-base font-display font-semibold tracking-tight text-on-background group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[13px] text-outline", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ml-auto", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 pt-3 border-t border-outline-variant/30 mt-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
