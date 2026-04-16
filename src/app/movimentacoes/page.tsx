"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Search, ArrowUp, ArrowDown, Filter, LayoutList, FileSpreadsheet, Edit2, RotateCcw, X, Paperclip, ExternalLink, MoreVertical, Wallet } from "lucide-react";
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
import { upload } from "@vercel/blob/client";
import { FileUp, Cloud, Link as LinkIcon, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

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

  // Form states
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

  const fetchTransactions = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "Todos") params.append("category", filterCategory);
      if (filterType) params.append("type", filterType);
      if (filterPaymentStatus !== "ALL") params.append("paymentStatus", filterPaymentStatus);
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterType, filterPaymentStatus, page]);

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
      console.error("Failed to fetch stats:", e);
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
      console.error(e);
    }
  }, [editingId]);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterCategory, filterType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(page);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type,
      description,
      categoryId,
      amount: parseFloat(amount),
      date,
      frequency,
      paymentStatus,
      dueDate,
      paidAt,
      attachmentUrl,
      blobUrl
    };

    try {
      const url = editingId ? `/api/transactions/${editingId}` : "/api/transactions";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(editingId ? "Registro atualizado!" : "Lançamento confirmado!");
        setOpen(false);
        resetForm();
        fetchTransactions();
        fetchStats();
      } else {
        const errorData = await res.json();
        const msg = typeof errorData.error === 'object'
          ? JSON.stringify(errorData.error)
          : (errorData.error || "Erro ao salvar o lançamento");
        toast.error(msg);
      }
    } catch(e) {
      console.error(e);
      toast.error("Falha na comunicação com o servidor");
    }
  };

  const deleteTransaction = async (id: string) => {
    const confirmed = await confirm({
      title: "Excluir movimentação",
      message: "Confirmar exclusão desta movimentação?",
      confirmLabel: "Excluir",
      variant: "danger"
    });
    if (!confirmed) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      toast.success("Movimentação excluída com sucesso!");
      fetchTransactions();
      fetchStats();
    } catch(e) {
      console.error(e);
      toast.error("Erro ao excluir movimentação");
    }
  };

  const updatePaymentStatus = async (id: string, nextStatus: "PAID" | "PENDING") => {
    try {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      if (res.ok) {
        toast.success(nextStatus === "PAID" ? "Marcado como pago" : "Marcado como pendente");
        fetchTransactions();
        fetchStats();
      } else {
        toast.error("Não foi possível atualizar o status");
      }
    } catch (e) {
      console.error(e);
      toast.error("Falha ao atualizar o status");
    }
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setType(t.type);
    setDescription(t.description);
    setCategoryId(t.categoryId);
    setAmount(t.amount.toString());
    setDate(t.date.split("T")[0]);
    setFrequency(t.frequency || "NONE");
    setPaymentStatus(t.paymentStatus || "PAID");
    setDueDate(t.dueDate ? t.dueDate.split("T")[0] : "");
    setPaidAt(t.paidAt ? t.paidAt.split("T")[0] : "");
    setAttachmentUrl(t.attachmentUrl || "");
    setBlobUrl(t.blobUrl || "");
    setOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setType("EXPENSE");
    setDescription("");
    setCategoryId(categories.find(c => c.name === "Outros")?.id || categories[0]?.id || "");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setFrequency("NONE");
    setPaymentStatus("PAID");
    setDueDate("");
    setPaidAt("");
    setAttachmentUrl("");
    setBlobUrl("");
  };

  const exportToExcel = async () => {
    const params = new URLSearchParams();
    if (filterCategory !== "Todos") params.append("category", filterCategory);
    if (filterType) params.append("type", filterType);
    if (filterPaymentStatus !== "ALL") params.append("paymentStatus", filterPaymentStatus);

    try {
      const res = await fetch(`/api/transactions/export?${params.toString()}`);
      if (!res.ok) throw new Error("Falha ao exportar dados");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Exportação concluída com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao exportar. Tente novamente.");
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto relative pb-20 md:pb-0">
      {/* Header - Compact */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-2.5 rounded-lg bg-secondary text-on-secondary"
          >
            <LayoutList className="w-5 h-5" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-background">
              Suas transações
            </h1>
            <p className="text-on-surface-variant font-medium text-xs mt-0.5">Todas as entradas e saídas</p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto mt-3 md:mt-0">
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="w-full md:w-auto h-10 px-4 font-semibold text-sm rounded-lg"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar
          </Button>

          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger render={<Button className="apple-button-primary w-full md:w-auto h-10 px-5 text-sm rounded-lg" />}>
              <Plus className="w-4 h-4 mr-2" strokeWidth={2.5} /> NOVO
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-surface sm:shadow-2xl">
              <div className="p-8 border-b border-outline/10 bg-surface">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold tracking-tight text-on-background">
                    {editingId ? "Editar Registro" : "Novo Lançamento"}
                  </DialogTitle>
                  <p className="text-on-surface-variant text-sm font-medium mt-1">Insira os detalhes da movimentação</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex gap-2 p-1 bg-surface-variant rounded-full border border-outline/20">
                  <Button type="button" variant="ghost" className={cn("flex-1 h-9 rounded-full text-xs font-bold transition-colors", type === "INCOME" ? "bg-surface text-secondary shadow-sm" : "text-on-surface-variant")} onClick={() => setType("INCOME")}><ArrowUp className="w-3.5 h-3.5 mr-2" /> Receita</Button>
                  <Button type="button" variant="ghost" className={cn("flex-1 h-9 rounded-full text-xs font-bold transition-colors", type === "EXPENSE" ? "bg-surface text-red-600 shadow-sm" : "text-on-surface-variant")} onClick={() => setType("EXPENSE")}><ArrowDown className="w-3.5 h-3.5 mr-2" /> Despesa</Button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Descrição</Label>
                  <Input required value={description} onChange={e => setDescription(e.target.value)} className="h-11 font-medium" placeholder="Ex: Assinatura mensal Cloud" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Valor (BRL)</Label>
                    <Input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Data</Label>
                    <Input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Categoria</Label>
                    <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                      <SelectTrigger className="h-11 font-medium text-foreground">
                        {categories.find(c => c.id === categoryId)?.name || <span className="text-muted-foreground">Selecione...</span>}
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Recorrência</Label>
                    <Select value={frequency} onValueChange={v => setFrequency(v || "NONE")}>
                      <SelectTrigger className="h-11 font-medium text-foreground">
                        {frequency === "MONTHLY" ? "Mensal" : frequency === "NONE" ? "Nenhuma" : <span className="text-muted-foreground">Selecione...</span>}
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="NONE" className="rounded-lg">Nenhuma</SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-lg">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Status de Pagamento</Label>
                  <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v || "PAID")}>
                    <SelectTrigger className="h-11 font-medium text-foreground">
                      {paymentStatus === "PAID" ? "Pago" : paymentStatus === "PENDING" ? "Pendente" : <span className="text-muted-foreground">Selecione...</span>}
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="PAID" className="rounded-lg">Pago</SelectItem>
                      <SelectItem value="PENDING" className="rounded-lg">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Vencimento</Label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-11 font-medium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Pago em</Label>
                    <Input type="date" value={paidAt} onChange={e => setPaidAt(e.target.value)} className="h-11 font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Comprovante</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        disabled={uploading}
                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                        type="file"
                        aria-label="Anexar comprovante"
                        tabIndex={-1}
                        onChange={async (e) => {
                          if (e.target.files?.[0]) {
                            setUploading(true);
                            try {
                              const f = e.target.files[0];
                              const formData = new FormData();
                              formData.append("file", f);
                              
                              const res = await fetch(`/api/upload?filename=${encodeURIComponent(f.name)}`, {
                                method: 'POST',
                                body: formData,
                              });
                              
                              if (!res.ok) throw new Error("Upload failed");
                              const newBlob = await res.json();
                              setBlobUrl(newBlob.url);
                              setAttachmentUrl(""); 
                            } catch (error) {
                              console.error(error);
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                      />
                      <div className={cn(
                        "h-11 rounded-lg border-2 border-dashed flex items-center justify-center gap-2.5 transition-colors font-bold text-xs uppercase tracking-wider",
                        blobUrl ? "border-emerald-500/50 bg-emerald-50 text-emerald-600" : "border-outline/30 bg-surface-variant/30 text-on-surface-variant/70"
                      )}>
                        {uploading ? "Sincronizando..." : blobUrl ? <><CheckCircle2 className="w-4 h-4" /> SUBMETIDO</> : <><FileUp className="w-4 h-4" /> ANEXAR</>}
                      </div>
                    </div>
                    <div className="flex-[1.5] relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                      <Input 
                        placeholder="Link..." 
                        value={attachmentUrl} 
                        onChange={e => {
                          setAttachmentUrl(e.target.value);
                          setBlobUrl(""); 
                        }}
                        className="h-11 pl-10 font-medium" 
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="apple-button-primary w-full h-12 text-base mt-2">
                  {editingId ? "Salvar Alterações" : "Confirmar Lançamento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview - Compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 md:px-0"
      >
        <Card className="premium-card p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Saldo total</p>
              <h2 className="text-2xl md:text-3xl font-bold text-on-background tracking-tight">
                  {formatCurrency(stats.balance)}
              </h2>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-secondary" />
              <span className="text-[10px] font-semibold text-on-surface-variant">Todas as contas</span>
            </div>
        </Card>

        <Card className="premium-card p-5 flex flex-col justify-between border-emerald-100 bg-emerald-50/20">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">Entrou</p>
                <h2 className="text-2xl font-bold text-emerald-700 tracking-tight">
                    {formatCurrency(stats.income)}
                </h2>
            </div>
            <div className="mt-3 flex items-center gap-2 text-emerald-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-xs font-semibold">Este mês</span>
            </div>
        </Card>

        <Card className="premium-card p-5 flex flex-col justify-between border-red-100 bg-red-50/20">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">Saiu</p>
                <h2 className="text-2xl font-bold text-red-700 tracking-tight">
                    {formatCurrency(stats.expenses)}
                </h2>
              </div>
              <div className="mt-3 flex items-center gap-2 text-red-600">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-xs font-semibold">Este mês</span>
              </div>
          </Card>
        <Card className="premium-card p-5 flex flex-col justify-between border-amber-100 bg-amber-50/20">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">A pagar</p>
                <h2 className="text-2xl font-bold text-amber-700 tracking-tight">
                    {formatCurrency(stats.pending)}
                </h2>
            </div>
            <div className="mt-3 flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Contas pendentes</span>
            </div>
        </Card>
      </motion.div>

      {/* Filters & Search - Compact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-surface p-4 rounded-xl border border-outline/10 mx-4 md:mx-0"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..." 
            className="pl-12 h-11 bg-surface-variant/40 border-outline/10 rounded-2xl placeholder:opacity-70 font-medium focus:bg-surface focus:border-outline/40 transition-colors text-on-surface" 
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v || "Todos")}>
            <SelectTrigger className="md:w-56 h-11 rounded-2xl bg-surface-variant/30 border-transparent font-semibold">
              <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-secondary" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Todos" className="rounded-lg">Todas Categorias</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.name} className="rounded-lg">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Importer onImportSuccess={fetchTransactions} />
          <DocumentImporter onImportSuccess={fetchTransactions} />
        </div>

        <div className="flex bg-surface-variant/30 rounded-2xl p-1 border border-outline/5 overflow-x-auto no-scrollbar">
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", !filterType ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant")} onClick={() => setFilterType(null)}>Todos</Button>
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", filterType === "INCOME" ? "bg-emerald-100 text-emerald-700" : "text-on-surface-variant")} onClick={() => setFilterType("INCOME")}>Receitas</Button>
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", filterType === "EXPENSE" ? "bg-red-100 text-red-700" : "text-on-surface-variant")} onClick={() => setFilterType("EXPENSE")}>Despesas</Button>
        </div>

        <div className="flex bg-surface-variant/30 rounded-2xl p-1 border border-outline/5 overflow-x-auto no-scrollbar">
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", filterPaymentStatus === "ALL" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("ALL")}>Todos</Button>
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", filterPaymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("PAID")}>Pagas</Button>
          <Button variant="ghost" className={cn("h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors", filterPaymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "text-on-surface-variant")} onClick={() => setFilterPaymentStatus("PENDING")}>A pagar</Button>
        </div>
      </motion.div>
      
      {/* Transaction List - Desktop Table (hidden on mobile, cards handle it) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden md:block px-4 md:px-0"
      >
        <Card className="premium-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-variant/10 hover:bg-surface-variant/10 border-b border-outline/10">
                <TableHead className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant/70">Data</TableHead>
                <TableHead className="py-3 sm:py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant/70">Descrição</TableHead>
                <TableHead className="py-3 sm:py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant/70 text-center">Categoria</TableHead>
                <TableHead className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant/70 text-right">Valor</TableHead>
                <TableHead className="w-20 sm:w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-24 text-xs font-semibold text-on-surface-variant/40 italic">Processando dados...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <LayoutList className="w-12 h-12 text-on-surface-variant" />
                      <p className="font-semibold text-sm">Nenhuma transação encontrada</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id} className="group border-b border-outline/5 hover:bg-surface-variant/15 transition-colors duration-200">
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-on-background tracking-tight">{format(new Date(t.date), "dd/MM/yy")}</span>
                      {t.frequency === "MONTHLY" && <span className="flex items-center gap-1 text-[8px] font-bold text-secondary uppercase mt-0.5 tracking-wider"><RotateCcw className="w-2.5 h-2.5" /> Mensal</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-medium text-on-background text-sm">
                    <div className="flex items-center gap-3">
                      {t.description}
                      {t.blobUrl && <motion.a whileHover={{ scale: 1.1 }} href={t.blobUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100"><Cloud className="w-3 h-3" /></motion.a>}
                      {t.attachmentUrl && !t.blobUrl && <motion.a whileHover={{ scale: 1.1 }} href={t.attachmentUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg bg-surface-variant text-secondary border border-outline/10"><LinkIcon className="w-3 h-3" /></motion.a>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {t.frequency === "MONTHLY" && <span className="flex items-center gap-1 text-[8px] font-bold text-secondary uppercase tracking-wider"><RotateCcw className="w-2.5 h-2.5" /> Mensal</span>}
                      {t.dueDate && <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-surface-variant/50 text-on-surface-variant border border-outline/20">Vence {format(new Date(t.dueDate), "dd/MM")}</span>}
                      {t.paidAt && <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Pago {format(new Date(t.paidAt), "dd/MM")}</span>}
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider",
                        t.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-surface-variant/50 text-on-surface-variant border border-outline/20">{t.category?.name}</span>
                  </TableCell>
                  <TableCell className={cn("px-6 py-4 text-right font-bold text-sm tracking-tight", t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background')}>
                    {t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.type === "EXPENSE" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updatePaymentStatus(t.id, t.paymentStatus === "PENDING" ? "PAID" : "PENDING")}
                          className={cn(
                            "h-11 w-11 rounded-lg transition-colors",
                            t.paymentStatus === "PENDING"
                              ? "hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700"
                              : "hover:bg-amber-100 text-amber-600 hover:text-amber-700"
                          )}
                          title={t.paymentStatus === "PENDING" ? "Marcar como pago" : "Marcar como pendente"}
                        >
                          {t.paymentStatus === "PENDING" ? <CheckCircle2 className="w-4 h-4" /> : <Clock3 className="w-4 h-4" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-11 w-11 rounded-lg hover:bg-surface-variant text-secondary hover:text-secondary/90 transition-colors" aria-label="Editar movimentação"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-11 w-11 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold transition-colors" aria-label="Excluir movimentação"><Trash2 className="w-4 h-4" /></Button>
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
          <div className="py-20 text-center text-on-surface-variant/30 font-semibold text-xs italic">Sincronizando...</div>
        ) : transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-on-surface-variant/30">
            <LayoutList className="w-12 h-12" />
            <p className="text-sm font-semibold">Sem resultados</p>
          </div>
        ) : (
          transactions.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="premium-card p-4 group active:scale-[0.98] transition-colors relative">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                      t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-surface-variant/50 text-on-surface-variant/60"
                    )}>
                      {t.type === 'INCOME' ? <ArrowUp className="w-6 h-6" strokeWidth={2.5} /> : <ArrowDown className="w-6 h-6" strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-on-background leading-tight">{t.description}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-tighter">{format(new Date(t.date), "dd MMM, yyyy")}</span>
                        <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-surface-variant/60 text-on-surface-variant font-bold uppercase">{t.category?.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {t.dueDate && <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-surface-variant/50 text-on-surface-variant border border-outline/20">Vence {format(new Date(t.dueDate), "dd/MM")}</span>}
                        {t.paidAt && <span className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">Pago {format(new Date(t.paidAt), "dd/MM")}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-bold tracking-tight",
                        t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background'
                      )}>{t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}</span>
                      <div className="flex justify-end gap-1.5 mt-2">
                        {t.type === "EXPENSE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updatePaymentStatus(t.id, t.paymentStatus === "PENDING" ? "PAID" : "PENDING")}
                            className={cn(
                              "h-11 w-11 rounded-lg transition-colors",
                              t.paymentStatus === "PENDING"
                                ? "bg-emerald-100/70 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-100/70 text-amber-700 hover:bg-amber-100"
                            )}
                            title={t.paymentStatus === "PENDING" ? "Marcar como pago" : "Marcar como pendente"}
                          >
                            {t.paymentStatus === "PENDING" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock3 className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-11 w-11 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/15 transition-colors" aria-label="Editar movimentação">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-11 w-11 rounded-lg bg-red-100/60 text-red-600 hover:bg-red-100 transition-colors" aria-label="Excluir movimentação">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider",
                        t.paymentStatus === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
                      </span>
                      {t.frequency === "MONTHLY" && (
                        <span className="flex items-center gap-1 text-[8px] font-bold text-secondary uppercase tracking-wider">
                          <RotateCcw className="w-2.5 h-2.5" /> Mensal
                        </span>
                      )}
                    </div>
                  </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-4 md:px-0"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            {total} registros · Página {page} de {totalPages}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest"
            >
              Próxima
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed z-50" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom) + 16px)', right: '1.5rem' }}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setOpen(true); }}
          className="h-14 w-14 rounded-2xl bg-secondary text-on-secondary shadow-lg flex items-center justify-center border-none"
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </motion.button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
