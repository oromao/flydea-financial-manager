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
      <DialogTrigger render={<Button className="h-12 md:h-16 px-3 md:px-8 w-auto rounded-full bg-white/5 hover:bg-white/10 text-on-surface text-xs md:text-base font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95 whitespace-nowrap flex items-center gap-1 md:gap-3" />}>
        <Upload className="w-5 md:w-6 h-5 md:h-6 text-primary" /> <span className="hidden sm:inline">IMPORTAR EXTRATO</span><span className="sm:hidden">IMPORTAR</span>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:max-w-xl bg-surface border-none rounded-[40px] p-0 shadow-[0_32px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden ring-1 ring-white/10">
        <div className="bg-white/5 p-8 md:p-12 border-b border-white/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-on-background tracking-tighter uppercase italic">Importar Extrato</DialogTitle>
            <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Módulo de Sincronização Bancária</p>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          {!file ? (
            <div className="border-4 border-dashed border-white/5 rounded-[32px] p-16 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 cursor-pointer relative group">
              <input type="file" accept=".ofx,.csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <p className="text-on-background text-lg font-black tracking-tight">Arraste seu arquivo OFX ou CSV</p>
              <p className="text-on-surface-variant/40 text-[10px] mt-2 uppercase tracking-[0.3em] font-black italic">Máximo 10MB • Proteção SSL Ativa</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-xl"><FileText className="w-6 h-6" /></div>
                  <span className="text-on-background font-black text-sm truncate max-w-[200px] tracking-tight">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-12 w-12 rounded-full text-on-surface-variant/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all"><X className="w-5 h-5" /></Button>
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
                  <Button onClick={confirmImport} className="m3-button-premium w-full h-16 border-none">
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
