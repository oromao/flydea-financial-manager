"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  History, RotateCcw, Plus, Trash2, Calendar, 
  ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Recorrencias() {
  const [recurrences, setRecurrences] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      setRecurrences(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
      if (data.length > 0) setCategoryId(data[0].id);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchRecurrences();
    fetchCategories();
  }, [fetchRecurrences, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/recurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount, frequency, startDate, categoryId })
      });
      if (res.ok) {
        setIsDialogOpen(false);
        resetForm();
        fetchRecurrences();
        // Also trigger a cron run to catch up
        fetch("/api/cron/recurrence");
      }
    } catch (e) {
      console.error(e);
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32 px-4 md:px-0"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#D0E4FF] text-[#003258]">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#E2E2E6]">Recorrências</h1>
            <p className="text-[#C1C7CE] font-medium mt-1">Automação de contas fixas e assinaturas</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="m3-button-premium h-14 px-8 border-none" />}>
            <Plus className="w-5 h-5 mr-2" /> NOVA RECORRÊNCIA
          </DialogTrigger>
          <DialogContent className="w-[95vw] md:max-w-xl bg-[#1A1311] border-none rounded-[32px] p-0 shadow-2xl overflow-hidden ring-1 ring-white/10">
            <div className="bg-[#2D1612] p-8 md:p-10 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-[#FFB4A3] uppercase tracking-[0.2em]">Agendar Automação</DialogTitle>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-[#C1C7CE] ml-2">Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="h-14 rounded-2xl border-[#534341] bg-[#1A1311] text-[#E2E2E6] text-lg font-bold" placeholder="Ex: Aluguel, Netflix, Salários..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#C1C7CE] ml-2">Valor Mensal</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="h-14 rounded-2xl border-[#534341] bg-[#1A1311] text-[#E2E2E6] text-lg font-bold" placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#C1C7CE] ml-2">Frequência</Label>
                  <Select value={frequency} onValueChange={v => setFrequency(v || "MONTHLY")}>
                    <SelectTrigger className="h-14 rounded-2xl border-[#534341] bg-[#1A1311]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1311] border-[#534341]">
                      <SelectItem value="MONTHLY">Mensal</SelectItem>
                      <SelectItem value="WEEKLY">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#C1C7CE] ml-2">Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-14 rounded-2xl border-[#534341] bg-[#1A1311] text-[#E2E2E6]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-[#C1C7CE] ml-2">Categoria</Label>
                  <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                    <SelectTrigger className="h-14 rounded-2xl border-[#534341] bg-[#1A1311]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1311] border-[#534341]">
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="m3-button-premium w-full h-16 text-xs border-none mt-4">
                CONFIRMAR AGENDAMENTO
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="py-24 text-center animate-pulse text-[#8D9199] font-black uppercase tracking-[0.3em]">Sincronizando Automações...</div>
      ) : recurrences.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-[32px] p-12 text-center bg-white/5 border-none shadow-2xl">
            <RotateCcw className="w-16 h-16 mx-auto mb-6 text-on-surface-variant/20" />
            <h2 className="text-xl font-bold text-on-background">Nenhuma recorrência ativa</h2>
            <p className="text-on-surface-variant/60 mt-2 max-w-sm mx-auto font-medium">Agende suas despesas fixas para que o FLY DEA as lance automaticamente todo mês para você.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-0">
          {recurrences.map((rec) => (
            <div key={rec.id} className="glass-card border-none rounded-[28px] overflow-hidden group hover:scale-[1.02] transition-all shadow-xl p-0">
                <div className="bg-white/5 p-6 flex justify-between items-start">
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-[10px] text-on-surface-variant/40 mb-1">Próximo Lançamento</h3>
                    <div className="flex items-center gap-2 text-on-background font-bold">
                      <Calendar className="w-4 h-4 text-primary" />
                      {format(new Date(rec.nextDate || rec.startDate), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-background/50 text-primary text-[10px] font-black tracking-widest border border-primary/20 uppercase">
                    {rec.frequency === 'MONTHLY' ? 'Mensal' : 'Semanal'}
                  </span>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-on-background tracking-tight leading-tight">{rec.description}</h2>
                    <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">{rec.category?.name}</span>
                  </div>

                  <div className="text-3xl font-black text-primary tracking-tighter">
                    {formatCurrency(rec.amount)}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-secondary">
                      <CheckCircle2 className="w-3 h-3" /> ATIVO
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full text-on-surface-variant/40 hover:bg-rose-500/10 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
