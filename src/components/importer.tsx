"use client";

import { useState } from "react";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImporterProps {
  onImportSuccess: () => void;
}

export function Importer({ onImportSuccess }: ImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      parseFile(e.target.files[0]);
    }
  };

  const parseFile = async (f: File) => {
    setParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const transactions: any[] = [];

      if (f.name.endsWith(".ofx")) {
        // Simple OFX Regex Parser
        const trns = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g) || [];
        trns.forEach(trn => {
          const amount = trn.match(/<TRNAMT>(.*)/)?.[1];
          const date = trn.match(/<DTPOSTED>(.*)/)?.[1];
          const memo = trn.match(/<MEMO>(.*)/)?.[1] || trn.match(/<NAME>(.*)/)?.[1];
          
          if (amount && date && memo) {
            transactions.push({
              description: memo.trim(),
              amount: parseFloat(amount),
              date: `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
            });
          }
        });
      } else if (f.name.endsWith(".csv")) {
        const lines = text.split("\n").slice(1); // skip header
        lines.forEach(line => {
          const parts = line.split(",");
          if (parts.length >= 3) {
            transactions.push({
              date: parts[0].trim(),
              description: parts[1].trim(),
              amount: parseFloat(parts[2].trim())
            });
          }
        });
      }

      setPreview(transactions);
      setParsing(false);
    };
    reader.readAsText(f);
  };

  const confirmImport = async () => {
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: preview })
      });
      if (res.ok) {
        setOpen(false);
        setFile(null);
        setPreview([]);
        onImportSuccess();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl border-[#43474E] bg-[#111318] text-[#D1E4FF] px-6" />}>
        <Upload className="w-4 h-4 mr-2" /> IMPORTAR EXTRATO
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-xl bg-[#1A1C1E] border-none rounded-[32px] p-0 shadow-2xl">
        <div className="bg-[#1D2024] p-8 md:p-10 border-b border-[#43474E]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#E2E2E6]">Importar via OFX/CSV</DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {!file ? (
            <div className="border-2 border-dashed border-[#43474E] rounded-3xl p-12 text-center hover:border-[#D1E4FF] transition-colors cursor-pointer relative">
              <input type="file" accept=".ofx,.csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <FileText className="w-12 h-12 text-[#8D9199] mx-auto mb-4" />
              <p className="text-[#E2E2E6] font-bold">Arraste seu arquivo OFX ou CSV</p>
              <p className="text-[#8D9199] text-xs mt-2 uppercase tracking-widest font-black">Máximo 10MB</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#111318] p-4 rounded-2xl border border-[#43474E]">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[#3C4858] text-[#D1E4FF]"><FileText className="w-5 h-5" /></div>
                  <span className="text-[#E2E2E6] font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="rounded-full text-[#8D9199]"><X className="w-4 h-4" /></Button>
              </div>

              {parsing ? (
                <div className="py-12 text-center text-[#D1E4FF] animate-pulse font-bold uppercase tracking-widest">Processando dados...</div>
              ) : preview.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-[#8D9199] px-2 tracking-widest">
                    <span>{preview.length} Transações detectadas</span>
                    <span>Confirmar?</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                    {preview.slice(0, 10).map((t, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-[#111318] rounded-xl text-xs border border-[#43474E]/30">
                        <div className="flex flex-col">
                          <span className="text-[#E2E2E6] font-bold">{t.description}</span>
                          <span className="text-[#8D9199] text-[10px]">{t.date}</span>
                        </div>
                        <span className={cn("font-black", t.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </span>
                      </div>
                    ))}
                    {preview.length > 10 && <p className="text-center text-[10px] text-[#8D9199] py-2">... e mais {preview.length - 10} registros</p>}
                  </div>
                  <Button onClick={confirmImport} className="w-full h-14 rounded-full bg-[#D0E4FF] text-[#003258] font-bold">
                    CONCLUIR IMPORTAÇÃO
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-xs font-bold">Nenhuma transação válida encontrada no arquivo.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
