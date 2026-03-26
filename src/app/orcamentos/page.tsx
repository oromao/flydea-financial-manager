"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { CardsGridSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function Orcamentos() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  // Form
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [alertAt, setAlertAt] = useState("80");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, catsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories")
      ]);
      const [budgetsData, catsData] = await Promise.all([budgetsRes.json(), catsRes.json()]);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      const expenseCats = Array.isArray(catsData) ? catsData.filter((c: any) => c.type === "EXPENSE") : [];
      setCategories(expenseCats);
      if (expenseCats.length > 0) setCategoryId(expenseCats[0].id);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setAmount(""); setPeriod("MONTHLY"); setAlertAt("80");
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { categoryId, amount: parseFloat(amount), period, alertAt: parseFloat(alertAt) };
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      toast.success("Orçamento criado!");
      setIsOpen(false);
      resetForm();
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao criar orçamento");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({ message: "Remover este orçamento?", confirmLabel: "Remover", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Orçamento removido!"); fetchData(); }
    else toast.error("Erro ao remover");
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const alertCount = budgets.filter((b) => b.percentage >= b.alertAt).length;

  const getBarColor = (pct: number, alertAt: number) => {
    if (pct >= 100) return "#f43f5e";
    if (pct >= alertAt) return "#f59e0b";
    return "#10b981";
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32 px-4 md:px-0">

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-secondary text-white shadow-xl shadow-secondary/20">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">Orçamentos</h1>
            <p className="text-[10px] text-on-surface-variant/40 mt-1 font-bold uppercase tracking-[0.2em]">
              Metas & Limites de Gastos
            </p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="m3-button-premium h-14 px-8 border-none" />}>
            <Plus className="w-5 h-5 mr-2" /> NOVO ORÇAMENTO
          </DialogTrigger>
          <DialogContent className="w-[95vw] md:max-w-lg bg-[#09090B] border border-white/10 rounded-[32px] p-0 overflow-hidden shadow-2xl">
            <div className="bg-white/5 p-8 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white uppercase tracking-[0.2em]">
                  Definir Orçamento
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Categoria</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v || "")}>
                  <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#09090B] border-white/10">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Limite (R$)</Label>
                  <Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white text-lg font-bold"
                    placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Período</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v || "MONTHLY")}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#09090B] border-white/10">
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="YEARLY">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                  Alertar ao atingir {alertAt}%
                </Label>
                <Input type="range" min="10" max="100" step="5" value={alertAt}
                  onChange={(e) => setAlertAt(e.target.value)}
                  className="h-2 w-full accent-primary" />
                <div className="flex justify-between text-[10px] text-on-surface-variant/40 font-bold">
                  <span>10%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              <Button type="submit" className="m3-button-premium w-full h-14 border-none mt-2">
                DEFINIR ORÇAMENTO
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-[24px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Total Orçado</p>
          <p className="text-3xl font-black text-white mt-2">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="glass-card p-6 rounded-[24px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Total Gasto</p>
          <p className="text-3xl font-black text-rose-400 mt-2">{formatCurrency(totalSpent)}</p>
        </div>
        <div className={cn("glass-card p-6 rounded-[24px]", alertCount > 0 && "border border-amber-500/20 bg-amber-500/5")}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Alertas Ativos</p>
          <div className="flex items-center gap-2 mt-2">
            {alertCount > 0 ? <AlertTriangle className="w-6 h-6 text-amber-400" /> : <CheckCircle2 className="w-6 h-6 text-secondary" />}
            <p className={cn("text-3xl font-black", alertCount > 0 ? "text-amber-400" : "text-secondary")}>
              {alertCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Budget List */}
      {loading ? (
        <CardsGridSkeleton count={3} />
      ) : budgets.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Target}
            title="Nenhum orçamento definido"
            description="Defina limites de gastos por categoria para manter suas finanças sob controle."
            ctaLabel="+ NOVO ORÇAMENTO"
            onCta={() => setIsOpen(true)}
          />
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          {budgets.map((budget) => {
            const pct = Math.min(budget.percentage || 0, 100);
            const barColor = getBarColor(budget.percentage || 0, budget.alertAt);
            const isAlert = (budget.percentage || 0) >= budget.alertAt;
            const isOver = (budget.percentage || 0) >= 100;

            return (
              <div key={budget.id}
                className={cn("glass-card border-none rounded-[24px] p-6 group transition-all",
                  isOver && "border border-rose-500/20 bg-rose-500/5",
                  isAlert && !isOver && "border border-amber-500/20 bg-amber-500/5")}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-on-background text-lg">{budget.category?.name}</h3>
                      {isOver && <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase">Estourado</span>}
                      {isAlert && !isOver && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase">Alerta</span>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                      {budget.period === "MONTHLY" ? "Mensal" : "Anual"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-black text-white text-xl">{formatCurrency(budget.spent || 0)}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant/40">de {formatCurrency(budget.amount)}</p>
                    </div>
                    <Button variant="ghost" size="icon"
                      className="rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-500/10"
                      onClick={() => handleDelete(budget.id)}>
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold" style={{ color: barColor }}>
                      {(budget.percentage || 0).toFixed(1)}% utilizado
                    </span>
                    <span className="text-[10px] text-on-surface-variant/40 font-bold">
                      Alerta: {budget.alertAt}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
