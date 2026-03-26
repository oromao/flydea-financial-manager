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
import { upload } from "@vercel/blob/client";
import { FileUp, Cloud, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Movimentacoes() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterType, setFilterType] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<string>("EXPENSE");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [frequency, setFrequency] = useState("NONE");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransactions = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "Todos") params.append("category", filterCategory);
      if (filterType) params.append("type", filterType);
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
  }, [searchTerm, filterCategory, filterType, page]);

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
  }, [fetchCategories]);

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
        showToast(editingId ? "Registro atualizado!" : "Lançamento confirmado!", "success");
        setOpen(false);
        resetForm();
        fetchTransactions();
      } else {
        const errorData = await res.json();
        const msg = typeof errorData.error === 'object' 
          ? JSON.stringify(errorData.error) 
          : (errorData.error || "Erro ao salvar o lançamento");
        showToast(msg, "error");
      }
    } catch(e) {
      console.error(e);
      showToast("Falha na comunicação com o servidor", "error");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm("Confirmar exclusão desta movimentação?")) return;
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch(e) {
      console.error(e);
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
    setAttachmentUrl("");
    setBlobUrl("");
  };

  const exportToExcel = () => {
    const params = new URLSearchParams();
    if (filterCategory !== "Todos") params.append("category", filterCategory);
    if (filterType) params.append("type", filterType);
    window.location.href = `/api/transactions/export?${params.toString()}`;
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-10 md:space-y-16 max-w-7xl mx-auto relative pb-32">
      {/* Custom Toast Notification */}
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
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold text-xs tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4 md:px-0"
      >
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-3.5 rounded-2xl bg-secondary text-on-secondary shadow-sm"
          >
            <LayoutList className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">
              Fluxo de Caixa
            </h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">Gestão inteligente e precisa de ativos</p>
          </div>
        </div>
        
        <div className="flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto mt-6 md:mt-0">
          <Button 
            variant="outline"
            onClick={exportToExcel}
            className="w-full md:w-auto h-11 px-6 font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
          </Button>

          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger render={<Button className="apple-button-primary w-full md:w-auto h-11 px-8" />}>
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVO LANÇAMENTO
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
                  <Button type="button" variant="ghost" className={cn("flex-1 h-9 rounded-full text-xs font-bold transition-all", type === "INCOME" ? "bg-surface text-secondary shadow-sm" : "text-on-surface-variant")} onClick={() => setType("INCOME")}><ArrowUp className="w-3.5 h-3.5 mr-2" /> Receita</Button>
                  <Button type="button" variant="ghost" className={cn("flex-1 h-9 rounded-full text-xs font-bold transition-all", type === "EXPENSE" ? "bg-surface text-red-600 shadow-sm" : "text-on-surface-variant")} onClick={() => setType("EXPENSE")}><ArrowDown className="w-3.5 h-3.5 mr-2" /> Despesa</Button>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Descrição</Label>
                  <Input required value={description} onChange={e => setDescription(e.target.value)} className="h-11 font-medium" placeholder="Ex: Assinatura mensal Cloud" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Valor (BRL)</Label>
                    <Input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="h-11 font-bold text-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Data</Label>
                    <Input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
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
                  <Label className="text-xs font-semibold text-on-surface-variant font-bold ml-1">Comprovante</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input 
                        disabled={uploading}
                        className="opacity-0 absolute inset-0 cursor-pointer z-10" 
                        type="file" 
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
                        "h-11 rounded-lg border-2 border-dashed flex items-center justify-center gap-2.5 transition-all font-bold text-[10px] uppercase tracking-wider",
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

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0"
      >
        <Card className="premium-card p-6 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Saldo Atual</p>
              <h2 className="text-3xl font-bold text-on-background tracking-tight mt-1">
                  {formatCurrency(transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0))}
              </h2>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold text-on-surface-variant">Ajustado em tempo real</span>
            </div>
        </Card>
        
        <Card className="premium-card p-6 flex flex-col justify-between border-emerald-100 bg-emerald-50/20">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Entradas</p>
                <h2 className="text-2xl font-bold text-emerald-700 tracking-tight mt-1">
                    {formatCurrency(transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0))}
                </h2>
            </div>
            <div className="mt-6 flex items-center gap-2 text-emerald-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Fluxos positivos</span>
            </div>
        </Card>

        <Card className="premium-card p-6 flex flex-col justify-between border-red-100 bg-red-50/20">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Saídas</p>
                <h2 className="text-2xl font-bold text-red-700 tracking-tight mt-1">
                    {formatCurrency(transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0))}
                </h2>
              </div>
              <div className="mt-6 flex items-center gap-2 text-red-600">
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-[10px] font-semibold">Fluxos negativos</span>
              </div>
          </Card>
      </motion.div>

      {/* Filters & Search */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-surface p-6 rounded-3xl border border-outline/10 shadow-sm mx-4 md:mx-0"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/60" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..." 
            className="pl-12 h-11 bg-surface-variant/40 border-outline/10 rounded-2xl placeholder:opacity-70 font-medium focus:bg-surface focus:border-outline/40 transition-all text-on-surface" 
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
        </div>

        <div className="flex bg-surface-variant/30 rounded-2xl p-1 border border-outline/5 overflow-x-auto no-scrollbar">
          <Button variant="ghost" className={cn("h-9 px-6 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", !filterType ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant")} onClick={() => setFilterType(null)}>Todos</Button>
          <Button variant="ghost" className={cn("h-9 px-6 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", filterType === "INCOME" ? "bg-emerald-100 text-emerald-700" : "text-on-surface-variant")} onClick={() => setFilterType("INCOME")}>Receitas</Button>
          <Button variant="ghost" className={cn("h-9 px-6 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all", filterType === "EXPENSE" ? "bg-red-100 text-red-700" : "text-on-surface-variant")} onClick={() => setFilterType("EXPENSE")}>Despesas</Button>
        </div>
      </motion.div>
      
      {/* Transaction List - Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 md:px-0"
      >
        <Card className="premium-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-variant/10 hover:bg-surface-variant/10 border-b border-outline/10">
                <TableHead className="px-8 py-6 font-bold uppercase text-[10px] tracking-widest text-on-surface-variant/80">Data</TableHead>
                <TableHead className="py-6 font-bold uppercase text-[10px] tracking-widest text-on-surface-variant/80">Descrição</TableHead>
                <TableHead className="py-6 font-bold uppercase text-[10px] tracking-widest text-on-surface-variant/80 text-center">Categoria</TableHead>
                <TableHead className="px-8 py-6 font-bold uppercase text-[10px] tracking-widest text-on-surface-variant/80 text-right">Valor</TableHead>
                <TableHead className="w-32"></TableHead>
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
                <TableRow key={t.id} className="group border-b border-outline/5 hover:bg-surface-variant/20 transition-all duration-200">
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-on-background tracking-tight">{format(new Date(t.date), "dd/MM/yyyy")}</span>
                      {t.frequency === "MONTHLY" && <span className="flex items-center gap-1 text-[9px] font-bold text-secondary uppercase mt-1 tracking-wider"><RotateCcw className="w-2.5 h-2.5" /> Mensal</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 font-semibold text-on-background">
                    <div className="flex items-center gap-4">
                      {t.description}
                      {t.blobUrl && <motion.a whileHover={{ scale: 1.1 }} href={t.blobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100"><Cloud className="w-3.5 h-3.5" /></motion.a>}
                      {t.attachmentUrl && !t.blobUrl && <motion.a whileHover={{ scale: 1.1 }} href={t.attachmentUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-surface-variant text-secondary border border-outline/10"><LinkIcon className="w-3.5 h-3.5" /></motion.a>}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 text-center">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-variant/60 text-on-surface-variant border border-outline/20">{t.category?.name}</span>
                  </TableCell>
                  <TableCell className={cn("px-8 py-6 text-right font-bold text-xl tracking-tight", t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background')}>
                    {t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-9 w-9 rounded-xl hover:bg-surface-variant text-on-surface-variant hover:text-secondary"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 text-on-surface-variant hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
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
              <Card className="premium-card p-4 group active:scale-[0.98] transition-all relative">
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
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-lg font-bold tracking-tight",
                        t.type === 'INCOME' ? 'text-emerald-600' : 'text-on-background'
                      )}>{t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}</span>
                      <div className="flex justify-end gap-1.5 mt-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 rounded-lg bg-surface-variant/30 text-on-surface-variant">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-8 w-8 rounded-lg bg-surface-variant/30 text-on-surface-variant">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
      <div className="md:hidden fixed bottom-24 right-6 z-50">
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
