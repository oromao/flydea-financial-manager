"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, MailWarning, Info, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/page-skeleton";
import { safeFormatDate } from "@/lib/date-utils";

interface AlertNotification {
  id: string;
  read: boolean;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export default function Alertas() {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string, read: boolean) => {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
  };

  const remove = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });
    await load();
  };

  const clearRead = async () => {
    await Promise.all(notifications.filter((n) => n.read).map((n) => remove(n.id)));
    await load();
  };

  const icon = (type: string) => {
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-warning" />;
    if (type === "error") return <MailWarning className="w-4 h-4 text-destructive" />;
    return <Info className="w-4 h-4 text-secondary" />;
  };

  const filteredNotifications = notifications.filter((n) => {
    const text = `${n.title} ${n.message}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesFilter =
      filter === "all" ? true : filter === "read" ? n.read : !n.read;
    return matchesQuery && matchesFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  if (loading) {
    return (
      <PageErrorBoundary>
        <div className="space-y-6 p-6">
          <PageHeaderSkeleton />
          <TableSkeleton rows={5} />
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary>
    <div className="space-y-8 max-w-5xl mx-auto pb-20 md:pb-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <PageHeader icon={Bell} title="Alertas" subtitle="Notificações in-app do sistema" iconClassName="bg-secondary text-on-secondary shadow-secondary/20" />
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar alertas"
            aria-label="Buscar alertas"
            className="h-11 rounded-xl"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setFilter("all")} variant={filter === "all" ? "default" : "outline"} className="h-11 rounded-xl">Todos ({notifications.length})</Button>
            <Button onClick={() => setFilter("unread")} variant={filter === "unread" ? "default" : "outline"} className="h-11 rounded-xl">Não lidos ({unreadCount})</Button>
            <Button onClick={() => setFilter("read")} variant={filter === "read" ? "default" : "outline"} className="h-11 rounded-xl">Lidos ({readCount})</Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={markAllRead} variant="outline" className="max-md:min-h-[44px] h-10 rounded-xl">Marcar todas lidas</Button>
          <Button onClick={clearRead} variant="outline" className="max-md:min-h-[44px] h-10 rounded-xl">Limpar lidas</Button>
          <Button onClick={load} variant="outline" className="max-md:min-h-[44px] h-10 rounded-xl">Atualizar</Button>
        </div>
      </motion.header>

      <Card className="premium-card p-4 sm:p-6">
        {filteredNotifications.length === 0 ? (
          <div role="status" className="py-10 text-center text-on-surface-variant/40">Sem alertas.</div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => (
              <div key={n.id} className={cn("flex items-start justify-between gap-4 p-4 rounded-xl border", n.read ? "bg-surface border-outline/10" : "bg-secondary/5 border-secondary/20")}>
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{icon(n.type)}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-on-background">{n.title}</div>
                    <div className="text-sm text-on-surface-variant mt-1">{n.message}</div>
                    <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mt-2">{n.createdAt ? safeFormatDate(n.createdAt, "dd/MM/yyyy") : "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && (
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={async () => { await markRead(n.id, true); await load(); }}>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Ler
                    </Button>
                  )}
                  <Button aria-label="Excluir alerta" variant="ghost" size="icon" className="rounded-xl" onClick={async () => { await remove(n.id); await load(); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </PageErrorBoundary>
  );
}
