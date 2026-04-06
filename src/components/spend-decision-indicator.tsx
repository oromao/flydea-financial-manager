"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DecisionResponse {
  currentWeek: number;
  decision: {
    status: "PODE_GASTAR" | "ALERTA" | "NAO_PODE_GASTAR";
    motivo: string;
    saldoAtual: number;
    saldoProximaSemana: number;
  };
}

export function SpendDecisionIndicator() {
  const [data, setData] = useState<DecisionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDecision() {
      try {
        setLoading(true);
        const res = await fetch("/api/cashflow/decision");
        if (!res.ok) throw new Error("Failed to fetch decision");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching spend decision:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDecision();
  }, []);

  if (loading || !data) {
    return null;
  }

  const { status, motivo, saldoAtual } = data.decision;
  const semana = data.currentWeek;

  const config = {
    PODE_GASTAR: {
      icon: CheckCircle2,
      bg: "bg-emerald-50/30 border-emerald-100",
      text: "text-emerald-700",
      label: "🟢 Pode gastar",
      emoji: "✅",
    },
    ALERTA: {
      icon: AlertTriangle,
      bg: "bg-amber-50/30 border-amber-100",
      text: "text-amber-700",
      label: "🟡 Atenção",
      emoji: "⚠️",
    },
    NAO_PODE_GASTAR: {
      icon: AlertCircle,
      bg: "bg-red-50/30 border-red-100",
      text: "text-red-700",
      label: "🔴 Evite gastos",
      emoji: "❌",
    },
  };

  const cfg = config[status];
  const Icon = cfg.icon;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value
    );

  return (
    <Card className={cn("premium-card p-5 sm:p-6 border-2", cfg.bg)}>
      <div className="flex items-start gap-4">
        <Icon className={cn("w-8 h-8 mt-1 shrink-0", cfg.text)} />

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={cn("font-bold text-lg", cfg.text)}>{cfg.label}</h3>
            <span className="text-2xl">{cfg.emoji}</span>
          </div>

          <div className="space-y-1">
            <p className={cn("text-sm font-semibold", cfg.text)}>{motivo}</p>
            <p className="text-xs text-on-surface-variant/70">
              Semana {semana}: {formatCurrency(saldoAtual)} de saldo
            </p>
          </div>

          <div className="pt-2 border-t border-current/10">
            <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
              💡 <strong>Dica:</strong> Acompanhe a previsão semanal acima para
              entender melhor seu fluxo de caixa.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
