"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Search, ArrowUp, ArrowDown, Filter, LayoutList, Download, Edit2, RotateCcw, X, Paperclip, ExternalLink, MoreVertical, Wallet } from "lucide-react";
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

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterCategory !== "Todos") params.append("category", filterCategory);
      if (filterType) params.append("type", filterType);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterType]);

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
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

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
        showToast(errorData.error || "Erro ao salvar o lançamento", "error");
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

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor", "Recorrência", "Anexo"];
    const rows = transactions.map(t => [
      format(new Date(t.date), "dd/MM/yyyy"),
      t.description,
      t.category?.name || "N/A",
      t.type === "INCOME" ? "Entrada" : "Saída",
      t.amount.toString(),
      t.frequency === "MONTHLY" ? "Mensal" : "Nenhuma",
      t.blobUrl || t.attachmentUrl || ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fly_dea_movimentacoes_${format(new Date(), "yyyy_MM_dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto relative pb-32">
      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border backdrop-blur-xl transition-all duration-500",
              toast.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10" 
                : "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10"
            )}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            <span className="font-black uppercase tracking-widest text-xs">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Responsive */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4 md:px-0"
      >
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="p-4 rounded-3xl bg-secondary text-on-secondary shadow-2xl shadow-secondary/20"
          >
            <LayoutList className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-on-background">
              Fluxo de Caixa
            </h1>
            <p className="text-on-surface-variant/60 font-bold text-sm md:text-lg uppercase tracking-[0.2em] mt-1">Gestão FLY DEA <span className="text-primary">•</span> Premium Mobility</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            onClick={exportToCSV}
            className="flex-1 md:flex-none h-16 px-8 rounded-full bg-surface-variant/20 hover:bg-surface-variant/40 text-on-surface font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95"
          >
            <Download className="w-6 h-6 mr-3" /> CSV
          </Button>

          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger render={<Button className="flex-[2] md:flex-none h-16 px-10 rounded-full bg-primary hover:bg-white text-on-primary hover:text-primary font-black text-base md:text-lg shadow-2xl shadow-primary/20 border-none transition-all duration-500 active:scale-95" />}>
              <Plus className="w-7 h-7 mr-3" strokeWidth={4} /> NOVO LANÇAMENTO
            </DialogTrigger>
            <DialogContent className="w-[95vw] md:max-w-[550px] p-0 overflow-hidden border-none rounded-[40px] bg-surface shadow-[0_32px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              <div className="bg-surface-variant/10 p-8 md:p-12 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <DialogHeader>
                  <DialogTitle className="text-2xl md:text-4xl font-black text-on-background tracking-tighter">
                    {editingId ? "Editar Registro" : "Novo Lançamento"}
                  </DialogTitle>
                  <p className="text-on-surface-variant/40 text-xs font-bold uppercase tracking-widest mt-2 italic">Infraestrutura Corporativa FLY DEA</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 md:space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4 p-1.5 bg-background rounded-full border border-white/5">
                  <Button type="button" variant="ghost" className={cn("h-14 rounded-full text-xs font-black uppercase tracking-widest transition-all", type === "INCOME" ? "bg-primary text-on-primary shadow-xl" : "text-on-surface-variant/40")} onClick={() => setType("INCOME")}><ArrowUp className="w-4 h-4 mr-2" /> Receita</Button>
                  <Button type="button" variant="ghost" className={cn("h-14 rounded-full text-xs font-black uppercase tracking-widest transition-all", type === "EXPENSE" ? "bg-primary text-on-primary shadow-xl" : "text-on-surface-variant/40")} onClick={() => setType("EXPENSE")}><ArrowDown className="w-4 h-4 mr-2" /> Despesa</Button>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Descrição Detalhada</Label>
                  <Input required value={description} onChange={e => setDescription(e.target.value)} className="h-16 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface placeholder:text-on-surface-variant/20 px-8 text-lg font-bold focus:bg-white/[0.06] transition-all" placeholder="Ex: Pagamento Consultoria..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Valor (BRL)</Label>
                    <Input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="h-16 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface px-8 text-lg font-black focus:bg-white/[0.06] transition-all" />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Data Operação</Label>
                    <Input required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-16 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface px-8 text-lg font-bold focus:bg-white/[0.06] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Categoria M3</Label>
                    <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                      <SelectTrigger className="h-16 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface px-8 text-lg font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-white/10 text-on-surface rounded-[24px] p-2">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 px-4 focus:bg-primary/20">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Recorrência</Label>
                    <Select value={frequency} onValueChange={v => setFrequency(v || "NONE")}>
                      <SelectTrigger className="h-16 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface px-8 text-lg font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-white/10 text-on-surface rounded-[24px] p-2">
                        <SelectItem value="NONE" className="rounded-xl py-3 px-4">Nenhuma</SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-xl py-3 px-4">Mensal Automática</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 ml-3">Documento / Comprovante</Label>
                  <div className="flex flex-col md:flex-row gap-4">
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
                              const newBlob = await upload(f.name, f, {
                                access: 'public',
                                handleUploadUrl: '/api/upload',
                              });
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
                        "h-16 rounded-[24px] border-2 border-dashed flex items-center justify-center gap-3 transition-all font-black text-xs uppercase tracking-widest",
                        blobUrl ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-white/5 bg-white/[0.02] text-on-surface-variant/20"
                      )}>
                        {uploading ? "Sincronizando..." : blobUrl ? <><Cloud className="w-5 h-5" /> PRONTO</> : <><FileUp className="w-5 h-5" /> UPLOAD</>}
                      </div>
                    </div>
                    <div className="flex-[2] relative">
                      <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/20" />
                      <Input 
                        placeholder="Link Externo..." 
                        value={attachmentUrl} 
                        onChange={e => {
                          setAttachmentUrl(e.target.value);
                          setBlobUrl(""); 
                        }}
                        className="h-16 pl-14 rounded-[24px] border-white/5 bg-white/[0.03] text-on-surface placeholder:text-on-surface-variant/20 font-bold" 
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-20 rounded-full bg-primary text-on-primary font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 duration-500">
                  {editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR LANÇAMENTO"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview with Motion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0"
      >
        <div className="m3-glass p-8 flex items-center justify-between group hover:scale-[1.05] transition-all duration-700">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Saldo Consolidado</p>
                <h2 className="text-4xl font-black text-on-background tracking-tighter mt-1 drop-shadow-xl">
                    {formatCurrency(transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0))}
                </h2>
            </div>
            <div className="p-4 rounded-[24px] bg-primary/10 text-primary shadow-2xl transition-transform group-hover:rotate-12 duration-700">
                <Wallet className="w-8 h-8" />
            </div>
        </div>
        
        <div className="m3-card-glass p-8 flex items-center justify-between border-emerald-500/20 bg-emerald-500/[0.03] group hover:scale-[1.05] transition-all duration-700">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Receitas Totais</p>
                <h2 className="text-3xl font-black text-emerald-400 tracking-tighter mt-1">
                    {formatCurrency(transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0))}
                </h2>
            </div>
            <div className="p-4 rounded-[24px] bg-emerald-500/10 text-emerald-400 transition-transform group-hover:-translate-y-2 duration-700">
                <ArrowUp className="w-7 h-7" />
            </div>
        </div>

        <div className="m3-card-glass p-8 flex items-center justify-between border-rose-500/20 bg-rose-500/[0.03] group hover:scale-[1.05] transition-all duration-700">
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Despesas Totais</p>
                <h2 className="text-3xl font-black text-rose-400 tracking-tighter mt-1">
                    {formatCurrency(transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0))}
                </h2>
              </div>
              <div className="p-4 rounded-[24px] bg-rose-500/10 text-rose-400 transition-transform group-hover:translate-y-2 duration-700">
                  <ArrowDown className="w-7 h-7" />
              </div>
          </div>
      </motion.div>

      {/* Filters & Search - Optimized for Touch */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-6 m3-card-glass p-6 md:p-8 mx-4 md:mx-0 shadow-2xl"
      >
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar transações..." 
            className="pl-16 h-16 bg-background/50 border-white/5 rounded-[24px] text-base font-bold placeholder:text-on-surface-variant/20 focus:bg-background transition-all" 
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v || "Todos")}>
            <SelectTrigger className="flex-1 md:w-64 h-16 rounded-[24px] border-white/5 bg-background/50 font-bold px-6">
              <div className="flex items-center gap-3"><Filter className="w-5 h-5 text-primary" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent className="bg-surface border-white/10 text-on-surface rounded-[24px] p-2">
              <SelectItem value="Todos" className="rounded-xl py-3 px-4">Todas Categorias</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.name} className="rounded-xl py-3 px-4">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Importer onImportSuccess={fetchTransactions} />
        </div>

        <div className="flex bg-background/50 rounded-[24px] border border-white/5 p-1.5 overflow-x-auto no-scrollbar">
          <Button variant="ghost" className={cn("h-13 px-8 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all", !filterType ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant/40")} onClick={() => setFilterType(null)}>Tudo</Button>
          <Button variant="ghost" className={cn("h-13 px-8 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all", filterType === "INCOME" ? "bg-emerald-500/20 text-emerald-400" : "text-on-surface-variant/40")} onClick={() => setFilterType("INCOME")}>Receitas</Button>
          <Button variant="ghost" className={cn("h-13 px-8 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all", filterType === "EXPENSE" ? "bg-rose-500/20 text-rose-400" : "text-on-surface-variant/40")} onClick={() => setFilterType("EXPENSE")}>Despesas</Button>
        </div>
      </motion.div>
      
      {/* Transaction List - Desktop Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 md:px-0"
      >
        <Card className="hidden md:block m3-card-glass overflow-hidden shadow-2xl border-none">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 border-b border-white/5">
                <TableHead className="px-10 py-8 font-black uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">Data Operação</TableHead>
                <TableHead className="py-8 font-black uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">Descrição de Fluxo</TableHead>
                <TableHead className="py-8 font-black uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40">Categoria M3</TableHead>
                <TableHead className="px-10 py-8 font-black uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40 text-right">Valor Líquido</TableHead>
                <TableHead className="w-[180px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32 animate-pulse uppercase text-xs font-black tracking-[0.5em] text-on-surface-variant/20">Sincronizando Dados Corporativos...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-32">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <LayoutList className="w-16 h-16 text-on-surface-variant" />
                      <p className="font-black uppercase tracking-[0.3em] text-sm">Base de dados vazia</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.map((t) => (
                <TableRow key={t.id} className="group hover:bg-white/[0.05] border-b border-white/5 text-on-surface transition-all duration-300">
                  <TableCell className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="font-black text-lg tracking-tighter text-on-background">{format(new Date(t.date), "dd/MM/yyyy")}</span>
                      {t.frequency === "MONTHLY" && <span className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase mt-1.5 tracking-widest"><RotateCcw className="w-3 h-3" /> Recorrência Mensal</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-8 font-black tracking-tight text-base">
                    <div className="flex items-center gap-4">
                      {t.description}
                      {t.blobUrl && <motion.a whileHover={{ scale: 1.2 }} href={t.blobUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Cloud className="w-4 h-4" /></motion.a>}
                      {t.attachmentUrl && !t.blobUrl && <motion.a whileHover={{ scale: 1.2 }} href={t.attachmentUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20"><LinkIcon className="w-4 h-4" /></motion.a>}
                    </div>
                  </TableCell>
                  <TableCell className="py-8"><span className="inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface-variant/30 text-on-surface-variant border border-white/5 shadow-sm">{t.category?.name}</span></TableCell>
                  <TableCell className={cn("px-10 py-8 text-right font-black text-2xl tracking-tighter drop-shadow-sm", t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400')}>{formatCurrency(t.amount)}</TableCell>
                  <TableCell className="text-right pr-10">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-12 w-12 rounded-2xl bg-white/[0.03] text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all shadow-sm"><Edit2 className="w-5 h-5" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-12 w-12 rounded-2xl bg-white/[0.03] text-on-surface-variant hover:text-rose-400 hover:bg-rose-400/10 transition-all shadow-sm"><Trash2 className="w-5 h-5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Transaction List - Mobile Cards */}
      <div className="md:hidden space-y-6 px-4">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant/20 font-black uppercase text-xs tracking-widest animate-pulse">Sincronizando Nuvem...</div>
        ) : transactions.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-6 text-on-surface-variant/20">
            <LayoutList className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-[0.2em]">Sem lançamentos</p>
          </div>
        ) : (
          transactions.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="m3-card-glass border-none rounded-[32px] overflow-hidden active:scale-95 transition-all shadow-xl group">
                <CardContent className="p-6 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-[20px] flex items-center justify-center shadow-lg transition-transform group-active:rotate-12",
                      t.type === 'INCOME' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {t.type === 'INCOME' ? <ArrowUp className="w-8 h-8" strokeWidth={3} /> : <ArrowDown className="w-8 h-8" strokeWidth={3} />}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-on-background tracking-tight">{t.description}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{format(new Date(t.date), "dd MMM")}</span>
                        <span className="text-[9px] px-3 py-1 rounded-full bg-white/5 border border-white/5 text-on-surface-variant font-black uppercase tracking-[0.1em]">{t.category?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 relative z-10">
                    <span className={cn(
                      "text-xl font-black tracking-tighter drop-shadow-sm",
                      t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                    )}>{formatCurrency(t.amount)}</span>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-10 w-10 rounded-xl bg-white/5 text-on-surface-variant">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} className="h-10 w-10 rounded-xl bg-white/5 text-on-surface-variant">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-10 right-8 z-50">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { resetForm(); setOpen(true); }}
          className="h-20 w-20 rounded-[28px] bg-primary text-on-primary shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center border-none"
        >
          <Plus className="w-10 h-10" strokeWidth={4} />
        </motion.button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); border: 2px solid transparent; background-clip: content-box; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
