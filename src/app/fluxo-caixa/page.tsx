"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3, TrendingUp, TrendingDown, Brain,
  CheckCircle, AlertCircle, Plus, FileText, Loader2,
  User, Calendar, ReceiptText, PlusCircle, Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/ui/money-input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeeklyForecast {
  week: number;
  weekStart: string;
  weekEnd: string;
  totalIncome: number;
  projectedIncome: number;
  totalExpenses: number;
  balance: number;
  canSpend: boolean;
}

interface Metrics {
  totalIncome: number;
  totalExpenses: number;
  totalProjectedIncome: number;
  monthBalance: number;
  faturado: number;
  aReceber: number;
}

interface CashflowResponse {
  data: WeeklyForecast[];
  metrics: Metrics;
  referenceDate: string;
}

interface Installment {
  id?: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "RECEIVED" | "OVERDUE";
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string | null;
  description?: string | null;
  totalAmount: number;
  emissionDate: string;
  dueDate?: string | null;
  observations?: string | null;
  paymentMethod?: string | null;
  status: string;
  installments: Installment[];
  createdAt: string;
}

interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  totalAmount: number;
  emissionDate: string;
  paymentMethod: string;
  observations: string;
  installments: Installment[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const fmtFullMonth = (d: Date) =>
  d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CashflowPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const toast = useToast();

  // ---- Auth guard ----
  useEffect(() => {
    if (sessionStatus === "unauthenticated") router.push("/login");
  }, [sessionStatus, router]);

  // ---- Cashflow state ----
  const [cashflow, setCashflow] = useState<CashflowResponse | null>(null);
  const [cfLoading, setCfLoading] = useState(true);
  const [cfError, setCfError] = useState<string | null>(null);

  const fetchCashflow = useCallback(async () => {
    try {
      setCfLoading(true);
      setCfError(null);
      const res = await fetch("/api/cashflow/weekly");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setCashflow(await res.json());
    } catch (err) {
      setCfError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setCfLoading(false);
    }
  }, []);

  // ---- Invoices state ----
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [numInstallments, setNumInstallments] = useState(1);

  const fetchInvoices = useCallback(async () => {
    try {
      setInvLoading(true);
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const json = await res.json();
        setInvoices(json.data ?? []);
      }
    } catch {
      /* silent */
    } finally {
      setInvLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchCashflow();
      fetchInvoices();
    }
  }, [sessionStatus, fetchCashflow, fetchInvoices]);

  // ---- Invoice form data ----
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    description: "",
    totalAmount: 0,
    emissionDate: new Date().toISOString().split("T")[0],
    paymentMethod: "PIX",
    observations: "",
    installments: [
      { installmentNumber: 1, amount: 0, dueDate: new Date().toISOString().split("T")[0], status: "PENDING" },
    ],
  });

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      description: "",
      totalAmount: 0,
      emissionDate: new Date().toISOString().split("T")[0],
      paymentMethod: "PIX",
      observations: "",
      installments: [
        { installmentNumber: 1, amount: 0, dueDate: new Date().toISOString().split("T")[0], status: "PENDING" },
      ],
    });
    setNumInstallments(1);
  };

  const handleInstallmentCountChange = (count: number) => {
    setNumInstallments(count);
    setFormData((prev) => ({
      ...prev,
      installments: Array.from({ length: count }, (_, i) => ({
        installmentNumber: i + 1,
        amount: prev.totalAmount / count,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)).toISOString().split("T")[0],
        status: "PENDING" as const,
      })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.clientName || formData.totalAmount <= 0) {
      return toast.error("Preencha os campos obrigatórios");
    }
    setFormLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Erro no servidor");
      toast.success("Nota de Receita registrada!");
      setShowForm(false);
      resetForm();
      fetchInvoices();
      fetchCashflow();
    } catch {
      toast.error("Falha ao criar nota.");
    } finally {
      setFormLoading(false);
    }
  };

  // ---- Derived data ----
  const { data: weeks = [], metrics } = cashflow ?? {};
  const now = new Date();

  // ---- Status helper ----
  const getWeekStatus = (week: WeeklyForecast): { label: string; variant: "default" | "secondary" | "destructive" } => {
    if (week.balance < 0) return { label: "Atenção", variant: "destructive" };
    if (!week.canSpend) return { label: "OK", variant: "secondary" };
    return { label: "Positivo", variant: "default" };
  };

  // ---- Auth loading ----
  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") return null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-24 md:pb-8 px-4 md:px-6">
      {/* ================================================================ */}
      {/* HEADER                                                          */}
      {/* ================================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Fluxo de Caixa
            </h1>
            <p className="text-muted-foreground font-medium text-sm mt-0.5">
              Previsão e controle de liquidez
            </p>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* LOADING STATE                                                   */}
      {/* ================================================================ */}
      {cfLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-8 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-24 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ERROR STATE                                                     */}
      {/* ================================================================ */}
      {!cfLoading && cfError && (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-destructive font-semibold">Erro ao carregar dados</p>
            <p className="text-muted-foreground text-sm">{cfError}</p>
            <Button onClick={fetchCashflow} variant="outline" className="rounded-xl mt-2">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================================================================ */}
      {/* CONTENT (loaded)                                                */}
      {/* ================================================================ */}
      {!cfLoading && !cfError && cashflow && (
        <div className="space-y-8">
          {/* ---------------------------------------------------------- */}
          {/* TOP SUMMARY — 3 cards                                      */}
          {/* ---------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Faturado */}
            <Card className="rounded-2xl border-border bg-emerald-500/5">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Faturado
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(metrics?.faturado ?? 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Total do mês</p>
              </CardContent>
            </Card>

            {/* A Receber */}
            <Card className="rounded-2xl border-border bg-amber-500/5">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Wallet className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                    A Receber
                  </p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(metrics?.aReceber ?? 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Parcelas abertas</p>
              </CardContent>
            </Card>

            {/* Saldo do Mês */}
            <Card
className={cn(
                  "rounded-2xl",
                  (metrics?.monthBalance ?? 0) >= 0
                    ? "border-border bg-card"
                    : "border-destructive/40 bg-destructive/5"
                )}
            >
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    metrics.monthBalance >= 0 ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    {metrics.monthBalance >= 0 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    )}
                  </div>
                  <p className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    metrics.monthBalance >= 0 ? "text-primary" : "text-destructive"
                  )}>
                    Saldo do Mês
                  </p>
                </div>
                <p
                  className={cn(
                    "text-xl sm:text-2xl font-bold",
                    metrics.monthBalance >= 0 ? "text-foreground" : "text-destructive"
                  )}
                >
                  {formatCurrency(metrics.monthBalance)}
                </p>
                <p className="text-[10px] text-muted-foreground">Receitas - Despesas</p>
              </CardContent>
            </Card>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* WEEKLY BREAKDOWN — 4 cards                                 */}
          {/* ---------------------------------------------------------- */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Previsão Semanal</h2>
              <Badge variant="outline" className="text-xs">
                {fmtFullMonth(now)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {weeks.map((week) => {
                const status = getWeekStatus(week);
                return (
                  <Card
                    key={week.week}
                    className={cn(
                      "rounded-2xl shadow-sm",
                      week.balance >= 0 ? "border-border" : "border-destructive/40 bg-destructive/5"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header row */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Semana {week.week}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {fmtDate(week.weekStart)} – {fmtDate(week.weekEnd)}
                          </p>
                        </div>
                        <Badge variant={status.variant} className="text-[10px] px-2 py-0.5">
                          {status.label}
                        </Badge>
                      </div>

                      <Separator />

                      {/* Entradas */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          Entradas
                        </span>
                        <span className="text-sm font-semibold text-emerald-600">
                          +{formatCurrency(week.totalIncome)}
                        </span>
                      </div>

                      {/* Projected income detail */}
                      {week.totalIncome > 0 && (
                        <div className="text-[10px] text-muted-foreground pl-5">
                          {week.projectedIncome > 0 && (
                            <>Previsto: {formatCurrency(week.projectedIncome)}</>
                          )}
                        </div>
                      )}

                      <Separator />

                      {/* Saídas */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                          Saídas
                        </span>
                        <span className="text-sm font-semibold text-destructive">
                          -{formatCurrency(week.totalExpenses)}
                        </span>
                      </div>

                      <Separator />

                      {/* Saldo */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Saldo</span>
                        <span
                          className={cn(
                            "text-sm font-bold",
                            week.balance >= 0 ? "text-foreground" : "text-destructive"
                          )}
                        >
                          {formatCurrency(week.balance)}
                        </span>
                      </div>

                      {/* Projection chip */}
                      {week.projectedIncome > 0 && (
                        <div className="pt-1">
                          <Badge variant="secondary" className="text-[10px] w-full justify-center">
                            {formatCurrency(week.projectedIncome)} a receber
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* MONTHLY SUMMARY (Resumo)                                   */}
          {/* ---------------------------------------------------------- */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                Resumo — {fmtFullMonth(now)}
              </CardTitle>
              <CardDescription>Consolidado de receitas e despesas do mês</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Receitas
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(metrics.totalIncome)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Despesas
                  </p>
                  <p className="text-xl font-bold text-destructive">
                    {formatCurrency(metrics.totalExpenses)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Saldo do Mês
                  </p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      metrics.monthBalance >= 0 ? "text-foreground" : "text-destructive"
                    )}
                  >
                    {formatCurrency(metrics.monthBalance)}
                  </p>
                </div>
              </div>

              {/* Progress bar: faturado vs total projected */}
              {metrics.totalProjectedIncome > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progresso de recebimento</span>
                    <span>
                      {formatCurrency(metrics.totalIncome)} / {formatCurrency(metrics.totalProjectedIncome + metrics.totalIncome)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      Math.round((metrics.totalIncome / (metrics.totalProjectedIncome + metrics.totalIncome || 1)) * 100),
                      100
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------- */}
          {/* RECEITAS ESPERADAS                                         */}
          {/* ---------------------------------------------------------- */}
          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10">
                  <ReceiptText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Receitas Esperadas
                  </CardTitle>
                  <CardDescription>Notas e parcelas futuras</CardDescription>
                </div>
              </div>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="rounded-xl text-xs font-semibold"
                  size="sm"
                >
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Nova Nota
                </Button>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* -- Empty state -- */}
              {!invLoading && invoices.length === 0 && !showForm && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Nenhuma nota de receita
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Adicione notas de receita futuras para prever seu fluxo de caixa com precisão.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Criar primeira nota
                  </Button>
                </div>
              )}

              {/* -- Invoice list -- */}
              {!invLoading && invoices.length > 0 && !showForm && (
                <ScrollArea className={invoices.length > 4 ? "h-[320px]" : ""}>
                  <div className="space-y-2 pr-2">
                    {invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:border-border transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg bg-background border border-border">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              #{inv.invoiceNumber} — {inv.clientName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {inv.installments.length}x de{" "}
                              {formatCurrency(inv.totalAmount / (inv.installments.length || 1))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant={
                              inv.status === "PAID" || inv.status === "RECEIVED"
                                ? "default"
                                : inv.status === "OVERDUE"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {inv.status === "PAID" || inv.status === "RECEIVED"
                              ? "Recebido"
                              : inv.status === "OVERDUE"
                                ? "Atrasado"
                                : "Pendente"}
                          </Badge>
                          <span className="text-sm font-bold text-foreground">
                            {formatCurrency(inv.totalAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* -- Create form -- */}
              {showForm && (
                <div className="space-y-6">
                  <Separator />

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Número da Nota *</Label>
                        <Input
                          required
                          value={formData.invoiceNumber}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, invoiceNumber: e.target.value }))
                          }
                          className="h-11 rounded-xl"
                          placeholder="0001"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Valor Total *</Label>
                        <MoneyInput
                          value={formData.totalAmount.toString()}
                          onChange={(val) => {
                            const total = parseFloat(val) || 0;
                            setFormData((p) => ({ ...p, totalAmount: total }));
                          }}
                          className="h-11 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Nome do Cliente *</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          required
                          value={formData.clientName}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, clientName: e.target.value }))
                          }
                          className="h-11 pl-10 rounded-xl"
                          placeholder="Nome completo ou empresa"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Data Emissão *</Label>
                        <Input
                          type="date"
                          required
                          value={formData.emissionDate}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, emissionDate: e.target.value }))
                          }
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Parcelamento *</Label>
                        <Select
                          value={numInstallments.toString()}
                          onValueChange={(v) => handleInstallmentCountChange(parseInt(v || "1"))}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {[1, 2, 3, 4, 6, 12].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}x Parcelas
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Installment details */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Detalhamento de Parcelas
                      </p>
                      <div className="grid gap-3">
                        {formData.installments.map((inst, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 items-center"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {inst.installmentNumber}
                            </div>
                            <div className="flex-1 w-full sm:w-auto">
                              <Label className="text-[10px] text-muted-foreground ml-1">Vencimento</Label>
                              <Input
                                type="date"
                                value={inst.dueDate}
                                onChange={(e) => {
                                  const next = [...formData.installments];
                                  next[idx] = { ...next[idx], dueDate: e.target.value };
                                  setFormData((p) => ({ ...p, installments: next }));
                                }}
                                className="h-10 rounded-xl text-xs"
                              />
                            </div>
                            <div className="w-full sm:w-32">
                              <Label className="text-[10px] text-muted-foreground ml-1">Valor</Label>
                              <MoneyInput
                                value={inst.amount.toString()}
                                onChange={(v) => {
                                  const next = [...formData.installments];
                                  next[idx] = { ...next[idx], amount: parseFloat(v) || 0 };
                                  setFormData((p) => ({ ...p, installments: next }));
                                }}
                                className="h-10 rounded-xl text-xs"
                              />
                            </div>
                            <div className="w-full sm:w-32">
                              <Label className="text-[10px] text-muted-foreground ml-1">Status</Label>
                              <Select
                                value={inst.status}
                                onValueChange={(v) => {
                                  const next = [...formData.installments];
                                  next[idx] = {
                                    ...next[idx],
                                    status: (v as Installment["status"]) || "PENDING",
                                  };
                                  setFormData((p) => ({ ...p, installments: next }));
                                }}
                              >
                                <SelectTrigger className="h-10 rounded-xl text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="PENDING">Pendente</SelectItem>
                                  <SelectItem value="RECEIVED">Recebido</SelectItem>
                                  <SelectItem value="OVERDUE">Atrasado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={formLoading}
                        className="flex-1 h-11 rounded-xl font-semibold text-sm"
                      >
                        {formLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                        )}
                        {formLoading ? "Salvando..." : "Registrar Nota"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setShowForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ---------------------------------------------------------- */}
          {/* DICA DA IA                                                  */}
          {/* ---------------------------------------------------------- */}
          <Card className="rounded-2xl border-border bg-muted/30 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-background border border-border shrink-0">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Dica da IA
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Adicione suas notas de receita futuras para que o PicoClaw possa prever com
                    precisão seu saldo nos próximos 30 dias. Quanto mais dados você fornecer,
                    mais inteligentes serão as recomendações de gastos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
