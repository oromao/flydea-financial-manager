"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, X, Loader2, Eye, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface DocumentImporterProps {
  onImportSuccess: () => void;
}

interface ExtractedData {
  documentType: string;
  documentNumber: string | null;
  emitterName: string | null;
  emitterDocument: string | null;
  emissionDate: string | null;
  dueDate: string | null;
  paymentDate: string | null;
  totalAmount: number | null;
  netAmount: number | null;
  description: string | null;
  lineItems: Array<{ description: string; quantity: number | null; totalPrice: number | null }>;
}

interface Classification {
  transactionType: string;
  categoryName: string;
  categoryId: string | null;
  paymentStatus: string;
  confidence: number;
  reasoning: string[];
}

export function DocumentImporter({ onImportSuccess }: DocumentImporterProps) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{
    id: string;
    fileName: string;
    extractedData: ExtractedData;
    classification: Classification;
    duplicateCheck: { isDuplicate: boolean; reason: string };
    needsReview: boolean;
  } | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<{
    type: string;
    categoryId: string;
    amount: string;
    date: string;
    dueDate: string;
    paymentStatus: string;
    description: string;
  } | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("DocumentImporter: failed to fetch categories", e);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 10MB)");
        return;
      }
      setFile(f);
      await parseDocument(f);
    }
  };

  const parseDocument = async (f: File) => {
    setParsing(true);
    setPreview(null);
    setEditMode(false);

    try {
      const formData = new FormData();
      formData.append("file", f);

      const res = await fetch("/api/document-import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao processar documento");
        setParsing(false);
        return;
      }

      setPreview({
        id: data.id,
        fileName: data.fileName,
        extractedData: data.extractedData,
        classification: data.classification,
        duplicateCheck: data.duplicateCheck,
        needsReview: data.needsReview,
      });

      await fetchCategories();
    } catch (e) {
      toast.error("Erro ao processar documento");
    } finally {
      setParsing(false);
    }
  };

  const startEdit = () => {
    if (!preview) return;
    setEditedData({
      type: preview.classification.transactionType,
      categoryId: preview.classification.categoryId || "",
      amount: preview.extractedData.totalAmount?.toString() || "",
      date: preview.extractedData.emissionDate || new Date().toISOString().split("T")[0],
      dueDate: preview.extractedData.dueDate || "",
      paymentStatus: preview.classification.paymentStatus,
      description: preview.extractedData.description || preview.fileName,
    });
    setEditMode(true);
  };

  const confirmImport = async () => {
    if (!preview) return;
    setSaving(true);

    try {
      const payload = {
        documentId: preview.id,
        overrideType: editedData?.type || preview.classification.transactionType,
        overrideCategoryId: editedData?.categoryId || preview.classification.categoryId,
        overrideAmount: editedData?.amount ? parseFloat(editedData.amount) : preview.extractedData.totalAmount,
        overrideDate: editedData?.date || preview.extractedData.emissionDate,
        overrideDueDate: editedData?.dueDate || preview.extractedData.dueDate,
        overridePaymentStatus: editedData?.paymentStatus || preview.classification.paymentStatus,
        overrideDescription: editedData?.description || preview.extractedData.description,
      };

      const res = await fetch("/api/document-import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao importar");
        setSaving(false);
        return;
      }

      toast.success("Transação importada com sucesso!");
      setOpen(false);
      setFile(null);
      setPreview(null);
      onImportSuccess();
    } catch (e) {
      toast.error("Erro ao importar transação");
    } finally {
      setSaving(false);
    }
  };

  const cancelImport = async () => {
    if (!preview) return;
    try {
      await fetch(`/api/document-import/confirm?id=${preview.id}`, { method: "DELETE" });
    } catch (e) {
    }
    setPreview(null);
    setFile(null);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-success";
    if (confidence >= 0.5) return "text-warning";
    return "text-destructive";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setFile(null);
          setPreview(null);
          setEditMode(false);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button className="h-10 px-4 rounded-lg bg-accent/5 hover:bg-accent/10 text-on-surface text-xs font-semibold uppercase border border-border/50 transition-colors whitespace-nowrap flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">IMPORTAR DOCUMENTO</span>
            <span className="sm:hidden">IMPORTAR</span>
          </Button>
        }
      />
      <DialogContent className="w-[95vw] md:max-w-2xl bg-surface border-none rounded-[40px] p-0 shadow-xl overflow-hidden border border-border max-h-[90vh] overflow-y-auto">
          <div className="bg-accent/5 p-8 md:p-12 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-on-background tracking-tighter uppercase italic">
              Importar Documento
            </DialogTitle>
            <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Nota fiscal, recibo ou comprovante
            </p>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {!file && !preview && (
            <div className="border-4 border-dashed border-border rounded-[32px] p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors duration-500 cursor-pointer relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <p className="text-on-background text-lg font-black tracking-tight">
                Arraste seu PDF, imagem ou arquivo
              </p>
              <p className="text-on-surface-variant/40 text-[10px] mt-2 uppercase tracking-[0.3em] font-black italic">
                PDF, PNG, JPG, WEBP · Máximo 10MB
              </p>
            </div>
          )}

          {parsing && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-on-background font-bold uppercase tracking-widest">Processando documento...</p>
              <p className="text-on-surface-variant/60 text-xs mt-2">Isso pode levar alguns segundos</p>
            </div>
          )}

          {preview && !editMode && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-accent/5 p-6 rounded-3xl border border-border">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-background font-black text-sm truncate max-w-[200px]">
                      {preview.fileName}
                    </span>
                    <span className="text-on-surface-variant/60 text-[10px] uppercase">
                      {preview.extractedData.documentType}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setPreview(null); setFile(null); }} aria-label="Cancelar importação" className="h-12 w-12 rounded-full text-on-surface-variant/40 hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {preview.duplicateCheck.isDuplicate && (
                <div className="flex items-center gap-3 p-4 bg-warning/10 text-warning rounded-2xl border border-warning/20">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Duplicata detectada</p>
                    <p className="text-[10px] opacity-70">{preview.duplicateCheck.reason}</p>
                  </div>
                </div>
              )}

              <div className="bg-accent/5 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-on-surface-variant/60">DADOS EXTRAÍDOS</span>
                  <span className={cn("text-xs font-bold", getConfidenceColor(preview.classification.confidence))}>
                    {Math.round(preview.classification.confidence * 100)}% confiança
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Valor</p>
                    <p className="font-bold text-on-background">{formatCurrency(preview.extractedData.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Data</p>
                    <p className="font-bold text-on-background">{preview.extractedData.emissionDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Emitente</p>
                    <p className="font-bold text-on-background truncate">{preview.extractedData.emitterName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Vencimento</p>
                    <p className="font-bold text-on-background">{preview.extractedData.dueDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Tipo</p>
                    <p className="font-bold text-on-background">{preview.classification.transactionType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Categoria</p>
                    <p className="font-bold text-on-background">{preview.classification.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Status</p>
                    <p className="font-bold text-on-background">{preview.classification.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60">Documento</p>
                    <p className="font-bold text-on-background">{preview.extractedData.documentNumber || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase text-on-surface-variant/60">Descrição</p>
                  <p className="font-medium text-on-background">{preview.extractedData.description || preview.fileName}</p>
                </div>

                {preview.classification.reasoning.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase text-on-surface-variant/60 mb-2">Classificação</p>
                    <div className="flex flex-wrap gap-2">
                      {preview.classification.reasoning.map((r, i) => (
                        <span key={i} className="px-2 py-1 bg-surface rounded-lg text-[10px] text-on-surface-variant">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={startEdit} variant="outline" className="flex-1 h-12">
                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                </Button>
                <Button onClick={confirmImport} disabled={saving} className="flex-1 h-12 apple-button-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {preview && editMode && editedData && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-on-background">Editando dados</span>
                <Button variant="ghost" size="icon" onClick={() => setEditMode(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2 p-1 bg-surface-variant rounded-full border border-outline/20">
                <Button
                  type="button"
                  variant="ghost"
                   className={cn("flex-1 h-9 rounded-full text-xs font-bold", editedData.type === "INCOME" ? "bg-surface text-success" : "text-on-surface-variant")}
                  onClick={() => setEditedData({ ...editedData, type: "INCOME" })}
                >
                  <ArrowUp className="w-3.5 h-3.5 mr-2" /> Receita
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                   className={cn("flex-1 h-9 rounded-full text-xs font-bold", editedData.type === "EXPENSE" ? "bg-surface text-destructive" : "text-on-surface-variant")}
                  onClick={() => setEditedData({ ...editedData, type: "EXPENSE" })}
                >
                  <ArrowDown className="w-3.5 h-3.5 mr-2" /> Despesa
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant ml-1">Descrição</Label>
                <Input
                  value={editedData.description}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                  className="h-11 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant ml-1">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editedData.amount}
                    onChange={(e) => setEditedData({ ...editedData, amount: e.target.value })}
                    className="h-11 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant ml-1">Data</Label>
                  <Input
                    type="date"
                    value={editedData.date}
                    onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant ml-1">Categoria</Label>
                  <Select
                    value={editedData.categoryId}
                    onValueChange={(v) => setEditedData({ ...editedData, categoryId: v || "" })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-on-surface-variant ml-1">Status</Label>
                  <Select
                    value={editedData.paymentStatus}
                    onValueChange={(v) => setEditedData({ ...editedData, paymentStatus: v || "PENDING" })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">Pago</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="OVERDUE">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-on-surface-variant ml-1">Vencimento</Label>
                <Input
                  type="date"
                  value={editedData.dueDate}
                  onChange={(e) => setEditedData({ ...editedData, dueDate: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1 h-12">
                  Cancelar
                </Button>
                <Button onClick={confirmImport} disabled={saving} className="flex-1 h-12 apple-button-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
