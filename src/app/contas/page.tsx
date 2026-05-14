"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Wallet, CreditCard, PiggyBank, Banknote, Edit2, TrendingUp, Loader2, Archive, RotateCcw, ChevronDown, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currentBalance?: number;
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
  const [archivedOpen, setArchivedOpen] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("CHECKING");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#0071E3");

  const toast = useToast();
  const confirm = useConfirm();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts?archived=true");
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

  const activeAccounts = accounts.filter(a => a.isActive !== false);
  const archivedAccounts = accounts.filter(a => a.isActive === false);

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

  const handleArchive = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    const ok = await confirm({
      title: "Arquivar conta",
      message: `"${account.name}" será arquivada. O histórico de transações será preservado. Você pode reativar a qualquer momento.`,
      confirmLabel: "Arquivar",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/accounts/${id}/archive`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Conta arquivada!");
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao arquivar conta");
      }
    } catch {
      toast.error("Erro ao processar");
    }
  };

  const handleRestore = async (id: string) => {
    const ok = await confirm({
      title: "Reativar conta",
      message: "Esta conta voltará a aparecer na lista principal de contas.",
      confirmLabel: "Reativar",
      variant: "info",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/accounts/${id}/restore`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Conta reativada!");
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao reativar conta");
      }
    } catch {
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

  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const renderAccountCard = (acc: Account, idx: number, archived: boolean = false) => {
    const cfg = accountTypes.find(t => t.value === acc.type) || accountTypes[0];
    const Icon = cfg.icon;

    return (
      <motion.div
        key={acc.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
      >
        <Card className={cn(
          "premium-card p-0 overflow-hidden group border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-card min-h-[180px] flex flex-col",
          archived && "opacity-60 hover:opacity-80 saturate-50"
        )}>
          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <Avatar size="lg" className="rounded-2xl shadow-lg" style={{ backgroundColor: acc.color || cfg.color }}>
                    <AvatarFallback className="rounded-2xl text-white" style={{ backgroundColor: acc.color || cfg.color }}>
                      <Icon className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className={cn(
                      "text-xl font-black tracking-tight truncate group-hover:text-secondary transition-colors",
                      archived ? "text-muted-foreground" : "text-foreground"
                    )}>{acc.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">{cfg.label}</Badge>
                      {archived && (
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">ARQUIVADA</Badge>
                      )}
                    </div>
                  </div>
                </div>

                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!archived && (
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)} aria-label="Editar conta" className="h-11 w-11 rounded-xl bg-muted text-muted-foreground hover:bg-secondary hover:text-white transition-all">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          {archived ? (
                            <Button variant="ghost" size="icon" onClick={() => handleRestore(acc.id)} aria-label="Reativar conta" className="h-11 w-11 rounded-xl bg-muted text-muted-foreground hover:bg-success hover:text-white transition-all">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleArchive(acc.id)} aria-label="Arquivar conta" className="h-11 w-11 rounded-xl bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-all">
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Saldo Líquido</p>
                <h3 className={cn(
                  "text-3xl font-black tracking-tighter mt-1",
                    archived ? "text-muted-foreground" : (acc.currentBalance ?? acc.balance) >= 0 ? "text-foreground" : "text-destructive"
                  )}>
                  {formatCurrency(acc.currentBalance ?? acc.balance)}
                </h3>
              </div>
            </div>
          </CardContent>

          <ProgressPrimitive.Root value={100}>
            <ProgressTrack className="h-1.5 rounded-none bg-muted/30">
              <ProgressIndicator className="rounded-none" style={{ width: "100%", backgroundColor: archived ? "hsl(var(--muted-foreground))" : (acc.color || cfg.color) }} />
            </ProgressTrack>
          </ProgressPrimitive.Root>
        </Card>
      </motion.div>
    );
  };

  return (
    <PageErrorBoundary>
    <div className="space-y-10 max-w-7xl mx-auto pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Minhas Contas</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Organize seus bancos e carteiras</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button className="apple-button-primary h-11 px-8 rounded-xl shadow-lg shadow-secondary/20" />}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVA CONTA
          </DialogTrigger>
          <DialogContent showCloseButton={false} className="sm:max-w-[500px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-card sm:shadow-2xl">
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-30 rounded-full"
                />
              }
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Fechar</span>
            </DialogClose>

            <div className="p-8 bg-card sticky top-0 z-10 pointer-events-none">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  {editingId ? "Editar Conta" : "Adicionar Banco"}
                </DialogTitle>
                <p className="text-muted-foreground text-sm font-medium mt-1">Conecte seus centros de custo e patrimônio</p>
              </DialogHeader>
            </div>
            <Separator />

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Nome da Conta</Label>
                <Input required value={name} onChange={e => setName(e.target.value)}
                  className="h-12 font-bold text-lg rounded-2xl bg-muted/20 border-border/10"
                  placeholder="Ex: Nubank, Itaú, Carteira..." />
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Tipo</Label>
                  <Select value={type} onValueChange={(val: string | null) => setType(val || "CHECKING")}>
                    <SelectTrigger className="h-12 font-bold rounded-2xl bg-muted/20 border-border/10">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/10">
                      {accountTypes.map(t => (
                        <SelectItem key={t.value} value={t.value} className="rounded-xl font-bold">{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo Inicial</Label>
                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-2 py-0.5 rounded-full">Ajuste</span>
                  </div>
                  <MoneyInput value={balance} onChange={setBalance} className="h-12 font-black text-2xl rounded-2xl bg-muted/20 border-border/10" />
                  <p className="text-[9px] text-muted-foreground/40 italic ml-1">Este valor será somado ao total de transações.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Cor de Identificação</Label>
                <div className="flex flex-wrap gap-3 p-4 bg-muted/20 rounded-2xl border border-border/5">
                  {["#0071E3", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6", "#64748b", "#1D1D1F"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        "w-11 h-11 rounded-xl transition-all shadow-sm ring-offset-2 ring-offset-background",
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
        <div className="space-y-12">
          {activeAccounts.length > 0 && (
            <div>
              {archivedAccounts.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    Ativas
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeAccounts.map((acc, idx) => renderAccountCard(acc, idx, false))}
              </div>
            </div>
          )}

          {archivedAccounts.length > 0 && (
            <div>
              <button
                onClick={() => setArchivedOpen(!archivedOpen)}
                className="flex items-center gap-3 w-full group cursor-pointer max-md:min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  {archivedOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                  )}
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    Arquivadas ({archivedAccounts.length})
                  </span>
                </div>
                <div className="flex-1 h-px bg-border/30" />
              </button>

              <AnimatePresence initial={false}>
                {archivedOpen && (
                  <motion.div
                    key="archived-grid"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                      {archivedAccounts.map((acc, idx) => renderAccountCard(acc, idx, true))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
    </PageErrorBoundary>
  );
}
