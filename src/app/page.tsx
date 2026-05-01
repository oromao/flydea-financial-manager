"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays, History,
  LayoutDashboard, ReceiptText, BarChart3, Bell, User as UserIcon,
  AlertTriangle, Target, ArrowRight, Brain, Sparkles, ChevronRight, Clock
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

interface ChartDataPoint {
  day: string;
  income: number;
  expense: number;
}

interface BudgetAlert {
  id: string;
  category: { name: string };
  percentage: number;
}

interface CopilotData {
  proactiveMessage?: string;
  insights: Array<{
    id: string;
    type: "URGENTE" | "IMPACTO" | "INFORMAÇÃO";
    title: string;
    message: string;
    actionLabel?: string;
    actionUrl?: string;
    score: number;
    isRead: boolean;
  }>;
  healthScore?: number;
}

interface DashboardData {
  balance: number;
  income: number;
  expenses: number;
  chartData: ChartDataPoint[];
  topCategories: unknown[];
  projectedExpenses: number;
  projectedIncome: number;
  pendingExpenses: number;
  nextMonths: unknown[];
  budgetAlerts: BudgetAlert[];
  savingsRate: number;
  monthIncome: number;
  monthExpenses: number;
  copilot?: CopilotData;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 25, stiffness: 120 } },
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expenses: 0,
    chartData: [],
    topCategories: [],
    projectedExpenses: 0,
    projectedIncome: 0,
    pendingExpenses: 0,
    nextMonths: [],
    budgetAlerts: [],
    savingsRate: 0,
    monthIncome: 0,
    monthExpenses: 0,
    copilot: undefined,
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [metricsRes, categoriesRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/categories"),
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
      className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 px-4 md:px-0"
    >
      {/* Hero: Saldo Geral */}
      <motion.section variants={itemVariants}>
        <DashboardHero
          balance={metrics.balance}
          loading={loading}
          categories={categories}
        />
      </motion.section>

      {/* AI Copilot */}
      {!loading && metrics.copilot?.proactiveMessage && (
        <motion.section variants={itemVariants}>
          <div className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-sm border border-outline/10 flex flex-col gap-3">
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

      {/* 3-Column Key Metrics: Receita / Despesa / Pendentes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-sm border border-outline/10 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-success/10 min-w-[28px] min-h-[28px] flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" />
            </div>
            <p className="text-xs md:text-sm font-medium text-on-surface-variant">Entradas</p>
          </div>
          <p className="text-xl md:text-2xl font-display font-bold text-on-surface">
            {loading ? <Skeleton className="h-7 w-28 rounded-lg" /> : formatCurrency(metrics.income)}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-sm border border-outline/10 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-destructive/10 min-w-[28px] min-h-[28px] flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-destructive" />
            </div>
            <p className="text-xs md:text-sm font-medium text-on-surface-variant">Saídas</p>
          </div>
          <p className="text-xl md:text-2xl font-display font-bold text-on-surface">
            {loading ? <Skeleton className="h-7 w-28 rounded-lg" /> : formatCurrency(metrics.expenses)}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-surface-container-lowest rounded-[20px] p-5 md:p-6 shadow-sm border border-outline/10 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-warning/10 min-w-[28px] min-h-[28px] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-warning" />
            </div>
            <p className="text-xs md:text-sm font-medium text-on-surface-variant">Pendentes</p>
          </div>
          <p className="text-xl md:text-2xl font-display font-bold text-on-surface">
            {loading ? <Skeleton className="h-7 w-28 rounded-lg" /> : formatCurrency(metrics.pendingExpenses)}
          </p>
        </motion.div>
      </div>

      {/* Spend Decision Indicator (Prominent Banner) */}
      <motion.section variants={itemVariants}>
        <SpendDecisionIndicator />
      </motion.section>

      {/* Main Content: Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Left: Charts & Forecast */}
        <div className="lg:col-span-7 space-y-8 md:space-y-12">
          {/* Weekly Cashflow Forecast (Compact) */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-display font-bold text-on-surface">
                Projeção de Caixa
              </h2>
              <Link
                href="/relatorios"
                className="text-xs md:text-sm font-semibold text-primary flex items-center gap-1 hover:underline min-h-[44px] px-2"
              >
                Ver detalhes <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </div>
            <div className="bg-surface-container-lowest rounded-[20px] p-4 md:p-6 shadow-sm border border-outline/10">
              <WeeklyCashflowForecast />
            </div>
          </motion.section>

          {/* Monthly Flux Chart */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-lg md:text-xl font-display font-bold text-on-surface">
              Fluxo Mensal
            </h2>
            <Card className="premium-card p-4 md:p-8 h-[300px] md:h-[380px]">
              {loading ? (
                <Skeleton className="h-full w-full rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="day" stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={35} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", padding: "10px", fontSize: "12px" }} />
                    <Area type="monotone" dataKey="income" stroke="var(--color-success)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" stroke="var(--color-destructive)" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.section>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-5 space-y-8 md:space-y-12">
          {/* Critical Budgets */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-lg md:text-xl font-display font-bold text-on-surface flex items-center gap-2">
              <Target className="w-5 h-5 text-tertiary" />
              Orçamentos Críticos
            </h2>
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-4 w-10 rounded-md" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                ))
              ) : metrics.budgetAlerts?.length > 0 ? (
                metrics.budgetAlerts.map((budget) => (
                  <div key={budget.id} className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-on-surface">{budget.category.name}</span>
                      <span
                        className={cn(
                          "font-display font-bold",
                          budget.percentage >= 100 ? "text-destructive" : "text-primary"
                        )}
                      >
                        {budget.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full transition-all duration-700",
                          budget.percentage >= 100 ? "bg-destructive" : "bg-primary"
                        )}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-surface-container-low text-center">
                  <p className="text-sm font-semibold text-on-surface-variant">
                    Tudo sob controle no momento.
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Daily Insight */}
          <motion.section variants={itemVariants}>
            <DailyInsight metrics={metrics} />
          </motion.section>

          {/* Security Status */}
          <motion.section
            variants={itemVariants}
            className="p-6 rounded-[20px] bg-tertiary/5 border border-tertiary/10 space-y-4"
          >
            <div className="flex items-center gap-3 text-tertiary">
              <div className="p-2 rounded-lg bg-tertiary/10">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Cofre Digital</span>
            </div>
            <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
              Seus dados estão protegidos por criptografia de ponta a ponta e auditoria constante.
            </p>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
