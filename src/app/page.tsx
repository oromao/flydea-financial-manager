"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CalendarDays, History, LayoutDashboard, ReceiptText, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ balance: 0, income: 0, expenses: 0, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (e) {
        console.error("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 md:space-y-14 max-w-7xl mx-auto pb-12"
    >
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 px-4 md:px-0">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="p-4 rounded-3xl bg-primary text-on-primary shadow-2xl shadow-primary/20"
          >
            <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-on-background">
              Dashboard
            </h1>
            <p className="text-on-surface-variant font-bold text-sm md:text-lg uppercase tracking-[0.1em] opacity-70">
              Fluxo FLY DEA <span className="text-primary">•</span> v3.5 Premium
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-surface-variant/20 px-6 py-4 rounded-full border border-white/5 backdrop-blur-md self-end sm:self-auto shadow-xl">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="text-xs md:text-base font-black text-on-background uppercase tracking-widest">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </motion.header>
      
      <motion.div variants={itemVariants} className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-3">
        <Card className="m3-glass border-none text-on-primary-container p-8 min-h-[220px] md:min-h-[260px] flex flex-col justify-center relative overflow-hidden group shadow-2xl hover:scale-[1.03] transition-all duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/80 to-primary-container/40 -z-10" />
          <div className="absolute -top-10 -right-10 p-12 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-1000 ease-out">
            <Wallet className="w-32 h-32 md:w-48 md:h-48" />
          </div>
          <CardHeader className="p-0 mb-6">
            <h2 className="text-on-primary-container/60 text-xs font-black uppercase tracking-[0.3em]">Saldo Consolidado</h2>
          </CardHeader>
          <CardContent className="p-0 relative z-10">
            {loading ? <Skeleton className="h-12 w-48 md:h-16 md:w-64 bg-white/10" /> : (
              <div className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl">
                {formatCurrency(metrics.balance)}
              </div>
            )}
            <div className="mt-8 flex items-center gap-3 text-on-primary-container/80 text-xs md:text-sm font-black uppercase tracking-[0.2em]">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", metrics.balance >= 0 ? "bg-emerald-400" : "bg-rose-400")} />
              <span>Status: {metrics.balance >= 0 ? "Operação Saudável" : "Atenção Crítica"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="m3-card-glass p-8 min-h-[200px] md:min-h-[260px] flex flex-col justify-center group hover:scale-[1.02] active:scale-95 transition-all cursor-default">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant text-xs font-black uppercase tracking-[0.3em]">Entradas (Mês)</h2>
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
            >
              <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8" />
            </motion.div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-10 w-40 md:h-12 md:w-56 bg-white/5" /> : (
              <div className="text-3xl md:text-5xl font-black text-on-background tracking-tight">
                {formatCurrency(metrics.income)}
              </div>
            )}
            <p className="mt-8 text-[10px] md:text-xs text-on-surface-variant/40 font-black uppercase tracking-[0.2em] leading-none">Receita Mensal Bruta</p>
          </CardContent>
        </Card>

        <Card className="m3-card-glass p-8 min-h-[200px] md:min-h-[260px] flex flex-col justify-center group hover:scale-[1.02] active:scale-95 transition-all cursor-default">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <h2 className="text-on-surface-variant text-xs font-black uppercase tracking-[0.3em]">Saídas (Mês)</h2>
            <motion.div 
              whileHover={{ y: 5 }}
              className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/10"
            >
              <ArrowDownRight className="w-6 h-6 md:w-8 md:h-8" />
            </motion.div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <Skeleton className="h-10 w-40 md:h-12 md:w-56 bg-white/5" /> : (
              <div className="text-3xl md:text-5xl font-black text-on-background tracking-tight">
                {formatCurrency(metrics.expenses)}
              </div>
            )}
            <p className="mt-8 text-[10px] md:text-xs text-on-surface-variant/40 font-black uppercase tracking-[0.2em] leading-none">Custo Operacional</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-10 lg:grid-cols-2 mt-8 md:mt-12">
        <Card className="m3-card-glass border-none overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <CardHeader className="p-10 pb-6">
             <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-black text-on-background flex items-center gap-5">
                    <motion.div whileHover={{ scale: 1.2 }} className="p-2 bg-primary/10 rounded-xl">
                      <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </motion.div>
                    Fluxo Diário
                  </CardTitle>
                  <p className="text-xs md:text-sm text-on-surface-variant/60 mt-2 font-bold uppercase tracking-widest italic">Performance de caixa</p>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 h-[350px] md:h-[450px]">
            {loading ? <Skeleton className="h-full w-full bg-white/5 rounded-[32px]" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    tick={{ dy: 10 }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => value > 999 ? `${(value/1000).toFixed(0)}k` : value}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(28, 27, 31, 0.9)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '20px', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      padding: '12px 18px'
                    }}
                    itemStyle={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <motion.div variants={itemVariants} className="flex flex-col gap-10">
          <Card className="m3-card-glass border-none flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <CardHeader className="flex flex-row items-center justify-between p-10">
              <CardTitle className="flex items-center gap-5 text-2xl md:text-3xl font-black text-on-background">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 1 }} className="p-2 bg-primary/10 rounded-xl">
                  <History className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </motion.div>
                Atividade
              </CardTitle>
              <Link href="/movimentacoes" className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity border-b-2 border-primary/20 pb-1">
                Explorar Tudo
              </Link>
            </CardHeader>
            <CardContent className="px-10 pb-12">
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center gap-8 group cursor-pointer"
               >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shadow-2xl transition-transform group-hover:rotate-6">
                     <ReceiptText className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-on-background">Conciliação Bancária</h3>
                    <p className="text-on-surface-variant/60 font-bold text-xs md:text-sm uppercase tracking-widest mt-1">Sincronização inteligente de fluxos.</p>
                  </div>
               </motion.div>
            </CardContent>
          </Card>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="w-full bg-primary rounded-[40px] p-12 text-on-primary shadow-2xl shadow-primary/20 relative overflow-hidden group cursor-pointer"
          >
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
             <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-container/30 rounded-full blur-[60px]"></div>
             
             <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter relative z-10">Novo Registro</h2>
             <p className="text-on-primary/70 mb-10 text-base md:text-xl font-bold leading-tight relative z-10 uppercase tracking-widest">
               Gestão em tempo real <br/> <span className="opacity-50">para decisões precisas.</span>
             </p>
             <Link href="/movimentacoes" className="inline-flex h-16 bg-on-primary text-primary rounded-full px-12 items-center justify-center gap-4 font-black text-base md:text-lg hover:bg-on-primary/90 transition-all shadow-2xl relative z-10 group/btn">
               LANÇAR AGORA
               <ArrowUpRight className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
             </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
