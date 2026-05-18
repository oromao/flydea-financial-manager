"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
import { FirstStepsCard } from "@/components/dashboard/first-steps-card";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 25, stiffness: 120 } },
};

interface DashboardData {
  balance: number;
  projectedBalance: number;
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

export default function Dashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardData>({
    balance: 0,
    projectedBalance: 0,
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
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

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
        } else {
          const err = await metricsRes.json().catch(() => ({ error: "Erro ao carregar dados" }));
          setError(err.error || "Erro ao carregar dashboard");
        }
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(Array.isArray(catData) ? catData : []);
        }
      } catch {
        setError("Erro de conexão. Verifique sua internet.");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  if (loading) {
    return (
      <PageErrorBoundary>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8"
      >
        {/* Hero Skeleton */}
        <motion.section variants={itemVariants}>
          <div className="bg-primary overflow-hidden rounded-3xl md:rounded-4xl p-6 md:p-10 shadow-2xl text-white relative">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3.5 w-3.5 rounded-full bg-white/[0.07]" />
                  <div className="h-3 w-24 rounded-full bg-white/[0.07]" />
                </div>
                <div className="p-3 rounded-2xl bg-accent/10 border border-border">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/[0.07]" />
                </div>
              </div>
              <div className="h-12 md:h-16 w-48 md:w-72 bg-accent/10 rounded-2xl animate-pulse" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-accent/10 rounded-2xl p-3 md:p-4 border border-border">
                    <div className="h-3 w-16 bg-white/[0.07] rounded mb-1" />
                    <div className="h-4 w-20 bg-accent/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Chart Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted/30 rounded" />
          <div className="bg-background rounded-2xl p-4 md:p-6 shadow-sm border border-border/10">
            <div className="h-[240px] md:h-[320px] w-full bg-muted/20 rounded-2xl animate-pulse" />
          </div>
        </div>
      </motion.div>
    </PageErrorBoundary>
    );
  }

  if (error) {
    return (
      <PageErrorBoundary>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-8 h-8 text-destructive" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-on-background mb-2">Dashboard indisponível</h2>
        <p className="text-sm text-on-surface-variant mb-6 max-w-xs mx-auto">{error}</p>
        <Button onClick={() => router.refresh()} className="h-11 rounded-xl">
          Tentar novamente
        </Button>
      </motion.div>
    </PageErrorBoundary>
    );
  }

  if (!loading && metrics.balance === 0 && metrics.income === 0 && metrics.expenses === 0 && !metrics.chartData?.length) {
    return (
      <PageErrorBoundary>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
        <EmptyDashboard />
      </motion.div>
    </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Hero: Saldo Geral + Mini Cards */}
      <motion.section variants={itemVariants}>
        <DashboardHero
          balance={metrics.balance}
          projectedBalance={metrics.projectedBalance || metrics.balance}
          income={metrics.monthIncome || metrics.income}
          expenses={metrics.monthExpenses || metrics.expenses}
          loading={loading}
          lastUpdated={lastUpdated}
          categories={categories}
        />
      </motion.section>

      {/* First Steps CTA for new users */}
      <motion.div variants={itemVariants}>
        <FirstStepsCard />
      </motion.div>

      {/* Main Content: Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left: Charts & Forecast */}
        <div className="lg:col-span-7 space-y-8">
          {/* Weekly Cashflow Forecast */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-foreground">
                Projeção de Caixa
              </h2>
              <Link
                href="/fluxo-caixa"
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-background rounded-2xl p-4 md:p-6 shadow-sm border border-border/10">
              <WeeklyCashflowForecast />
            </div>
          </motion.section>

          {/* Monthly Flux Chart */}
          <motion.section variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-display font-bold text-foreground">
              Fluxo Mensal
            </h2>
            <Card className="bg-background shadow-md rounded-xl transition-all duration-500 hover:shadow-lg border-none p-4 md:p-6 min-h-[240px] md:min-h-[320px]">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[280px] md:h-[340px] w-full rounded-2xl" />
                </div>
              ) : metrics.chartData && metrics.chartData.length > 0 ? (
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
                      formatter={(value: unknown) => formatCurrency(Number(value as number))}
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
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-on-surface-variant/50">
                  Registre transações para ver o gráfico de fluxo mensal
                </div>
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
              <h2 className="text-lg font-display font-bold text-foreground">
                Orçamentos
              </h2>
            </div>
            <Card className="bg-background shadow-md rounded-xl transition-all duration-500 hover:shadow-lg border-none p-5 md:p-6 space-y-5">
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
                        <span className="font-semibold text-foreground">{budget.category.name}</span>
                        <span
                          className={cn(
                            "font-display font-bold text-xs",
                            budget.percentage >= 100 ? "text-destructive" : "text-primary"
                          )}
                        >
                          {budget.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(budget.percentage, 100)}
                        className={budget.percentage >= 100 ? "[&_[data-slot=progress-indicator]]:bg-destructive" : ""}
                      />
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
                  <p className="text-sm text-muted-foreground">
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
    </PageErrorBoundary>
  );
}
