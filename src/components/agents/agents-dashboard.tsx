"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Loader2, Trash2, Play, History, ShieldAlert, 
  TrendingDown, Receipt, Target, Brain, Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { AgentForm } from "./agent-form";
import { AgentExecutionHistory } from "./agent-execution-history";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  type: string;
  schedule: string;
  isActive: boolean;
  createdAt: string;
}

export function AgentsDashboard() {
  const toast = useToast();
  const confirm = useConfirm();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agents");
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      toast.error("Erro ao carregar agentes");
    } finally {
      setLoading(false);
    }
  };

  const QUICK_TEMPLATES = [
    {
      id: "fluxo-negativo",
      name: "Fluxo Negativo",
      description: "Avisa se gastos superarem receitas",
      icon: TrendingDown,
      type: "CASHFLOW_FORECAST",
      color: "text-destructive bg-destructive/10"
    },
    {
      id: "gastos-limite",
      name: "Controle de Gastos",
      description: "Monitora categorias críticas",
      icon: ShieldAlert,
      type: "EXPENSE_ALERT",
      color: "text-warning bg-warning/10"
    },
    {
      id: "contas-altas",
      name: "Contas em Risco",
      description: "Alerta sobre boletos altos",
      icon: Receipt,
      type: "BUDGET_REVIEW",
      color: "text-primary bg-primary/10"
    },
    {
      id: "meta-poupanca",
      name: "Meta de Reserva",
      description: "Ações para atingir meta",
      icon: Target,
      type: "SAVINGS_GOAL",
      color: "text-success bg-success/10"
    }
  ];

  const handleQuickCreate = async (template: typeof QUICK_TEMPLATES[0]) => {
    setCreatingId(template.id);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          type: template.type,
          schedule: "0 9 * * *", // Todo dia às 9:00
          timezone: "America/Sao_Paulo",
          config: { actions: [{ type: "IN_APP_NOTIFICATION", enabled: true }] }
        }),
      });

      if (res.ok) {
        toast.success(`Agente "${template.name}" ativado!`);
        loadAgents();
      } else {
        toast.error("Erro ao ativar agente");
      }
    } catch (e) {
      toast.error("Erro ao conectar com servidor");
    } finally {
      setCreatingId(null);
    }
  };

  const handleExecute = async (agentId: string) => {
    setExecuting(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "POST" });
      if (res.ok) {
        toast.success("Agente executado com sucesso!");
        loadAgents();
      } else {
        toast.error("Erro ao executar agente");
      }
    } catch (error) {
      toast.error("Erro ao executar agente");
    } finally {
      setExecuting(null);
    }
  };

  const handleDelete = async (agentId: string) => {
    const ok = await confirm({ title: "Deletar Agente", message: "Tem certeza que deseja deletar este agente?", variant: "danger" });
    if (!ok) return;

    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Agente deletado!");
        loadAgents();
      } else {
        toast.error("Erro ao deletar agente");
      }
    } catch (error) {
      toast.error("Erro ao deletar agente");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/10 flex-shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-on-background tracking-tight">Agentes IA</h1>
            <p className="text-on-surface-variant text-sm mt-0.5 font-medium">
              Ative assistentes que cuidam do seu dinheiro automaticamente
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="gap-2 rounded-xl font-bold text-xs px-4 h-9 border-outline/20 text-on-surface-variant hover:text-on-surface hover:border-outline/40"
        >
          <Plus className="w-3.5 h-3.5" />
          Personalizado
        </Button>
      </motion.div>

      {/* Quick Templates */}
      <div className="flex flex-col gap-3 pt-2">
        {QUICK_TEMPLATES.map((template) => (
          <motion.button
            key={template.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => !creatingId && handleQuickCreate(template)}
            disabled={!!creatingId}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline/10 cursor-pointer hover:bg-surface-container hover:border-outline/20 transition-all text-left relative overflow-hidden",
              creatingId === template.id && "opacity-70"
            )}
          >
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", template.color)}>
              {creatingId === template.id
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <template.icon className="w-5 h-5" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-on-background">{template.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{template.description}</p>
            </div>
            <Plus className={cn("w-5 h-5 shrink-0 text-on-surface-variant/40 transition-all", creatingId === template.id && "opacity-0")} />
          </motion.button>
        ))}
      </div>

      <div className="pt-10">
        <h2 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.3em] mb-6 flex items-center gap-3 opacity-50">
          <div className="h-px flex-1 bg-accent/5" />
          Seus Agentes Ativos
          <div className="h-px flex-1 bg-accent/5" />
        </h2>
        
        {/* Agent List */}
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-accent/5 border border-dashed border-border rounded-4xl"
          >
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Nenhum agente ativo no momento</p>
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-full px-8 border-border hover:bg-accent/5"
            >
              Criar meu primeiro assistente
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-3"
          >
            <AnimatePresence>
              {agents.map((agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl bg-accent/5 border border-border/50 hover:bg-accent/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-on-background text-sm">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider">
                          {agent.type}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase opacity-40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {agent.schedule}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowHistory(true);
                        }}
                        disabled={executing === agent.id}
                        aria-label="Histórico de execuções"
                        className="rounded-full h-10 w-10 p-0 hover:bg-accent/5 text-on-surface-variant"
                      >
                        <History className="w-4.5 h-4.5" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleExecute(agent.id)}
                        disabled={executing === agent.id}
                        aria-label="Executar agente"
                        className="rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                      >
                        {executing === agent.id ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <Play className="w-4.5 h-4.5 fill-current" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(agent.id)}
                        aria-label="Excluir agente"
                        className="rounded-full h-10 w-10 p-0 hover:bg-destructive/10 text-on-surface-variant hover:text-destructive"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <AgentForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadAgents();
            }}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && selectedAgent && (
          <AgentExecutionHistory
            agentId={selectedAgent.id}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
