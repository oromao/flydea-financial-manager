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
import { DashboardHero } from "@/components/dashboard/dashboard-hero";

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
      className="space-y-6 md:space-y-16 max-w-7xl mx-auto pb-24 px-4 md:px-0"
    >
      {/* Fintech Hero Section: Clear Balance */}
      <motion.section variants={itemVariants}>
        <DashboardHero 
          balance={metrics.balance} 
          loading={loading} 
          categories={categories} 
        />
      </motion.section>

      {/* AI Copilot Insight Card */}
      {!loading && metrics.copilot?.proactiveMessage && (
        <motion.section variants={itemVariants}>
          <div className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-sm border border-surface-container-low flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-xs font-bold uppercase tracking-wider">Copiloto IA</h2>
            </div>
            <p className="text-on-surface text-sm md:text-base font-medium leading-relaxed">
              {metrics.copilot.proactiveMessage}
            </p>
          </div>
        </motion.section>
      )}

      {/* Main Grid: Clean Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Primary Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-surface-container-low space-y-2">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <p className="text-xs md:text-sm font-medium">Entradas</p>
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-on-surface">
                {loading ? "..." : formatCurrency(metrics.income)}
              </p>
            </div>
            
            <div className="bg-surface-container-lowest rounded-[20px] p-5 shadow-sm border border-surface-container-low space-y-2">
              <div className="flex items-center gap-2 text-on-surface-variant mb-1">
                <div className="p-1.5 rounded-full bg-red-500/10 text-red-600">
                  <ArrowDownRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <p className="text-xs md:text-sm font-medium">Saídas</p>
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-on-surface">
                {loading ? "..." : formatCurrency(metrics.expenses)}
              </p>
            </div>
          </div>

          {/* Weekly Forecast Chart */}
          <section className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-display font-bold">Projeção de Caixa</h2>
              <button className="text-xs md:text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                Ver detalhes <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
            <motion.div variants={itemVariants}>
              <WeeklyCashflowForecast />
            </motion.div>
          </section>

          {/* Monthly Flux Area Chart */}
          <section className="space-y-6 md:space-y-8">
            <h2 className="text-xl md:text-2xl font-display font-bold">Fluxo Mensal</h2>
            <Card className="premium-card p-4 md:p-10 h-[300px] md:h-[400px]">
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
                    <XAxis dataKey="day" stroke="#707978" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#707978" fontSize={10} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} width={35} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '10px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="income" stroke="#004b49" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" stroke="#49220a" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
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
