"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isBefore, isAfter, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock3, ArrowUpRight, BadgeDollarSign, CalendarDays, Loader2, Search, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

export default function ContasAPagar() {
  const toast = useToast();
  const confirm = useConfirm();
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
    } catch (e) {
      toast.error("Falha ao carregar pendências");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updatePaymentStatus = async (id: string, nextStatus: "PAID" | "PENDING") => {
    if (nextStatus === "PAID") {
      const ok = await confirm({
        title: "Marcar como pago",
        message: "Deseja confirmar este pagamento? O valor será deductdo do saldo.",
        confirmLabel: "Sim, pagar",
        variant: "warning",
      });
      if (!ok) return;
    }
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      toast.success(nextStatus === "PAID" ? "Conta liquidada!" : "Lançamento pendente.");
      fetchTransactions();
    } catch (e) {
      toast.error("Erro ao atualizar.");
    }
  };

  const now = new Date();
  const dueSoon = addDays(now, 7);

  const filteredData = useMemo(() => {
    let base = transactions.filter(t => 
      t.description.toLowerCase().includes(query.toLowerCase())
    );

    if (filter === "overdue") {
      base = base.filter(t => t.dueDate && isBefore(new Date(t.dueDate), now));
    } else if (filter === "upcoming") {
      base = base.filter(t => t.dueDate && !isBefore(new Date(t.dueDate), now) && !isAfter(new Date(t.dueDate), dueSoon));
    } else if (filter === "nodate") {
      base = base.filter(t => !t.dueDate);
    }

    return base;
  }, [transactions, query, filter]);

  const totals = useMemo(() => {
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const overdue = transactions.filter(t => t.dueDate && isBefore(new Date(t.dueDate), now)).reduce((s, t) => s + t.amount, 0);
    const upcoming = transactions.filter(t => t.dueDate && !isBefore(new Date(t.dueDate), now) && !isAfter(new Date(t.dueDate), dueSoon)).reduce((s, t) => s + t.amount, 0);
    return { total, overdue, upcoming };
  }, [transactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <PageErrorBoundary>
    <div className="space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-warning text-white shadow-lg shadow-warning/30">
            <Clock3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">Contas a Pagar</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Gestão inteligente de vencimentos</p>
          </div>
        </div>

        <div className="flex bg-surface-variant/40 rounded-2xl p-1 border border-outline/5 self-start md:self-center overflow-x-auto">
            <Button variant="ghost" className={cn("h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", filter === "all" ? "bg-white text-on-surface shadow-md" : "text-on-surface-variant")} onClick={() => setFilter("all")}>Todas</Button>
            <Button variant="ghost" className={cn("h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", filter === "overdue" ? "bg-destructive text-white shadow-lg shadow-destructive/20" : "text-on-surface-variant")} onClick={() => setFilter("overdue")}>Atrasadas</Button>
            <Button variant="ghost" className={cn("h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", filter === "upcoming" ? "bg-warning text-white shadow-lg shadow-warning/20" : "text-on-surface-variant")} onClick={() => setFilter("upcoming")}>Próximos 7d</Button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
         <Card className="premium-card p-5 bg-surface border-outline/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">Total Pendente</p>
            <h2 className="text-xl md:text-3xl font-black mt-2 tracking-tighter truncate">{formatCurrency(totals.total)}</h2>
         </Card>
         <Card className="premium-card p-5 bg-destructive/10 border-destructive/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-destructive/60">Atrasadas</p>
            <h2 className="text-xl md:text-3xl font-black mt-2 text-destructive tracking-tighter truncate">{formatCurrency(totals.overdue)}</h2>
         </Card>
         <Card className="premium-card p-5 bg-warning/10 border-warning/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-warning/60">Próximos 7 dias</p>
            <h2 className="text-xl md:text-3xl font-black mt-2 text-warning tracking-tighter truncate">{formatCurrency(totals.upcoming)}</h2>
         </Card>
      </div>

      <div className="space-y-4">
        <div className="relative mx-4 md:mx-0">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
           <Input 
             value={query} 
             onChange={e => setQuery(e.target.value)} 
             placeholder="Filtrar por nome..." 
             className="h-14 pl-12 rounded-[24px] bg-surface-variant/30 border-transparent font-bold text-lg focus:bg-surface focus:border-outline/20"
           />
        </div>

        <div className="grid gap-3 px-4 md:px-0">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/20" /></div>
            ) : filteredData.length === 0 ? (
              <Card className="premium-card p-20 flex flex-col items-center gap-4 opacity-30 border-dashed">
                 <CheckCircle2 className="w-16 h-16" />
                 <p className="font-black uppercase tracking-widest text-xs">Tudo liquidado!</p>
              </Card>
            ) : filteredData.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card className="premium-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-xl transition-all border-none bg-surface shadow-md">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner",
                        t.dueDate && isBefore(new Date(t.dueDate), now) ? "bg-destructive/10 text-destructive" : "bg-surface-variant/50 text-on-surface-variant/40"
                      )}>
                        {t.dueDate && isBefore(new Date(t.dueDate), now) ? <AlertTriangle className="w-7 h-7" /> : <CalendarDays className="w-7 h-7" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-on-background tracking-tight leading-none truncate">{t.description}</h3>
                        <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mt-2">
                           {t.dueDate ? `Vencimento: ${format(new Date(t.dueDate), "dd 'de' MMM", { locale: ptBR })}` : "Sem vencimento"}
                        </p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="text-right">
                         <p className="text-2xl font-black tracking-tighter text-on-background">{formatCurrency(t.amount)}</p>
                         <span className="text-[10px] font-black uppercase tracking-widest text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/30">Pendente</span>
                      </div>
                      <Button 
                        onClick={() => updatePaymentStatus(t.id, "PAID")}
                        className="h-12 px-8 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                         Liquidar
                      </Button>
                   </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </PageErrorBoundary>
  );
}
