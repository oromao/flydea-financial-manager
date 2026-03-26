"use client";

import { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import {
  PieChart, TrendingDown, LayoutPanelLeft, BarChart3, Presentation,
  Download, Calendar, Filter, Target, RotateCcw, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLORS = ["#09090b", "#18181b", "#27272a", "#3f3f46", "#52525b", "#71717a", "#a1a1aa", "#d4d4d8"];

export default function Relatorios() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("0"); // months ago (0 = current)

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      try {
        const monthsAgo = parseInt(period, 10);
        const refDate = subMonths(new Date(), monthsAgo);
        const start = format(startOfMonth(refDate), "yyyy-MM-dd");
        const end = format(endOfMonth(refDate), "yyyy-MM-dd");

        const res = await fetch(`/api/transactions?all=true&startDate=${start}&endDate=${end}`);
        const data = await res.json();
        setTransactions(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [period]);

  const expensesByCategory = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const catName = t.category?.name || "Sem Categoria";
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeByCategory = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => {
      const catName = t.category?.name || "Sem Categoria";
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

  const budgetBreakdown = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const type = t.status === "RECURRING" ? "FIXED" : "VARIABLE";
      acc[type] = (acc[type] || 0) + t.amount;
      return acc;
    }, { FIXED: 0, VARIABLE: 0 } as Record<string, number>);

  // Pie chart data
  const pieData = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 7)
    .map(([name, value]) => ({ name, value: Number(value) }));

  // Bar chart data (income vs expense by category)
  const barData = Object.keys({ ...expensesByCategory, ...incomeByCategory })
    .slice(0, 8)
    .map((name) => ({
      name: name.length > 10 ? name.slice(0, 10) + "…" : name,
      Despesa: expensesByCategory[name] || 0,
      Receita: incomeByCategory[name] || 0,
    }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleExportCSV = () => {
    const monthsAgo = parseInt(period, 10);
    const refDate = subMonths(new Date(), monthsAgo);
    const start = format(startOfMonth(refDate), "yyyy-MM-dd");
    const end = format(endOfMonth(refDate), "yyyy-MM-dd");
    window.location.href = `/api/transactions/export?startDate=${start}&endDate=${end}`;
  };

  const handlePrint = () => window.print();

  const refDate = subMonths(new Date(), parseInt(period, 10));
  const periodLabel = format(refDate, "MMMM yyyy", { locale: ptBR });

  return (
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-32 px-4 md:px-0 relative no-print">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
      >
        <div className="flex flex-row items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-3.5 rounded-2xl bg-secondary text-on-secondary shadow-sm"
          >
            <Presentation className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">Relatórios</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1 uppercase tracking-widest text-[10px]">Estatísticas & Insights</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-4 bg-surface-variant/30 p-1.5 rounded-2xl border border-outline/5">
          <div className="flex items-center gap-2 pl-3">
            <Calendar className="w-4 h-4 text-on-surface-variant/70" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/80 hidden md:block">Período:</span>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v || "0")}>
            <SelectTrigger className="w-44 h-9 rounded-xl border-none bg-surface/80 font-bold text-xs ring-1 ring-outline/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="0" className="rounded-lg">Mês Atual</SelectItem>
              <SelectItem value="1" className="rounded-lg">Mês Passado</SelectItem>
              <SelectItem value="2" className="rounded-lg">2 Meses Atrás</SelectItem>
              <SelectItem value="3" className="rounded-lg">3 Meses Atrás</SelectItem>
              <SelectItem value="5" className="rounded-lg">5 Meses Atrás</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.header>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
      >
        {[
          { label: "Receitas", value: totalIncome, color: "text-secondary" },
          { label: "Despesas", value: totalExpenses, color: "text-red-600" },
          { label: "Resultado", value: netBalance, color: netBalance >= 0 ? "text-secondary" : "text-red-600" },
          { label: "Poupança", value: null, color: savingsRate >= 20 ? "text-secondary" : "text-amber-600", label2: `${savingsRate.toFixed(1)}%` },
        ].map((card, i) => (
          <Card key={i} className="premium-card p-6 flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">{card.label}</p>
            <p className={cn("text-2xl md:text-3xl font-bold mt-1 tracking-tight", card.color)}>
              {card.value !== null ? formatCurrency(card.value) : card.label2}
            </p>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-8 grid-cols-1 lg:grid-cols-2"
      >
        {/* Pie Chart - Expenses by Category */}
        <Card className="premium-card p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2.5 rounded-xl bg-surface-variant text-on-surface-variant border border-outline/5">
              <PieChart className="w-5 h-5 opacity-70" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-background tracking-tight">Gastos por Categoria</h2>
              <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mt-0.5 capitalize">{periodLabel}</p>
            </div>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center text-on-surface-variant/20 font-bold text-xs uppercase tracking-[0.2em] italic">Analisando dados...</div>
          ) : pieData.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center gap-4 opacity-20">
              <TrendingDown className="w-12 h-12" />
              <p className="font-bold text-sm">Sem dados disponíveis</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} stroke="none"
                  paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                  contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#000", fontSize: "12px", fontWeight: "bold" }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Bar Chart - Income vs Expense by Category */}
        <Card className="premium-card p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2.5 rounded-xl bg-surface-variant text-on-surface-variant border border-outline/5">
              <BarChart3 className="w-5 h-5 opacity-70" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-background tracking-tight">Receita vs Despesa</h2>
              <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest mt-0.5">Visão Comparativa</p>
            </div>
          </div>
          {loading ? (
            <div className="h-72 flex items-center justify-center text-on-surface-variant/20 font-bold text-xs uppercase tracking-[0.2em] italic">Processando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(0,0,0,0.3)" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value || 0))}
                  contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "16px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
                  itemStyle={{ color: "#000", fontSize: "12px", fontWeight: "bold" }}
                />
                <Bar dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* Breakdown & Export Row */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-8 grid-cols-1 lg:grid-cols-2"
      >
        {/* Expense breakdown list */}
        <Card className="premium-card p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-outline/5 mb-8">
            <div className="p-2.5 rounded-xl bg-surface-variant text-on-surface-variant border border-outline/5">
              <Filter className="w-5 h-5 opacity-70" />
            </div>
            <h2 className="text-xl font-bold text-on-background tracking-tight uppercase tracking-wider text-sm">Distribuição Detalhada</h2>
          </div>
          {loading ? (
            <div className="py-20 text-center font-bold text-on-surface-variant/20 text-[10px] tracking-[0.3em] italic uppercase">Consultando banco de dados...</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(expensesByCategory).length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-4 opacity-20">
                  <TrendingDown className="w-12 h-12" />
                  <p className="font-bold text-sm">Nenhum registro encontrado</p>
                </div>
              ) : (
                Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => Number(b) - Number(a))
                  .map(([category, amount], i) => {
                    const pct = totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0;
                    return (
                      <div key={category}
                        className="flex items-center justify-between p-4 rounded-2xl bg-surface group hover:bg-surface-variant/10 transition-all border border-outline/5">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div className="flex-1">
                            <span className="font-bold text-sm text-on-background tracking-tight">{category}</span>
                            <div className="w-full h-1 bg-surface-variant/50 rounded-full mt-2 overflow-hidden max-w-[120px]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                className="h-full rounded-full" 
                                style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg text-on-background tracking-tight">{formatCurrency(Number(amount))}</span>
                          <p className="text-[9px] text-on-surface-variant/70 font-bold uppercase tracking-widest mt-0.5">{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </Card>

        {/* Composition & Export */}
        <div className="space-y-8">
          {/* Fixed vs Variable */}
          <Card className="premium-card p-8">
            <h3 className="text-xl font-bold text-on-background tracking-tight mb-8 uppercase tracking-wider text-sm">Composição de Gastos</h3>
            <div className="space-y-4">
              {[
                { label: "Despesas Fixas", value: budgetBreakdown.FIXED, color: "text-red-500", icon: RotateCcw },
                { label: "Despesas Variáveis", value: budgetBreakdown.VARIABLE, color: "text-secondary", icon: TrendingUp },
                { label: "Taxa de Poupança", value: null, label2: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? "text-secondary" : "text-amber-500", icon: Target }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-surface border border-outline/5 group hover:border-secondary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-on-surface-variant/60" strokeWidth={2.5} />
                    <span className="text-on-surface-variant/80 font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
                  </div>
                  <span className={cn("font-bold text-2xl tracking-tight text-right", item.color)}>
                    {item.value !== null ? formatCurrency(item.value) : item.label2}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Export Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="premium-card p-6 flex items-center justify-between text-left group border-none bg-surface"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold tracking-tight uppercase">Excel (CSV)</h4>
                <p className="text-[10px] font-medium text-on-surface-variant/80">
                  Dados estruturados
                </p>
              </div>
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                <Download className="w-5 h-5" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="premium-card p-6 flex items-center justify-between text-left group border-none bg-surface"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-bold tracking-tight uppercase">Documento PDF</h4>
                <p className="text-[10px] font-medium text-on-surface-variant/80">Versão impressa</p>
              </div>
              <div className="w-10 h-10 bg-surface-variant text-on-surface-variant rounded-xl flex items-center justify-center group-hover:bg-on-surface group-hover:text-surface transition-all">
                <LayoutPanelLeft className="w-5 h-5" />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
