"use client";

import { useEffect, useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths, isBefore, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarRange, CheckCircle2, AlertTriangle, Wallet, FileSpreadsheet, FileText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";

interface TransactionSummary {
  id: string;
  type: string;
  amount: number;
  paymentStatus: string;
  dueDate?: string;
}

export default function Fechamento() {
  const toast = useToast();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
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

  const periodLabels = ["Mês atual", "Mês anterior", "2 meses atrás", "3 meses atrás"];

  const handleExport = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Falha ao exportar");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("Exportação concluída!");
    } catch (e) {
      toast.error("Erro ao exportar. Tente novamente.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 md:pb-0 px-4 md:px-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <PageHeader icon={CalendarRange} title="Fechamento Mensal" subtitle={periodLabel} iconClassName="bg-secondary text-on-secondary shadow-secondary/20" />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 md:pb-0">
            {["0", "1", "2", "3"].map((p) => (
              <Button key={p} variant={period === p ? "default" : "outline"} className="h-10 rounded-xl whitespace-nowrap snap-center shrink-0" onClick={() => setPeriod(p)}>
                {periodLabels[parseInt(p, 10)]}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => handleExport(`/api/fechamento/export?period=${period}`, "fechamento.csv")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" className="h-10 rounded-xl" onClick={() => handleExport(`/api/fechamento/export/pdf?period=${period}`, "fechamento.pdf")}>
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Summary cards — consistent with Dashboard and Movimentacoes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Receitas</p>
          <p className="text-xl md:text-2xl font-bold mt-2 text-success">{formatCurrency(summary.income)}</p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">Previstas no mês</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Despesas</p>
          <p className="text-xl md:text-2xl font-bold mt-2 text-destructive">{formatCurrency(summary.expenses)}</p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">Previstas no mês</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Saldo</p>
          <p className={`text-xl md:text-2xl font-bold mt-2 ${summary.balance >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(summary.balance)}
          </p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">Receitas - Despesas</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Desp. Pendentes</p>
          <p className="text-xl md:text-2xl font-bold mt-2 text-warning">{formatCurrency(summary.pending)}</p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">Despesas não pagas</p>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Desp. Pagas</p>
          <p className="text-xl md:text-2xl font-bold mt-2 text-success">{formatCurrency(summary.paid)}</p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">Já quitadas</p>
        </Card>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="premium-card p-4 sm:p-6 border-success/10 bg-success/10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="font-bold">Pagas</h2>
          </div>
          <div className="text-3xl font-bold text-success">{formatCurrency(summary.paid)}</div>
          <p className="text-xs text-on-surface-variant/60 mt-1">Despesas já quitadas neste mês</p>
        </Card>
        <Card className="premium-card p-4 sm:p-6 border-destructive/10 bg-destructive/10">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="font-bold">Atrasadas</h2>
          </div>
          <div className="text-3xl font-bold text-destructive">{formatCurrency(summary.overdue)}</div>
          <p className="text-xs text-on-surface-variant/60 mt-1">Despesas pendentes com vencimento passado</p>
        </Card>
        <Card className="premium-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-secondary" />
            <h2 className="font-bold">Estado do Fechamento</h2>
          </div>
          <div className={`text-lg font-semibold ${summary.balance >= 0 ? "text-success" : "text-destructive"}`}>
            {summary.balance >= 0 ? "Fechamento positivo ✓" : "Fechamento negativo ⚠"}
          </div>
          <p className="text-sm text-on-surface-variant mt-2">
            Receitas ({formatCurrency(summary.income)}) menos despesas ({formatCurrency(summary.expenses)}) do período.
          </p>
        </Card>
      </div>

      {loading && (
        <div className="py-10 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-3" />
          <p className="text-on-surface-variant/40 text-sm">Carregando fechamento...</p>
        </div>
      )}
    </div>
  );
}
