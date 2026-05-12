"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  RotateCcw, Plus, Trash2, Calendar,
  AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

interface Recurrence {
  id: string;
  description: string;
  amount: number;
  frequency: string;
  startDate: string;
  nextDate: string;
  isActive: boolean;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
}

export default function Recorrências() {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");

  const fetchRecurrences = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurrences");
      const data = await res.json();
      setRecurrences(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch recurrences error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRecurrence = async (id: string, currentIsActive: boolean) => {
    try {
      const res = await fetch(`/api/recurrences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentIsActive }),
      });
      if (res.ok) {
        toast.success(currentIsActive ? "Recorrencia pausada" : "Recorrencia ativada");
        fetchRecurrences();
      } else {
        toast.error("Erro ao atualizar recorrencia");
      }
    } catch (e) {
      toast.error("Erro ao atualizar recorrencia");
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Excluir recorrencia",
      message: "Tem certeza que deseja excluir esta recorrencia? Lancamentos futuros nao serao criados.",
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/recurrences/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recorrencia excluida");
        fetchRecurrences();
      } else {
        toast.error("Erro ao excluir recorrencia");
      }
    } catch (e) {
      toast.error("Falha ao excluir recorrencia");
    }
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      if (data.length > 0) setCategoryId(data[0].id);
    } catch (e) {
    }
  }, []);

  useEffect(() => {
    fetchRecurrences();
    fetchCategories();
  }, [fetchRecurrences, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !categoryId || !startDate) {
      toast.error("Preencha todos os campos obrigatorios");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("O valor deve ser maior que zero");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/recurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount: numAmount, frequency, startDate, categoryId })
      });
      if (res.ok) {
        toast.success("Recorrencia agendada!");
        setIsDialogOpen(false);
        resetForm();
        fetchRecurrences();
        fetch("/api/cron/recurrence").catch(() => {});
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erro ao criar recorrencia");
      }
    } catch (e) {
      toast.error("Erro ao criar recorrencia");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setFrequency("MONTHLY");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <PageErrorBoundary>
    <div className="space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8"
      >
        <div className="flex items-center gap-5">
          <div className="p-3.5 rounded-2xl bg-secondary text-on-secondary shadow-lg shadow-secondary/20">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Recorrências</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Automacao de contas fixas e assinaturas</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (open) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8 rounded-xl shadow-lg shadow-secondary/20" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVA RECORRENCIA
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-card sm:shadow-2xl">
            <div className="p-8 border-b border-border/10 bg-card">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  Agendar Automacao
                </DialogTitle>
                <p className="text-muted-foreground text-sm font-medium mt-1">Configure lancamentos automaticos inteligentes</p>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Descricao</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} 
                  className="h-12 font-bold text-lg rounded-2xl bg-muted/20 border-border/10" 
                  placeholder="Ex: Aluguel, Netflix, Salarios..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Valor Mensal (BRL)</Label>
                  <MoneyInput value={amount} onChange={setAmount} className="h-12 font-black text-2xl rounded-2xl bg-muted/20 border-border/10" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Frequencia</Label>
                  <Select value={frequency} onValueChange={(v: string | null) => setFrequency(v || "MONTHLY")}>
                    <SelectTrigger className="h-12 font-bold rounded-2xl bg-muted/20 border-border/10">
                      {frequency === "MONTHLY" ? "Mensal" : frequency === "WEEKLY" ? "Semanal" : frequency === "BIWEEKLY" ? "Quinzenal" : "Anual"}
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/10">
                      <SelectItem value="WEEKLY" className="rounded-xl font-bold">Semanal</SelectItem>
                      <SelectItem value="BIWEEKLY" className="rounded-xl font-bold">Quinzenal</SelectItem>
                      <SelectItem value="MONTHLY" className="rounded-xl font-bold">Mensal</SelectItem>
                      <SelectItem value="YEARLY" className="rounded-xl font-bold">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="h-12 font-bold rounded-2xl bg-muted/20 border-border/10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoria</Label>
                  <Select value={categoryId} onValueChange={(v: string | null) => setCategoryId(v || "")}>
                    <SelectTrigger className="h-12 font-bold rounded-2xl bg-muted/20 border-border/10">
                      {categories.find(c => c.id === categoryId)?.name || <span className="text-muted-foreground/50">Selecione...</span>}
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/10">
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={saving} className="apple-button-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-secondary/20 active:scale-95 transition-all mt-2">
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRMAR AGENDAMENTO"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="py-32 text-center">
           <Loader2 className="w-10 h-10 animate-spin mx-auto text-secondary/30" />
           <p className="mt-4 text-muted-foreground/40 font-black text-xs uppercase tracking-widest">Sincronizando automacoes...</p>
        </div>
      ) : recurrences.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={RotateCcw}
            title="Nenhuma recorrencia ativa"
            description="Agende suas despesas fixas para maior praticidade"
            ctaLabel="Nova Recorrencia"
            onCta={() => setIsDialogOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurrences.map((rec, idx) => (
            <motion.div 
              key={rec.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 p-0 border-none shadow-lg">
                <div className="bg-muted/30 p-6 flex justify-between items-start border-b border-border/5 gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Proximo Lancamento</h3>
                    <div className="flex items-center gap-2 text-foreground font-black text-sm">
                      <Calendar className="w-4 h-4 text-secondary/70 shrink-0" />
                      <span className="truncate">{format(new Date(rec.nextDate || rec.startDate), "dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className="text-secondary border-border/10 shadow-sm whitespace-nowrap text-[10px] font-black uppercase tracking-widest">
                      {rec.frequency === 'MONTHLY' ? 'Mensal' : rec.frequency === 'WEEKLY' ? 'Semanal' : rec.frequency === 'BIWEEKLY' ? 'Quinzenal' : 'Anual'}
                    </Badge>
                    <Badge variant={rec.isActive ? "default" : "secondary"} className={cn(
                      "text-[10px] font-black uppercase tracking-widest border shadow-sm whitespace-nowrap",
                      rec.isActive ? "bg-success border-success text-white" : "bg-warning border-warning text-white"
                    )}>
                      {rec.isActive ? "Ativa" : "Pausada"}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-7 space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight leading-tight group-hover:text-secondary transition-colors truncate">{rec.description}</h2>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1 block">{rec.category?.name || "Outros"}</span>
                  </div>

                  <div className="text-3xl font-black text-foreground tracking-tighter">
                    {formatCurrency(rec.amount)}
                  </div>

                  <div className="pt-6 border-t border-border/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary/60">
                      <div className={cn("w-2 h-2 rounded-full", rec.isActive ? "bg-success animate-pulse" : "bg-warning")} />
                      {rec.isActive ? "Rodando" : "Pausada"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRecurrence(rec.id, rec.isActive)}
                        className={cn(
                          "w-11 h-11 rounded-xl transition-all",
                          rec.isActive
                            ? "bg-warning/10 text-warning hover:bg-warning hover:text-white"
                            : "bg-success/10 text-success hover:bg-success hover:text-white"
                        )}
                        title={rec.isActive ? "Pausar" : "Retomar"}
                      >
                        {rec.isActive ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      </Button>
                      <Button variant="ghost" size="icon"
                        onClick={() => handleDelete(rec.id)}
                        aria-label="Excluir"
                        className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </PageErrorBoundary>
  );
}
