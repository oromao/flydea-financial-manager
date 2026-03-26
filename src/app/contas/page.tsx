"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Wallet, CreditCard, PiggyBank, Banknote, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto pb-32 px-4 md:px-0 relative">
      {/* Toast */}
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
            <Wallet className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">Contas</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Gestão de saldo e patrimônio</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVA CONTA
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-surface sm:shadow-2xl">
            <div className="p-8 border-b border-outline/10 bg-surface">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight text-on-background">
                  {editingId ? "Editar Conta" : "Nova Conta"}
                </DialogTitle>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Defina as configurações da sua carteira</p>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Identificação</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required
                  className="h-11 font-medium"
                  placeholder="Ex: Nubank, Carteira Principal" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Tipo de Conta</Label>
                  <Select value={type} onValueChange={(v) => setType(v || "CHECKING")}>
                    <SelectTrigger className="h-11 font-medium text-foreground">
                      {ACCOUNT_TYPES.find(t => t.value === type)?.label || <span className="text-muted-foreground">Selecione...</span>}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="rounded-lg">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Saldo Inicial (BRL)</Label>
                  <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)}
                    className="h-11 font-bold text-lg" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Cor de Destaque</Label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={cn("w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                        color === c ? "border-on-background ring-4 ring-on-background/5" : "border-outline/10")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <Button type="submit" className="apple-button-primary w-full h-12 text-base mt-2">
                {editingId ? "Salvar Alterações" : "Criar Conta"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Patrimônio Líquido */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="premium-card p-8 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Patrimônio Consolidado</p>
            <h2 className={cn("text-4xl md:text-5xl font-bold tracking-tight",
              totalBalance >= 0 ? "text-on-background" : "text-red-600")}>
              {formatCurrency(totalBalance)}
            </h2>
          </div>
          <div className={cn("p-4 rounded-2xl shadow-sm", totalBalance >= 0 ? "bg-secondary text-on-secondary" : "bg-red-100 text-red-600")}>
            {totalBalance >= 0
              ? <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
              : <TrendingDown className="w-8 h-8 md:w-10 md:h-10" />}
          </div>
        </Card>
      </motion.div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant/30 font-semibold text-xs italic">
          Sincronizando ativos...
        </div>
      ) : accounts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-6 opacity-30"
        >
            <Wallet className="w-16 h-16 text-on-surface-variant" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-on-background">Nenhuma conta cadastrada</h2>
              <p className="font-medium text-sm mt-1">Organize seu patrimônio criando sua primeira conta</p>
            </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((account, idx) => {
            const cfg = getTypeConfig(account.type);
            const Icon = cfg.icon;
            const currentBalance = account.currentBalance ?? account.balance;

            return (
              <motion.div 
                key={account.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
              >
                <Card className="premium-card p-0 overflow-hidden group hover:scale-[1.01] transition-all">
                  <div className="h-1.5 w-full" style={{ backgroundColor: account.color || cfg.color }} />
                  <div className="p-7 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-surface-variant/50 border border-outline/5">
                          <Icon className="w-6 h-6" style={{ color: account.color || cfg.color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-on-background tracking-tight">{account.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-surface-variant"
                          onClick={() => handleEdit(account)}>
                          <Edit2 className="w-4 h-4 text-on-surface-variant" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-red-50"
                          onClick={() => handleDelete(account.id)}>
                          <Trash2 className="w-4 h-4 text-on-surface-variant hover:text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/40">Saldo em conta</p>
                      <p className={cn("text-3xl font-bold tracking-tight mt-1",
                        currentBalance >= 0 ? "text-on-background" : "text-red-600")}>
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-outline/5 flex items-center justify-between text-on-surface-variant/50">
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {account._count?.transactions || 0} transações vinculadas
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold uppercase">Status Ativo</span>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: account.color || cfg.color }} />
                      </div>
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
