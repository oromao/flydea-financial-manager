"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Search, ArrowUp, ArrowDown, Filter, LayoutList, FileSpreadsheet, Edit2, RotateCcw, X, Paperclip, ExternalLink, MoreVertical, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Importer } from "@/components/importer";
import { DocumentImporter } from "@/components/document-importer";
import { PaymentImporter } from "@/components/payment-importer";
import { upload } from "@vercel/blob/client";
import { FileUp, Cloud, Link as LinkIcon, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { formatZodError } from "@/lib/format-errors";
import { toLocalDateInput } from "@/lib/date-utils";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";

export default function Movimentacoes() {
  const toast = useToast();
  const confirm = useConfirm();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Stats computed from ALL transactions (not paginated)
  const [stats, setStats] = useState({ balance: 0, income: 0, expenses: 0, pending: 0 });

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortOrder, setSortDirection] = useState<"asc" | "desc">("desc");

  // Form states
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<string>("EXPENSE");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState("NONE");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [dueDate, setDueDate] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let valA, valB;
      if (sortField === "amount") {
        valA = a.amount;
        valB = b.amount;
      } else if (sortField === "date") {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = String(a[sortField] || "").toLowerCase();
        valB = String(b[sortField] || "").toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [transactions, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const fetchTransactions = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "Todos") params.append("category", filterCategory);
      if (filterType) params.append("type", filterType);
      if (filterPaymentStatus !== "ALL") params.append("paymentStatus", filterPaymentStatus);
      
      if (startDateFilter && endDateFilter) {
        if (new Date(startDateFilter) > new Date(endDateFilter)) {
          toast.error("A data inicial não pode ser posterior à final");
          setLoading(false);
          return;
        }
        params.append("startDate", startDateFilter);
        params.append("endDate", endDateFilter);
      } else {
        if (startDateFilter) params.append("startDate", startDateFilter);
        if (endDateFilter) params.append("endDate", endDateFilter);
      }

      params.append("page", String(targetPage));

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setTransactions(data.data);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        setPage(data.page || 1);
      } else {
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Fetch transactions error:", e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterType, filterPaymentStatus, page, startDateFilter, endDateFilter, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?all=true");
      const data = await res.json();
      const allTx = Array.isArray(data.data) ? data.data : [];
      const balance = allTx.reduce((acc: number, t: any) => t.type === "INCOME" ? acc + t.amount : acc - t.amount, 0);
      const income = allTx.filter((t: any) => t.type === "INCOME").reduce((acc: number, t: any) => acc + t.amount, 0);
      const expenses = allTx.filter((t: any) => t.type === "EXPENSE").reduce((acc: number, t: any) => acc + t.amount, 0);
      const pending = allTx.filter((t: any) => t.type === "EXPENSE" && t.paymentStatus === "PENDING").reduce((acc: number, t: any) => acc + t.amount, 0);
      setStats({ balance, income, expenses, pending });
    } catch (e) {
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      if (data.length > 0 && !editingId) {
        setCategoryId(data.find((c: any) => c.name === "Outros")?.id || data[0].id);
      }
    } catch (e) {
    }
  }, [editingId]);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterCategory, filterType, startDateFilter, endDateFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(page);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return toast.error("Descrição é obrigatória");
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error("Valor inválido");
    if (!date) return toast.error("Data é obrigatória");

    setSaving(true);
    const payload = {
      type,
      description: description.trim(),
      categoryId: categoryId || null,
      amount: parsedAmount,
      date,
      frequency: frequency || "NONE",
      paymentStatus: paymentStatus || "PAID",
      dueDate: dueDate || null,
      paidAt: paidAt || null,
      attachmentUrl: attachmentUrl || null,
      blobUrl: blobUrl || null,
    };

    try {
      const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingId ? "Atualizado com sucesso!" : "Lançamento confirmado!");
        setOpen(false);
        resetForm();
        fetchTransactions();
        fetchStats();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao salvar");
      }
    } catch (e) {
      toast.error("Erro ao processar requisição");
    } finally {
      setSaving(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    const ok = await confirm({
      title: "Excluir transação",
      message: "Tem certeza que deseja remover este lançamento?",
      confirmLabel: "Excluir",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Excluído com sucesso!");
        fetchTransactions();
        fetchStats();
      } else {
        toast.error("Erro ao excluir");
      }
    } catch (e) {
      toast.error("Falha na exclusão");
    }
  };

  const updatePaymentStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      if (res.ok) {
        toast.success(nextStatus === "PAID" ? "Marcado como pago" : "Marcado como pendente");
        fetchTransactions();
        fetchStats();
      }
    } catch (e) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setType(t.type);
    setDescription(t.description);
    setCategoryId(t.categoryId || "");
    setAmount(t.amount.toString());
    setDate(toLocalDateInput(t.date));
    setFrequency(t.frequency || "NONE");
    setPaymentStatus(t.paymentStatus || "PAID");
    setDueDate(t.dueDate ? toLocalDateInput(t.dueDate) : "");
    setPaidAt(t.paidAt ? toLocalDateInput(t.paidAt) : "");
    setAttachmentUrl(t.attachmentUrl || "");
    setBlobUrl(t.blobUrl || "");
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setType("EXPENSE");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setFrequency("NONE");
    setPaymentStatus("PAID");
    setDueDate("");
    setPaidAt("");
    setAttachmentUrl("");
    setBlobUrl("");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <LayoutList className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-on-background">Movimentações</h1>
            <p className="text-on-surface-variant font-medium text-sm">Gerencie seu fluxo financeiro real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => {}} 
            className="w-full md:w-auto h-11 px-6 font-bold text-sm rounded-xl border-outline/20 hover:bg-surface-variant transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar
          </Button>

          <Dialog open={open} onOpenChange={async (val) => {
            if (!val && !saving && (description || amount)) {
              const confirmed = await confirm({
                title: "Descartar alterações?",
                message: "Você tem campos preenchidos. Deseja realmente fechar?",
                confirmLabel: "Sim, fechar",
                variant: "danger"
              });
              if (!confirmed) return;
            }
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger render={<Button className="apple-button-primary h-11 px-8 rounded-xl shadow-lg shadow-secondary/20" />}>
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVO
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-[32px] bg-surface sm:shadow-2xl max-h-[90vh]">
              <div className="p-8 border-b border-outline/10 bg-surface sticky top-0 z-20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black tracking-tight text-on-background">
                    {editingId ? "Editar Lançamento" : "Novo Lançamento"}
                  </DialogTitle>
                  <p className="text-on-surface-variant text-sm font-medium mt-1">Registre suas entradas e saídas com precisão</p>
                </DialogHeader>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex p-1 bg-surface-variant/30 rounded-2xl border border-outline/5">
                  <Button type="button" variant="ghost" className={cn("flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === "INCOME" ? "bg-white text-emerald-600 shadow-md scale-[1.02]" : "text-on-surface-variant")} onClick={() => setType("INCOME")}><ArrowUp className="w-4 h-4 mr-2" /> Receita</Button>
                  <Button type="button" variant="ghost" className={cn("flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === "EXPENSE" ? "bg-white text-red-600 shadow-md scale-[1.02]" : "text-on-surface-variant")} onClick={() => setType("EXPENSE")}><ArrowDown className="w-4 h-4 mr-2" /> Despesa</Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Descrição</Label>
                  <Input required value={description} onChange={e => setDescription(e.target.value)} className="h-12 font-bold text-lg rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" placeholder="O que você pagou ou recebeu?" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Valor (BRL)</Label>
                    <MoneyInput value={amount} onChange={setAmount} className="h-12 font-black text-2xl rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Data</Label>
                    <Input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Categoria</Label>
                    <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                      <SelectTrigger className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10">
                        {categories.find(c => c.id === categoryId)?.name || <span className="text-on-surface-variant/50">Selecione...</span>}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Recorrência</Label>
                    <Select value={frequency} onValueChange={v => setFrequency(v || "NONE")}>
                      <SelectTrigger className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10">
                        {frequency === "MONTHLY" ? "Mensal" : frequency === "NONE" ? "Nenhuma" : <span className="text-on-surface-variant/50">Selecione...</span>}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        <SelectItem value="NONE" className="rounded-xl font-bold">Nenhuma</SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-xl font-bold">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Status de Pagamento</Label>
                  <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v || "PAID")}>
                    <SelectTrigger className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10">
                      {paymentStatus === "PAID" ? "Pago" : "Pendente"}
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-outline/10">
                      <SelectItem value="PAID" className="rounded-xl font-bold">Confirmado / Pago</SelectItem>
                      <SelectItem value="PENDING" className="rounded-xl font-bold">Pendente / Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Comprovante</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        disabled={uploading}
                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                        type="file"
                        aria-label="Anexar comprovante"
                        tabIndex={-1}
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const f = e.target.files[0];
                            if (f.size > 10 * 1024 * 1024) throw new Error("Máximo 10MB");
                            
                            const formData = new FormData();
                            formData.append("file", f);
                            const filename = `receipt_${Date.now()}.${f.name.split('.').pop()}`;
                            const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
                              method: "POST",
                              body: formData,
                            });
                            if (!res.ok) throw new Error("Upload falhou");
                            const newBlob = await res.json();
                            setBlobUrl(newBlob.url);
                            toast.success("Anexado!");
                          } catch (error: any) {
                            toast.error(error.message || "Erro no upload");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <div className={cn(
                        "h-12 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest",
                        blobUrl ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-outline/20 bg-surface-variant/30 text-on-surface-variant/60 hover:bg-surface-variant/50"
                      )}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : blobUrl ? <><CheckCircle2 className="w-4 h-4" /> PRONTO</> : <><FileUp className="w-4 h-4" /> ANEXAR</>}
                      </div>
                    </div>
                    <div className="flex-[1.5] relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                      <Input placeholder="Link externo..." value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="h-12 pl-11 rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface font-medium" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-surface pb-2">
                  <Button 
                    type="submit" 
                    disabled={saving || !description.trim() || !amount || !date || !categoryId} 
                    className="apple-button-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-secondary/20 active:scale-95 transition-all"
                  >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR LANÇAMENTO"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview - 2 Columns Mobile, 4 Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-0"
      >
        <Card className="premium-card p-4 bg-surface border-outline/10 flex flex-col justify-between min-h-[110px]">
          <p className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant/50">Saldo Geral</p>
          <h2 className={cn("text-xl md:text-3xl font-black mt-2 tracking-tighter truncate", stats.balance >= 0 ? "text-on-background" : "text-red-500")}>
            {formatCurrency(stats.balance)}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 opacity-40">
            <Wallet className="w-3 h-3 text-secondary" />
            <span className="text-[8px] font-black uppercase tracking-widest">Total Líquido</span>
          </div>
        </Card>
        
        <Card className="premium-card p-4 bg-emerald-50/20 border-emerald-100 flex flex-col justify-between min-h-[110px]">
          <p className="text-[9px] uppercase tracking-widest font-black text-emerald-600/70">Receitas</p>
          <h2 className="text-xl md:text-3xl font-black mt-2 text-emerald-600 tracking-tighter truncate">{formatCurrency(stats.income)}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-600/50">
            <ArrowUp className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Este mês</span>
          </div>
        </Card>

        <Card className="premium-card p-4 bg-red-50/20 border-red-100 flex flex-col justify-between min-h-[110px]">
          <p className="text-[9px] uppercase tracking-widest font-black text-red-600/70">Despesas</p>
          <h2 className="text-xl md:text-3xl font-black mt-2 text-red-600 tracking-tighter truncate">{formatCurrency(stats.expenses)}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-red-600/50">
            <ArrowDown className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Este mês</span>
          </div>
        </Card>

        <Card className="premium-card p-4 bg-amber-50/20 border-amber-100 flex flex-col justify-between min-h-[110px]">
          <p className="text-[9px] uppercase tracking-widest font-black text-amber-600/70">Pendências</p>
          <h2 className="text-xl md:text-3xl font-black mt-2 text-amber-600 tracking-tighter truncate">{formatCurrency(stats.pending)}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-amber-600/50">
            <AlertCircle className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">A Pagar</span>
          </div>
        </Card>
      </motion.div>

      {/* Filters & Search - Premium Surface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 bg-surface p-6 rounded-[32px] border border-outline/10 mx-4 md:mx-0 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar lançamentos..."
              className="pl-12 h-12 bg-surface-variant/40 border-transparent rounded-2xl placeholder:text-on-surface-variant/40 font-bold focus:bg-surface focus:border-outline/30 transition-all text-on-surface"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v || "Todos")}>
              <SelectTrigger className="sm:w-56 h-12 rounded-2xl bg-surface-variant/30 border-transparent font-black uppercase text-[10px] tracking-widest">
                <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-secondary" /><SelectValue /></div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-outline/10">
                <SelectItem value="Todos" className="rounded-xl font-bold">TODAS CATEGORIAS</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name} className="rounded-xl font-bold">{c.name.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <PaymentImporter onImportSuccess={fetchTransactions} />
          </div>
        </div>

        {/* Advanced Date Range Filter */}
        <div className="grid grid-cols-2 lg:flex gap-4 p-4 bg-surface-variant/20 rounded-2xl border border-outline/5">
          <div className="space-y-1 flex-1">
            <Label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-2">Período De</Label>
            <Input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="h-10 bg-white border-transparent rounded-xl text-xs font-black" />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-2">Período Até</Label>
            <Input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="h-10 bg-white border-transparent rounded-xl text-xs font-black" />
          </div>
          {(startDateFilter || endDateFilter) && (
            <Button variant="ghost" size="icon" onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }} className="self-end h-10 w-10 text-on-surface-variant/40 hover:text-red-500 rounded-xl hover:bg-red-50">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <div className="flex bg-surface-variant/40 rounded-2xl p-1 border border-outline/5">
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", !filterType ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant")} onClick={() => setFilterType(null)}>Todos</Button>
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterType === "INCOME" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-on-surface-variant")} onClick={() => setFilterType("INCOME")}>Receitas</Button>
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterType === "EXPENSE" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-on-surface-variant")} onClick={() => setFilterType("EXPENSE")}>Despesas</Button>
          </div>

          <div className="flex bg-surface-variant/40 rounded-2xl p-1 border border-outline/5">
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterPaymentStatus === "ALL" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("ALL")}>Todos Status</Button>
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterPaymentStatus === "PAID" ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("PAID")}>Pagas</Button>
            <Button variant="ghost" className={cn("h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filterPaymentStatus === "PENDING" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("PENDING")}>Pendentes</Button>
          </div>
        </div>
      </motion.div>
      
      {/* Transaction List - Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden md:block"
      >
        <Card className="premium-card overflow-hidden border-none shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-variant/30 hover:bg-surface-variant/30 border-b border-outline/5">
                <TableHead className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-2">Data {sortField === "date" && (sortOrder === "asc" ? "↑" : "↓")}</div>
                </TableHead>
                <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("description")}>
                  <div className="flex items-center gap-2">Lançamento {sortField === "description" && (sortOrder === "asc" ? "↑" : "↓")}</div>
                </TableHead>
                <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 text-center">Categoria</TableHead>
                <TableHead className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort("amount")}>
                  <div className="flex items-center justify-end gap-2">Valor {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}</div>
                </TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/30" /></TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32">
                    <EmptyState icon={LayoutList} title="Sem movimentações" description="Ajuste os filtros ou crie um novo lançamento." />
                  </TableCell>
                </TableRow>
              ) : sortedTransactions.map((t) => (
                <TableRow key={t.id} className="group border-b border-outline/5 hover:bg-surface-variant/10 transition-all duration-300">
                  <TableCell className="px-6 py-5">
                    <span className="font-black text-sm text-on-background tracking-tighter">{format(new Date(t.date), "dd/MM/yy")}</span>
                  </TableCell>
                  <TableCell className="py-5 font-bold text-on-background text-sm">
                    <div className="flex items-center gap-3">
                      {t.description}
                      {t.blobUrl && (
                        <a href={t.blobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-colors">
                          <Cloud className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {t.frequency === "MONTHLY" && <span className="flex items-center gap-1 text-[8px] font-black text-secondary uppercase tracking-widest bg-secondary/5 px-2 py-0.5 rounded-full border border-secondary/10"><RotateCcw className="w-2.5 h-2.5" /> Mensal</span>}
                      {t.dueDate && <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-surface-variant text-on-surface-variant/70 border border-outline/10">Vence {format(new Date(t.dueDate), "dd/MM")}</span>}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                        t.paymentStatus === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      )}>
                        {t.paymentStatus === "PENDING" ? "Pendente" : "Confirmado"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-surface-variant text-on-surface-variant/60 border border-outline/10">{t.category?.name || "Outros"}</span>
                  </TableCell>
                  <TableCell className={cn("px-6 py-5 text-right font-black text-base tracking-tighter", t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background')}>
                    {t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.type === "EXPENSE" && t.paymentStatus === "PENDING" && (
                        <Button variant="ghost" size="icon" onClick={() => updatePaymentStatus(t.id, "PAID")} className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 className="w-4.5 h-4.5" /></Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-10 w-10 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all"><Edit2 className="w-4.5 h-4.5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-10 w-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4.5 h-4.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Transaction List - Mobile Cards */}
      <div className="md:hidden space-y-4 px-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/20" /></div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={LayoutList} title="Sem resultados" description="Nenhum lançamento encontrado." />
        ) : (
          transactions.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="premium-card p-5 active:scale-[0.98] transition-all border-none shadow-md relative overflow-hidden">
                  {t.type === 'INCOME' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-[18px] flex items-center justify-center shadow-inner",
                      t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-surface-variant/60 text-on-surface-variant/40"
                    )}>
                      {t.type === 'INCOME' ? <ArrowUp className="w-6 h-6" strokeWidth={3} /> : <ArrowDown className="w-6 h-6" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-on-background leading-none truncate">{t.description}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{format(new Date(t.date), "dd MMM, yy")}</span>
                        <div className="w-1 h-1 rounded-full bg-outline/20" />
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant/60 font-black uppercase tracking-widest">{t.category?.name || "Outros"}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-lg font-black tracking-tighter",
                        t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background'
                      )}>{t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest",
                        t.paymentStatus === "PENDING" ? "text-amber-500" : "text-emerald-500"
                      )}>{t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-outline/5">
                    {t.type === "EXPENSE" && t.paymentStatus === "PENDING" && (
                      <Button variant="ghost" size="icon" onClick={() => updatePaymentStatus(t.id, "PAID")} className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary"><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-10 w-10 rounded-xl bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination - Premium Layout */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-0 mt-8"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">
            {total} registros · Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-outline/20 hover:bg-surface-variant transition-all"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-11 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-outline/20 hover:bg-surface-variant transition-all"
            >
              Próxima
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed z-[50]" style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))', right: '1.5rem' }}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setOpen(true); }}
          className="h-16 w-16 rounded-[24px] bg-secondary text-on-secondary shadow-2xl shadow-secondary/40 flex items-center justify-center border-none"
        >
          <Plus className="w-8 h-8" strokeWidth={3.5} />
        </motion.button>
      </div>
    </div>
  );
}
