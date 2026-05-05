"use client";

import { useState, useEffect } from "react";
import { X, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";

interface Execution {
  id: string;
  status: "PENDING" | "RUNNING" | "SUCCESS" | "FAILED";
  output: string | object | null;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface AgentExecutionHistoryProps {
  agentId: string;
  onClose: () => void;
}

export function AgentExecutionHistory({
  agentId,
  onClose,
}: AgentExecutionHistoryProps) {
  const toast = useToast();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(
    null
  );

  useEffect(() => {
    loadExecutions();
  }, [agentId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/agents/${agentId}/executions`);
      const data = await res.json();
      setExecutions(data.executions || []);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <CheckCircle2 className="w-5 h-5 text-success" />
        );
      case "FAILED":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "RUNNING":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "Sucesso";
      case "FAILED":
        return "Falha";
      case "RUNNING":
        return "Executando";
      default:
        return "Pendente";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const getDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return "-";
    const ms =
      new Date(completed).getTime() - new Date(started).getTime();
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-outline/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-background">
            Histórico de Execuções
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-variant/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">
                Nenhuma execução ainda
              </p>
            </div>
          ) : !selectedExecution ? (
            <div className="space-y-3">
              {executions.map((execution) => (
                <motion.button
                  key={execution.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedExecution(execution)}
                  className="w-full p-4 rounded-lg border border-outline/10 hover:bg-surface-variant/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-background">
                          {getStatusLabel(execution.status)}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {formatDate(execution.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">
                        Duração:{" "}
                        {getDuration(
                          execution.startedAt,
                          execution.completedAt
                        )}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedExecution(null)}
                className="text-primary hover:underline text-sm"
              >
                ← Voltar à lista
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-on-background mb-2">
                    Status
                  </h3>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-variant/20">
                    {getStatusIcon(selectedExecution.status)}
                    <span className="text-on-background">
                      {getStatusLabel(selectedExecution.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-on-background mb-2">
                      Criado em
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {formatDate(selectedExecution.createdAt)}
                    </p>
                  </div>

                  {selectedExecution.startedAt && (
                    <div>
                      <h3 className="text-sm font-semibold text-on-background mb-2">
                        Iniciado em
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {formatDate(selectedExecution.startedAt)}
                      </p>
                    </div>
                  )}

                  {selectedExecution.completedAt && (
                    <div>
                      <h3 className="text-sm font-semibold text-on-background mb-2">
                        Concluído em
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {formatDate(selectedExecution.completedAt)}
                      </p>
                    </div>
                  )}

                  {selectedExecution.startedAt &&
                    selectedExecution.completedAt && (
                      <div>
                        <h3 className="text-sm font-semibold text-on-background mb-2">
                          Duração
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {getDuration(
                            selectedExecution.startedAt,
                            selectedExecution.completedAt
                          )}
                        </p>
                      </div>
                    )}
                </div>

                {selectedExecution.output && (
                  <div>
                    <h3 className="text-sm font-semibold text-on-background mb-2">
                      Saída
                    </h3>
                    <div className="p-3 rounded-lg bg-surface-variant/20 max-h-48 overflow-y-auto">
                      <p className="text-sm text-on-surface-variant whitespace-pre-wrap font-mono">
                        {typeof selectedExecution.output === "string"
                          ? selectedExecution.output
                          : JSON.stringify(selectedExecution.output, null, 2)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedExecution.error && (
                  <div>
                    <h3 className="text-sm font-semibold text-destructive mb-2">Erro</h3>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 max-h-48 overflow-y-auto">
                      <p className="text-sm text-destructive whitespace-pre-wrap font-mono">
                        {selectedExecution.error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedExecution && (
          <div className="sticky bottom-0 bg-background border-t border-outline/10 px-6 py-4">
            <Button variant="outline" onClick={() => setSelectedExecution(null)}>
              Voltar
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
