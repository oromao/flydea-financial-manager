"use client";

import { useEffect, useState } from "react";
import { Bell, X, AlertCircle, CheckCircle, Info, TriangleAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface InAppNotificationsProps {
  notifications?: Notification[];
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

const colorMap = {
  success: "text-success bg-success/10 border-success/20",
  error: "text-destructive bg-destructive/10 border-destructive/20",
  warning: "text-warning bg-warning/10 border-warning/20",
  info: "text-primary bg-primary/10 border-primary/20",
};

export function InAppNotifications({ notifications = [] }: InAppNotificationsProps) {
  const [visible, setVisible] = useState<Notification[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(notifications), 0);
    
    notifications.forEach((n) => {
      if (n.duration !== 0) {
        const duration = n.duration || 5000;
        setTimeout(() => {
          setVisible((prev) => prev.filter((v) => v.id !== n.id));
        }, duration);
      }
    });

    return () => clearTimeout(timer);
  }, [notifications]);

  const dismiss = (id: string) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm space-y-2">
      <AnimatePresence>
        {visible.map((n) => {
          const Icon = iconMap[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border shadow-lg",
                colorMap[n.type]
              )}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-on-background">{n.title}</p>
                {n.message && (
                  <p className="text-xs text-on-surface-variant mt-1">{n.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(n.id)}
                aria-label="Dispensar notificação"
                className="shrink-0 p-1 rounded hover:bg-muted/5"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function NotificationBell({ count }: { count: number }) {
  return (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  );
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = (type: NotificationType, title: string, message?: string, duration = 5000) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, add, remove };
}