"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Wallet, CreditCard, PiggyBank, Banknote, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Conta Corrente", icon: Banknote, color: "#3B82F6" },
  { value: "SAVINGS", label: "Poupança", icon: PiggyBank, color: "#10B981" },
  { value: "CREDIT", label: "Cartão de Crédito", icon: CreditCard, color: "#F59E0B" },
  { value: "CASH", label: "Dinheiro", icon: Wallet, color: "#8B5CF6" },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#F43F5E", "#06B6D4", "#84CC16", "#EC4899"];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function Contas() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState("#3B82F6");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const resetForm = () => {
    setName(""); setType("CHECKING"); setBalance("0"); setColor("#3B82F6");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, type, balance: parseFloat(balance), color };
    const url = editingId ? `/api/accounts/${editingId}` : "/api/accounts";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      showToast(editingId ? "Conta atualizada!" : "Conta criada!", "success");
      setIsOpen(false);
      resetForm();
      fetchAccounts();
    } else {
      showToast("Erro ao salvar conta", "error");
    }
  };

  const handleEdit = (acc: any) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setBalance(String(acc.balance));
    setColor(acc.color || "#3B82F6");
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta conta? As transações vinculadas serão desvinculadas.")) return;
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Conta removida!", "success"); fetchAccounts(); }
    else showToast("Erro ao remover conta", "error");
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalBalance = accounts.reduce((s, a) => s + (a.currentBalance ?? a.balance), 0);

  const getTypeConfig = (typeVal: string) =>
    ACCOUNT_TYPES.find((t) => t.value === typeVal) || ACCOUNT_TYPES[0];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-32 px-4 md:px-0">

      {/* Toast */}
      {toast && (
        <div className={cn("fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl font-bold text-sm shadow-2xl",
          toast.type === "success" ? "bg-secondary text-white" : "bg-rose-500 text-white")}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">Contas</h1>
            <p className="text-[10px] text-on-surface-variant/40 mt-1 font-bold uppercase tracking-[0.2em]">
              Carteiras & Contas Bancárias
            </p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="m3-button-premium h-14 px-8 border-none" />}>
            <Plus className="w-5 h-5 mr-2" /> NOVA CONTA
          </DialogTrigger>
          <DialogContent className="w-[95vw] md:max-w-lg bg-[#09090B] border border-white/10 rounded-[32px] p-0 overflow-hidden shadow-2xl">
            <div className="bg-white/5 p-8 border-b border-white/5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white uppercase tracking-[0.2em]">
                  {editingId ? "Editar Conta" : "Nova Conta"}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required
                  className="h-14 rounded-2xl border-white/10 bg-white/5 text-white text-lg font-bold"
                  placeholder="Ex: Nubank, Bradesco, Carteira..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v || "CHECKING")}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/10 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#09090B] border-white/10">
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Saldo Inicial (R$)</Label>
                  <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-white text-lg font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={cn("w-8 h-8 rounded-full border-2 transition-all",
                        color === c ? "border-white scale-125" : "border-transparent")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <Button type="submit" className="m3-button-premium w-full h-14 border-none mt-2">
                {editingId ? "SALVAR ALTERAÇÕES" : "CRIAR CONTA"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Total Balance */}
      <motion.div variants={itemVariants}
        className="glass-card p-8 rounded-[32px] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Patrimônio Total</p>
          <p className={cn("text-4xl font-black mt-2 tracking-tighter",
            totalBalance >= 0 ? "text-secondary" : "text-rose-400")}>
            {formatCurrency(totalBalance)}
          </p>
        </div>
        <div className={cn("p-4 rounded-2xl", totalBalance >= 0 ? "bg-secondary/10" : "bg-rose-500/10")}>
          {totalBalance >= 0
            ? <TrendingUp className="w-8 h-8 text-secondary" />
            : <TrendingDown className="w-8 h-8 text-rose-400" />}
        </div>
      </motion.div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="py-24 text-center animate-pulse text-on-surface-variant/20 font-black uppercase tracking-[0.3em]">
          Carregando contas...
        </div>
      ) : accounts.length === 0 ? (
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-[32px] p-12 text-center border-none shadow-2xl">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-on-surface-variant/20" />
            <h2 className="text-xl font-bold text-on-background">Nenhuma conta cadastrada</h2>
            <p className="text-on-surface-variant/60 mt-2 max-w-sm mx-auto">
              Cadastre suas contas bancárias, carteiras e cartões para controlar seu patrimônio.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const cfg = getTypeConfig(account.type);
            const Icon = cfg.icon;
            const currentBalance = account.currentBalance ?? account.balance;

            return (
              <div key={account.id}
                className="glass-card border-none rounded-[28px] overflow-hidden group hover:scale-[1.02] transition-all shadow-xl">
                <div className="h-2" style={{ backgroundColor: account.color || cfg.color }} />
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl" style={{ backgroundColor: `${account.color || cfg.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: account.color || cfg.color }} />
                      </div>
                      <div>
                        <h3 className="font-black text-on-background text-lg leading-tight">{account.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full"
                        onClick={() => handleEdit(account)}>
                        <Edit2 className="w-3.5 h-3.5 text-on-surface-variant/60" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-rose-500/10"
                        onClick={() => handleDelete(account.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Saldo Atual</p>
                    <p className={cn("text-3xl font-black tracking-tighter mt-1",
                      currentBalance >= 0 ? "text-white" : "text-rose-400")}>
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                      {account._count?.transactions || 0} transações
                    </span>
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: account.color || cfg.color }} />
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
