"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

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

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SwipeableContent({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 150], [1, 0]);
  const [isAtTop, setIsAtTop] = React.useState(true);

  const handleDragEnd = React.useCallback((_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const shouldClose = info.offset.y > 100 || info.velocity.y > 500;
    if (shouldClose) {
      animate(y, 300, { type: "spring", stiffness: 300, damping: 30, onComplete: onClose });
    } else {
      animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }, [y, onClose]);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setIsAtTop(e.currentTarget.scrollTop <= 10);
  }, []);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      style={{ y, touchAction: "none", userSelect: "none" as any }}
      onDragEnd={handleDragEnd}
      onScroll={handleScroll}
      className="h-full overflow-y-auto"
    >
      {/* Swipe indicator */}
      <div className={cn(
        "sticky top-0 z-20 flex justify-center py-2 bg-popover sm:hidden pointer-events-none",
        !isAtTop && "opacity-0"
      )}>
        <div className="w-10 h-1 rounded-full bg-on-surface-variant/30" />
      </div>
      {children}
    </motion.div>
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    if (first) {
      first.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        const items = Array.from(
          el.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstItem) {
            e.preventDefault();
            lastItem.focus();
          }
        } else {
          if (document.activeElement === lastItem) {
            e.preventDefault();
            firstItem.focus();
          }
        }
      }
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        ref={contentRef}
        data-slot="dialog-content"
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 grid w-full bg-popover text-sm text-popover-foreground outline-none shadow-2xl transition-colors duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          // Mobile: Full screen with overflow-y-auto
          "bottom-0 left-0 h-[100dvh] rounded-none",
          // Desktop: Centered floating modal
          "sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl sm:p-6 sm:ring-1 sm:ring-foreground/5",
          className
        )}
        {...props}
      >
        {/* Swipeable wrapper for mobile */}
        <div className="sm:hidden h-full">
          <SwipeableContent onClose={() => {
            const closeButton = contentRef.current?.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement;
            closeButton?.click();
          }}>
            {/* Mobile sticky header — close button always visible */}
            {showCloseButton && (
              <div className="sticky top-0 z-10 flex items-center justify-end px-4 pt-3 pb-2 bg-popover">
                <DialogPrimitive.Close
                  render={
                    <Button
                      variant="ghost"
                      className="rounded-full w-11 h-11 p-0 min-w-[44px] min-h-[44px]"
                    />
                  }
                >
                  <XIcon />
                  <span className="sr-only">Fechar</span>
                </DialogPrimitive.Close>
              </div>
            )}
            <div className={cn("p-5", className)}>
              {children}
            </div>
          </SwipeableContent>
        </div>

        {/* Desktop: no swipe wrapper */}
        <div className="hidden sm:block">
          {/* Mobile sticky header — close button always visible */}
          {showCloseButton && (
            <div className="sticky top-0 z-10 flex items-center justify-end px-4 pt-3 pb-2 bg-popover sm:hidden">
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    className="rounded-full w-11 h-11 p-0 min-w-[44px] min-h-[44px]"
                  />
                }
              >
                <XIcon />
                <span className="sr-only">Fechar</span>
              </DialogPrimitive.Close>
            </div>
          )}
          <div className={cn("p-5 sm:p-0", className)}>
            {children}
          </div>
          {/* Desktop close button */}
          {showCloseButton && (
            <DialogPrimitive.Close
              className="hidden sm:block"
              render={
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full w-8 h-8 p-0"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-surface-variant/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
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
