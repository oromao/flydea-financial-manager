"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { safeFormatDate, safeDateSortKey, toLocalDateInput } from "@/lib/date-utils";
import {
  Plus, Trash2, Search, ArrowUp, ArrowDown, Filter, LayoutList,
  FileSpreadsheet, Edit2, X, MoreVertical, Wallet, Loader2, FileUp,
  CheckCircle2, ArrowUpRight, ArrowDownRight, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PaymentImporter } from "@/components/payment-importer";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { EmptyState } from "@/components/ui/empty-state";
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

function MovimentaçõesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const [sortOrder, setSortDirection] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc",
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filterCategory && filterCategory !== "Todos") params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    if (filterPaymentStatus && filterPaymentStatus !== "ALL")
      params.set("paymentStatus", filterPaymentStatus);
    if (startDateFilter) params.set("startDate", startDateFilter);
    if (endDateFilter) params.set("endDate", endDateFilter);
    if (sortField && sortField !== "date") params.set("sort", sortField);
    if (sortOrder && sortOrder !== "desc") params.set("order", sortOrder);
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

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
        valA = safeDateSortKey(a.date);
        valB = safeDateSortKey(b.date);
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

  const fetchTransactions = useCallback(
    async (targetPage = page) => {
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
    },
    [searchTerm, filterCategory, filterType, filterPaymentStatus, page, startDateFilter, endDateFilter],
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions?all=true");
      const data = await res.json();
      const allTx = Array.isArray(data.data) ? data.data : [];
      const balance = allTx.reduce(
        (acc: number, t: Transaction) =>
          t.type === "INCOME" ? acc + t.amount : acc - t.amount,
        0,
      );
      const income = allTx
        .filter((t: Transaction) => t.type === "INCOME")
        .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      const expenses = allTx
        .filter((t: Transaction) => t.type === "EXPENSE")
        .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
      const pending = allTx
        .filter(
          (t: Transaction) =>
            t.type === "EXPENSE" && t.paymentStatus === "PENDING",
        )
        .reduce((acc: number, t: Transaction) => acc + t.amount, 0);
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
        // Pequeno delay para garantir que o toast apareça antes do modal fechar
        setTimeout(() => {
          setOpen(false);
          resetForm();
          fetchTransactions();
          fetchStats();
        }, 100);
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
    setCategoryId(
      categories.find((c: Category) => c.name === "Outros")?.id ||
        (categories.length > 0 ? categories[0].id : ""),
    );
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

  const hasActiveFilters =
    searchTerm ||
    filterCategory !== "Todos" ||
    filterType ||
    filterPaymentStatus !== "ALL" ||
    startDateFilter ||
    endDateFilter;

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-24 md:space-y-6 md:pb-8 px-4 md:px-0">
      {/* ─── TOP BAR ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <LayoutList className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Movimentações
            </h1>
            <p className="text-xs text-muted-foreground">
              Gerencie seu fluxo financeiro real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Exportar
          </Button>
          <Dialog
            open={open}
            onOpenChange={async (val) => {
              if (!val && !saving && (description || amount)) {
                const confirmed = await confirm({
                  title: "Descartar alterações?",
                  message: "Você tem campos preenchidos. Deseja realmente fechar?",
                  confirmLabel: "Sim, fechar",
                  variant: "danger",
                });
                if (!confirmed) return;
              }
              setOpen(val);
              if (!val) resetForm();
            }}
          >
            <DialogTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-xl shadow-lg shadow-primary/20"
                >
                  <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.5} /> NOVO
                </Button>
              }
            />

              <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border sm:rounded-2xl bg-card sm:shadow-2xl max-h-[90vh]">
                {/* Close button - positioned above sticky header */}
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

                <div className="border-b border-border p-6 sm:p-8 sticky top-0 z-20 bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                      {editingId ? "Editar Lançamento" : "Novo Lançamento"}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Registre suas entradas e saídas com precisão
                    </p>
                  </DialogHeader>
                </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Dados Básicos
                  </h3>

                  <div className="flex rounded-xl bg-muted p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                        type === "INCOME"
                          ? "bg-background text-success shadow-sm"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setType("INCOME")}
                    >
                      <ArrowUp className="mr-1.5 h-4 w-4" /> Receita
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                        type === "EXPENSE"
                          ? "bg-background text-destructive shadow-sm"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setType("EXPENSE")}
                    >
                      <ArrowDown className="mr-1.5 h-4 w-4" /> Despesa
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Descrição
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors font-semibold"
                      placeholder="O que você pagou ou recebeu?"
                      aria-describedby="description-error"
                    />
                    {errors.description && (
                      <p id="description-error" className="text-xs text-destructive mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Valor (BRL)
                    </Label>
                    <MoneyInput
                      id="amount"
                      name="amount"
                      value={amount}
                      onChange={setAmount}
                      className="h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors text-2xl font-bold"
                      required
                      aria-describedby="amount-error"
                    />
                    {errors.amount && (
                      <p id="amount-error" className="text-xs text-destructive mt-1">
                        {errors.amount}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Classificação
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="categoryId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Categoria <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={categoryId}
                      onValueChange={(v: string | null) => setCategoryId(v || "")}
                    >
                      <SelectTrigger
                        id="categoryId"
                        className="h-12 rounded-xl bg-muted/50 border-border font-semibold"
                        aria-describedby="categoryId-error"
                      >
                        <SelectValue placeholder="Selecione...">
                          {categoryId ? categories.find(c => c.id === categoryId)?.name || "Selecione..." : "Selecione..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="rounded-lg font-semibold">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p id="categoryId-error" className="text-xs text-destructive mt-1">
                        {errors.categoryId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="accountId" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Conta <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={accountId}
                      onValueChange={(v: string | null) => setAccountId(v || "")}
                    >
                      <SelectTrigger
                        id="accountId"
                        className="h-12 rounded-xl bg-muted/50 border-border font-semibold"
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id} className="rounded-lg font-semibold">
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.accountId && (
                      <p id="accountId-error" className="text-xs text-destructive mt-1">
                        {errors.accountId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="frequency" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Recorrência
                    </Label>
                    <Select
                      value={frequency}
                      onValueChange={(v: string | null) => setFrequency(v || "")}
                    >
                      <SelectTrigger
                        id="frequency"
                        className="h-12 rounded-xl bg-muted/50 border-border font-semibold"
                      >
                        <SelectValue placeholder="Nenhuma" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                        <SelectItem value="NONE" className="rounded-lg font-semibold">
                          Nenhuma
                        </SelectItem>
                        <SelectItem value="MONTHLY" className="rounded-lg font-semibold">
                          Mensal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                    Datas e Status
                  </h3>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Data
                    </Label>
                    <Input
                      id="date"
                      name="date"
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors font-semibold"
                      aria-describedby="date-error"
                    />
                    {errors.date && (
                      <p id="date-error" className="text-xs text-destructive mt-1">
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dueDate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Vencimento
                    </Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="paymentStatus" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Status de Pagamento
                    </Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={(v: string | null) => setPaymentStatus(v || "")}
                    >
                      <SelectTrigger
                        id="paymentStatus"
                        className="h-12 rounded-xl bg-muted/50 border-border font-semibold"
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                        <SelectItem value="PAID" className="rounded-lg font-semibold">
                          Confirmado / Pago
                        </SelectItem>
                        <SelectItem value="PENDING" className="rounded-lg font-semibold">
                          Pendente / Agendado
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentStatus === "PENDING" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="amountPaid" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Valor já Pago (parcial)
                    </Label>
                    <MoneyInput
                      id="amountPaid"
                      name="amountPaid"
                      value={amountPaid}
                      onChange={setAmountPaid}
                      className="h-12 rounded-xl bg-muted/50 border-border font-semibold"
                      placeholder="0,00"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Comprovante
                  </Label>
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
                            const res = await fetch(
                              `/api/upload?filename=${encodeURIComponent(f.name)}`,
                              { method: "POST", body: formData },
                            );
                            const newBlob = await res.json();
                            setBlobUrl(newBlob.url);
                            toast.success("Anexado!");
                          } catch {
                            toast.error("Erro no upload");
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                      <div
                        className={cn(
                          "h-12 rounded-xl border-2 border-dashed flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider",
                          blobUrl
                            ? "border-success bg-success/10 text-success"
                            : "border-border bg-muted text-muted-foreground/60",
                        )}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : blobUrl ? (
                          "PRONTO"
                        ) : (
                          "ANEXAR"
                        )}
                      </div>
                    </div>
                    <Input
                      placeholder="Link externo..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="flex-[1.5] h-12 rounded-xl bg-muted/50 border-border focus:bg-background transition-colors font-medium"
                      aria-label="Link externo do comprovante"
                    />
                  </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-card pb-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    variant="default"
                    className="w-full h-14 text-base font-bold rounded-xl shadow-xl shadow-primary/20"
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : editingId ? (
                      "SALVAR ALTERAÇÕES"
                    ) : (
                      "CONFIRMAR LANÇAMENTO"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Saldo Geral
              </span>
            </div>
            <p
              className={cn(
                "text-xl font-bold tracking-tight truncate",
                stats.balance >= 0 ? "text-foreground" : "text-destructive",
              )}
            >
              {formatCurrency(stats.balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-success/20 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-success/70">
                Receitas
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight text-success truncate">
              {formatCurrency(stats.income)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/70">
                Despesas
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight text-destructive truncate">
              {formatCurrency(stats.expenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-warning" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-warning/70">
                Pendências
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight text-warning truncate">
              {formatCurrency(stats.pending)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── FILTER BAR ─── */}
      <Card className="rounded-2xl border-border">
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Row 1: Search + Category + Import */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="pl-9 h-9 sm:h-10 rounded-xl bg-muted/50 border-border text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filterCategory}
                onValueChange={(v) => setFilterCategory(v || "Todos")}
              >
                <SelectTrigger className="w-28 h-9 rounded-xl bg-muted/50 border-border text-xs font-medium">
                  <span className="truncate">
                    {filterCategory === "Todos" ? "Categoria" : filterCategory}
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="Todos" className="rounded-lg font-medium">Todas</SelectItem>
                  {categories.slice(0, 10).map((c) => (
                    <SelectItem key={c.id} value={c.name} className="rounded-lg font-medium">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PaymentImporter onImportSuccess={fetchTransactions} />
            </div>
          </div>

          {/* Row 2: Date + Type + Status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="h-8 w-24 rounded-lg bg-muted/50 border-border text-xs"
              />
              <span className="text-xs text-muted-foreground">-</span>
              <Input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="h-8 w-24 rounded-lg bg-muted/50 border-border text-xs"
              />
            </div>

            <Tabs
              value={filterType || "ALL"}
              onValueChange={(val) => setFilterType(val === "ALL" ? null : val)}
              className="flex-shrink-0"
            >
              <TabsList className="h-8 rounded-lg bg-muted border-border p-0.5">
                <TabsTrigger value="ALL" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  Todos
                </TabsTrigger>
                <TabsTrigger value="INCOME" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  +
                </TabsTrigger>
                <TabsTrigger value="EXPENSE" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  -
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs
              value={filterPaymentStatus}
              onValueChange={setFilterPaymentStatus}
              className="flex-shrink-0"
            >
              <TabsList className="h-8 rounded-lg bg-muted border-border p-0.5">
                <TabsTrigger value="ALL" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  Status
                </TabsTrigger>
                <TabsTrigger value="PAID" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  Pago
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="px-2 h-7 text-[10px] font-medium rounded-md">
                  Pend
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 rounded-lg text-xs font-medium border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── TRANSACTION LIST — DESKTOP ─── */}
      <div className="hidden md:block">
        <Card className="rounded-2xl border-border overflow-hidden">
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead
                    className="w-[100px] px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort("date")}
                  >
                    Data
                    {sortField === "date" && (
                      <span className="ml-1 text-primary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort("description")}
                  >
                    Descrição
                    {sortField === "description" && (
                      <span className="ml-1 text-primary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">
                    Categoria
                  </TableHead>
                  <TableHead
                    className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right cursor-pointer select-none"
                    onClick={() => handleSort("amount")}
                  >
                    Valor
                    {sortField === "amount" && (
                      <span className="ml-1 text-primary">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="w-[80px] py-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32">
                      <EmptyState
                        icon={LayoutList}
                        title="Sem movimentações"
                        description="Ajuste os filtros ou crie um novo lançamento."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((t) => (
                    <TableRow
                      key={t.id}
                      className="group border-border hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="px-5 py-4 text-sm font-semibold text-foreground">
                        {safeFormatDate(t.date, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[280px]">
                          {t.description}
                        </p>
                        <div className="flex gap-1.5 mt-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase px-2 py-0",
                              t.paymentStatus === "PENDING"
                                ? "border-warning/40 text-warning bg-warning/5"
                                : "border-success/40 text-success bg-success/5",
                            )}
                          >
                            {t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold border-border text-muted-foreground"
                        >
                          {t.category?.name || "Outros"}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "px-5 py-4 text-right text-sm font-bold tabular-nums",
                          t.type === "INCOME" ? "text-success" : "text-foreground",
                        )}
                      >
                        {t.type === "EXPENSE" ? "- " : "+ "}
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell className="pr-5 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(t)}
                            aria-label="Editar transação"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransaction(t.id)}
                            aria-label="Excluir transação"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>

      {/* ─── TRANSACTION LIST — MOBILE ─── */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="rounded-2xl border-border py-12">
            <EmptyState
              icon={LayoutList}
              title="Sem resultados"
              description="Nenhum lançamento encontrado."
            />
          </Card>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedTransactions.map((t) => {
              const isIncome = t.type === "INCOME";
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0",
                          isIncome
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <span>{safeFormatDate(t.date, "dd MMM")}</span>
                          {t.category?.name && (
                            <>
                              <span>·</span>
                              <span className="truncate max-w-[100px]">
                                {t.category.name}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="mt-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase px-1.5 py-0",
                              t.paymentStatus === "PENDING"
                                ? "border-warning/40 text-warning bg-warning/5"
                                : "border-success/40 text-success bg-success/5",
                            )}
                          >
                            {t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            isIncome ? "text-success" : "text-foreground",
                          )}
                        >
                          {isIncome ? "+ " : "- "}
                          {formatCurrency(t.amount)}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg flex-shrink-0"
                              aria-label="Ações"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-xl"
                        >
                          {t.type === "EXPENSE" &&
                            t.paymentStatus === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  updatePaymentStatus(t.id, "PAID");
                                }}
                                className="rounded-lg text-sm font-semibold"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                                Marcar Pago
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuItem
                            onClick={() => handleEdit(t)}
                            className="rounded-lg text-sm font-semibold"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteTransaction(t.id)}
                            variant="destructive"
                            className="rounded-lg text-sm font-semibold"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ─── PAGINATION ─── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-0 mt-4 pb-10">
          <p className="text-xs font-medium text-muted-foreground">
            {total} registros · Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-xl text-xs font-semibold"
            >
              Anterior
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="min-w-[36px] h-9 rounded-xl text-xs font-semibold"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <span className="flex items-center px-2 text-muted-foreground text-xs">
                  ...
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-xl text-xs font-semibold"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* ─── MOBILE FAB ─── */}
      <div
        className="md:hidden fixed z-50"
        style={{
          bottom: "calc(6rem + env(safe-area-inset-bottom))",
          right: "1.5rem",
        }}
      >
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex items-center justify-center active:scale-95 transition-all"
        >
          <Plus className="h-7 w-7" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export default function Movimentações() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      }
    >
      <MovimentaçõesContent />
    </Suspense>
  );
}
