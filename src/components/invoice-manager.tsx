"use client";

import { useState } from "react";
import { Plus, Check, Loader2, X, Wallet, User, Mail, FileText, Calendar, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { useToast } from "./ui/toast";
import { MoneyInput } from "./ui/money-input";
import { cn } from "@/lib/utils";

interface Installment {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "RECEIVED" | "OVERDUE";
}

interface InvoiceFormData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  description: string;
  totalAmount: number;
  emissionDate: string;
  dueDate: string;
  paymentMethod: string;
  observations: string;
  installments: Installment[];
}

interface InvoiceManagerProps {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function InvoiceManager({ onSuccess, onError }: InvoiceManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numInstallments, setNumInstallments] = useState(1);
  const toast = useToast();

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: "",
    clientName: "",
    clientEmail: "",
    description: "",
    totalAmount: 0,
    emissionDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    paymentMethod: "PIX",
    observations: "",
    installments: [
      {
        installmentNumber: 1,
        amount: 0,
        dueDate: new Date().toISOString().split("T")[0],
        status: "PENDING"
      }
    ]
  });

  const handleInstallmentCountChange = (count: number) => {
    setNumInstallments(count);
    const newInstallments = Array.from({ length: count }, (_, i) => ({
      installmentNumber: i + 1,
      amount: formData.totalAmount / count,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + i))
        .toISOString()
        .split("T")[0],
      status: "PENDING" as const
    }));
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleInstallmentChange = (index: number, field: string, value: any) => {
    const newInstallments = [...formData.installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setFormData({ ...formData, installments: newInstallments });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceNumber || !formData.clientName || formData.totalAmount <= 0) {
      return toast.error("Preencha os campos obrigatórios");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro no servidor");

      toast.success("Nota de Receita registrada!");
      onSuccess?.("Nota criada com sucesso!");
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error("Falha ao criar nota.");
      onError?.("Erro ao criar nota");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      clientName: "",
      clientEmail: "",
      description: "",
      totalAmount: 0,
      emissionDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      paymentMethod: "PIX",
      observations: "",
      installments: [
        {
          installmentNumber: 1,
          amount: 0,
          dueDate: new Date().toISOString().split("T")[0],
          status: "PENDING"
        }
      ]
    });
    setNumInstallments(1);
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full h-14 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.99] transition-all border-none"
        >
          <Plus size={18} className="mr-2" strokeWidth={3} /> Nova Nota de Receita
        </Button>
      )}

      {showForm && (
        <Card className="premium-card border-none shadow-2xl overflow-hidden bg-surface">
          <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-surface-variant/20">
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-secondary text-white">
                 <FileText className="w-5 h-5" />
               </div>
               <h3 className="text-xl font-black text-on-background tracking-tight">Criar Nota de Receita</h3>
             </div>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Fechar formulário" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
               <X className="w-5 h-5" />
             </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Número da Nota*</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-bold text-xs">#</span>
                  <Input required value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="h-12 pl-8 rounded-2xl font-bold bg-surface-variant/20 border-outline/10" placeholder="0001" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Valor Total*</Label>
                <MoneyInput 
                  value={formData.totalAmount.toString()} 
                  onChange={(val) => {
                    const total = parseFloat(val) || 0;
                    setFormData({ ...formData, totalAmount: total });
                  }} 
                  className="h-12 font-black text-2xl rounded-2xl bg-surface-variant/20 border-outline/10" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Nome do Cliente*</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                <Input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="h-12 pl-11 rounded-2xl font-bold bg-surface-variant/20 border-outline/10" placeholder="Nome Completo ou Empresa" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Data Emissão*</Label>
                 <Input type="date" required value={formData.emissionDate} onChange={e => setFormData({...formData, emissionDate: e.target.value})} className="h-12 rounded-2xl font-bold bg-surface-variant/20 border-outline/10" />
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Parcelamento*</Label>
                 <Select value={numInstallments.toString()} onValueChange={(v: string | null) => handleInstallmentCountChange(parseInt(v || "1"))}>
                    <SelectTrigger className="h-12 rounded-2xl font-black bg-surface-variant/20 border-outline/10">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl font-bold">
                       {[1, 2, 3, 4, 6, 12].map(n => <SelectItem key={n} value={n.toString()} className="rounded-xl">{n}x Parcelas</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Detalhamento de Parcelas</h4>
                <div className="h-px bg-outline/5 flex-1 mx-4" />
              </div>
              
              <div className="grid gap-3">
                {formData.installments.map((inst, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-surface-variant/20 border border-outline/5 items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-black text-[10px] shrink-0">
                      {inst.installmentNumber}
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                      <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Vencimento</Label>
                      <Input type="date" value={inst.dueDate} onChange={e => handleInstallmentChange(idx, "dueDate", e.target.value)} className="h-12 bg-surface-container-high border-transparent rounded-xl font-bold text-xs" />
                    </div>
                    <div className="w-full sm:w-32">
                       <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Valor</Label>
                       <MoneyInput value={inst.amount.toString()} onChange={v => handleInstallmentChange(idx, "amount", parseFloat(v) || 0)} className="h-12 bg-surface-container-high border-transparent rounded-xl font-bold text-xs" />
                    </div>
                    <div className="w-full sm:w-32">
                       <Label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Status</Label>
                       <Select value={inst.status} onValueChange={(v: string | null) => handleInstallmentChange(idx, "status", v || "PENDING")}>
                           <SelectTrigger className="h-10 bg-surface-container-high border-transparent rounded-xl font-bold text-[10px] uppercase">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                             <SelectItem value="PENDING" className="text-warning">Pendente</SelectItem>
                             <SelectItem value="RECEIVED" className="text-success">Recebido</SelectItem>
                             <SelectItem value="OVERDUE" className="text-destructive">Atrasado</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Observações Internas</Label>
              <textarea
                value={formData.observations}
                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                className="w-full rounded-2xl bg-surface-variant/20 border border-outline/10 p-4 font-medium text-sm focus:bg-surface focus:border-outline/20 outline-none transition-all"
                rows={3}
                placeholder="Notas sobre o serviço ou cliente..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 sticky bottom-0 bg-surface pb-4 z-10 border-t border-outline/5">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Check size={18} className="mr-2" strokeWidth={3} /> Gerar Nota Fiscal</>}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest text-on-surface-variant/60 hover:bg-surface-variant"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
