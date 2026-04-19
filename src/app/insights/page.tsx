"use client";

import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FinancialAIChat } from "@/components/financial-ai-chat";

export default function InsightsPage() {
  return (
    <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20 md:pb-0 px-4 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-3 rounded-2xl bg-secondary/10 text-secondary"
          >
            <Brain className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">
              Insights Financeiros
            </h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">
              IA analisando seus padrões de gastos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/30 flex gap-3">
          <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-on-background">
              Análise com IA
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              A IA analisa todas as suas transações em tempo real
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100/30 flex gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-on-background">
              Previsões Precisas
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Receba previsões de fluxo de caixa baseadas em padrões reais
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/30 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-on-background">
              Alertas Inteligentes
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Identifique padrões de gasto desnecessários automaticamente
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/30 flex gap-3">
          <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-on-background">
              Recomendações Personalizadas
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Obtenha dicas específicas para sua situação financeira
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="h-[600px] md:h-[700px]"
      >
        <FinancialAIChat className="h-full" />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-surface-variant/30 border border-outline/10 text-center text-sm text-on-surface-variant"
      >
        <p>
          💡 Dica: Faça perguntas específicas como "Qual é minha maior despesa?" ou
          "Como posso economizar mais este mês?"
        </p>
      </motion.div>
    </div>
  );
}
