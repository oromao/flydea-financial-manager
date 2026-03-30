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
      className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-0"
    >
      {/* Header - Compact */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-background">
            Visão Geral
          </h1>
          <p className="text-on-surface-variant font-medium text-sm mt-1">
            Seu controle financeiro
          </p>
        </div>
        <div className="flex items-center gap-3">
          {metrics.budgetAlerts?.length > 0 && (
            <Link href="/orcamentos" className="p-2.5 rounded-lg hover:bg-surface-variant transition-all relative">
              <Bell className="w-5 h-5 text-amber-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-background" />
            </Link>
          )}
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-variant/60 border border-outline/20">
            <CalendarDays className="w-4 h-4 text-secondary" />
            <span className="text-xs font-semibold text-on-background uppercase">
              {new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
            </span>
          </div>
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

      {/* Stats Cards - Compact Dense */}
      <motion.div
        variants={itemVariants}
        className="grid gap-5 grid-cols-1 md:grid-cols-3"
      >
        <Card className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-3">
            <Wallet className="w-20 h-20" />
          </div>
          <div>
            <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70 mb-2">Saldo</p>
            {loading ? <Skeleton className="h-9 w-40 mb-3" /> : (
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-on-background leading-tight">
                {formatCurrency(metrics.balance)}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", metrics.balance >= 0 ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-[10px] font-semibold text-on-surface-variant">
              {metrics.balance >= 0 ? "Saudável" : "Atenção"}
            </span>
          </div>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70">Entradas</p>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            {loading ? <Skeleton className="h-9 w-32 mb-3" /> : (
              <div className="text-3xl font-bold text-on-background">{formatCurrency(metrics.income)}</div>
            )}
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium mt-3">Mês atual</p>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70">Saídas</p>
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
            {loading ? <Skeleton className="h-9 w-32 mb-3" /> : (
              <div className="text-3xl font-bold text-on-background">{formatCurrency(metrics.expenses)}</div>
            )}
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium mt-3">Acumulado</p>
        </Card>
      </motion.div>

      {/* Chart + Right Panel - Optimized Density */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="premium-card lg:col-span-2 overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold text-on-background flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Fluxo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 h-[280px]">
            {loading ? <Skeleton className="h-full w-full rounded-lg" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="day" stroke="#6F7278" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#6F7278" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} width={45} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "600" }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Categories - Compact */}
        <Card className="premium-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4.5 h-4.5 text-secondary" />
            <h3 className="text-sm font-bold text-on-background">Top Gastos</h3>
          </div>
          {loading ? (
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-7 w-full rounded" />)}
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 no-scrollbar">
              {metrics.topCategories?.slice(0, 5).map((cat: any) => {
                const pct = metrics.expenses > 0 ? (cat.amount / metrics.expenses) * 100 : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-on-background truncate">{cat.name}</span>
                      <span className="text-[10px] font-semibold text-on-surface-variant whitespace-nowrap ml-2">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-500 bg-secondary"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/relatorios" className="text-secondary font-semibold text-xs hover:underline mt-4 flex items-center gap-1">
            Ver mais <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>
      </motion.div>

      {/* Quick Actions - Compact */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <Card className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4.5 h-4.5 text-secondary" />
              <h3 className="font-bold text-sm text-on-background">Atividade Recente</h3>
            </div>
            <p className="text-on-surface-variant font-medium text-xs">
              Acompanhe suas transações em tempo real.
            </p>
          </div>
          <Link href="/movimentacoes" className="text-secondary font-semibold text-xs hover:underline mt-4 flex items-center gap-1.5">
            Ver <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between bg-secondary/5 border-secondary/15">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-secondary/10 text-secondary">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-on-background">Registrar</h3>
            </div>
            <p className="text-on-surface-variant font-medium text-xs">
              Adicione entrada ou despesa ao seu painel.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Link href="/movimentacoes" className="apple-button-primary h-8 px-4 rounded-lg text-xs font-bold shadow-sm group">
              Abrir <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
