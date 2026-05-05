"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight,
  Target, BarChart3
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { WeeklyCashflowForecast } from "@/components/weekly-cashflow-forecast";
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
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
          setLastUpdated(new Date());
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
      className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0"
    >
      {/* Hero: Saldo Geral + Mini Cards */}
      <motion.section variants={itemVariants}>
        <DashboardHero
          balance={metrics.balance}
          income={metrics.monthIncome || metrics.income}
          expenses={metrics.monthExpenses || metrics.expenses}
          loading={loading}
          lastUpdated={lastUpdated}
          categories={categories}
        />
      </motion.section>

      {/* Main Content: Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left: Charts & Forecast */}
        <div className="lg:col-span-7 space-y-8">
          {/* Weekly Cashflow Forecast */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-on-surface">
                Projeção de Caixa
              </h2>
              <Link
                href="/fluxo-caixa"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline/10">
              <WeeklyCashflowForecast />
            </div>
          </motion.section>

          {/* Monthly Flux Chart */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-display font-bold text-on-surface">
              Fluxo Mensal
            </h2>
            <Card className="premium-card p-4 md:p-6 h-[320px] md:h-[380px]">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[280px] md:h-[340px] w-full rounded-2xl" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline)" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="day"
                      stroke="var(--color-on-surface-variant)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      dy={8}
                    />
                    <YAxis
                      stroke="var(--color-on-surface-variant)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      width={45}
                    >
                      <Label
                        value="Receitas / Despesas"
                        angle={-90}
                        position="insideLeft"
                        offset={-5}
                        style={{
                          fill: "var(--color-on-surface-variant)",
                          fontSize: 10,
                          fontWeight: 600,
                          textAnchor: "middle",
                        }}
                      />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid var(--color-outline)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        padding: "10px 14px",
                        fontSize: "13px",
                      }}
                      formatter={(v: any) => formatCurrency(Number(v))}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Receitas"
                      stroke="var(--color-success)"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Despesas"
                      stroke="var(--color-destructive)"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </motion.section>
        </div>

        {/* Right: Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          {/* Budget Alerts */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-tertiary" aria-hidden="true" />
              <h2 className="text-lg font-display font-bold text-on-surface">
                Orçamentos
              </h2>
            </div>
            <Card className="premium-card p-5 md:p-6 space-y-5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-4 w-10 rounded-md" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                ))
              ) : metrics.budgetAlerts?.length > 0 ? (
                <>
                  {metrics.budgetAlerts.map((budget) => (
                    <div key={budget.id} className="group">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-on-surface">{budget.category.name}</span>
                        <span
                          className={cn(
                            "font-display font-bold text-xs",
                            budget.percentage >= 100 ? "text-destructive" : "text-primary"
                          )}
                        >
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            budget.percentage >= 100 ? "bg-destructive" : "bg-primary"
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <Link
                    href="/orcamentos"
                    className="flex items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline pt-2"
                  >
                    Ver todos os orçamentos <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-on-surface-variant">
                    Nenhum orçamento configurado.
                  </p>
                  <Link href="/orcamentos" className="text-xs font-semibold text-primary hover:underline mt-1 inline-block">
                    Criar orçamento
                  </Link>
                </div>
              )}
            </Card>
          </motion.section>

        </div>
      </div>
    </motion.div>
  );
}
