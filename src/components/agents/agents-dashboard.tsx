"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2, Play, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { AgentForm } from "./agent-form";
import { AgentExecutionHistory } from "./agent-execution-history";

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
          <h1 className="text-3xl font-bold text-on-background">Agentes IA</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Crie agentes para automatizar ações financeiras
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Agente
        </Button>
      </motion.div>

      {/* Agent List */}
      {agents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-surface-variant/20 rounded-xl"
        >
          <p className="text-on-surface-variant">Nenhum agente criado ainda</p>
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="mt-4"
          >
            Criar primeiro agente
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4"
        >
          <AnimatePresence>
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg border border-outline/10 hover:bg-surface-variant/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-on-background">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {agent.type} • Schedule: {agent.schedule}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowHistory(true);
                      }}
                      disabled={executing === agent.id}
                    >
                      <History className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleExecute(agent.id)}
                      disabled={executing === agent.id}
                    >
                      {executing === agent.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(agent.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

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
