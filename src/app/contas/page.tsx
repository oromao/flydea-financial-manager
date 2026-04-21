"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Wallet, CreditCard, PiggyBank, Banknote, Edit2, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";

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
  const toast = useToast();
  const confirm = useConfirm();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState("#3B82F6");

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

    if (!name || !type) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      toast.error("Saldo inválido");
      return;
    }

    setSaving(true);
    try {
      const payload = { name, type, balance: numBalance, color };
      const url = editingId ? `/api/accounts/${editingId}` : "/api/accounts";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(editingId ? "Conta atualizada!" : "Conta criada!");
        setIsOpen(false);
        resetForm();
        fetchAccounts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Erro ao salvar conta");
      }
    } finally {
      setSaving(false);
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
    const ok = await confirm({ title: "Excluir conta", message: "Tem certeza que deseja remover esta conta? As transações vinculadas serão desvinculadas.", confirmLabel: "Excluir", variant: "danger" });
    if (!ok) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403) {
        toast.error(data.error || "Você não tem permissão para excluir esta conta");
        return;
      }

      if (!res.ok) {
        toast.error(data.error || "Erro ao remover conta");
        return;
      }

      toast.success("Conta removida!");
      fetchAccounts();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao remover conta";
      toast.error(msg);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const totalBalance = accounts.reduce((s, a) => s + (a.currentBalance ?? a.balance), 0);

  const getTypeConfig = (typeVal: string) =>
    ACCOUNT_TYPES.find((t) => t.value === typeVal) || ACCOUNT_TYPES[0];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-20 px-4 md:px-0 relative">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-secondary text-on-secondary">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-background">Contas</h1>
            <p className="text-on-surface-variant font-medium text-xs mt-0.5">Patrimônio financeiro</p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-10 px-5 text-sm rounded-lg" />}>
            <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> NOVO
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
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold">Saldo Inicial (BRL)</Label>
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter bg-secondary/10 px-1.5 py-0.5 rounded">Opcional</span>
                  </div>
                  <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)}
                    className="h-11 font-bold text-lg" 
                    placeholder="0,00"
                  />
                  <p className="text-[9px] text-on-surface-variant/50 ml-1 italic font-medium">Este valor será somado ao total de transações registradas.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Cor de Destaque</Label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      aria-label={`Selecionar cor ${c}`}
                      className={cn("w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-colors hover:scale-110",
                        color === c ? "border-on-background ring-4 ring-on-background/5" : "border-outline/10")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={saving} className="apple-button-primary w-full h-12 text-base mt-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : editingId ? "Salvar Alterações" : "Criar Conta"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Patrimônio Líquido - Compact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="premium-card p-4 sm:p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-70">Patrimônio Total</p>
            <h2 className={cn("text-3xl md:text-4xl font-bold tracking-tight",
              totalBalance >= 0 ? "text-on-background" : "text-red-600")}>
              {formatCurrency(totalBalance)}
            </h2>
          </div>
          <div className={cn("p-3 rounded-lg", totalBalance >= 0 ? "bg-secondary/10 text-secondary" : "bg-red-100/50 text-red-600")}>
            {totalBalance >= 0
              ? <TrendingUp className="w-6 h-6" />
              : <TrendingDown className="w-6 h-6" />}
          </div>
        </Card>
      </motion.div>

      {/* Accounts Grid */}
      {loading ? (
        <div className="py-24 text-center text-on-surface-variant/30 font-semibold text-xs italic">
          Sincronizando ativos...
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma conta cadastrada"
          description="Organize seu patrimônio criando sua primeira conta"
          ctaLabel="Nova Conta"
          onCta={() => setIsOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                <Card className="premium-card p-0 overflow-hidden group hover:shadow-md transition-colors">
                  <div className="h-1 w-full" style={{ backgroundColor: account.color || cfg.color }} />
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-surface-variant/40">
                          <Icon className="w-5 h-5" style={{ color: account.color || cfg.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base text-on-background">{account.name}</h3>
                          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-on-surface-variant/60">
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-md bg-secondary/10 hover:bg-secondary/15 text-secondary transition-colors"
                          onClick={() => handleEdit(account)}
                          aria-label="Editar conta">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-md bg-red-100/60 hover:bg-red-100 text-red-600 transition-colors"
                          onClick={() => handleDelete(account.id)}
                          aria-label="Excluir conta">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-1">Saldo</p>
                      <p className={cn("text-2xl font-bold tracking-tight",
                        currentBalance >= 0 ? "text-on-background" : "text-red-600")}>
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-outline/10 flex items-center justify-between text-on-surface-variant/50 text-[10px] sm:text-xs">
                      <span className="font-bold uppercase">{account._count?.transactions || 0} tx</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">Ativo</span>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: account.color || cfg.color }} />
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
