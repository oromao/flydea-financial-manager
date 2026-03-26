"use client";

import { useEffect, useRef, useState, createContext, useContext, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "undo";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onUndo?: () => void;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, options?: { duration?: number; onUndo?: () => void }) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  undo: (message: string, onUndo: () => void, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastType = "info", options?: { duration?: number; onUndo?: () => void }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type, ...options }]);
      const duration = options?.duration ?? (type === "undo" ? 5000 : 3500);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    show,
    success: (msg) => show(msg, "success"),
    error: (msg) => show(msg, "error"),
    info: (msg) => show(msg, "info"),
    undo: (msg, onUndo, duration = 5000) => show(msg, "undo", { onUndo, duration }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notificações"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 items-center pointer-events-none w-full max-w-sm px-4"
      >
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const duration = toast.duration ?? (toast.type === "undo" ? 5000 : 3500);
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
    undo: <Trash2 className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  const barColors = {
    success: "bg-emerald-400",
    error: "bg-rose-400",
    info: "bg-blue-400",
    undo: "bg-amber-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      role="status"
      className="pointer-events-auto w-full glass-card rounded-2xl overflow-hidden border-white/10"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {icons[toast.type]}
        <span className="flex-1 text-sm text-on-surface font-medium">{toast.message}</span>
        {toast.type === "undo" && toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo!();
              onDismiss(toast.id);
            }}
            className="text-amber-400 text-xs font-bold uppercase tracking-wider hover:text-amber-300 transition-colors px-2 py-1 rounded-lg hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Desfazer
          </button>
        )}
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Fechar notificação"
          className="text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-0.5 bg-white/5">
        <div
          className={`h-full transition-none ${barColors[toast.type]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
