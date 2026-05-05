"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Wallet, CreditCard, PiggyBank, Banknote, Edit2, TrendingUp, TrendingDown, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  isActive: boolean;
}

const accountTypes = [
  { value: "CHECKING", label: "Conta Corrente", icon: Wallet, color: "#0071E3" },
  { value: "SAVINGS", label: "Poupança", icon: PiggyBank, color: "#10b981" },
  { value: "INVESTMENT", label: "Investimento", icon: TrendingUp, color: "#8b5cf6" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito", icon: CreditCard, color: "#f43f5e" },
  { value: "CASH", label: "Dinheiro", icon: Banknote, color: "#f59e0b" },
];

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#0071E3");

  const toast = useToast();
  const confirm = useConfirm();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nome é obrigatório");
    
    setSaving(true);
    try {
      const url = editingId ? `/api/accounts/${editingId}` : "/api/accounts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, balance: parseFloat(balance) || 0, color }),
      });

      if (res.ok) {
        toast.success(editingId ? "Conta atualizada" : "Conta criada com sucesso!");
        setOpen(false);
        resetForm();
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao salvar conta");
      }
    } catch (e) {
      toast.error("Erro na requisição");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    const isActive = account?.isActive !== false;

    const ok = await confirm({
      title: isActive ? "Desativar conta" : "Reativar conta",
      message: isActive 
        ? "A conta será arquivada mas o histórico de transações será preservado. Você pode reativar a qualquer momento."
        : "Esta conta voltará a aparecer normalmente.",
      confirmLabel: isActive ? "Desativar" : "Reativar",
      variant: isActive ? "danger" : "info",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/accounts/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive })
      });
      if (res.ok) {
        toast.success(isActive ? "Conta arquivada!" : "Conta reativada!");
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar conta.");
      }
    } catch (e) {
      toast.error("Erro ao processar");
    }
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toString());
    setColor(acc.color || "#0071E3");
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setType("CHECKING");
    setBalance("");
    setColor("#0071E3");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-secondary text-on-secondary shadow-lg shadow-secondary/20">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">Minhas Contas</h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Organize seus bancos e carteiras</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8 rounded-xl shadow-lg shadow-secondary/20" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVA CONTA
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-[32px] bg-surface sm:shadow-2xl">
            <div className="p-8 border-b border-outline/10 bg-surface sticky top-0 z-10 pointer-events-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-on-background">
                  {editingId ? "Editar Conta" : "Adicionar Banco"}
                </DialogTitle>
                <p className="text-on-surface-variant text-sm font-medium mt-1">Conecte seus centros de custo e patrimônio</p>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome da Conta</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} 
                  className="h-12 font-bold text-lg rounded-2xl bg-surface-variant/20 border-outline/10" 
                  placeholder="Ex: Nubank, Itaú, Carteira..." />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Tipo</Label>
                  <Select value={type} onValueChange={(val: string | null) => setType(val || "CHECKING")}>
                    <SelectTrigger className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-outline/10">
                      {accountTypes.map(t => (
                        <SelectItem key={t.value} value={t.value} className="rounded-xl font-bold">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Saldo Inicial</Label>
                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-2 py-0.5 rounded-full">Ajuste</span>
                  </div>
                  <MoneyInput value={balance} onChange={setBalance} className="h-12 font-black text-2xl rounded-2xl bg-surface-variant/20 border-outline/10" />
                  <p className="text-[9px] text-on-surface-variant/40 italic ml-1">Este valor será somado ao total de transações.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Cor de Identificação</Label>
                <div className="flex flex-wrap gap-3 p-4 bg-surface-variant/20 rounded-2xl border border-outline/5">
                  {["#0071E3", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#64748b", "#1D1D1F"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all shadow-sm ring-offset-2 ring-offset-background",
                        color === c ? "ring-2 ring-secondary scale-110 shadow-lg" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={saving} className="apple-button-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-secondary/20 active:scale-95 transition-all mt-4">
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRMAR CONTA"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="py-32 text-center">
           <Loader2 className="w-10 h-10 animate-spin mx-auto text-secondary/30" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-16">
          <EmptyState
            icon={Wallet}
            title="Nenhuma conta cadastrada"
            description="Adicione seus bancos para começar a gestão"
            ctaLabel="Nova Conta"
            onCta={() => setOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map((acc, idx) => {
            const cfg = accountTypes.find(t => t.value === acc.type) || accountTypes[0];
            const Icon = cfg.icon;

            return (
              <motion.div 
                key={acc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn("premium-card p-0 overflow-hidden group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-surface min-h-[180px] flex flex-col", acc.isActive === false && "opacity-50")}>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: acc.color || cfg.color }}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl font-black text-on-background tracking-tight truncate group-hover:text-secondary transition-colors">{acc.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{cfg.label}</span>
                            {acc.isActive === false && (
                              <span className="text-[8px] font-black uppercase tracking-widest bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">ARQUIVADA</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)} aria-label="Editar conta" className="h-9 w-9 rounded-xl bg-surface-variant text-on-surface-variant hover:bg-secondary hover:text-white transition-all"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(acc.id)} aria-label={acc.isActive === false ? "Reativar conta" : "Excluir conta"} className={cn("h-9 w-9 rounded-xl bg-surface-variant text-on-surface-variant hover:bg-destructive hover:text-white transition-all", acc.isActive === false && "hover:bg-success")}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Saldo Líquido</p>
                      <h3 className={cn("text-3xl font-black tracking-tighter mt-1", acc.balance >= 0 ? "text-on-background" : "text-destructive")}>
                        {formatCurrency(acc.balance)}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-surface-variant/30">
                    <div className="h-full transition-all duration-1000" style={{ width: '100%', backgroundColor: acc.color || cfg.color }} />
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
