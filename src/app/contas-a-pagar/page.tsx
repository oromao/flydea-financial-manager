"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isBefore, isAfter, addDays } from "date-fns";
import { AlertTriangle, CheckCircle2, Clock3, ArrowUpRight, BadgeDollarSign, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ContasAPagar() {
  const toast = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "overdue" | "upcoming" | "nodate">("all");
  const [partialAmounts, setPartialAmounts] = useState<Record<string, string>>({});

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        all: "true",
        paymentStatus: "PENDING",
      });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(Array.isArray(data.data) ? data.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updatePaymentStatus = async (id: string, nextStatus: "PAID" | "PENDING") => {
    const now = new Date().toISOString().split("T")[0];
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: nextStatus,
          paidAt: nextStatus === "PAID" ? now : "",
        }),
      });
      if (nextStatus === "PAID") {
        toast.undo("Conta marcada como paga", async () => {
          await fetch(`/api/transactions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "PENDING", paidAt: "" }),
          });
          fetchTransactions();
        });
      } else {
        toast.success("Conta marcada como pendente");
      }
      fetchTransactions();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao atualizar status");
    }
  };

  const applyPartial = async (id: string) => {
    const raw = partialAmounts[id] || "";
    const amount = Number(raw);
    if (!Number.isFinite(amount) || amount <= 0) return;
    await fetch("/api/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId: id, amount }),
    });
    setPartialAmounts((current) => ({ ...current, [id]: "" }));
    fetchTransactions();
  };

  const now = new Date();
  const dueSoon = useMemo(() => addDays(now, 7), [now]);

  const overdue = transactions.filter((t) => t.dueDate && isBefore(new Date(t.dueDate), now));
  const upcoming = transactions.filter((t) => t.dueDate && !isBefore(new Date(t.dueDate), now) && !isAfter(new Date(t.dueDate), dueSoon));
  const noDate = transactions.filter((t) => !t.dueDate);

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const paidPartial = transactions.reduce((sum, t) => sum + (t.amountPaid || 0), 0);
  const overdueTotal = overdue.reduce((sum, t) => sum + t.amount, 0);
  const upcomingTotal = upcoming.reduce((sum, t) => sum + t.amount, 0);
  const filteredOverdue = overdue.filter((t) => `${t.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredUpcoming = upcoming.filter((t) => `${t.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredNoDate = noDate.filter((t) => `${t.description}`.toLowerCase().includes(query.trim().toLowerCase()));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 md:pb-0 px-4 md:px-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-secondary text-on-secondary">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-background">Contas a pagar</h1>
              <p className="text-on-surface-variant text-sm mt-1">Suas pendências do momento</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por descrição"
            className="h-11 rounded-xl"
          />
          <Button onClick={fetchTransactions} variant="outline" className="h-10 rounded-xl">Atualizar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setFilter("all")} variant={filter === "all" ? "default" : "outline"} className="h-10 rounded-xl">Todas</Button>
          <Button onClick={() => setFilter("overdue")} variant={filter === "overdue" ? "default" : "outline"} className="h-10 rounded-xl">Atrasadas</Button>
          <Button onClick={() => setFilter("upcoming")} variant={filter === "upcoming" ? "default" : "outline"} className="h-10 rounded-xl">7 dias</Button>
          <Button onClick={() => setFilter("nodate")} variant={filter === "nodate" ? "default" : "outline"} className="h-10 rounded-xl">Sem data</Button>
        </div>
      </motion.header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="premium-card p-4 sm:p-5 min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Total pendente</p>
          <p className="text-2xl font-bold mt-2 truncate">{formatCurrency(total)}</p>
          <p className="text-xs text-on-surface-variant mt-1">Inclui despesas e receitas pendentes</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5 border-amber-100 bg-amber-50/20 min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700">Despesas pendentes</p>
          <p className="text-2xl font-bold mt-2 text-amber-700 truncate">{formatCurrency(transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0))}</p>
          <p className="text-xs text-on-surface-variant mt-1">Somente despesas</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5 border-red-100 bg-red-50/20 min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-bold text-red-700">Atrasadas</p>
          <p className="text-2xl font-bold mt-2 text-red-700 truncate">{formatCurrency(overdueTotal)}</p>
        </Card>
        <Card className="premium-card p-5 border-amber-100 bg-amber-50/20 min-w-0 overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700">Vencem em 7 dias</p>
          <p className="text-2xl font-bold mt-2 text-amber-700 truncate">{formatCurrency(upcomingTotal)}</p>
        </Card>
      </div>

      <div className="grid gap-4">
        {/* Atrasadas — only show when filter is "all" or "overdue" */}
        {(filter === "all" || filter === "overdue") && (
        <Card className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="w-4 h-4 text-red-600" />
            <h2 className="font-bold text-lg">Atrasadas</h2>
          </div>
          {loading ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Carregando...</div>
          ) : filteredOverdue.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Sem atrasos.</div>
          ) : (
            <div className="space-y-3">
              {filteredOverdue.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-red-100 bg-red-50/20">
                  <div className="min-w-0">
                    <div className="font-semibold text-on-background truncate">{t.description}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Venceu em {format(new Date(t.dueDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold">{formatCurrency(t.amount)}</span>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="rounded-xl" onClick={() => updatePaymentStatus(t.id, "PAID")}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar paga
                      </Button>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={partialAmounts[t.id] || ""}
                          onChange={(e) => setPartialAmounts((current) => ({ ...current, [t.id]: e.target.value }))}
                          placeholder="Baixa parcial"
                          aria-label="Valor da baixa parcial"
                          className="h-9 w-32 rounded-xl border border-outline/30 bg-surface px-3 text-xs"
                        />
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => applyPartial(t.id)}>
                          Parcial
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}

        {/* Vencem em breve — only show when filter is "all" or "upcoming" */}
        {(filter === "all" || filter === "upcoming") && (
        <Card className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-lg">Vencem em breve</h2>
          </div>
          {loading ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Carregando...</div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Nada vencendo nos próximos 7 dias.</div>
          ) : (
            <div className="space-y-3">
              {filteredUpcoming.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-100 bg-amber-50/20">
                  <div className="min-w-0">
                    <div className="font-semibold text-on-background truncate">{t.description}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-2 mt-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Vence em {format(new Date(t.dueDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold">{formatCurrency(t.amount)}</span>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => updatePaymentStatus(t.id, "PAID")}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={partialAmounts[t.id] || ""}
                          onChange={(e) => setPartialAmounts((current) => ({ ...current, [t.id]: e.target.value }))}
                          placeholder="Baixa parcial"
                          aria-label="Valor da baixa parcial"
                          className="h-9 w-32 rounded-xl border border-outline/30 bg-surface px-3 text-xs"
                        />
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => applyPartial(t.id)}>
                          Parcial
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}

        {/* Sem vencimento — only show when filter is "all" or "nodate" */}
        {(filter === "all" || filter === "nodate") && (
        <Card className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-lg">Sem vencimento definido</h2>
          </div>
          {loading ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Carregando...</div>
          ) : filteredNoDate.length === 0 ? (
            <div className="py-10 text-center text-on-surface-variant/40 text-sm">Nenhuma pendência sem vencimento.</div>
          ) : (
            <div className="space-y-3">
              {filteredNoDate.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-outline/10 bg-surface">
                  <div className="min-w-0">
                    <div className="font-semibold text-on-background truncate">{t.description}</div>
                    <div className="text-xs text-on-surface-variant mt-1">Sem data de vencimento</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold">{formatCurrency(t.amount)}</span>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="rounded-xl" onClick={() => updatePaymentStatus(t.id, "PAID")}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={partialAmounts[t.id] || ""}
                          onChange={(e) => setPartialAmounts((current) => ({ ...current, [t.id]: e.target.value }))}
                          placeholder="Baixa parcial"
                          aria-label="Valor da baixa parcial"
                          className="h-9 w-32 rounded-xl border border-outline/30 bg-surface px-3 text-xs"
                        />
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => applyPartial(t.id)}>
                          Parcial
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        )}
      </div>
    </div>
  );
}
