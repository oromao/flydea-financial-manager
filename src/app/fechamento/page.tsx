"use client";

import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, CheckCircle2, AlertTriangle, Wallet, FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Fechamento() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("0");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const monthsAgo = parseInt(period, 10);
        const ref = subMonths(new Date(), monthsAgo);
        const start = format(startOfMonth(ref), "yyyy-MM-dd");
        const end = format(endOfMonth(ref), "yyyy-MM-dd");
        const res = await fetch(`/api/transactions?all=true&startDate=${start}&endDate=${end}`);
        const data = await res.json();
        setTransactions(Array.isArray(data.data) ? data.data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period]);

  const summary = useMemo(() => {
    const now = new Date();
    const income = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
    const paid = transactions.filter((t) => t.type === "EXPENSE" && t.paymentStatus === "PAID").reduce((sum, t) => sum + t.amount, 0);
    const pending = transactions.filter((t) => t.type === "EXPENSE" && t.paymentStatus === "PENDING").reduce((sum, t) => sum + t.amount, 0);
    const overdue = transactions.filter((t) => t.type === "EXPENSE" && t.paymentStatus === "PENDING" && t.dueDate && isBefore(new Date(t.dueDate), now) && !isSameDay(new Date(t.dueDate), now)).reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, paid, pending, overdue, balance };
  }, [transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const periodLabel = format(subMonths(new Date(), parseInt(period, 10)), "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-secondary text-on-secondary">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-background">Fechamento Mensal</h1>
            <p className="text-on-surface-variant text-sm mt-1">{periodLabel}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {["0", "1", "2", "3"].map((p) => (
              <Button key={p} variant={period === p ? "default" : "outline"} className="h-10 rounded-xl whitespace-nowrap shrink-0" onClick={() => setPeriod(p)}>
                {p === "0" ? "Atual" : `${p} mês${p === "1" ? "" : "es"} atrás`}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => window.location.href = `/api/fechamento/export?period=${period}`}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => window.location.href = `/api/fechamento/export/pdf?period=${period}`}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="premium-card p-5"><p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Receitas</p><p className="text-2xl font-bold mt-2 text-emerald-600">{formatCurrency(summary.income)}</p></Card>
        <Card className="premium-card p-5"><p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Despesas</p><p className="text-2xl font-bold mt-2 text-red-600">{formatCurrency(summary.expenses)}</p></Card>
        <Card className="premium-card p-5"><p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Saldo</p><p className="text-2xl font-bold mt-2">{formatCurrency(summary.balance)}</p></Card>
        <Card className="premium-card p-5"><p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Pendências</p><p className="text-2xl font-bold mt-2 text-amber-600">{formatCurrency(summary.pending)}</p></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="premium-card p-6 border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><h2 className="font-bold">Pagas</h2></div>
          <div className="text-3xl font-bold text-emerald-700">{formatCurrency(summary.paid)}</div>
        </Card>
        <Card className="premium-card p-6 border-amber-100 bg-amber-50/20">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-600" /><h2 className="font-bold">Atrasadas</h2></div>
          <div className="text-3xl font-bold text-amber-700">{formatCurrency(summary.overdue)}</div>
        </Card>
        <Card className="premium-card p-6">
          <div className="flex items-center gap-2 mb-3"><Wallet className="w-4 h-4 text-secondary" /><h2 className="font-bold">Estado</h2></div>
          <div className="text-lg font-semibold text-on-background">{summary.balance >= 0 ? "Fechamento positivo" : "Fechamento negativo"}</div>
          <div className="text-sm text-on-surface-variant mt-2">Receitas menos despesas do período selecionado.</div>
        </Card>
      </div>

      {loading && <div className="py-10 text-center text-on-surface-variant/40">Carregando...</div>}
    </div>
  );
}
