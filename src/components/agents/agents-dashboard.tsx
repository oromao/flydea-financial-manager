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
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
      color: "text-red-500 bg-red-500/10"
    },
    {
      id: "gastos-limite",
      name: "Controle de Gastos",
      description: "Monitora categorias críticas",
      icon: ShieldAlert,
      type: "EXPENSE_ALERT",
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      id: "contas-altas",
      name: "Contas em Risco",
      description: "Alerta sobre boletos altos",
      icon: Receipt,
      type: "BUDGET_REVIEW",
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      id: "meta-poupanca",
      name: "Meta de Reserva",
      description: "Ações para atingir meta",
      icon: Target,
      type: "SAVINGS_GOAL",
      color: "text-emerald-500 bg-emerald-500/10"
    }
  ];

  const handleQuickCreate = async (template: typeof QUICK_TEMPLATES[0]) => {
    setCreating(true);
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
      setCreating(false);
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
    if (!confirm("Tem certeza que deseja deletar este agente?")) return;

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
        <div>
          <h1 className="text-3xl font-black text-on-background tracking-tight uppercase italic flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Brain className="w-6 h-6" />
            </div>
            Agentes IA
          </h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium">
            Ative assistentes que cuidam do seu dinheiro automaticamente
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 rounded-full font-bold uppercase tracking-widest text-xs px-6 bg-white/5 border-white/10 hover:bg-white/10 text-on-surface"
        >
          <Plus className="w-4 h-4" />
          Personalizado
        </Button>
      </motion.div>

      {/* Quick Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {QUICK_TEMPLATES.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !creating && handleQuickCreate(template)}
            className="p-6 rounded-[32px] bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all group relative overflow-hidden backdrop-blur-xl"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", template.color)}>
              <template.icon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-tight text-on-background">{template.name}</h3>
            <p className="text-[10px] text-on-surface-variant mt-1 font-black uppercase opacity-40 tracking-[0.15em]">
              {template.description}
            </p>
            {creating && (
              <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-secondary" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-10">
        <h2 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.3em] mb-6 flex items-center gap-3 opacity-50">
          <div className="h-px flex-1 bg-white/5" />
          Seus Agentes Ativos
          <div className="h-px flex-1 bg-white/5" />
        </h2>
        
        {/* Agent List */}
        {agents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]"
          >
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Nenhum agente ativo no momento</p>
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="mt-6 rounded-full px-8 border-white/10 hover:bg-white/5"
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
                  className="p-5 rounded-[24px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-on-background text-sm">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider">
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
                        className="rounded-full h-10 w-10 p-0 hover:bg-white/5 text-on-surface-variant"
                      >
                        <History className="w-4.5 h-4.5" />
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleExecute(agent.id)}
                        disabled={executing === agent.id}
                        className="rounded-full h-10 w-10 p-0 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
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
                        className="rounded-full h-10 w-10 p-0 hover:bg-rose-500/10 text-on-surface-variant hover:text-rose-500"
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
