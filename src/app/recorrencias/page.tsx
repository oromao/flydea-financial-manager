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
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-32 px-4 md:px-0">
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
            <RotateCcw className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">Recorrências</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Automação de contas fixas e assinaturas</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVA RECORRÊNCIA
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-surface sm:shadow-2xl">
            <div className="p-8 border-b border-outline/10 bg-surface">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-on-background">
                  Agendar Automação
                </DialogTitle>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Configure lançamentos automáticos inteligentes</p>
              </DialogHeader>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Descrição</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} 
                  className="h-11 font-medium text-lg" 
                  placeholder="Ex: Aluguel, Netflix, Salários..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Valor Mensal (BRL)</Label>
                  <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} 
                    className="h-11 font-bold text-lg" 
                    placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Frequência</Label>
                  <Select value={frequency} onValueChange={v => setFrequency(v || "MONTHLY")}>
                    <SelectTrigger className="h-11 font-medium text-foreground">
                      {frequency === "MONTHLY" ? "Mensal" : frequency === "WEEKLY" ? "Semanal" : <span className="text-muted-foreground">Selecione...</span>}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MONTHLY" className="rounded-lg">Mensal</SelectItem>
                      <SelectItem value="WEEKLY" className="rounded-lg">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Data Inicial</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} 
                    className="h-11 font-medium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Categoria</Label>
                  <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                    <SelectTrigger className="h-11 font-medium border-t-0 border-x-0 rounded-none px-0 text-foreground">
                      {categories.find(c => c.id === categoryId)?.name || <span className="text-muted-foreground">Selecione...</span>}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="apple-button-primary w-full h-12 text-base mt-2">
                Confirmar Agendamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="py-24 text-center text-on-surface-variant/30 font-semibold text-xs italic">
          Sincronizando automações...
        </div>
      ) : recurrences.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 opacity-30"
        >
            <RotateCcw className="w-16 h-16 text-on-surface-variant" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-on-background">Nenhuma recorrência ativa</h2>
              <p className="font-medium text-sm mt-1">Agende suas despesas fixas para maior praticidade</p>
            </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recurrences.map((rec, idx) => (
            <motion.div 
              key={rec.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
            >
              <Card className="premium-card overflow-hidden group hover:shadow-xl transition-all duration-300 p-0 border-none bg-surface">
                <div className="bg-surface-variant/30 p-6 flex justify-between items-start border-b border-outline/5">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">Próximo Lançamento</h3>
                    <div className="flex items-center gap-2 text-on-background font-bold text-sm">
                      <Calendar className="w-4 h-4 text-secondary/70" />
                      {format(new Date(rec.nextDate || rec.startDate), "dd 'de' MMMM", { locale: ptBR })}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-surface text-secondary text-[9px] font-bold uppercase tracking-wider border border-outline/10 shadow-sm">
                    {rec.frequency === 'MONTHLY' ? 'Mensal' : 'Semanal'}
                  </span>
                </div>
                
                <div className="p-7 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-on-background tracking-tight leading-tight group-hover:text-secondary transition-colors">{rec.description}</h2>
                    <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1 block">{rec.category?.name}</span>
                  </div>

                  <div className="text-3xl font-bold text-on-background tracking-tight">
                    {formatCurrency(rec.amount)}
                  </div>

                  <div className="pt-5 border-t border-outline/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      Status: Ativo
                    </div>
                    <Button variant="ghost" size="icon" 
                      className="w-10 h-10 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-all">
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
