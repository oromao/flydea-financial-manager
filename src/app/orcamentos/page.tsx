"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [alertAt, setAlertAt] = useState("80");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast("Orçamento criado!", "success");
      setIsOpen(false);
      resetForm();
      fetchData();
    } else {
      const err = await res.json();
      showToast(err.error || "Erro ao criar orçamento", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este orçamento?")) return;
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Orçamento removido!", "success"); fetchData(); }
    else showToast("Erro ao remover", "error");
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
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-32 px-4 md:px-0 relative">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-surface/90 backdrop-blur-md transition-all duration-300",
              toast.type === "success" 
                ? "border-emerald-200 text-emerald-700" 
                : "border-red-200 text-red-700"
            )}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <span className="font-semibold text-xs tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-3.5 rounded-2xl bg-secondary text-on-secondary shadow-sm"
          >
            <Target className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">Orçamentos</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Planejamento e controle de limites</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVO ORÇAMENTO
          </DialogTrigger>
          <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none rounded-3xl bg-surface shadow-2xl">
            <div className="p-8 border-b border-outline/10 bg-surface">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-on-background">
                  Definir Orçamento
                </DialogTitle>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Estabeleça limites inteligentes por categoria</p>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant/70 ml-1">Categoria</Label>
                <Select value={categoryId} onValueChange={(v) => setCategoryId(v || "")}>
                  <SelectTrigger className="h-11 font-medium">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant/70 ml-1">Limite (BRL)</Label>
                  <Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="h-11 font-bold text-lg"
                    placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant/70 ml-1">Período</Label>
                  <Select value={period} onValueChange={(v) => setPeriod(v || "MONTHLY")}>
                    <SelectTrigger className="h-11 font-medium">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MONTHLY" className="rounded-lg">Mensal</SelectItem>
                      <SelectItem value="YEARLY" className="rounded-lg">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-xs font-semibold text-on-surface-variant/70">
                    Alerta de Proximidade
                  </Label>
                  <span className="text-xs font-bold text-secondary">{alertAt}%</span>
                </div>
                <Input type="range" min="10" max="100" step="5" value={alertAt}
                  onChange={(e) => setAlertAt(e.target.value)}
                  className="h-1.5 w-full accent-secondary" />
                <div className="flex justify-between text-[10px] text-on-surface-variant/30 font-bold uppercase tracking-wider">
                  <span>Mínimo</span><span>Crítico</span>
                </div>
              </div>

              <Button type="submit" className="apple-button-primary w-full h-12 text-base mt-2">
                Confirmar Configuração
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
      >
        <Card className="premium-card p-6 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Orçado</p>
          <p className="text-3xl font-bold text-on-background tracking-tight mt-1">{formatCurrency(totalBudget)}</p>
        </Card>
        <Card className="premium-card p-6 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Total Consumido</p>
          <p className="text-3xl font-bold text-red-600 tracking-tight mt-1">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className={cn("premium-card p-6 flex flex-col justify-between transition-all", alertCount > 0 ? "border-amber-100 bg-amber-50/20" : "")}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Alertas Críticos</p>
          <div className="flex items-center gap-3 mt-1">
            {alertCount > 0 ? <AlertTriangle className="w-6 h-6 text-amber-500" /> : <CheckCircle2 className="w-6 h-6 text-secondary" />}
            <p className={cn("text-3xl font-bold tracking-tight", alertCount > 0 ? "text-amber-600" : "text-secondary")}>
              {alertCount}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Budget List */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant/30 font-semibold text-xs italic">
          Analisando orçamentos...
        </div>
      ) : budgets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 opacity-30"
        >
            <Target className="w-16 h-16 text-on-surface-variant" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-on-background">Nenhum orçamento definido</h2>
              <p className="font-medium text-sm mt-1">Crie metas para ter um controle financeiro preciso</p>
            </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {budgets.map((budget, idx) => {
            const pct = Math.min(budget.percentage || 0, 100);
            const isAlert = (budget.percentage || 0) >= budget.alertAt;
            const isOver = (budget.percentage || 0) >= 100;

            const barColorClass = isOver 
              ? "bg-red-500" 
              : isAlert 
                ? "bg-amber-500" 
                : "bg-secondary";

            return (
              <motion.div 
                key={budget.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
              >
                <Card className={cn(
                  "premium-card p-7 group transition-all",
                  isOver && "border-red-100 bg-red-50/10",
                  isAlert && !isOver && "border-amber-100 bg-amber-50/10"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl text-on-background tracking-tight">{budget.category?.name}</h3>
                        {isOver && <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-bold uppercase tracking-wider">Limite Excedido</span>}
                        {isAlert && !isOver && <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-bold uppercase tracking-wider">Atenção</span>}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                        Fluxo {budget.period === "MONTHLY" ? "Mensal" : "Anual"} de Gastos
                      </span>
                    </div>
                    <div className="flex items-center gap-6 self-end md:self-auto">
                      <div className="text-right">
                        <p className="font-bold text-on-background text-2xl tracking-tight">{formatCurrency(budget.spent || 0)}</p>
                        <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">de {formatCurrency(budget.amount)} total</p>
                      </div>
                      <Button variant="ghost" size="icon"
                        className="w-10 h-10 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-all"
                        onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="h-2 bg-surface-variant/50 rounded-full overflow-hidden border border-outline/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-full", barColorClass)} 
                      />
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className={cn("text-[10px] uppercase tracking-wider", isOver ? "text-red-600" : isAlert ? "text-amber-600" : "text-secondary")}>
                        {(budget.percentage || 0).toFixed(1)}% utilizado do total
                      </span>
                      <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                        Alerta configurado para {budget.alertAt}%
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
