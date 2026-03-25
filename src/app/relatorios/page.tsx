"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingDown, LayoutPanelLeft, ArrowRight, BarChart3, Presentation } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function Relatorios() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const expensesByCategory = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const catName = t.category?.name || "Sem Categoria";
      acc[catName] = (acc[catName] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const budgetBreakdown = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const type = t.status === "RECURRING" ? "FIXED" : "VARIABLE";
      acc[type] = (acc[type] || 0) + t.amount;
      return acc;
    }, { FIXED: 0, VARIABLE: 0 } as Record<string, number>);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32 px-4 md:px-0"
    >
      <motion.header variants={itemVariants} className="flex flex-row items-center gap-4 md:gap-6">
        <div className="p-4 md:p-5 rounded-3xl bg-secondary text-white shadow-2xl shadow-secondary/20">
           <Presentation className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tight text-on-background">Relatórios</h1>
           <p className="text-[10px] md:text-sm text-on-surface-variant/40 mt-1 font-bold uppercase tracking-[0.2em]">Insights Financeiros <span className="text-primary">•</span> FLY DEA</p>
        </div>
      </motion.header>
      
      <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <div className="glass-card p-4 md:p-8 rounded-[32px] overflow-hidden min-h-full">
          <div className="flex flex-row items-center gap-4 md:gap-6 pb-6 md:pb-10 pt-4 md:pt-6 px-4 md:px-6 border-b border-white/5">
            <div className="p-3 md:p-4 rounded-2xl bg-primary text-on-primary shadow-xl">
              <PieChart className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-on-background tracking-tighter uppercase">Gastos por Categoria</h2>
              <p className="text-[9px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] mt-1">Análise de Fluxo Operacional</p>
            </div>
          </div>
          <div className="px-4 md:px-6 pb-6 md:pb-10 pt-8">
            {loading ? <div className="py-12 md:py-24 text-center font-black text-on-surface-variant/20 text-[10px] tracking-widest animate-pulse uppercase">Sincronizando...</div> : (
              <div className="space-y-4">
                {Object.entries(expensesByCategory).length === 0 ? (
                  <div className="py-12 md:py-16 flex flex-col items-center justify-center gap-4 md:gap-6 text-on-surface-variant/20">
                    <TrendingDown className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
                    <p className="font-bold text-xs md:text-sm tracking-tight capitalize">Nenhum dado encontrado para este período.</p>
                  </div>
                ) : (
                  Object.entries(expensesByCategory)
                    .sort(([,a], [,b]) => Number(b) - Number(a))
                    .map(([category, amount]) => (
                    <div key={category} className="group flex items-center justify-between p-5 md:p-6 rounded-[24px] bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 active:scale-[0.98] transition-all duration-300">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-secondary shadow-[0_0_15px_rgba(var(--secondary),0.5)]" />
                        <span className="font-bold text-sm md:text-lg text-on-background tracking-tight">{category}</span>
                      </div>
                      <span className="font-black text-base md:text-2xl text-on-background tracking-tighter">
                        {formatCurrency(Number(amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6 md:space-y-10 text-center md:text-left">
          <div className="glass-card bg-white/[0.02] border-none p-8 md:p-12 rounded-[32px] flex flex-col justify-center min-h-[300px] md:min-h-[450px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="flex flex-col items-center text-center space-y-8 relative z-10">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-primary flex items-center justify-center relative shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-700">
                 <BarChart3 className="w-10 h-10 md:w-14 md:h-14 text-on-primary" />
              </div>
              <div className="space-y-6 px-2 w-full">
                <h3 className="text-2xl md:text-4xl font-black text-on-background tracking-tight">Composição de Gastos</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 rounded-[24px] bg-background/40 border border-white/5 shadow-xl">
                    <span className="text-on-surface-variant/40 font-black uppercase text-[10px] tracking-[0.2em]">Despesas Fixas</span>
                    <span className="text-rose-400 font-black text-2xl tracking-tighter">{formatCurrency(budgetBreakdown.FIXED)}</span>
                  </div>
                  <div className="flex justify-between items-center p-6 rounded-[24px] bg-background/40 border border-white/5 shadow-xl">
                    <span className="text-on-surface-variant/40 font-black uppercase text-[10px] tracking-[0.2em]">Despesas Variáveis</span>
                    <span className="text-secondary font-black text-2xl tracking-tighter">{formatCurrency(budgetBreakdown.VARIABLE)}</span>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 text-secondary font-black text-[10px] tracking-[0.3em] bg-secondary/10 px-8 py-4 rounded-full border border-secondary/20 uppercase">
                 Estatísticas Ativas
                 <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => window.print()}
            className="glass-card border-none px-8 py-8 rounded-[32px] text-on-surface active:scale-[0.98] transition-all cursor-pointer hover:bg-white/5 shadow-2xl flex items-center justify-between group"
          >
             <div className="text-left">
                <h4 className="text-lg font-black tracking-tight uppercase">Exportar PDF Corporativo</h4>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Gerar documento oficial para impressão</p>
             </div>
             <div className="p-4 bg-white/5 text-primary rounded-2xl border border-white/10 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                <LayoutPanelLeft className="w-6 h-6" />
             </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
