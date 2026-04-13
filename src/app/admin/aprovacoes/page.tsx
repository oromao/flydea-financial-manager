"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

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
  const { data: session, status } = useSession();
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/approvals");
      if (!res.ok) throw new Error("Erro ao carregar aprovações");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Não foi possível carregar as aprovações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handle = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    const ok = await confirm({
      title: action === "APPROVE" ? "Aprovar ação" : "Rejeitar ação",
      message: action === "APPROVE"
        ? "Tem certeza que deseja aprovar esta ação? Ela será executada imediatamente."
        : "Tem certeza que deseja rejeitar esta ação? Ela será cancelada.",
      confirmLabel: action === "APPROVE" ? "Aprovar" : "Rejeitar",
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
      if (!res.ok) throw new Error("Erro ao processar aprovação");
      toast.success(action === "APPROVE" ? "Ação aprovada com sucesso" : "Ação rejeitada");
      load();
    } catch (e) {
      toast.error("Não foi possível processar a ação. Tente novamente.");
    } finally {
      setActionLoading(null);
    }
  };

  // Admin guard (A-05)
  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <Card className="premium-card p-8">
          <h1 className="text-2xl font-bold text-on-background">Acesso restrito</h1>
          <p className="text-on-surface-variant mt-2">Esta área é reservada para usuários administradores.</p>
        </Card>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-0 px-4 md:px-0">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-background">Aprovações</h1>
          <p className="text-on-surface-variant font-medium mt-1">Fila de ações críticas pendentes.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
          <span className="ml-3 text-on-surface-variant text-sm">Carregando aprovações...</span>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Sem aprovações pendentes"
          description="Todas as ações foram processadas. Tudo em ordem!"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="premium-card">
              <CardContent className="p-4 sm:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{item.entity}</span>
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">{item.action}</span>
                    <span className="rounded-full bg-surface-variant px-2 py-0.5 text-xs font-semibold text-on-surface-variant">{item.status}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant/60 mt-1 truncate">{item.reason || item.entityId}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-on-surface-variant/50">{item.requestedBy?.name || item.requestedBy?.email || "Usuário"}</p>
                    <p className="text-xs text-on-surface-variant/40">
                      {format(new Date(item.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => handle(item.id, "APPROVE")}
                    disabled={actionLoading === item.id}
                    aria-label={`Aprovar ação em ${item.entity}`}
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handle(item.id, "REJECT")}
                    disabled={actionLoading === item.id}
                    aria-label={`Rejeitar ação em ${item.entity}`}
                  >
                    {actionLoading === item.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
