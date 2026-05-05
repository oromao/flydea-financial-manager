"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2, Search, ArrowUp, ArrowDown, Filter, LayoutList, FileSpreadsheet, Edit2, RotateCcw, X, Paperclip, ExternalLink, MoreVertical, Wallet, Loader2, Cloud, AlertCircle, CheckCircle2, FileUp, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PaymentImporter } from "@/components/payment-importer";
import { DocumentImporter } from "@/components/document-importer";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toLocalDateInput } from "@/lib/date-utils";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionCard } from "@/components/movimentacoes/transaction-card";
import { PageHeader } from "@/components/ui/page-header";
import { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";

const transactionSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Data é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  accountId: z.string().min(1, "Conta é obrigatória"),
  dueDate: z.string().optional(),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
  observations: z.string().optional(),
});

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  paymentStatus: string;
  category?: { id: string; name: string };
  categoryId?: string;
  frequency?: string;
  dueDate?: string;
  paidAt?: string;
  amountPaid?: number;
  attachmentUrl?: string;
  blobUrl?: string;
  accountId?: string;
  [key: string]: unknown;
}

interface Category {
  id: string;
  name: string;
}

function MovimentacoesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Sync state from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({ balance: 0, income: 0, expenses: 0, pending: 0 });

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [filterCategory, setFilterCategory] = useState(searchParams.get("category") || "Todos");
  const [filterType, setFilterType] = useState<string | null>(searchParams.get("type"));
  const [filterPaymentStatus, setFilterPaymentStatus] = useState(searchParams.get("paymentStatus") || "ALL");
  const [startDateFilter, setStartDateFilter] = useState(searchParams.get("startDate") || "");
  const [endDateFilter, setEndDateFilter] = useState(searchParams.get("endDate") || "");
  const [sortField, setSortField] = useState<string>(searchParams.get("sort") || "date");
  const [sortOrder, setSortDirection] = useState<"asc" | "desc">((searchParams.get("order") as "asc" | "desc") || "desc");

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filterCategory && filterCategory !== "Todos") params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    if (filterPaymentStatus && filterPaymentStatus !== "ALL") params.set("paymentStatus", filterPaymentStatus);
    if (startDateFilter) params.set("startDate", startDateFilter);
    if (endDateFilter) params.set("endDate", endDateFilter);
    if (sortField && sortField !== "date") params.set("sort", sortField);
    if (sortOrder && sortOrder !== "desc") params.set("order", sortOrder);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
    
    // Only replace if changed
    if (window.location.search !== `?${queryString}` && !(window.location.search === "" && !queryString)) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchTerm, filterCategory, filterType, filterPaymentStatus, startDateFilter, endDateFilter, sortField, sortOrder, page, router, pathname]);

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
      if (startDateFilter) params.append("startDate", startDateFilter);
      if (endDateFilter) params.append("endDate", endDateFilter);
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
  }, [searchTerm, filterCategory, filterType, filterPaymentStatus, page, startDateFilter, endDateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?all=true");
      const data = await res.json();
      const allTx = Array.isArray(data.data) ? data.data : [];
      const balance = allTx.reduce((acc: number, t: Transaction) => t.type === "INCOME" ? acc + t.amount : acc - t.amount, 0);
      const income = allTx.filter((t: Transaction) => t.type === "INCOME").reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      const expenses = allTx.filter((t: Transaction) => t.type === "EXPENSE").reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      const pending = allTx.filter((t: Transaction) => t.type === "EXPENSE" && t.paymentStatus === "PENDING").reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      setStats({ balance, income, expenses, pending });
    } catch (e) {}
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [fetchCategories, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(page);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions, page]);

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
  const [amountPaid, setAmountPaid] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [accountId, setAccountId] = useState("");

  const { errors, validate } = useZodForm(transactionSchema);

  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    const formData = {
      description: description.trim(),
      amount: parsedAmount,
      type: type as "INCOME" | "EXPENSE",
      date,
      categoryId,
      accountId: accountId || undefined,
      dueDate: dueDate || undefined,
      paymentStatus: (paymentStatus || undefined) as "PENDING" | "PAID" | undefined,
      observations: undefined,
    };
    if (!validate(formData)) return;

    setSaving(true);
    const payload: Record<string, unknown> = {
      type,
      description: description.trim(),
      categoryId,
      amount: parsedAmount,
      date,
      frequency: frequency || "NONE",
      paymentStatus: paymentStatus || "PAID",
      dueDate: dueDate || null,
      paidAt: paidAt || null,
      attachmentUrl: attachmentUrl || null,
      blobUrl: blobUrl || null,
      accountId: accountId || null,
    };
    if (amountPaid && parseFloat(amountPaid) > 0) {
      payload.amountPaid = parseFloat(amountPaid);
    }

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

  const handleEdit = (t: Transaction) => {
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
    setAmountPaid(t.amountPaid?.toString() || "");
    setAttachmentUrl(t.attachmentUrl || "");
    setBlobUrl(t.blobUrl || "");
    setAccountId(t.accountId || "");
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
    setAmountPaid("");
    setAttachmentUrl("");
    setBlobUrl("");
    setCategoryId(categories.find((c: Category) => c.name === "Outros")?.id || (categories.length > 0 ? categories[0].id : ""));
    setAccountId("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("Todos");
    setFilterType(null);
    setFilterPaymentStatus("ALL");
    setStartDateFilter("");
    setEndDateFilter("");
    setPage(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      {/* Header Section */}
      <PageHeader icon={LayoutList} title="Movimentações" subtitle="Gerencie seu fluxo financeiro real">
          <Button variant="outline" className="h-10 px-5 font-bold text-sm rounded-xl border-outline/20 hover:bg-surface-variant transition-all">
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
            <DialogTrigger render={<Button className="apple-button-primary h-11 px-6 rounded-xl shadow-lg shadow-secondary/20 whitespace-nowrap"><Plus className="w-5 h-5 mr-2" strokeWidth={2.5} /> NOVO</Button>} />
            
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
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest border-b border-outline/10 pb-2">Dados Básicos</h3>

                  <div className="flex p-1 bg-surface-variant/30 rounded-2xl border border-outline/5">
                    <Button type="button" variant="ghost" className={cn("flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === "INCOME" ? "bg-surface-container-lowest text-success shadow-md scale-[1.02]" : "text-on-surface-variant")} onClick={() => setType("INCOME")}><ArrowUp className="w-4 h-4 mr-2" /> Receita</Button>
                    <Button type="button" variant="ghost" className={cn("flex-1 h-10 rounded-xl text-xs font-black uppercase tracking-widest transition-all", type === "EXPENSE" ? "bg-surface-container-lowest text-destructive shadow-md scale-[1.02]" : "text-on-surface-variant")} onClick={() => setType("EXPENSE")}><ArrowDown className="w-4 h-4 mr-2" /> Despesa</Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Descrição</Label>
                    <Input id="description" name="description" required value={description} onChange={e => setDescription(e.target.value)} className="h-12 font-bold text-lg rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" placeholder="O que você pagou ou recebeu?" aria-label="Descrição da transação" aria-describedby="description-error" />
                    {errors.description && <p id="description-error" className="text-xs text-destructive mt-1">{errors.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Valor (BRL)</Label>
                    <MoneyInput id="amount" name="amount" value={amount} onChange={setAmount} className="h-12 font-black text-2xl rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" required aria-label="Valor da transação" aria-describedby="amount-error" />
                    {errors.amount && <p id="amount-error" className="text-xs text-destructive mt-1">{errors.amount}</p>}
                  </div>
                </div>

                <hr className="border-outline/10" />

                {/* Classificação */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest border-b border-outline/10 pb-2">Classificação</h3>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Categoria <span className="text-destructive">*</span></Label>
                    <Select value={categoryId} onValueChange={(v: string | null) => setCategoryId(v || "")}>
                      <SelectTrigger id="categoryId" className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10" aria-label="Categoria da transação" aria-describedby="categoryId-error">
                        {categories.find(c => c.id === categoryId)?.name || "Selecione..."}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold">{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && <p id="categoryId-error" className="text-xs text-destructive mt-1">{errors.categoryId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Conta <span className="text-destructive">*</span></Label>
                    <Select value={accountId} onValueChange={(v: string | null) => setAccountId(v || "")}>
                      <SelectTrigger id="accountId" className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10" aria-label="Conta da transação">
                        {accounts.find(a => a.id === accountId)?.name || "Selecione..."}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        {accounts.map(a => (
                          <SelectItem key={a.id} value={a.id} className="rounded-xl font-bold">{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.accountId && <p id="accountId-error" className="text-xs text-destructive mt-1">{errors.accountId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Recorrência</Label>
                    <Select value={frequency} onValueChange={(v: string | null) => setFrequency(v || "")}>
                      <SelectTrigger id="frequency" className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10" aria-label="Recorrência da transação">
                        {frequency === "MONTHLY" ? "Mensal" : "Nenhuma"}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        <SelectItem value="NONE" className="rounded-xl font-bold">Nenhuma</SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-xl font-bold">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <hr className="border-outline/10" />

                {/* Datas e Status */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest border-b border-outline/10 pb-2">Datas e Status</h3>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Data</Label>
                    <Input id="date" name="date" required type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" aria-label="Data da transação" aria-describedby="date-error" />
                    {errors.date && <p id="date-error" className="text-xs text-destructive mt-1">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Vencimento</Label>
                    <Input id="dueDate" name="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface transition-all" aria-label="Data de vencimento" aria-describedby="dueDate-error" />
                    {errors.dueDate && <p id="dueDate-error" className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Status de Pagamento</Label>
                    <Select value={paymentStatus} onValueChange={(v: string | null) => setPaymentStatus(v || "")}>
                      <SelectTrigger id="paymentStatus" className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10" aria-label="Status de pagamento" aria-describedby="paymentStatus-error">
                        {paymentStatus === "PAID" ? "Pago" : "Pendente"}
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-outline/10">
                        <SelectItem value="PAID" className="rounded-xl font-bold">Confirmado / Pago</SelectItem>
                        <SelectItem value="PENDING" className="rounded-xl font-bold">Pendente / Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentStatus && <p id="paymentStatus-error" className="text-xs text-destructive mt-1">{errors.paymentStatus}</p>}
                  </div>
                </div>

                {paymentStatus === "PENDING" && (
                  <div className="space-y-2">
                    <Label htmlFor="amountPaid" className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Valor já Pago (parcial)</Label>
                    <MoneyInput id="amountPaid" name="amountPaid" value={amountPaid} onChange={setAmountPaid} className="h-12 font-bold rounded-2xl bg-surface-variant/20 border-outline/10" placeholder="0,00" aria-label="Valor parcial já pago" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Comprovante</Label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        disabled={uploading}
                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                        type="file"
                        aria-label="Anexar comprovante"
                        onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          setUploading(true);
                          try {
                            const f = e.target.files[0];
                            const formData = new FormData();
                            formData.append("file", f);
                            const res = await fetch(`/api/upload?filename=${encodeURIComponent(f.name)}`, { method: "POST", body: formData });
                            const newBlob = await res.json();
                            setBlobUrl(newBlob.url);
                            toast.success("Anexado!");
                          } catch (error: unknown) {
                            toast.error("Erro no upload");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <div className={cn(
                        "h-12 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest",
                        blobUrl ? "border-success bg-success/10 text-success" : "border-outline/20 bg-surface-variant/30 text-on-surface-variant/60"
                      )}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : blobUrl ? "PRONTO" : "ANEXAR"}
                      </div>
                    </div>
                    <Input placeholder="Link externo..." value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="flex-[1.5] h-12 rounded-2xl bg-surface-variant/20 border-outline/10 focus:bg-surface font-medium" aria-label="Link externo do comprovante" />
                  </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-surface pb-2">
                  <Button type="submit" disabled={saving} className="apple-button-primary w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-secondary/20">
                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : editingId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR LANÇAMENTO"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="premium-card p-4 min-h-[110px] flex flex-col justify-between">
          <p className="text-[9px] uppercase tracking-widest font-black text-on-surface-variant/50">Saldo Geral</p>
          <h2 className={cn("text-xl md:text-2xl font-black mt-2 tracking-tighter truncate", stats.balance >= 0 ? "text-on-background" : "text-destructive")}>{formatCurrency(stats.balance)}</h2>
          <div className="flex items-center gap-1.5 mt-2 opacity-40">
            <Wallet className="w-3 h-3 text-secondary" />
            <span className="text-[8px] font-black uppercase tracking-widest">Total Líquido</span>
          </div>
        </Card>
        <Card className="premium-card p-4 min-h-[110px] flex flex-col justify-between bg-success/10 border-success/20">
          <p className="text-[9px] uppercase tracking-widest font-black text-success/70">Receitas</p>
          <h2 className="text-xl md:text-2xl font-black mt-2 text-success tracking-tighter truncate">{formatCurrency(stats.income)}</h2>
        </Card>
        <Card className="premium-card p-4 min-h-[110px] flex flex-col justify-between bg-destructive/10 border-destructive/20">
          <p className="text-[9px] uppercase tracking-widest font-black text-destructive/70">Despesas</p>
          <h2 className="text-xl md:text-2xl font-black mt-2 text-destructive tracking-tighter truncate">{formatCurrency(stats.expenses)}</h2>
        </Card>
        <Card className="premium-card p-4 min-h-[110px] flex flex-col justify-between bg-warning/10 border-warning/20">
          <p className="text-[9px] uppercase tracking-widest font-black text-warning/70">Pendências</p>
          <h2 className="text-xl md:text-2xl font-black mt-2 text-warning tracking-tighter truncate">{formatCurrency(stats.pending)}</h2>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4 bg-surface p-6 rounded-[32px] border border-outline/10 mx-4 md:mx-0 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Pesquisar lançamentos..." className="pl-12 h-12 bg-surface-variant/40 border-transparent rounded-2xl focus:bg-surface transition-all" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v || "ALL")}>
              <SelectTrigger className="sm:w-56 h-12 rounded-2xl bg-surface-variant/30 border-transparent font-black uppercase text-[10px] tracking-widest">
                <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-secondary" />{filterCategory === "Todos" ? "TODAS CATEGORIAS" : filterCategory.toUpperCase()}</div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-outline/10">
                <SelectItem value="Todos" className="rounded-xl font-bold">TODAS CATEGORIAS</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.name} className="rounded-xl font-bold">{c.name.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col sm:flex-row gap-2">
              <PaymentImporter onImportSuccess={fetchTransactions} />
              <DocumentImporter onImportSuccess={fetchTransactions} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex gap-3 p-4 bg-surface-variant/20 rounded-2xl border border-outline/5 lg:items-end">
          <div className="space-y-1 flex-1">
            <Label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-2">Período De</Label>
            <Input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="h-12 bg-surface-container-lowest border-outline/10 rounded-xl text-xs font-black" />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/50 ml-2">Período Até</Label>
            <Input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="h-12 bg-surface-container-lowest border-outline/10 rounded-xl text-xs font-black" />
          </div>
          
          <div className="flex bg-surface-container-lowest rounded-xl p-0.5 border border-outline/10 h-10 overflow-hidden">
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", !filterType ? "bg-surface-variant/30 text-on-surface shadow-sm" : "text-on-surface-variant/40")} onClick={() => setFilterType(null)}>Todos</Button>
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filterType === "INCOME" ? "bg-success text-white shadow-lg" : "text-on-surface-variant/40")} onClick={() => setFilterType("INCOME")}>Receitas</Button>
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filterType === "EXPENSE" ? "bg-destructive text-white shadow-lg" : "text-on-surface-variant/40")} onClick={() => setFilterType("EXPENSE")}>Despesas</Button>
          </div>

          <div className="flex bg-surface-container-lowest rounded-xl p-0.5 border border-outline/10 h-10 overflow-hidden">
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filterPaymentStatus === "ALL" ? "bg-surface-variant/30 text-on-surface shadow-sm" : "text-on-surface-variant/40")} onClick={() => setFilterPaymentStatus("ALL")}>Status</Button>
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filterPaymentStatus === "PAID" ? "bg-secondary text-on-secondary shadow-lg" : "text-on-surface-variant/40")} onClick={() => setFilterPaymentStatus("PAID")}>Pagas</Button>
            <Button variant="ghost" className={cn("flex-1 h-full px-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap", filterPaymentStatus === "PENDING" ? "bg-warning text-white shadow-lg" : "text-on-surface-variant/40")} onClick={() => setFilterPaymentStatus("PENDING")}>Pendentes</Button>
          </div>

          {(searchTerm || filterCategory !== "Todos" || filterType || filterPaymentStatus !== "ALL" || startDateFilter || endDateFilter) && (
            <Button variant="outline" onClick={clearFilters} className="h-10 px-4 rounded-xl font-black text-[9px] uppercase border-destructive/30 text-destructive hover:bg-destructive/10">
              <X className="w-3 h-3 mr-2" /> Limpar
            </Button>
          )}
        </div>
      </div>
      
      {/* Transaction List */}
      <div className="hidden md:block">
        <Card className="premium-card overflow-hidden border-none shadow-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-variant/30 border-b border-outline/5">
                <TableHead className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 cursor-pointer" onClick={() => handleSort("date")}>Data</TableHead>
                <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 cursor-pointer" onClick={() => handleSort("description")}>Lançamento</TableHead>
                <TableHead className="py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 text-center">Categoria</TableHead>
                <TableHead className="px-6 py-5 font-black uppercase text-[10px] tracking-widest text-on-surface-variant/60 text-right cursor-pointer" onClick={() => handleSort("amount")}>Valor</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-32"><EmptyState icon={LayoutList} title="Sem movimentações" description="Ajuste os filtros ou crie um novo lançamento." /></TableCell></TableRow>
              ) : sortedTransactions.map((t) => (
                <TableRow key={t.id} className="group border-b border-outline/5 hover:bg-surface-variant/10 transition-all">
                  <TableCell className="px-6 py-5 font-black text-sm">                {t.date ? format(new Date(t.date), "dd/MM/yy") : "—"}</TableCell>
                  <TableCell className="py-5 font-bold text-sm">
                    {t.description}
                    <div className="flex gap-2 mt-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border", t.paymentStatus === "PENDING" ? "bg-warning/10 text-warning border-warning/30" : "bg-success/10 text-success border-success/30")}>{t.paymentStatus === "PENDING" ? "Pendente" : "Confirmado"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center"><span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-surface-variant text-on-surface-variant/60">{t.category?.name || "Outros"}</span></TableCell>
                  <TableCell className={cn("px-6 py-5 text-right font-black text-base", t.type === 'INCOME' ? 'text-success' : 'text-on-background')}>{t.type === 'EXPENSE' && "- "}{formatCurrency(t.amount)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} aria-label="Editar transação" className="h-9 w-9 rounded-xl bg-secondary/5 text-secondary"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTransaction(t.id)} aria-label="Excluir transação" className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="md:hidden space-y-4 px-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/20" /></div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={LayoutList} title="Sem resultados" description="Nenhum lançamento encontrado." />
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedTransactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} onEdit={handleEdit} onDelete={deleteTransaction} onUpdateStatus={updatePaymentStatus} formatCurrency={formatCurrency} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-0 mt-8 pb-10">
          <p className="text-[10px] font-black uppercase text-on-surface-variant/50">{total} registros · Página {page} de {totalPages}</p>
          <div className="flex gap-2 items-center">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="h-11 px-4 rounded-2xl font-black text-[10px] uppercase">Anterior</Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setPage(pageNum)}
                    className="min-w-[44px] min-h-[44px] rounded-xl text-xs font-bold"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <span className="flex items-center px-2 text-on-surface-variant/50">...</span>
              )}
            </div>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="h-11 px-4 rounded-2xl font-black text-[10px] uppercase">Próxima</Button>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed z-[50]" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))', right: '1.5rem' }}>
        <button onClick={() => { resetForm(); setOpen(true); }} className="h-16 w-16 rounded-[24px] bg-secondary text-on-secondary shadow-2xl shadow-secondary/40 flex items-center justify-center border-none active:scale-95 transition-all">
          <Plus className="w-8 h-8" strokeWidth={3.5} />
        </button>
      </div>
    </div>
  );
}

export default function Movimentacoes() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary/20" /></div>}>
      <MovimentacoesContent />
    </Suspense>
  );
}
