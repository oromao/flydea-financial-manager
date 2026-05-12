"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
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
        "fixed inset-0 isolate z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
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
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-background sm:bg-transparent sm:items-center sm:justify-center outline-none",
          className
        )}
        {...props}
      >
        {/* Mobile: full screen container */}
        <div className="flex flex-col flex-1 sm:flex-none sm:w-full sm:max-w-lg sm:max-h-[85vh] bg-background sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-border/10 overflow-hidden animate-in fade-in duration-200 sm:data-open:animate-in sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-8 sm:data-closed:animate-out sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-8">
          {/* Header with drag handle + close */}
          <div className="relative flex items-center justify-center border-b border-border/5 min-h-[52px] shrink-0">
            <div className="absolute left-0 top-0 bottom-0 flex items-center sm:hidden">
              <div className="flex justify-center items-center w-12 h-full">
                <div className="w-8 h-1 rounded-full bg-border/40" />
              </div>
            </div>
            {showCloseButton && (
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 hover:bg-muted/60"
                  />
                }
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Fechar</span>
              </DialogPrimitive.Close>
            )}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            {children}
          </div>
        </div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 px-5 pt-5 sm:pt-0 sm:px-0 pb-3", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end sm:px-0 sm:pb-0 pt-3 border-t border-border/5 shrink-0", className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-xl font-bold tracking-tight", className)}
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
