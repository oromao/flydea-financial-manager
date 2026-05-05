"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion } from "framer-motion";
import { AgentTypeEnum } from "@/domain/agent/value-objects/AgentType";

interface AgentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AGENT_TYPES = [
  {
    value: AgentTypeEnum.BUDGET_REVIEW,
    label: "Revisão de Orçamento",
    description: "Revisa seus orçamentos e alerta sobre limites",
  },
  {
    value: AgentTypeEnum.EXPENSE_ALERT,
    label: "Alerta de Despesas",
    description: "Detecta gastos anormais e alertas em tempo real",
  },
  {
    value: AgentTypeEnum.INCOME_CHECK,
    label: "Verificação de Receita",
    description: "Verifica sua receita e fluxo de entrada",
  },
  {
    value: AgentTypeEnum.CASHFLOW_FORECAST,
    label: "Projeção de Fluxo de Caixa",
    description: "Fornece previsões de fluxo de caixa futuro",
  },
  {
    value: AgentTypeEnum.SAVINGS_GOAL,
    label: "Meta de Poupança",
    description: "Monitora progresso em relação a metas de poupança",
  },
  {
    value: AgentTypeEnum.CUSTOM,
    label: "Agente Customizado",
    description: "Configure um agente personalizado",
  },
];

const CRON_PRESETS = [
  { label: "Todo dia às 9:00", value: "0 9 * * *" },
  { label: "Todo dia às 18:00", value: "0 18 * * *" },
  { label: "Segunda a Sexta às 9:00", value: "0 9 * * 1-5" },
  { label: "Todo domingo", value: "0 0 * * 0" },
  { label: "1º de cada mês", value: "0 0 1 * *" },
];

export function AgentForm({ onClose, onSuccess }: AgentFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"type" | "details" | "schedule" | "actions">(
    "type"
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    schedule: CRON_PRESETS[1].value,
    timezone: "America/Sao_Paulo",
    actions: [
      {
        type: "EMAIL",
        enabled: true,
        recipient: "",
      },
    ],
  });

  const handleTypeSelect = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
    setStep("details");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do agente é obrigatório");
      return;
    }
    if (!formData.type) {
      toast.error("Tipo de agente é obrigatório");
      return;
    }
    if (!formData.schedule.trim()) {
      toast.error("Schedule é obrigatório");
      return;
    }

    const enabledActions = formData.actions.filter((a) => a.enabled);
    if (enabledActions.length === 0) {
      toast.error("Selecione pelo menos uma ação");
      return;
    }

    if (enabledActions.some((a) => a.type === "EMAIL" && !a.recipient)) {
      toast.error("Email é obrigatório para ações de email");
      return;
    }

    setLoading(true);
    try {
      const config = {
        actions: formData.actions,
      };

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          schedule: formData.schedule,
          timezone: formData.timezone,
          config,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Erro ao criar agente");
        return;
      }

      toast.success("Agente criado com sucesso!");
      onSuccess();
    } catch (error) {
      toast.error("Erro ao criar agente");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = AGENT_TYPES.find((t) => t.value === formData.type);

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
            {step === "type" && "Novo Agente IA"}
            {step === "details" && "Detalhes do Agente"}
            {step === "schedule" && "Configurar Schedule"}
            {step === "actions" && "Configurar Ações"}
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
          {step === "type" && (
            <div className="space-y-4">
              <p className="text-on-surface-variant text-sm">
                Selecione o tipo de agente que deseja criar:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {AGENT_TYPES.map((type) => (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeSelect(type.value)}
                    className="p-4 rounded-lg border border-outline/10 hover:bg-surface-variant/50 text-left transition-colors"
                  >
                    <h3 className="font-semibold text-on-background">
                      {type.label}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {type.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Nome do Agente
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Monitorar Gastos"
                  className="w-full px-4 py-2 rounded-lg border border-outline/20 bg-surface text-on-background placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o que este agente fará..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-outline/20 bg-surface text-on-background placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-outline/20 bg-surface text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/Sao_Paulo">São Paulo (Brasil)</option>
                  <option value="America/New_York">New York (USA)</option>
                  <option value="Europe/London">London (UK)</option>
                  <option value="Europe/Paris">Paris (Europa)</option>
                  <option value="Asia/Tokyo">Tokyo (Ásia)</option>
                </select>
              </div>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Presets Rápidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CRON_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          schedule: preset.value,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        formData.schedule === preset.value
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline/20 text-on-background hover:bg-surface-variant/50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-background mb-2">
                  Expressão CRON Customizada
                </label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  placeholder="Ex: 0 9 * * * (9:00 todo dia)"
                  className="w-full px-4 py-2 rounded-lg border border-outline/20 bg-surface text-on-background placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                />
                <p className="text-xs text-on-surface-variant mt-2">
                  Formato: minuto hora dia mês dia-semana
                </p>
              </div>
            </div>
          )}

          {step === "actions" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-background mb-3">
                  Ações ao Executar
                </label>

                <div className="space-y-4">
                  {formData.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-outline/10 bg-surface-variant/20"
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={action.enabled}
                          onChange={(e) => {
                            const newActions = [...formData.actions];
                            newActions[idx].enabled = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              actions: newActions,
                            }));
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-on-background">
                            {action.type === "EMAIL" && "📧 Enviar Email"}
                            {action.type === "SMS" && "📱 Enviar SMS"}
                            {action.type === "IN_APP_NOTIFICATION" && "🔔 Notificação"}
                            {action.type === "WEBHOOK" && "🔗 Webhook"}
                          </h4>

                          {action.type === "EMAIL" && action.enabled && (
                            <input
                              type="email"
                              placeholder="seu@email.com"
                              value={action.recipient}
                              onChange={(e) => {
                                const newActions = [...formData.actions];
                                newActions[idx].recipient = e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  actions: newActions,
                                }));
                              }}
                              className="mt-2 w-full px-3 py-2 rounded border border-outline/20 bg-background text-on-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-outline/10 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {step !== "type" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === "details") setStep("type");
                  else if (step === "schedule") setStep("details");
                  else if (step === "actions") setStep("schedule");
                }}
              >
                Voltar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {step !== "actions" && (
              <Button
                onClick={() => {
                  if (step === "type" && formData.type)
                    setStep("details");
                  else if (step === "details" && formData.name)
                    setStep("schedule");
                  else if (step === "schedule" && formData.schedule)
                    setStep("actions");
                }}
              >
                Próximo
              </Button>
            )}
            {step === "actions" && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Criar Agente
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
