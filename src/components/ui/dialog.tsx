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
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className="fixed inset-0 z-50 outline-none overflow-y-auto flex items-start sm:items-center justify-center"
        {...props}
      >
        <div
          className={cn(
            "relative flex flex-col w-full bg-background shadow-xl",
            "min-h-full sm:min-h-0 sm:max-w-lg sm:m-6 sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-border/10 sm:max-h-[85vh]",
            "animate-in fade-in duration-200 data-closed:animate-out data-closed:fade-out-0",
            "sm:data-open:animate-in sm:data-open:fade-in-0 sm:data-open:zoom-in-95 sm:data-open:slide-in-from-bottom-4",
            "sm:data-closed:animate-out sm:data-closed:fade-out-0 sm:data-closed:zoom-out-95",
            className
          )}
        >
          {showCloseButton && (
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 z-10 rounded-full min-h-10 min-w-10 h-8 w-8 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                />
              }
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain">
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
      className={cn("flex flex-col gap-1.5 px-5 pt-5 pb-3", className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 px-5 pb-5 sm:flex-row sm:justify-end pt-3 border-t border-border/5 shrink-0", className)}
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
      className={cn("text-sm text-on-surface-variant", className)}
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
