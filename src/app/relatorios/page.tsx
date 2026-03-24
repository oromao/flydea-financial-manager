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
      className="space-y-8 md:space-y-12 max-w-6xl mx-auto pb-24 md:pb-12 px-2 md:px-0"
    >
      <motion.header variants={itemVariants} className="flex flex-row items-center gap-4 md:gap-6">
        <div className="p-3 md:p-4 rounded-2xl md:rounded-[28px] bg-[#BBC7DB] text-[#253140] shadow-sm">
           <Presentation className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <div>
           <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#E2E2E6]">Insights</h1>
           <p className="text-[10px] md:text-base text-[#C3C7CF] mt-1 font-bold uppercase tracking-widest">Relatórios de Fluxo v3.2</p>
        </div>
      </motion.header>
      
      <div className="grid gap-6 md:gap-10 grid-cols-1 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="m3-card-glass border-[#43474E] p-4 md:p-4 rounded-[28px] md:rounded-[32px] overflow-hidden min-h-full">
          <CardHeader className="flex flex-row items-center gap-4 md:gap-6 pb-6 md:pb-10 pt-4 md:pt-6 px-4 md:px-6">
            <div className="p-2 md:p-3 rounded-2xl bg-[#00497D] text-[#D1E4FF]">
              <PieChart className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-2xl font-bold text-[#E2E2E6]">Categorias</CardTitle>
              <p className="text-[9px] md:text-[10px] font-black text-[#8D9199] uppercase tracking-[0.2em] mt-1">Análise de Custos</p>
            </div>
          </CardHeader>
          <CardContent className="px-4 md:px-6 pb-6 md:pb-10">
            {loading ? <div className="py-12 md:py-24 text-center font-black text-[#8D9199] text-[10px] tracking-widest animate-pulse uppercase">PROCESSANDO DADOS...</div> : (
              <div className="space-y-3">
                {Object.entries(expensesByCategory).length === 0 ? (
                  <div className="py-12 md:py-16 flex flex-col items-center justify-center gap-4 md:gap-6 text-[#8D9199]/50">
                    <TrendingDown className="w-8 h-8 md:w-12 md:h-12 opacity-20" />
                    <p className="font-bold text-xs md:text-sm tracking-tight">Sem despesas registradas.</p>
                  </div>
                ) : (
                  Object.entries(expensesByCategory)
                    .sort(([,a], [,b]) => Number(b) - Number(a))
                    .map(([category, amount]) => (
                    <div key={category} className="group flex items-center justify-between p-4 md:p-5 rounded-[20px] md:rounded-[24px] bg-[#1D2024] border border-transparent hover:border-[#43474E] active:scale-[0.98] transition-all">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-[#BBC7DB]" />
                        <span className="font-bold text-sm md:text-lg text-[#E2E2E6] tracking-tight">{category}</span>
                      </div>
                      <span className="font-black text-base md:text-xl text-[#D1E4FF] tracking-tighter">
                        {formatCurrency(Number(amount))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6 md:space-y-10 text-center md:text-left">
          <Card className="m3-glass bg-[#1A1C1E]/40 border-none p-8 md:p-10 rounded-[28px] md:rounded-[32px] flex flex-col justify-center min-h-[300px] md:min-h-[400px] shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[#00497D] flex items-center justify-center relative shadow-lg">
                 <div className="absolute inset-0 bg-[#D0E4FF] rounded-full blur-2xl opacity-10 animate-pulse"></div>
                 <BarChart3 className="w-8 h-8 md:w-12 md:h-12 text-[#D1E4FF]" />
              </div>
              <div className="space-y-4 px-2 w-full">
                <h3 className="text-xl md:text-3xl font-black text-[#E2E2E6] tracking-tight">Composição de Gastos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-[#1A1C1E]/50 border border-[#D1E4FF]/10">
                    <span className="text-[#8D9199] font-black uppercase text-[10px] tracking-widest">Contas Fixas (Recorrência)</span>
                    <span className="text-[#FFB4A3] font-black text-lg">{formatCurrency(budgetBreakdown.FIXED)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-2xl bg-[#1A1C1E]/50 border border-[#D1E4FF]/10">
                    <span className="text-[#8D9199] font-black uppercase text-[10px] tracking-widest">Gastos Variáveis</span>
                    <span className="text-[#D1E4FF] font-black text-lg">{formatCurrency(budgetBreakdown.VARIABLE)}</span>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center gap-3 md:gap-4 text-[#D1E4FF] font-black text-[9px] md:text-xs tracking-widest bg-[#00497D]/50 px-6 md:px-8 py-3 md:py-4 rounded-full border border-[#D1E4FF]/10">
                 EM EVOLUÇÃO
                 <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Card>
          
          <Card 
            onClick={() => window.print()}
            className="m3-button-tonal border-none px-6 md:px-10 py-6 md:py-8 rounded-[28px] md:rounded-[32px] text-[#D7E3F7] active:scale-[0.98] transition-all cursor-pointer hover:bg-[#4A5768] shadow-lg"
          >
             <div className="flex items-center justify-between">
                <div>
                   <h4 className="text-sm md:text-lg font-bold">Relatório PDF</h4>
                   <p className="text-[10px] md:text-xs font-medium opacity-70 mt-0.5 md:mt-1">Clique para Imprimir/Exportar</p>
                </div>
                <div className="p-3 md:p-4 bg-[#D1E4FF] text-[#003258] rounded-xl md:rounded-2xl shadow-sm">
                   <LayoutPanelLeft className="w-5 h-5 md:w-6 md:h-6" />
                </div>
             </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
