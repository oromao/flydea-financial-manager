"use client";

import { useEffect, useState } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, TrendingDown, LayoutPanelLeft, ArrowRight, BarChart3, Presentation,
  Download, TrendingUp, Calendar, Filter
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#F43F5E", "#06B6D4", "#84CC16", "#EC4899"];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32 px-4 md:px-0"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-row items-center gap-4">
          <div className="p-4 rounded-3xl bg-secondary text-white shadow-2xl shadow-secondary/20">
            <Presentation className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-on-background">Relatórios</h1>
            <p className="text-[10px] md:text-sm text-on-surface-variant/40 mt-1 font-bold uppercase tracking-[0.2em]">
              Insights Financeiros <span className="text-primary">•</span> FLY DEA
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary" />
          <Select value={period} onValueChange={(v) => setPeriod(v || "0")}>
            <SelectTrigger className="w-48 h-12 rounded-2xl border-white/10 bg-white/5 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#09090B] border-white/10">
              <SelectItem value="0">Mês Atual</SelectItem>
              <SelectItem value="1">Mês Passado</SelectItem>
              <SelectItem value="2">2 Meses Atrás</SelectItem>
              <SelectItem value="3">3 Meses Atrás</SelectItem>
              <SelectItem value="5">5 Meses Atrás</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.header>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receitas", value: totalIncome, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Despesas", value: totalExpenses, color: "text-rose-400", bg: "bg-rose-500/10" },
          { label: "Saldo Líquido", value: netBalance, color: netBalance >= 0 ? "text-secondary" : "text-rose-400", bg: "bg-white/5" },
          { label: "Taxa de Poupança", value: null, color: savingsRate >= 20 ? "text-secondary" : "text-amber-400", bg: "bg-white/5", label2: `${savingsRate.toFixed(1)}%` },
        ].map((card, i) => (
          <div key={i} className={`glass-card p-5 rounded-[24px] ${card.bg}`}>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">{card.label}</p>
            <p className={`text-2xl font-black mt-1 tracking-tighter ${card.color}`}>
              {card.value !== null ? formatCurrency(card.value) : card.label2}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid gap-8 grid-cols-1 lg:grid-cols-2">

        {/* Pie Chart - Expenses by Category */}
        <div className="glass-card border-none rounded-[32px] overflow-hidden p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-primary text-on-primary shadow-xl">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-background tracking-tighter uppercase">Gastos por Categoria</h2>
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1 capitalize">{periodLabel}</p>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-on-surface-variant/20 font-black uppercase text-xs tracking-widest">Carregando...</div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-on-surface-variant/20">
              <TrendingDown className="w-12 h-12 opacity-20" />
              <p className="font-bold text-sm">Nenhum dado para este período.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                  paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "rgba(9,9,11,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "12px" }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart - Income vs Expense by Category */}
        <div className="glass-card border-none rounded-[32px] overflow-hidden p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-secondary text-white shadow-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-background tracking-tighter uppercase">Receita vs Despesa</h2>
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1">Por Categoria</p>
            </div>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-on-surface-variant/20 font-black uppercase text-xs tracking-widest">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "rgba(9,9,11,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff", fontSize: "12px" }}
                />
                <Bar dataKey="Receita" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesa" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Breakdown & Export Row */}
      <motion.div variants={itemVariants} className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">

        {/* Expense breakdown list */}
        <div className="glass-card p-6 md:p-8 rounded-[32px] overflow-hidden">
          <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-6">
            <div className="p-3 rounded-2xl bg-primary text-on-primary shadow-xl">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-on-background tracking-tighter uppercase">Detalhamento</h2>
          </div>
          {loading ? (
            <div className="py-12 text-center font-black text-on-surface-variant/20 text-[10px] tracking-widest animate-pulse uppercase">Sincronizando...</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(expensesByCategory).length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-4 text-on-surface-variant/20">
                  <TrendingDown className="w-10 h-10 opacity-20" />
                  <p className="font-bold text-sm">Nenhum dado encontrado.</p>
                </div>
              ) : (
                Object.entries(expensesByCategory)
                  .sort(([, a], [, b]) => Number(b) - Number(a))
                  .map(([category, amount], i) => {
                    const pct = totalExpenses > 0 ? (Number(amount) / totalExpenses) * 100 : 0;
                    return (
                      <div key={category}
                        className="flex items-center justify-between p-4 rounded-[18px] bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <div>
                            <span className="font-bold text-sm text-on-background">{category}</span>
                            <div className="w-24 h-1.5 bg-white/5 rounded-full mt-1">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-lg text-on-background">{formatCurrency(Number(amount))}</span>
                          <p className="text-[10px] text-on-surface-variant/40 font-bold">{pct.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>

        {/* Composition & Export */}
        <div className="space-y-6">
          {/* Fixed vs Variable */}
          <div className="glass-card bg-white/[0.02] border-none p-8 rounded-[32px] shadow-2xl">
            <h3 className="text-xl font-black text-on-background tracking-tight mb-6">Composição de Gastos</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 rounded-[20px] bg-background/40 border border-white/5 shadow-xl">
                <span className="text-on-surface-variant/40 font-black uppercase text-[10px] tracking-[0.2em]">Despesas Fixas</span>
                <span className="text-rose-400 font-black text-2xl tracking-tighter">{formatCurrency(budgetBreakdown.FIXED)}</span>
              </div>
              <div className="flex justify-between items-center p-5 rounded-[20px] bg-background/40 border border-white/5 shadow-xl">
                <span className="text-on-surface-variant/40 font-black uppercase text-[10px] tracking-[0.2em]">Despesas Variáveis</span>
                <span className="text-secondary font-black text-2xl tracking-tighter">{formatCurrency(budgetBreakdown.VARIABLE)}</span>
              </div>
              {totalIncome > 0 && (
                <div className="flex justify-between items-center p-5 rounded-[20px] bg-background/40 border border-white/5 shadow-xl">
                  <span className="text-on-surface-variant/40 font-black uppercase text-[10px] tracking-[0.2em]">Taxa de Poupança</span>
                  <span className={`font-black text-2xl tracking-tighter ${savingsRate >= 20 ? "text-secondary" : "text-amber-400"}`}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="glass-card border-none px-8 py-6 rounded-[28px] text-on-surface active:scale-[0.98] transition-all cursor-pointer hover:bg-white/5 shadow-2xl flex items-center justify-between group w-full"
          >
            <div className="text-left">
              <h4 className="text-base font-black tracking-tight uppercase">Exportar CSV</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                {periodLabel} · compatível com Excel
              </p>
            </div>
            <div className="p-3 bg-white/5 text-secondary rounded-2xl border border-white/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
              <Download className="w-5 h-5" />
            </div>
          </button>

          <button
            onClick={handlePrint}
            className="glass-card border-none px-8 py-6 rounded-[28px] text-on-surface active:scale-[0.98] transition-all cursor-pointer hover:bg-white/5 shadow-2xl flex items-center justify-between group w-full"
          >
            <div className="text-left">
              <h4 className="text-base font-black tracking-tight uppercase">Exportar PDF</h4>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Gerar documento para impressão</p>
            </div>
            <div className="p-3 bg-white/5 text-primary rounded-2xl border border-white/10 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
              <LayoutPanelLeft className="w-5 h-5" />
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
