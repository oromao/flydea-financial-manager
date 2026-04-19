"use client";

import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FinancialAIChat } from "@/components/financial-ai-chat";

export default function InsightsPage() {
  return (
    <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto pb-20 md:pb-0 px-4 md:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 text-secondary"
          >
            <Brain className="w-7 h-7 md:w-8 md:h-8" />
          </motion.div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">
              Insights Financeiros
            </h1>
            <p className="text-on-surface-variant font-medium text-sm mt-1">
              IA analisando seus padrões de gastos com precisão
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, staggerChildren: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div
          whileHover={{ translateY: -4 }}
          className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50/50 to-blue-50/20 border border-blue-100/40 flex gap-3 cursor-pointer transition-all"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex-shrink-0"
          >
            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-sm text-on-background">
              Análise com IA
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Análise local e inteligente de suas transações
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ translateY: -4 }}
          className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 border border-emerald-100/40 flex gap-3 cursor-pointer transition-all"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-sm text-on-background">
              Previsões Precisas
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Previsões de fluxo de caixa baseadas em seus dados
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ translateY: -4 }}
          className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-50/50 to-amber-50/20 border border-amber-100/40 flex gap-3 cursor-pointer transition-all"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}
            className="flex-shrink-0"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-sm text-on-background">
              Insights Automáticos
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Identifique padrões e oportunidades de otimização
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ translateY: -4 }}
          className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-50/50 to-purple-50/20 border border-purple-100/40 flex gap-3 cursor-pointer transition-all"
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
            className="flex-shrink-0"
          >
            <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-sm text-on-background">
              Recomendações Personalizadas
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Dicas específicas para sua situação financeira real
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px]"
      >
        <FinancialAIChat className="h-full" />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-gradient-to-r from-secondary/5 to-blue-500/5 border border-outline/10 text-sm text-on-surface-variant"
        >
          <p className="font-medium text-on-background mb-2">💡 Como aproveitar melhor</p>
          <ul className="space-y-1 text-xs md:text-sm">
            <li>✓ Pergunte sobre suas maiores despesas e como otimizá-las</li>
            <li>✓ Peça análise do seu fluxo de caixa e projeções futuras</li>
            <li>✓ Solicite dicas personalizadas para aumentar sua receita</li>
            <li>✓ Pergunte sobre saúde financeira e próximos passos</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-on-surface-variant/60"
        >
          <p>Nenhuma IA externa. Análise 100% local em seu servidor. Dados sempre privados. ✨</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
