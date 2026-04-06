"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Search, User, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("ALL");
  const [entity, setEntity] = useState("ALL");
  const { data: session, status } = useSession();

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesQuery =
        !term ||
        [log.user?.name, log.action, log.entity, log.details]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      const matchesAction = action === "ALL" || log.action === action;
      const matchesEntity = entity === "ALL" || log.entity === entity;
      return matchesQuery && matchesAction && matchesEntity;
    });
  }, [logs, query, action, entity]);

  const uniqueEntities = useMemo(
    () => Array.from(new Set(logs.map((log) => log.entity).filter(Boolean))).sort(),
    [logs],
  );

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <Card className="premium-card p-8">
          <h1 className="text-2xl font-bold text-on-background">Acesso restrito</h1>
          <p className="text-on-surface-variant mt-2">Esta área é reservada para usuários administradores.</p>
        </Card>
      </div>
    );
  }

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

      <Card className="premium-card bg-surface rounded-[32px] border-outline-variant shadow-sm">
        <CardContent className="p-5 grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por usuário, ação, entidade ou detalhe"
              className="pl-9"
            />
          </label>
          <Select value={action} onValueChange={(value) => setAction(value ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as ações</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="IMPORT">IMPORT</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entity} onValueChange={(value) => setEntity(value ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as entidades</SelectItem>
              {uniqueEntities.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="premium-card bg-surface rounded-[32px] border-outline-variant overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-variant/30 border-b border-outline-variant">
              <TableHead className="px-4 sm:px-10 py-4 sm:py-6 font-bold uppercase text-xs sm:text-[11px] tracking-[0.2em] text-on-surface-variant">Quando</TableHead>
              <TableHead className="px-2 sm:px-4 py-4 sm:py-6 font-bold uppercase text-xs sm:text-[11px] tracking-[0.2em] text-on-surface-variant">Responsável</TableHead>
              <TableHead className="px-2 sm:px-4 py-4 sm:py-6 font-bold uppercase text-xs sm:text-[11px] tracking-[0.2em] text-on-surface-variant">Ação</TableHead>
              <TableHead className="px-2 sm:px-4 py-4 sm:py-6 font-bold uppercase text-xs sm:text-[11px] tracking-[0.2em] text-on-surface-variant">Entidade</TableHead>
              <TableHead className="px-4 sm:px-10 py-4 sm:py-6 font-bold uppercase text-xs sm:text-[11px] tracking-[0.2em] text-on-surface-variant">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 animate-pulse uppercase text-xs font-bold tracking-widest text-on-surface-variant/60">Carregando logs...</TableCell></TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 text-on-surface-variant/60">Nenhum log encontrado</TableCell></TableRow>
            ) : filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-b border-outline-variant/30 text-on-surface hover:bg-surface-variant/10 transition-colors">
                <TableCell className="px-4 sm:px-10 py-4 sm:py-6">
                  <span className="font-bold text-[10px] sm:text-sm">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-4 sm:py-6">
                  <div className="flex items-center gap-2 flex-col sm:flex-row">
                    <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-on-surface-variant shrink-0" />
                    <span className="font-bold text-[10px] sm:text-sm truncate">{log.user?.name || log.userId}</span>
                  </div>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-4 sm:py-6">
                  <span className={cn("px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap", getActionColor(log.action))}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="px-2 sm:px-4 py-4 sm:py-6">
                  <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant/80 truncate">{log.entity}</span>
                </TableCell>
                <TableCell className="px-4 sm:px-10 py-4 sm:py-6">
                  <span className="text-[10px] sm:text-sm italic text-on-surface-variant/60 line-clamp-2">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
