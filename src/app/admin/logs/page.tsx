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
        <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-on-background">Logs de Auditoria</h1>
          <p className="text-on-surface-variant font-medium mt-1">Histórico de transparência v5.0 Enterprise</p>
        </div>
      </div>

      <Card className="premium-card bg-surface rounded-[32px] border-outline-variant overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-variant/30 border-b border-outline-variant">
              <TableHead className="px-10 py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-on-surface-variant">Quando</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-on-surface-variant">Responsável</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-on-surface-variant">Ação</TableHead>
              <TableHead className="py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-on-surface-variant">Entidade</TableHead>
              <TableHead className="px-10 py-6 font-bold uppercase text-[11px] tracking-[0.2em] text-on-surface-variant">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 animate-pulse uppercase text-xs font-bold tracking-widest text-on-surface-variant/60">Carregando logs...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-on-surface-variant/60">Nenhum log encontrado</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id} className="border-b border-outline-variant/30 text-on-surface hover:bg-surface-variant/10 transition-colors">
                <TableCell className="px-10 py-6">
                  <span className="font-bold text-sm">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-on-surface-variant" />
                    <span className="font-bold text-sm">{log.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", getActionColor(log.action))}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="py-6">
                  <span className="text-xs font-medium text-on-surface-variant/80">{log.entity}</span>
                </TableCell>
                <TableCell className="px-10 py-6">
                  <span className="text-sm italic text-on-surface-variant/60">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
