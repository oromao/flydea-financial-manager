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
      className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-20 px-4 md:px-0"
    >
      {/* Header */}
      <motion.nav variants={itemVariants} className="flex justify-between items-center py-4 border-b border-outline/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <LayoutDashboard className="text-on-primary w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-background uppercase italic">Flydea</h1>
            <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-[0.2em]">v8.0 Premium</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {metrics.budgetAlerts?.length > 0 && (
            <Link href="/orcamentos" className="p-2.5 rounded-full hover:bg-surface-variant transition-all relative">
              <Bell className="w-5 h-5 text-amber-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-background" />
            </Link>
          )}
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-on-surface-variant" />
          </div>
        </div>
      </motion.nav>

      <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-on-background">
            Olá, <span className="text-secondary">Seja bem-vindo</span>
          </h2>
          <p className="text-on-surface-variant font-medium text-base mt-2">
            Aqui está o resumo da sua saúde financeira hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-surface border border-outline/30 shadow-sm">
          <CalendarDays className="w-4 h-4 text-secondary" />
          <span className="text-xs font-semibold text-on-background uppercase tracking-wider">
            {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
        </div>
      </motion.header>

      {/* Budget Alerts Banner */}
      {!loading && metrics.budgetAlerts?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Link href="/orcamentos"
            className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all group">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-900">
              {metrics.budgetAlerts.length} orçamento(s) atingiram o limite de alerta este mês.
            </p>
            <ArrowRight className="w-4 h-4 text-amber-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3"
      >
        <Card className="premium-card p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Wallet className="w-24 h-24" />
          </div>
          <CardHeader className="p-0 mb-3">
            <h2 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Saldo Consolidado</h2>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {loading ? <Skeleton className="h-10 w-40" /> : (
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-on-background leading-tight">
                {formatCurrency(metrics.balance)}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2.5">
              <div className={cn("w-2 h-2 rounded-full", metrics.balance >= 0 ? "bg-emerald-500" : "bg-red-500")} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                {metrics.balance >= 0 ? "Operação Estável" : "Risco Imediato"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card p-8 flex flex-col justify-center">
          <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Entradas</h2>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-3xl font-bold text-on-background">{formatCurrency(metrics.income)}</div>
            )}
            <p className="mt-4 text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Receita Mensal Bruta</p>
          </CardContent>
        </Card>

        <Card className="premium-card p-8 flex flex-col justify-center">
          <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Saídas</h2>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-8 w-32" /> : (
              <div className="text-3xl font-bold text-on-background">{formatCurrency(metrics.expenses)}</div>
            )}
            <p className="mt-4 text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Despesas Acumuladas</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart + Right Panel */}
      <motion.div variants={itemVariants} className="grid gap-8 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="premium-card lg:col-span-2 min-h-[400px]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-lg font-bold text-on-background flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Fluxo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 h-[300px]">
            {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="premium-card p-8 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-secondary" />
            <h3 className="text-base font-bold text-on-background">Top Gastos</h3>
          </div>
          {loading ? (
            <div className="space-y-4 flex-1">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {metrics.topCategories?.map((cat: any, i: number) => {
                const pct = metrics.expenses > 0 ? (cat.amount / metrics.expenses) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-on-background">{cat.name}</span>
                      <span className="text-[10px] font-bold text-on-surface-variant/80">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full">
                      <div className="h-full rounded-full transition-all duration-700 bg-secondary"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/relatorios" className="text-secondary font-bold text-xs hover:underline mt-6 flex items-center gap-1.5">
            Ver relatório completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        <Card className="premium-card p-8 flex flex-col justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-on-background">
              <History className="w-5 h-5 text-secondary" />
              Histórico
            </CardTitle>
            <p className="mt-4 text-on-surface-variant font-medium text-sm">
              Verifique suas últimas transações e mantenha o controle em dia.
            </p>
          </div>
          <Link href="/movimentacoes" className="text-secondary font-bold text-sm hover:underline mt-6 block">
            → Visualizar Atividade
          </Link>
        </Card>

        <Card className="premium-card p-8 flex flex-col justify-between border-secondary/20 bg-secondary/5">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-on-background">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              Lançar Movimentação
            </CardTitle>
            <p className="mt-4 text-on-surface-variant font-medium text-sm">
              Registre receitas e despesas instantaneamente no seu painel.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Link href="/movimentacoes" className="apple-button-primary flex items-center justify-center h-10 px-6 rounded-full text-xs font-bold shadow-md group">
              Acessar Painel <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
