"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { History, User, Activity, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  const getActionColor = (action: string) => {
    switch(action) {
      case "CREATE": return "text-emerald-400 bg-emerald-400/10";
      case "UPDATE": return "text-amber-400 bg-amber-400/10";
      case "DELETE": return "text-rose-400 bg-rose-400/10";
      case "IMPORT": return "text-blue-400 bg-blue-400/10";
      default: return "text-slate-400 bg-slate-400/10";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-[#BBC7DB] text-[#253140]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#E2E2E6]">Logs de Auditoria</h1>
          <p className="text-[#C3C7CF] font-medium mt-1">Histórico de transparência v5.0 Enterprise</p>
        </div>
      </div>

      <Card className="bg-[#1A1C1E] rounded-[32px] border-[#43474E] overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1D2024] border-b border-[#43474E]">
              <TableHead className="px-10 py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-[#C3C7CF]">Quando</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-[#C3C7CF]">Responsável</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-[#C3C7CF]">Ação</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-[#C3C7CF]">Entidade</TableHead>
              <TableHead className="px-10 py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-[#C3C7CF]">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 animate-pulse uppercase text-xs font-bold tracking-widest text-[#8D9199]">Carregando logs...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-[#8D9199]">Nenhum log encontrado</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id} className="border-b border-[#43474E]/30 text-[#E2E2E6]">
                <TableCell className="px-10 py-6">
                  <span className="font-bold text-sm">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#8D9199]" />
                    <span className="font-bold text-sm">{log.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getActionColor(log.action))}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="py-6">
                  <span className="text-xs font-medium text-[#C3C7CF]">{log.entity}</span>
                </TableCell>
                <TableCell className="px-10 py-6">
                  <span className="text-sm italic text-[#8D9199]">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
