"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const variantStyles = {
  danger: {
    icon: "text-destructive",
    iconBg: "bg-destructive/10",
    actionClass: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  },
  warning: {
    icon: "text-warning",
    iconBg: "bg-warning/10",
    actionClass: "bg-warning hover:bg-warning/90 text-warning-foreground",
  },
  info: {
    icon: "text-primary",
    iconBg: "bg-primary/10",
    actionClass: "",
  },
} as const;

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolveRef, setResolveRef] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setResolveRef(() => resolve);
      setOpen(true);
    });
  }, []);

  const handle = (value: boolean) => {
    resolveRef?.(value);
    setOpen(false);
    setOptions(null);
    setResolveRef(null);
  };

  const variant = options?.variant ?? "danger";
  const styles = variantStyles[variant];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={(v) => { if (!v) handle(false) }}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className={cn("rounded-2xl p-2.5 shrink-0", styles.iconBg)}>
                <AlertTriangle className={cn("w-5 h-5", styles.icon)} />
              </div>
              <div className="flex-1 space-y-1">
                {options?.title && (
                  <AlertDialogTitle>{options.title}</AlertDialogTitle>
                )}
                <AlertDialogDescription className="text-sm leading-relaxed">
                  {options?.message}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handle(false)}>
              {options?.cancelLabel ?? "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handle(true)}
              className={styles.actionClass}
            >
              {options?.confirmLabel ?? "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx.confirm;
}
