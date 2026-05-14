"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Search, User, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/page-skeleton";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

const LOGS_PER_PAGE = 25;

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
  userId: string;
  user?: { name: string | null };
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("ALL");
  const [entity, setEntity] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [uniqueEntities, setUniqueEntities] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const { data: session, status } = useSession();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LOGS_PER_PAGE),
        action,
        entity,
        query,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await fetch(`/api/logs?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setLogs(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, action, entity, query]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Initial fetch for entities
  useEffect(() => {
    fetch("/api/logs?limit=500")
      .then(res => res.json())
      .then(data => {
        const allLogs = data.data || [];
        const entities = Array.from(new Set(allLogs.map((log: AuditEntry) => log.entity).filter(Boolean))) as string[];
        setUniqueEntities(entities.sort());
      });
  }, []);

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  };

  if (status === "authenticated" && session?.user?.role !== "ADMIN") {
    return (
      <PageErrorBoundary>
      <div className="max-w-3xl mx-auto py-20">
        <Card className="premium-card p-8">
          <h1 className="text-2xl font-bold text-on-background">Acesso restrito</h1>
          <p className="text-on-surface-variant mt-2">Esta área é reservada para usuários administradores.</p>
        </Card>
      </div>
    </PageErrorBoundary>
    );
  }

  const getActionColor = (action: string) => {
    switch(action) {
      case "CREATE": return "text-success bg-success/10";
      case "UPDATE": return "text-warning bg-warning/10";
      case "DELETE": return "text-destructive bg-destructive/10";
      case "IMPORT": return "text-primary bg-primary/10";
      default: return "text-surface-variant bg-surface-variant/10";
    }
  };

  if (loading && logs.length === 0) {
    return (
      <PageErrorBoundary>
        <div className="space-y-6 p-6">
          <PageHeaderSkeleton />
          <TableSkeleton rows={5} />
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary>
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

      <Card className="premium-card bg-surface rounded-3xl border-outline-variant shadow-sm">
        <CardContent className="p-5 grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr_1fr]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              value={query}
              onChange={(e) => handleFilterChange(setQuery, e.target.value)}
              placeholder="Buscar por usuário, ação, entidade ou detalhe"
              className="pl-9"
            />
          </label>
          <Select value={action} onValueChange={(value) => handleFilterChange(setAction, value ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as ações</SelectItem>
              <SelectItem value="CREATE">CREATE</SelectItem>
              <SelectItem value="UPDATE">UPDATE</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="IMPORT">IMPORT</SelectItem>
              <SelectItem value="RECURRENCE">RECURRENCE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entity} onValueChange={(value) => handleFilterChange(setEntity, value ?? "ALL")}>
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
          <div className="flex gap-2">
            <Input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
              className="h-12 text-xs"
              placeholder="De"
            />
            <Input 
              type="date" 
              value={dateTo} 
              onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
              className="h-12 text-xs"
              placeholder="Até"
            />
          </div>
        </CardContent>
      </Card>

      {/* DESKTOP TABLE */}
      <Card className="premium-card bg-surface rounded-3xl border-outline-variant overflow-hidden shadow-sm hidden md:block">
        {logs.length === 0 && !loading ? (
          <div className="p-8">
            <EmptyState icon={ShieldCheck} title="Nenhum log encontrado" description="Ajuste os filtros para ver os registros de auditoria." />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-variant/30 border-b border-outline-variant">
              <TableHead className="px-4 lg:px-6 py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant">Quando</TableHead>
              <TableHead className="px-2 lg:px-4 py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant">Responsável</TableHead>
              <TableHead className="px-2 lg:px-4 py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant">Ação</TableHead>
              <TableHead className="px-2 lg:px-4 py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant">Entidade</TableHead>
              <TableHead className="px-4 lg:px-6 py-4 font-bold uppercase text-[11px] sm:text-xs tracking-widest text-on-surface-variant">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-24 animate-pulse uppercase text-xs font-bold tracking-widest text-on-surface-variant/60">Carregando logs...</TableCell></TableRow>
            ) : logs.map((log) => (
              <TableRow key={log.id} className="border-b border-outline-variant/30 text-on-surface hover:bg-surface-variant/10 transition-colors">
                <TableCell className="px-4 lg:px-6 py-4">
                  <span className="font-bold text-[10px] sm:text-sm">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </TableCell>
                <TableCell className="px-2 lg:px-4 py-4">
                  <div className="flex items-center gap-2 flex-col sm:flex-row">
                    <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-on-surface-variant shrink-0" />
                    <span className="font-bold text-[10px] sm:text-sm truncate">{log.user?.name || log.userId}</span>
                  </div>
                </TableCell>
                <TableCell className="px-2 lg:px-4 py-4">
                  <span className={cn("px-2 lg:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap", getActionColor(log.action))}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="px-2 lg:px-4 py-4">
                  <span className="text-[10px] sm:text-xs font-medium text-on-surface-variant/80 truncate">{log.entity}</span>
                </TableCell>
                <TableCell className="px-4 lg:px-6 py-4">
                  <span className="text-[10px] sm:text-sm italic text-on-surface-variant/60 line-clamp-2">{log.details}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </Card>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center animate-pulse uppercase text-xs font-bold tracking-widest text-on-surface-variant/60">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <Card className="premium-card bg-surface rounded-3xl border-outline-variant overflow-hidden shadow-sm p-8">
            <EmptyState icon={ShieldCheck} title="Nenhum log encontrado" description="Ajuste os filtros para ver os registros de auditoria." />
          </Card>
        ) : logs.map((log) => (
          <Card key={log.id} className="rounded-2xl border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</span>
              <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", getActionColor(log.action))}>
                {log.action}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-1">
              <User className="w-3 h-3 shrink-0" />
              <span className="font-semibold truncate">{log.user?.name || log.userId}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 mb-1">
              <span className="font-medium">{log.entity}</span>
            </div>
            <p className="text-xs text-on-surface-variant/60 italic line-clamp-2">{log.details}</p>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {total > LOGS_PER_PAGE && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
            {total} registros · Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-10 px-4 rounded-lg text-xs font-bold"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-10 px-4 rounded-lg text-xs font-bold"
              aria-label="Próxima página"
            >
              Próxima <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
    </PageErrorBoundary>
  );
}
