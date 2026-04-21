"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays, History,
  LayoutDashboard, ReceiptText, BarChart3, Bell, User as UserIcon,
  AlertTriangle, Target, ArrowRight, Brain, Sparkles, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { WeeklyCashflowForecast } from "@/components/weekly-cashflow-forecast";
import { SpendDecisionIndicator } from "@/components/spend-decision-indicator";
import { DailyInsight } from "@/components/daily-insight";
import { QuickAdd } from "@/components/quick-add";
import { EmptyDashboard } from "@/components/ui/empty-states";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};
const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 120 } as any }
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>({
    balance: 0, income: 0, expenses: 0, chartData: [],
    topCategories: [], projectedExpenses: 0, projectedIncome: 0, pendingExpenses: 0,
    nextMonths: [], budgetAlerts: [], savingsRate: 0,
    copilot: { proactiveMessage: "", insights: [], healthScore: 0 }
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
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (!loading && metrics.balance === 0 && metrics.income === 0 && metrics.expenses === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
        <EmptyDashboard />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-24"
    >
      {/* Prime Hero Section: Intelligence Report */}
      <motion.section variants={itemVariants} className="relative">
        <div className="bg-primary-container rounded-3xl p-8 md:p-12 overflow-hidden shadow-xl border-none">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full -ml-10 -mb-10 blur-2xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-on-primary shadow-inner border border-white/10 backdrop-blur-md">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-on-primary/60 uppercase tracking-[0.3em]">Relatório de Inteligência</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white leading-[1.05]">
                {loading ? (
                  <div className="h-16 w-80 bg-white/10 animate-pulse rounded-2xl" />
                ) : metrics.copilot?.proactiveMessage || "Sua saúde financeira está sólida."}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary-container" />
                  Insight do dia disponível
                </div>
                <QuickAdd categories={categories} onSuccess={() => window.location.reload()} />
              </div>
            </div>

            <div className="md:text-right space-y-2 pt-2">
              <p className="text-xs font-bold text-on-primary/50 uppercase tracking-[0.2em]">Seu Patrimônio Líquido</p>
              <p className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter">
                {loading ? "..." : formatCurrency(metrics.balance)}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Grid: Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        
        {/* Primary Content (8 cols) */}
        <div className="lg:col-span-8 space-y-12 md:space-y-20">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Receitas Mensais</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {loading ? "..." : formatCurrency(metrics.income)}
                </p>
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Despesas Mensais</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl md:text-4xl font-display font-bold text-tertiary">
                  {loading ? "..." : formatCurrency(metrics.expenses)}
                </p>
                <div className="p-1 rounded-full bg-rose-500/10 text-rose-600">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Forecast Chart */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Projeção de Caixa</h2>
              <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <motion.div variants={itemVariants}>
              <WeeklyCashflowForecast />
            </motion.div>
          </section>

          {/* Monthly Flux Area Chart */}
          <section className="space-y-8">
            <h2 className="text-2xl font-display font-bold">Fluxo Mensal</h2>
            <Card className="premium-card p-6 md:p-10 h-[400px]">
              {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#004b49" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#004b49" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#49220a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#49220a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="day" stroke="#707978" fontSize={11} tickLine={false} axisLine={false} dy={12} />
                    <YAxis stroke="#707978" fontSize={11} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} width={50} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '12px' }} />
                    <Area type="monotone" dataKey="income" stroke="#004b49" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expense" stroke="#49220a" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </section>
        </div>

        {/* Sidebar Context (4 cols) */}
        <div className="lg:col-span-4 space-y-12 md:space-y-16">
          
          {/* Decision Indicator */}
          <motion.section variants={itemVariants}>
            <SpendDecisionIndicator />
          </motion.section>

          {/* Critical Budgets */}
          <section className="space-y-8">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-tertiary" />
              Orçamentos Críticos
            </h2>
            <div className="space-y-6">
              {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />) : (
                metrics.budgetAlerts?.length > 0 ? metrics.budgetAlerts.map((budget: any) => (
                  <div key={budget.id} className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="font-semibold text-on-surface">{budget.category.name}</span>
                      <span className={cn("font-display font-bold", budget.percentage >= 100 ? "text-error" : "text-primary")}>
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full transition-all duration-700", budget.percentage >= 100 ? "bg-error" : "bg-primary")}
                      />
                    </div>
                  </div>
                )) : (
                  <div className="p-8 rounded-3xl bg-surface-container-low text-center">
                    <p className="text-sm font-semibold text-on-surface-variant">Tudo sob controle no momento.</p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Daily Insight Card */}
          <motion.div variants={itemVariants}>
            <DailyInsight metrics={metrics} />
          </motion.div>
          
          {/* Security Status */}
          <section className="p-6 rounded-3xl bg-tertiary/5 border border-tertiary/10 space-y-4">
             <div className="flex items-center gap-3 text-tertiary">
               <div className="p-2 rounded-lg bg-tertiary/10">
                 <Target className="w-4 h-4" />
               </div>
               <span className="text-xs font-bold uppercase tracking-[0.2em]">Cofre Digital</span>
             </div>
             <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
               Seus dados estão protegidos por criptografia de ponta a ponta e auditoria constante.
             </p>
          </section>

        </div>
      </div>
    </motion.div>
  );
}
