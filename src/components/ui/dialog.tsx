"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-background/80 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SwipeableContent({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])
  const [isAtTop, setIsAtTop] = React.useState(true)

  const handleDragEnd = React.useCallback((_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    if (info.offset.y > 100 || info.velocity.y > 500) onClose()
  }, [onClose])

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      onUpdate={(latest) => {
        const yVal = typeof latest === "object" && latest !== null && "y" in latest ? (latest as { y: number }).y : 0
        setIsAtTop(yVal <= 0)
      }}
      style={{ y, opacity }}
      className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className={cn(
          "w-8 h-1 rounded-full transition-colors",
          isAtTop ? "bg-border" : "bg-muted-foreground/30"
        )} />
      </div>
      {children}
    </motion.div>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onClose: externalOnClose,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  onClose?: () => void
}) {
  const handleClose = () => {
    externalOnClose?.()
  }

  return (
    <DialogPortal>
      <DialogOverlay />
      {/* Mobile: Bottom Sheet */}
      <SwipeableContent onClose={handleClose}>
        <div className={cn(
          "bg-background rounded-t-3xl shadow-2xl overflow-hidden",
          className
        )}>
          {showCloseButton && (
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 sm:hidden rounded-full"
                />
              }
            >
              <XIcon className="w-5 h-5" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}
          {children}
        </div>
      </SwipeableContent>
      {/* Desktop: Centered modal */}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-3xl bg-background p-6 text-sm shadow-2xl ring-1 ring-border/20 duration-200 outline-none hidden sm:grid sm:max-w-lg data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 hidden sm:flex rounded-full"
              />
            }
          >
            <XIcon className="w-5 h-5" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left px-6 pt-6 sm:px-0 sm:pt-0", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:justify-end sm:px-0 sm:pb-0", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
