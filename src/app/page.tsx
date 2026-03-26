"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays, History,
  LayoutDashboard, ReceiptText, BarChart3, Bell, User as UserIcon,
  AlertTriangle, Target, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};
const itemVariants: any = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100 } as any }
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>({
    balance: 0, income: 0, expenses: 0, chartData: [],
    topCategories: [], projectedExpenses: 0, projectedIncome: 0,
    nextMonths: [], budgetAlerts: [], savingsRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (e) {
        console.error("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20 px-4 md:px-0"
    >
      {/* Header */}
      <motion.nav variants={itemVariants} className="flex justify-between items-center py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black gradient-text">Flydea</h1>
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Financial Manager v8.0</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {metrics.budgetAlerts?.length > 0 && (
            <Link href="/orcamentos" className="p-3 rounded-full hover:bg-white/5 transition-all relative">
              <Bell className="w-5 h-5 text-amber-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border-2 border-background" />
            </Link>
          )}
          <div className="w-10 h-10 rounded-full bg-surface-variant/20 border border-white/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </motion.nav>

      <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-on-background">
            Olá, <span className="text-primary italic">Seja bem-vindo</span>
          </h2>
          <p className="text-on-surface-variant/60 font-medium text-lg mt-2 italic">
            Aqui está o resumo da sua saúde financeira hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="text-sm font-black text-on-background uppercase tracking-widest">
            {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
        </div>
      </motion.header>

      {/* Budget Alerts Banner */}
      {!loading && metrics.budgetAlerts?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Link href="/orcamentos"
            className="flex items-center gap-4 p-5 rounded-[24px] bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all group">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm font-black text-amber-300">
              {metrics.budgetAlerts.length} orçamento(s) atingiram o limite de alerta este mês.
            </p>
            <ArrowRight className="w-4 h-4 text-amber-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="flex md:grid gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar snap-x snap-mandatory grid-cols-1 md:grid-cols-3"
      >
        <Card className="glass-card min-w-[300px] md:min-w-0 snap-center p-8 min-h-[220px] flex flex-col justify-center relative group hover:scale-[1.02] transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-32 h-32" />
          </div>
          <CardHeader className="p-0 mb-4">
            <h2 className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em]">Saldo Consolidado</h2>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {loading ? <Skeleton className="h-12 w-48 bg-white/5" /> : (
              <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                {formatCurrency(metrics.balance)}
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", metrics.balance >= 0 ? "bg-secondary animate-pulse" : "bg-rose-500")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                {metrics.balance >= 0 ? "Operação Estável" : "Risco Imediato"}
              </span>
            </div>
            {!loading && metrics.savingsRate > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[10px] font-black text-secondary">{metrics.savingsRate.toFixed(1)}% de poupança</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card min-w-[300px] md:min-w-0 snap-center p-8 min-h-[220px] flex flex-col justify-center group hover:scale-[1.02] transition-all duration-500">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em]">Entradas</h2>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-10 w-40 bg-white/5" /> : (
              <div className="text-3xl md:text-4xl font-black text-white">{formatCurrency(metrics.income)}</div>
            )}
            <p className="mt-4 text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest">Receita Mensal Bruta</p>
            {!loading && metrics.projectedIncome > 0 && (
              <p className="mt-2 text-[10px] text-secondary font-bold">
                + {formatCurrency(metrics.projectedIncome)} previsto/mês (recorrências)
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card min-w-[300px] md:min-w-0 snap-center p-8 min-h-[220px] flex flex-col justify-center group hover:scale-[1.02] transition-all duration-500">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em]">Saídas</h2>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-10 w-40 bg-white/5" /> : (
              <div className="text-3xl md:text-4xl font-black text-white">{formatCurrency(metrics.expenses)}</div>
            )}
            <p className="mt-4 text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest">Despesas Acumuladas</p>
            {!loading && metrics.projectedExpenses > 0 && (
              <p className="mt-2 text-[10px] text-rose-400 font-bold">
                {formatCurrency(metrics.projectedExpenses)} em recorrências/mês
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart + Right Panel */}
      <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="glass-card border-none overflow-hidden lg:col-span-2 h-[400px]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-white flex items-center gap-4">
              <BarChart3 className="w-6 h-6 text-primary" />
              Fluxo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 h-[300px]">
            {loading ? <Skeleton className="h-full w-full bg-white/5 rounded-3xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(9,9,11,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", backdropFilter: "blur(20px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
                    itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="glass-card border-none p-8 h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-black text-white">Top Gastos</h3>
          </div>
          {loading ? (
            <div className="space-y-3 flex-1">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full bg-white/5 rounded-xl" />)}
            </div>
          ) : metrics.topCategories?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant/20 text-sm font-bold">
              Sem dados este mês
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {metrics.topCategories?.map((cat: any, i: number) => {
                const pct = metrics.expenses > 0 ? (cat.amount / metrics.expenses) * 100 : 0;
                const colors = ["#f43f5e", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-on-background">{cat.name}</span>
                      <span className="text-xs font-black text-on-surface-variant/60">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/relatorios" className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity mt-4 flex items-center gap-1">
            Ver relatório completo <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card flex-1 p-8 flex flex-col justify-between border-none">
          <div>
            <CardTitle className="flex items-center gap-4 text-xl font-black text-white underline decoration-primary/30 underline-offset-8">
              <History className="w-6 h-6 text-primary" />
              Histórico
            </CardTitle>
            <p className="mt-6 text-on-surface-variant/60 font-medium">
              Verifique suas últimas transações e mantenha o controle em dia.
            </p>
          </div>
          <Link href="/movimentacoes" className="text-secondary font-black text-sm uppercase tracking-[0.2em] hover:opacity-70 transition-opacity mt-6 block">
            → Visualizar Atividade
          </Link>
        </Card>

        <Link href="/movimentacoes" className="m3-button-premium h-32 group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl tracking-tighter">LANÇAR MOVIMENTAÇÃO</span>
            <span className="text-[10px] opacity-50 tracking-[0.4em] font-medium">REGISTRO INSTANTÂNEO</span>
          </div>
          <ArrowUpRight className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
