"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  const handle = (value: boolean) => {
    pending?.resolve(value);
    setPending(null);
  };

  const variantStyles = {
    danger: {
      icon: "text-destructive",
      iconBg: "bg-destructive/10",
      confirmClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    },
    warning: {
      icon: "text-warning",
      iconBg: "bg-warning/10",
      confirmClass: "bg-warning hover:bg-warning/90 text-warning-foreground",
    },
    info: {
      icon: "text-primary",
      iconBg: "bg-primary/10",
      confirmClass: "bg-primary hover:bg-primary/90 text-on-primary",
    },
  };

  const variant = pending?.variant ?? "danger";
  const styles = variantStyles[variant];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {pending && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => handle(false)}
            />
            <motion.div
              key="dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-message"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-sm"
            >
              <div className="premium-card rounded-xl p-6 space-y-5 mx-4">
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-2.5 ${styles.iconBg}`}>
                    <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    {pending.title && (
                      <h2 id="confirm-title" className="text-on-surface font-bold text-base">
                        {pending.title}
                      </h2>
                    )}
                    <p id="confirm-message" className="text-on-surface-variant text-sm leading-relaxed">
                      {pending.message}
                    </p>
                  </div>
                  <button
                    onClick={() => handle(false)}
                    aria-label="Cancelar"
                    className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => handle(false)}
                    className="text-on-surface-variant hover:bg-white/5"
                  >
                    {pending.cancelLabel ?? "Cancelar"}
                  </Button>
                  <Button
                    onClick={() => handle(true)}
                    className={`border ${styles.confirmClass}`}
                  >
                    {pending.confirmLabel ?? "Confirmar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx.confirm;
}
