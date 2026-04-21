"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays, History,
  LayoutDashboard, ReceiptText, BarChart3, Bell, User as UserIcon,
  AlertTriangle, Target, ArrowRight, Brain
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};
const itemVariants: any = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 100 } as any }
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-0"
    >
      {/* Header - Copiloto Style */}
      <motion.header variants={itemVariants} className="space-y-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary animate-pulse">
                <Brain className="w-4 h-4" />
              </div>
              <p className="text-sm text-primary font-bold uppercase tracking-wider">
                Copiloto Inteligente
              </p>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-on-background max-w-2xl leading-tight">
              {loading ? (
                <div className="h-10 w-64 bg-surface-variant animate-pulse rounded-lg" />
              ) : metrics.copilot?.proactiveMessage || "Como você está hoje?"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <QuickAdd categories={categories} onSuccess={() => window.location.reload()} />
          </div>
        </div>
      </motion.header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <MetricCard
          loading={loading}
          title="Saldo Atual"
          value={metrics.balance}
          icon={Wallet}
          color="primary"
        />
        <MetricCard
          loading={loading}
          title="Receitas"
          value={metrics.income}
          icon={ArrowUpRight}
          color="emerald"
        />
        <MetricCard
          loading={loading}
          title="Despesas"
          value={metrics.expenses}
          icon={ArrowDownRight}
          color="rose"
        />
        <MetricCard
          loading={loading}
          title="Economia"
          value={`${metrics.savingsRate?.toFixed(0)}%`}
          icon={Target}
          color="amber"
          isCurrency={false}
        />
      </div>

      {!loading && metrics.balance === 0 && metrics.income === 0 && metrics.expenses === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyDashboard />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
           {/* Left Column (8 cols) */}
           <div className="lg:col-span-8 space-y-6 md:space-y-8">
              {/* Spend Decision Indicator */}
              <motion.div variants={itemVariants}>
                <SpendDecisionIndicator />
              </motion.div>

              {/* Weekly Cashflow Forecast */}
              <motion.div variants={itemVariants}>
                <WeeklyCashflowForecast />
              </motion.div>

              {/* Chart */}
              <Card className="premium-card overflow-hidden">
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
                        <Tooltip />
                        <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
           </div>

           {/* Right Column (4 cols) */}
           <div className="lg:col-span-4 space-y-6 md:space-y-8">
              <motion.div variants={itemVariants}>
                <DailyInsight metrics={metrics} />
              </motion.div>

              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Orçamentos Críticos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? [1,2].map(i => <Skeleton key={i} className="h-12 w-full" />) : (
                    metrics.budgetAlerts?.length > 0 ? metrics.budgetAlerts.map((budget: any) => (
                      <div key={budget.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="truncate">{budget.category.name}</span>
                          <span>{budget.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-500", budget.percentage >= 100 ? "bg-rose-500" : "bg-amber-500")}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-on-surface-variant text-center py-4">Tudo dentro do limite!</p>
                    )
                  )}
                </CardContent>
              </Card>
           </div>
        </div>
      )}
    </motion.div>
  );
}

function MetricCard({ title, value, icon: Icon, color, isCurrency = true, loading }: any) {
  const colors: any = {
    primary: "from-primary/20 to-primary/5 text-primary border-primary/10",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-600 border-emerald-100",
    rose: "from-rose-500/20 to-rose-600/5 text-rose-600 border-rose-100",
    amber: "from-amber-500/20 to-amber-600/5 text-amber-600 border-amber-100",
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn("overflow-hidden border shadow-none bg-gradient-to-br", colors[color])}>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className={cn("p-2 rounded-xl bg-white/50")}>
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70">
              {title}
            </p>
          </div>
          {loading ? (
            <div className="h-7 md:h-8 w-24 bg-black/5 animate-pulse rounded" />
          ) : (
            <p className="text-lg md:text-2xl font-black tracking-tight">
              {isCurrency ? formatCurrency(value) : value}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
