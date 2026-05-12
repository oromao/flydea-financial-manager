"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, AlertCircle, Clock3 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

type Approval = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  requestedBy?: { name?: string | null; email?: string | null };
};

export default function AprovacoesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Não foi possível carregar as aprovações");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const handle = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    const ok = await confirm({
      title: action === "APPROVE" ? "Aprovar Ação" : "Rejeitar Ação",
      message: action === "APPROVE"
        ? "Esta ação será executada permanentemente. Deseja continuar?"
        : "Esta solicitação será descartada. Deseja continuar?",
      confirmLabel: action === "APPROVE" ? "Sim, Aprovar" : "Sim, Rejeitar",
      variant: action === "APPROVE" ? "warning" : "danger",
    });
    if (!ok) return;

    setActionLoading(approvalId);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalId, action }),
      });
      if (!res.ok) throw new Error("Erro no servidor");
      toast.success(action === "APPROVE" ? "Ação aprovada!" : "Ação rejeitada.");
      load();
    } catch (e) {
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setActionLoading(null);
    }
  };

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <PageErrorBoundary>
      <div className="max-w-3xl mx-auto py-32 px-4">
        <Card className="premium-card p-12 text-center border-none shadow-2xl">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-black text-on-background tracking-tight">Acesso Restrito</h1>
          <p className="text-on-surface-variant/70 mt-3 max-w-sm mx-auto">Esta área é exclusiva para administradores do sistema.</p>
          <Button onClick={() => router.push("/")} className="mt-8 apple-button-outline px-8 rounded-xl font-bold">Voltar ao Início</Button>
        </Card>
      </div>
    </PageErrorBoundary>
    );
  }

  if (status === "loading") {
    return (
      <PageErrorBoundary>
      <div className="flex flex-col items-center justify-center py-48 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-secondary/30" />
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Autenticando...</p>
      </div>
    </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary>
    <div className="space-y-10 max-w-6xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      <div className="flex items-center gap-5">
        <div className="p-3.5 rounded-2xl bg-primary text-on-primary shadow-xl shadow-primary/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">Aprovações</h1>
          <p className="text-on-surface-variant font-medium text-sm mt-1">Gestão de segurança e ações críticas</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-secondary/20" />
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Sincronizando fila...</span>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Fila limpa!"
          description="Não existem ações pendentes de aprovação no momento."
        />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="premium-card border-none shadow-lg overflow-hidden bg-surface group hover:shadow-xl transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-stretch">
                      <div className="w-1.5 bg-secondary group-hover:bg-primary transition-colors shrink-0" />
                      
                      <div className="p-6 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-black text-sm text-on-background uppercase tracking-tight">{item.entity}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary/5 text-secondary text-[9px] font-black uppercase tracking-widest border border-secondary/10">{item.action}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant/60 text-[9px] font-black uppercase tracking-widest border border-outline/5">{item.status}</span>
                        </div>
                        
                        <div className="mt-4 flex items-start gap-3 bg-surface-variant/30 p-3 rounded-xl border border-outline/5">
                           <AlertCircle className="w-4 h-4 text-on-surface-variant/40 mt-0.5 shrink-0" />
                           <p className="text-sm font-medium text-on-surface-variant leading-relaxed truncate">{item.reason || item.entityId}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant/60 uppercase">
                               {item.requestedBy?.name?.[0] || 'U'}
                             </div>
                             <p className="text-[11px] font-bold text-on-surface-variant/70">{item.requestedBy?.name || item.requestedBy?.email || "Usuário"}</p>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-outline/30" />
                          <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                             <Clock3 className="w-3.5 h-3.5" />
                             <p className="text-[10px] font-bold uppercase tracking-wider">
                               {format(new Date(item.createdAt), "dd MMM, HH:mm", { locale: ptBR })}
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-surface-variant/10 md:w-[220px] flex md:flex-col items-center justify-center gap-3 border-l border-outline/5">
                        <Button
                          onClick={() => handle(item.id, "APPROVE")}
                          disabled={!!actionLoading}
                          className="w-full h-11 rounded-xl bg-success hover:bg-success/90 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-success/20"
                        >
                          {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Aprovar
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handle(item.id, "REJECT")}
                          disabled={!!actionLoading}
                          className="w-full h-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-black text-[11px] uppercase tracking-widest transition-all"
                        >
                          {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
    </PageErrorBoundary>
  );
}
