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
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";
import { WeeklyCashflowForecast } from "@/components/weekly-cashflow-forecast";
import { SpendDecisionIndicator } from "@/components/spend-decision-indicator";
import { DailyInsight } from "@/components/daily-insight";
import { QuickAdd } from "@/components/quick-add";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};
const itemVariants: any = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100 } as any }
};

export default function Dashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>({
    balance: 0, income: 0, expenses: 0, chartData: [],
    topCategories: [], projectedExpenses: 0, projectedIncome: 0, pendingExpenses: 0,
    nextMonths: [], budgetAlerts: [], savingsRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [metricsRes, categoriesRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/categories")
        ]);
        if (metricsRes.ok) {
          const data = await metricsRes.json();
          setMetrics(data);
        }
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
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
      {/* Header - Copiloto Style */}
      <motion.header variants={itemVariants} className="space-y-2 py-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <p className="text-sm text-on-surface-variant font-medium">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return "Bom dia";
                if (hour < 18) return "Boa tarde";
                return "Boa noite";
              })()}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-background">
              Como você está hoje?
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {metrics.budgetAlerts?.length > 0 && (
              <Link href="/orcamentos" className="p-2.5 rounded-lg hover:bg-surface-variant transition-colors relative">
                <Bell className="w-5 h-5 text-amber-500" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-background" />
              </Link>
            )}
            <Link href="/alertas" className="p-2.5 rounded-lg hover:bg-surface-variant transition-colors relative">
              <Bell className="w-5 h-5 text-secondary" />
            </Link>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-variant/60 border border-outline/20">
              <CalendarDays className="w-4 h-4 text-secondary" />
              <span className="text-xs font-semibold text-on-background uppercase">
                {new Date().toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem do dia */}
        {(() => {
          const day = new Date().getDay();
          const date = new Date().getDate();
          let msg = null;
          if (day === 1) msg = { title: "Nova semana", desc: "Que tal revisar suas pendências?" };
          else if (day === 5) msg = { title: "Sextou!", desc: "Bom início de fim de semana!" };
          else if (date <= 5) msg = { title: "Início de mês", desc: "Hora de acompanhar o fluxo" };
          else if (date >= 25) msg = { title: "Fim de mês", desc: "Falta pouco para fechar o mês" };
          if (msg) {
            return (
              <p className="text-xs text-on-surface-variant">
                <span className="font-semibold text-secondary">{msg.title}:</span> {msg.desc}
              </p>
            );
          }
          return null;
        })()}
      </motion.header>

      {/* Budget Alerts Banner */}
      {!loading && metrics.budgetAlerts?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Link href="/orcamentos"
            className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors group">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-900">
              {metrics.budgetAlerts.length} orçamento(s) atingiram o limite de alerta este mês.
            </p>
            <ArrowRight className="w-4 h-4 text-amber-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}

      {/* Spend Decision Indicator */}
      <motion.div variants={itemVariants}>
        <SpendDecisionIndicator />
      </motion.div>

      {/* Daily Insights - Smart Summary */}
      {!loading && (
        <motion.div variants={itemVariants}>
          <DailyInsight metrics={metrics} />
        </motion.div>
      )}

      {/* Weekly Cashflow Forecast */}
      <motion.div variants={itemVariants}>
        <WeeklyCashflowForecast />
      </motion.div>

      {/* Resumo do Momento Financeiro */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group min-w-0">
          <div className="absolute top-0 right-0 p-6 opacity-3">
            <Wallet className="w-20 h-20" />
          </div>
          <div className="min-w-0">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-90 mb-2">Seu saldo</p>
            {loading ? <Skeleton className="h-9 w-40 mb-3" /> : (
              <div className="text-2xl md:text-3xl font-bold tracking-tight text-on-background leading-tight truncate">
                {formatCurrency(metrics.balance)}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full shrink-0", metrics.balance >= 0 ? "bg-emerald-500" : "bg-red-500")} />
            <span className="text-xs sm:text-[10px] font-semibold text-on-surface-variant truncate">
              {metrics.balance >= 0 ? "Tudo OK" : "Atenção"} · Total guardado
            </span>
          </div>
        </Card>

        <Card className="premium-card p-4 sm:p-6 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70">Entrou</p>
              <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            {loading ? <Skeleton className="h-9 w-32 mb-3" /> : (
              <div className="text-2xl md:text-3xl font-bold text-on-background truncate">{formatCurrency(metrics.income)}</div>
            )}
          </div>
          <p className="text-xs sm:text-[10px] text-on-surface-variant font-medium mt-3">Este mês</p>
        </Card>

        <Card className="premium-card p-4 sm:p-6 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70">Saiu</p>
              <ArrowDownRight className="w-4 h-4 text-red-600 shrink-0" />
            </div>
            {loading ? <Skeleton className="h-9 w-32 mb-3" /> : (
              <div className="text-2xl md:text-3xl font-bold text-on-background truncate">{formatCurrency(metrics.expenses)}</div>
            )}
          </div>
          <p className="text-xs sm:text-[10px] text-on-surface-variant font-medium mt-3">Este mês</p>
        </Card>

        <Card className="premium-card p-4 sm:p-6 flex flex-col justify-between border-amber-100 bg-amber-50/20 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest opacity-70 truncate">Contas a pagar</p>
              <ReceiptText className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            {loading ? <Skeleton className="h-9 w-32 mb-3" /> : (
              <div className="text-2xl md:text-3xl font-bold text-on-background truncate">{formatCurrency(metrics.pendingExpenses || 0)}</div>
            )}
          </div>
          <p className="text-xs sm:text-[10px] text-on-surface-variant font-medium mt-3">Pendentes</p>
        </Card>
      </motion.div>

      {/* Chart + Right Panel - Optimized Density */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Area Chart */}
        <Card className="premium-card lg:col-span-2 overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-base font-bold text-on-background flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Seu fluxo mensal
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
            <h3 className="text-sm font-bold text-on-background">Onde você mais gastou</h3>
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
                      <div className="h-full transition-colors duration-500 bg-secondary"
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

      {/* Ações Rápidas */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
        <Card className="premium-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4.5 h-4.5 text-secondary" />
              <h3 className="font-bold text-sm text-on-background">Suas transações</h3>
            </div>
            <p className="text-on-surface-variant font-medium text-xs">
              Acompanhe o que entrou e saiu.
            </p>
          </div>
          <Link href="/movimentacoes" className="text-secondary font-semibold text-xs hover:underline mt-4 flex items-center gap-1.5">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between bg-secondary/5 border-secondary/15">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-secondary/10 text-secondary">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-on-background">Registrar movimento</h3>
            </div>
            <p className="text-on-surface-variant font-medium text-xs">
              Adicione uma nova despesa ou receita.
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <QuickAdd 
              categories={categories} 
              onSuccess={() => window.location.reload()}
            />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
