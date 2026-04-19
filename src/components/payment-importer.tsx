"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface PaymentImporterProps {
  onImportSuccess: () => void;
  variant?: "button" | "icon";
}

interface ImportedTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string | null;
  paymentStatus: "PAID" | "PENDING";
  documentUrl?: string;
}

export function PaymentImporter({ onImportSuccess, variant = "button" }: PaymentImporterProps) {
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<ImportedTransaction | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<ImportedTransaction> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SUPPORTED_FORMATS = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".ofx",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const ext = "." + f.name.split(".").pop()?.toLowerCase();

      if (!SUPPORTED_FORMATS.includes(ext)) {
        toast.error(
          `Formato não suportado. Use: ${SUPPORTED_FORMATS.join(", ")}`
        );
        return;
      }

      if (f.size > 20 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 20MB)");
        return;
      }

      setFile(f);
      await parseFile(f);
    }
  };

  const parseFile = async (f: File) => {
    setParsing(true);
    setEditMode(false);
    setEditData(null);

    try {
      const formData = new FormData();
      formData.append("file", f);

      // Send to unified import endpoint
      const res = await fetch("/api/document-import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Falha ao processar arquivo");
      }

      const result = await res.json();

      // Transform API response to our format
      const transaction: ImportedTransaction = {
        id: result.id || `temp-${Date.now()}`,
        description:
          result.description ||
          result.extractedData?.description ||
          f.name,
        amount: result.amount || result.extractedData?.totalAmount || 0,
        date:
          result.date ||
          result.extractedData?.emissionDate ||
          new Date().toISOString().split("T")[0],
        type: result.type || "EXPENSE",
        categoryId: result.categoryId || null,
        paymentStatus: result.paymentStatus || "PENDING",
        documentUrl: result.documentUrl,
      };

      setPreview(transaction);
      setEditData({ ...transaction });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao processar arquivo";
      toast.error(msg);
      setFile(null);
      setPreview(null);
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!editData) return;

    try {
      const payload = {
        ...editData,
        amount: parseFloat(String(editData.amount || 0)),
      };

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: [payload] }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Falha ao importar");
      }

      toast.success("Comprovante importado com sucesso!");
      setOpen(false);
      setFile(null);
      setPreview(null);
      setEditData(null);
      onImportSuccess();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao importar";
      toast.error(msg);
    }
  };

  const handleDialogOpen = async (value: boolean) => {
    setOpen(value);
    if (value) {
      await fetchCategories();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpen}>
      <DialogTrigger
        render={
          variant === "icon" ? (
            <Button
              size="icon"
              className="h-10 w-10 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary"
              title="Importar comprovante"
            >
              <Upload className="w-4 h-4" />
            </Button>
          ) : (
            <Button className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface text-xs font-semibold uppercase border border-white/5 transition-colors whitespace-nowrap flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Importar Comprovante
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[500px] p-0 overflow-x-hidden overflow-y-auto border-none sm:rounded-3xl bg-surface sm:shadow-2xl">
        <div className="p-6 sm:p-8 border-b border-outline/10 bg-surface">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-on-background">
              Importar Comprovante
            </DialogTitle>
            <p className="text-on-surface-variant text-sm font-medium mt-1">
              PDF, imagem, OFX ou CSV
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {!preview ? (
            <div className="space-y-4">
              {/* File Input */}
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  file
                    ? "border-emerald-500/50 bg-emerald-50/20"
                    : "border-outline/30 hover:border-outline/50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={SUPPORTED_FORMATS.join(",")}
                  onChange={handleFileChange}
                  disabled={parsing}
                />

                {parsing ? (
                  <>
                    <Loader2 className="w-10 h-10 mx-auto text-on-surface-variant/50 animate-spin mb-2" />
                    <p className="text-sm font-semibold text-on-surface-variant">
                      Processando arquivo...
                    </p>
                  </>
                ) : file ? (
                  <>
                    <Check className="w-10 h-10 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-on-background">
                      {file.name}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Clique para trocar
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto text-on-surface-variant/50 mb-2" />
                    <p className="text-sm font-semibold text-on-background">
                      Clique ou arraste um arquivo
                    </p>
                    <p className="text-xs text-on-surface-variant/70 mt-1">
                      PDF, JPG, PNG, OFX, CSV (máx 20MB)
                    </p>
                  </>
                )}
              </div>

              {file && !parsing && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          ) : editMode && editData ? (
            /* Edit Mode */
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-on-surface-variant">
                  Descrição
                </Label>
                <Input
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-on-surface-variant">
                    Valor
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.amount || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-on-surface-variant">
                    Data
                  </Label>
                  <Input
                    type="date"
                    value={editData.date || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        date: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-on-surface-variant">
                    Tipo
                  </Label>
                  <Select
                    value={editData.type || "EXPENSE"}
                    onValueChange={(value) =>
                      setEditData({
                        ...editData,
                        type: value as "INCOME" | "EXPENSE",
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Receita</SelectItem>
                      <SelectItem value="EXPENSE">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-on-surface-variant">
                    Categoria
                  </Label>
                  <Select
                    value={editData.categoryId || ""}
                    onValueChange={(value) =>
                      setEditData({
                        ...editData,
                        categoryId: value || null,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditMode(false)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmImport}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-variant/20 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">
                    Descrição
                  </p>
                  <p className="text-sm font-medium text-on-background">
                    {preview.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1">
                    Valor
                  </p>
                  <p className="text-xl font-bold text-on-background">
                    R$ {preview.amount.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-on-surface-variant mb-0.5">
                      Data
                    </p>
                    <p className="text-on-background">{preview.date}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface-variant mb-0.5">
                      Tipo
                    </p>
                    <p className="text-on-background">
                      {preview.type === "INCOME" ? "Receita" : "Despesa"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmImport}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
