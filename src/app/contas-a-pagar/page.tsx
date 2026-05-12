"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isBefore, isAfter, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock3, ArrowUpRight, BadgeDollarSign, CalendarDays, Loader2, Search, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";
import { safeFormatDate } from "@/lib/date-utils";

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
      toast.error("Falha ao carregar pendencias");
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
        message: "Deseja confirmar este pagamento? O valor sera deductdo do saldo.",
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
      toast.success(nextStatus === "PAID" ? "Conta liquidada!" : "Lancamento pendente.");
      fetchTransactions();
    } catch (e) {
      toast.error("Erro ao atualizar.");
    }
  };

  const now = new Date();
  const dueSoon = addDays(now, 7);

  function isBeforeDueDate(dueDate: string | null | undefined, ref: Date): boolean {
    if (!dueDate) return false;
    try {
      const d = new Date(dueDate);
      return !isNaN(d.getTime()) && isBefore(d, ref);
    } catch { return false; }
  }

  function isAfterDueDate(dueDate: string | null | undefined, ref: Date): boolean {
    if (!dueDate) return false;
    try {
      const d = new Date(dueDate);
      return !isNaN(d.getTime()) && isAfter(d, ref);
    } catch { return false; }
  }

  const filteredData = useMemo(() => {
    let base = transactions.filter(t => 
      t.description.toLowerCase().includes(query.toLowerCase())
    );

    if (filter === "overdue") {
      base = base.filter(t => isBeforeDueDate(t.dueDate, now));
    } else if (filter === "upcoming") {
      base = base.filter(t => t.dueDate && !isBeforeDueDate(t.dueDate, now) && !isAfterDueDate(t.dueDate, dueSoon));
    } else if (filter === "nodate") {
      base = base.filter(t => !t.dueDate);
    }

    return base;
  }, [transactions, query, filter, dueSoon, now]);

  const totals = useMemo(() => {
    const total = transactions.reduce((s, t) => s + t.amount, 0);
    const overdue = transactions.filter(t => isBeforeDueDate(t.dueDate, now)).reduce((s, t) => s + t.amount, 0);
    const upcoming = transactions.filter(t => t.dueDate && !isBeforeDueDate(t.dueDate, now) && !isAfterDueDate(t.dueDate, dueSoon)).reduce((s, t) => s + t.amount, 0);
    return { total, overdue, upcoming };
  }, [transactions, dueSoon, now]);

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
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Contas a Pagar</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Gestao inteligente de vencimentos</p>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)} className="self-start md:self-center">
          <TabsList className="h-11 rounded-2xl p-1 overflow-x-auto">
            <TabsTrigger value="all" className="rounded-xl text-xs font-black uppercase tracking-widest h-10 px-4 whitespace-nowrap">Todas</TabsTrigger>
            <TabsTrigger value="overdue" className="rounded-xl text-xs font-black uppercase tracking-widest h-10 px-4 whitespace-nowrap">Atrasadas</TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl text-xs font-black uppercase tracking-widest h-10 px-4 whitespace-nowrap">Proximos 7d</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
         <Card className="border-border/10">
            <CardContent>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Total Pendente</p>
              <h2 className="text-xl md:text-3xl font-black mt-2 tracking-tighter truncate">{formatCurrency(totals.total)}</h2>
            </CardContent>
         </Card>
         <Card className="border-destructive/30 bg-destructive/10">
            <CardContent>
              <p className="text-[10px] font-black uppercase tracking-widest text-destructive/60">Atrasadas</p>
              <h2 className="text-xl md:text-3xl font-black mt-2 text-destructive tracking-tighter truncate">{formatCurrency(totals.overdue)}</h2>
            </CardContent>
         </Card>
         <Card className="border-warning/30 bg-warning/10">
            <CardContent>
              <p className="text-[10px] font-black uppercase tracking-widest text-warning/60">Proximos 7 dias</p>
              <h2 className="text-xl md:text-3xl font-black mt-2 text-warning tracking-tighter truncate">{formatCurrency(totals.upcoming)}</h2>
            </CardContent>
         </Card>
      </div>

      <div className="space-y-4">
        <div className="relative mx-4 md:mx-0">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
           <Input 
             value={query} 
             onChange={e => setQuery(e.target.value)} 
             placeholder="Filtrar por nome..." 
             className="h-14 pl-12 rounded-2xl bg-muted/30 border-transparent font-bold text-lg focus:bg-card focus:border-border/20"
           />
        </div>

        <div className="grid gap-3 px-4 md:px-0">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="py-24 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/20" /></div>
            ) : filteredData.length === 0 ? (
              <Card className="flex flex-col items-center gap-4 opacity-30 border-dashed p-20">
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
                <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-none shadow-md p-6">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center shadow-inner",
                        isBeforeDueDate(t.dueDate, now) ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground/40"
                      }>
                        {isBeforeDueDate(t.dueDate, now) ? <AlertTriangle className="w-7 h-7" /> : <CalendarDays className="w-7 h-7" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-foreground tracking-tight leading-none truncate">{t.description}</h3>
                        <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mt-2">
                           {t.dueDate ? `Vencimento: ${safeFormatDate(t.dueDate, "dd/MM")}` : "Sem vencimento"}
                        </p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="text-right">
                         <p className="text-2xl font-black tracking-tighter text-foreground">{formatCurrency(t.amount)}</p>
                         <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-warning border-warning/30 bg-warning/10 px-2 py-0.5 rounded-full">Pendente</Badge>
                      </div>
                      <Button 
                        onClick={() => updatePaymentStatus(t.id, "PAID")}
                        className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
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
