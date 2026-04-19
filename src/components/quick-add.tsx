"use client";

import { useState, useEffect } from "react";
import { Plus, X, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/use-metrics";

interface QuickAddProps {
  categories: Array<{ id: string; name: string; type: string }>;
  onSuccess?: () => void;
}

export function QuickAdd({ categories, onSuccess }: QuickAddProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const toast = useToast();

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!amount || !description || !categoryId || !date) {
      toast.error("Preencha todos os campos");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description: description.trim(),
          amount: numAmount,
          date,
          categoryId,
          paymentStatus: "PAID"
        })
      });

      if (res.ok) {
        toast.success(`${type === "EXPENSE" ? "Despesa" : "Receita"} adicionada!`);
        trackEvent("quick_add", { type, amount: numAmount, category: categoryId });
        setOpen(false);
        setAmount("");
        setDescription("");
        setCategoryId("");
        onSuccess?.();
      } else {
        const error = await res.json().catch(() => ({}));
        toast.error(error.error || "Erro ao adicionar");
      }
    } catch (e) {
      toast.error("Erro ao adicionar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all hover:scale-110 z-40 md:hidden"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      <Button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-12 px-6 rounded-full bg-primary shadow-lg hover:bg-primary/90"
      >
        <Plus className="w-5 h-5" />
        <span className="font-bold">Novo Lançamento</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-md bg-surface border-none rounded-[32px] p-0 shadow-[0_32px_80px_rgba(0,0,0,0.8)] z-[9999]">
          <div className="bg-white/5 p-6 border-b border-white/5">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-on-background">
                Novo Lançamento
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex gap-2 p-1 bg-surface rounded-full border border-outline/20">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={cn(
                  "flex-1 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all",
                  type === "EXPENSE" 
                    ? "bg-red-100 text-red-700" 
                    : "text-on-surface-variant hover:bg-surface"
                )}
              >
                <ArrowDown className="w-4 h-4" /> Despesa
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={cn(
                  "flex-1 h-10 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all",
                  type === "INCOME" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "text-on-surface-variant hover:bg-surface"
                )}
              >
                <ArrowUp className="w-4 h-4" /> Receita
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-on-surface-variant ml-1">Descrição</Label>
              <Input
                placeholder={type === "EXPENSE" ? "Ex: Almoço, Transporte..." : "Ex: Cliente X, Freelance..."}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-on-surface-variant ml-1">Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant ml-1">Categoria</Label>
                <Select value={categoryId || ""} onValueChange={(val) => setCategoryId(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant ml-1">Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !amount || !description || !categoryId || !date}
              className="w-full h-12 mt-4 apple-button-primary"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}