"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Target, AlertTriangle, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  alertAt: number;
  spent: number;
  percentage: number;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function Orcamentos() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  // Form
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("MONTHLY");
  const [alertAt, setAlertAt] = useState("80");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().toISOString().slice(0, 7));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, catsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories")
      ]);
      const [budgetsData, catsData] = await Promise.all([budgetsRes.json(), catsRes.json()]);
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      const expenseCats = Array.isArray(catsData) ? catsData.filter((c: Category) => c.type === "EXPENSE") : [];
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

    if (!amount || !categoryId) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("O valor do orcamento deve ser maior que zero");
      return;
    }

    setSaving(true);
    try {
      const payload = { categoryId, amount: numAmount, period, alertAt: parseFloat(alertAt) };
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Orcamento criado!");
        setIsOpen(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao criar orcamento");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!await confirm({ title: "Excluir orcamento", message: "Tem certeza que deseja remover este orcamento?", confirmLabel: "Excluir", variant: "danger" })) return;
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Orcamento removido!"); fetchData(); }
    else toast.error("Erro ao remover");
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const alertCount = budgets.filter((b) => b.percentage >= b.alertAt).length;

  const getBarVariant = (pct: number): string => {
    if (pct > 95) return "critical";
    if (pct >= 80) return "danger";
    if (pct >= 50) return "warning";
    return "success";
  };

  return (
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-20 md:pb-0 px-4 md:px-0 relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-3.5 rounded-2xl bg-secondary text-on-secondary shadow-sm"
          >
            <Target className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Orcamentos</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Planejamento e controle de limites</p>
          </div>
        </div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="inline-flex items-center gap-3 bg-background rounded-2xl shadow-sm px-5 py-3.5 border border-border/10 w-full md:w-auto"
        >
          <Calendar className="w-5 h-5 text-primary shrink-0" />
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Periodo</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-12 min-h-[44px] px-0 py-0 bg-transparent border-0 font-bold text-base text-foreground focus:ring-0 focus:outline-none w-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
      >
        <Card>
          <CardContent>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Orcado</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Consumido</p>
            <p className="text-2xl sm:text-3xl font-bold text-destructive tracking-tight mt-1">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card className={alertCount > 0 ? "border-warning/30 bg-warning/5" : ""}>
          <CardContent>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Alertas Criticos</p>
            <div className="flex items-center gap-3 mt-1">
              {alertCount > 0 ? <AlertTriangle className="w-6 h-6 text-warning" /> : <CheckCircle2 className="w-6 h-6 text-success" />}
              <p className={cn("text-2xl sm:text-3xl font-bold tracking-tight", alertCount > 0 ? "text-warning" : "text-success")}>
                {alertCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget List */}
      {loading ? (
        <div className="py-24 text-center text-muted-foreground/30 font-semibold text-xs italic">
          Analisando orcamentos...
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={Target}
            title="Nenhum orcamento definido"
            description="Crie metas para ter um controle financeiro preciso"
            ctaLabel="Novo Orcamento"
            onCta={() => setIsOpen(true)}
          />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4"
        >
          {budgets.map((budget) => {
            const pct = Math.min(budget.percentage || 0, 100);
            const isAlert = (budget.percentage || 0) >= budget.alertAt;
            const isOver = (budget.percentage || 0) >= 100;
            const barVariant = getBarVariant(budget.percentage || 0);

            const barFillClass = 
              barVariant === "critical" ? "bg-destructive animate-pulse" :
              barVariant === "danger" ? "bg-destructive" :
              barVariant === "warning" ? "bg-warning" :
              "bg-success";

            const badgeVariant =
              barVariant === "critical" ? "destructive" :
              barVariant === "danger" ? "destructive" :
              barVariant === "warning" ? "secondary" :
              "default";

            return (
              <motion.div
                key={budget.id}
                variants={itemVariants}
              >
                <Card className={cn(
                  "group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
                  isOver && "border-destructive/20 bg-destructive/5",
                  isAlert && !isOver && "border-warning/20 bg-warning/5"
                )}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 md:mb-6">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg sm:text-xl text-foreground tracking-tight">{budget.category?.name}</h3>
                        <Badge variant={badgeVariant} className={cn(
                          "px-2.5 py-1 text-[11px] font-extrabold tracking-tight",
                          badgeVariant === "default" && "bg-success/15 text-success border-success/30"
                        )}>
                          {(budget.percentage || 0).toFixed(1)}% usado
                        </Badge>
                        {isOver && <Badge variant="destructive" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">Limite Excedido</Badge>}
                        {isAlert && !isOver && <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-warning/10 text-warning border-warning/30">Atencao</Badge>}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        Fluxo {budget.period === "MONTHLY" ? "Mensal" : "Anual"} de Gastos
                      </span>
                    </div>
                    <div className="flex items-center gap-5 self-end md:self-auto">
                      <div className="text-right">
                        <p className="font-bold text-foreground text-xl sm:text-2xl tracking-tight">{formatCurrency(budget.spent || 0)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">de {formatCurrency(budget.amount)} total</p>
                      </div>
                      <Button variant="ghost" size="icon"
                        aria-label="Excluir orcamento"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive transition-colors"
                        onClick={() => handleDelete(budget.id)}>
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Progress value={pct}>
                      <ProgressTrack className="h-1.5 rounded-full bg-muted">
                        <ProgressIndicator className={cn("h-full rounded-full", barFillClass)} />
                      </ProgressTrack>
                    </Progress>
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        isOver ? "text-destructive" : isAlert ? "text-warning" : "text-success"
                      )}>
                        {(budget.percentage || 0).toFixed(1)}% utilizado do total
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        Alerta em {budget.alertAt}%
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* FAB / CTA — Novo Orcamento */}
      <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
        <DialogTrigger
          render={
            <Button
              size="lg"
              className="fixed bottom-[12rem] right-6 z-30 md:relative md:bottom-auto md:right-auto md:mt-8 apple-button-primary rounded-2xl shadow-lg px-6 py-3.5 min-h-[44px]"
            />
          }
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Orcamento
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Novo Orcamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={(v: string | null) => setCategoryId(v || "")}>
                <SelectTrigger id="category" className="min-h-[44px] rounded-xl">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: Category) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input id="amount" type="number" step="0.01" min="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="min-h-[44px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Periodicidade</Label>
              <div className="flex gap-2">
                <Toggle
                  pressed={period === "MONTHLY"}
                  onPressedChange={() => setPeriod("MONTHLY")}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-h-[44px] rounded-xl"
                >
                  Mensal
                </Toggle>
                <Toggle
                  pressed={period === "ANNUAL"}
                  onPressedChange={() => setPeriod("ANNUAL")}
                  variant="outline"
                  size="lg"
                  className="flex-1 min-h-[44px] rounded-xl"
                >
                  Anual
                </Toggle>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alertAt">Alerta em (%)</Label>
              <Input id="alertAt" type="number" min="1" max="100" placeholder="80" value={alertAt} onChange={(e) => setAlertAt(e.target.value)} className="min-h-[44px] rounded-xl" />
            </div>
            <Button type="submit" size="lg" disabled={saving} className="w-full apple-button-primary min-h-[44px] rounded-xl">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              Criar Orcamento
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
