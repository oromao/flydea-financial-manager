"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface Step {
  id: string;
  label: string;
  completed: boolean;
  href?: string;
}

export function FirstStepsCard() {
  const [steps, setSteps] = useState<Step[]>([
    { id: "account", label: "Criar uma conta", completed: false, href: "/contas" },
    { id: "transaction", label: "Adicionar primeira transação", completed: false, href: "/movimentacoes" },
    { id: "budget", label: "Configurar orçamento", completed: false, href: "/orcamentos" },
    { id: "agents", label: "Explorar agentes IA", completed: false, href: "/agents" },
  ]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    async function checkProgress() {
      try {
        const [txRes, accRes, budgetRes, agentRes] = await Promise.all([
          fetch("/api/transactions?limit=1"),
          fetch("/api/accounts?limit=1"),
          fetch("/api/budgets?limit=1"),
          fetch("/api/agents?limit=1"),
        ]);
        const [txData, accData, budgetData, agentData] = await Promise.all([
          txRes.json(), accRes.json(), budgetRes.json(), agentRes.json(),
        ]);

        function getArrLen(data: unknown, key: string): number {
          if (Array.isArray(data)) return data.length;
          if (data && typeof data === "object") {
            const val = (data as Record<string, unknown>)[key];
            return Array.isArray(val) ? val.length : 0;
          }
          return 0;
        }

        const txCount = getArrLen(txData, "transactions");
        const accCount = getArrLen(accData, "accounts");
        const budgetCount = getArrLen(budgetData, "budgets");
        const agentCount = getArrLen(agentData, "agents");

        setSteps([
          { id: "account", label: "Criar uma conta", completed: accCount > 0, href: "/contas" },
          { id: "transaction", label: "Adicionar primeira transação", completed: txCount > 0, href: "/movimentacoes" },
          { id: "budget", label: "Configurar orçamento", completed: budgetCount > 0, href: "/orcamentos" },
          { id: "agents", label: "Explorar agentes IA", completed: agentCount > 0, href: "/agents" },
        ]);

        if (accCount > 0 && txCount > 0 && budgetCount > 0 && agentCount > 0) {
          setShow(false);
        }
      } catch {
        // Silently fail
      }
    }
    checkProgress();
  }, []);

  if (!show) return null;

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-5 mb-6"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-on-background">Primeiros Passos</h3>
            <p className="text-xs text-on-surface-variant/70">
              {completedCount}/4 concluído{completedCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {isCollapsed ? <ChevronDown className="w-5 h-5 text-on-surface-variant" /> : <ChevronUp className="w-5 h-5 text-on-surface-variant" />}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {steps.map((step) => (
                <a
                  key={step.id}
                  href={step.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    step.completed ? "bg-success/5" : "bg-surface-variant/30 hover:bg-surface-variant/50"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-on-surface-variant/40 shrink-0" />
                  )}
                  <span className={`text-sm ${step.completed ? "text-on-surface-variant/60 line-through" : "text-on-background"}`}>
                    {step.label}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-4 h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
