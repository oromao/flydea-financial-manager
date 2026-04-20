import { createEmbedding } from "./embeddings";
import { knowledgeBase, KnowledgeDocument } from "./knowledge-base";
import type { UserFinancialData } from "@/lib/financial-rag";
import { cagEngine, FinancialInsight } from "./cag-engine";

export interface RAGResponse {
  response: string;
  sources: KnowledgeDocument[];
  relevantMetrics?: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netFlow: number;
    topExpenseCategory?: string;
    healthScore: number;
  };
  insights: FinancialInsight[];
}

export class RAGQueryEngine {
  private knowledgeBase = knowledgeBase;

  processQuery(
    query: string,
    financialData: UserFinancialData,
    topK: number = 3
  ): RAGResponse {
    // 1. Analyze data using CAG Engine
    const insights = cagEngine.rankInsights(financialData);
    const scores = cagEngine.calculateScores(financialData);

    // 2. Semantic Search (RAG)
    const queryEmbedding = createEmbedding(query);
    const docEmbeddings = this.knowledgeBase.getDocuments().map((doc) => ({
      embedding: createEmbedding(doc.content),
      document: doc,
    }));

    const similarities = docEmbeddings.map((item) => ({
      document: item.document,
      similarity: this._cosineSimilarity(queryEmbedding, item.embedding),
    }));

    const topDocuments = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => item.document);

    // 3. Generate Intelligent Response
    const response = this._generateResponse(
      query,
      topDocuments,
      financialData,
      insights
    );

    return {
      response,
      sources: topDocuments,
      insights: insights.slice(0, 3), // Return top 3 insights for UI
      relevantMetrics: {
        totalBalance: financialData.summary.totalBalance,
        monthlyIncome: financialData.summary.monthlyIncome,
        monthlyExpenses: financialData.summary.monthlyExpenses,
        netFlow: financialData.summary.netFlow,
        topExpenseCategory: Object.entries(
          financialData.summary.expensesByCategory
        ).sort(([, a], [, b]) => b - a)[0]?.[0],
        healthScore: scores.healthScore,
      },
    };
  }

  private _cosineSimilarity(emb1: any, emb2: any): number {
    const allTerms = new Set([
      ...Object.keys(emb1.tfidf),
      ...Object.keys(emb2.tfidf),
    ]);

    let dotProduct = 0;
    let magnitude1 = 0; magnitude1; // avoid unused warning if needed
    let magnitude2 = 0;

    allTerms.forEach((term) => {
      const score1 = emb1.tfidf[term] || 0;
      const score2 = emb2.tfidf[term] || 0;

      dotProduct += score1 * score2;
      magnitude1 += score1 * score1;
      magnitude2 += score2 * score2;
    });

    const denominator = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private _generateResponse(
    query: string,
    documents: KnowledgeDocument[],
    financialData: UserFinancialData,
    insights: FinancialInsight[]
  ): string {
    const lowerQuery = query.toLowerCase();
    const { summary } = financialData;

    // A. Proactive/Urgent check
    if (lowerQuery.includes("devo me preocupar") || lowerQuery.includes("ajuda") || lowerQuery.includes("status")) {
      const urgent = insights.find(i => i.type === "URGENTE");
      if (urgent) {
        return `# ⚠️ Alerta Crítico\n\n${urgent.message}\n\n**Recomendação:** ${urgent.actionLabel}. Além disso, vi que ${documents[0]?.title || "planejamento"} pode ajudar.`;
      }
    }

    // B. Logic based on intent
    if (lowerQuery.includes("economiz") || lowerQuery.includes("reduz")) {
      const resp = this._generateExpenseOptimizationResponse(insights, summary.expensesByCategory, summary.monthlyExpenses);
      return resp + "\n\nEconomia: Identifiquei oportunidades para você poupar e reduzir sua despesa.";
    }

    if (lowerQuery.includes("receita") || lowerQuery.includes("aumentar") || lowerQuery.includes("ganhar")) {
      return `# 📈 Otimização de Receita\n\nIdentifiquei que sua receita este mês é de R$ ${summary.monthlyIncome.toFixed(2)}.\n\n**Sugestão:** Focar em ${documents[0]?.title || "diversificação de renda"}.\n\nVocê tem R$ ${summary.totalBalance.toFixed(2)} de saldo.`;
    }

    if (lowerQuery.includes("padrão") || lowerQuery.includes("comportamento")) {
      return `# 📊 Padrão de Gastos\n\nSeu padrão de gastos indica que ${Object.keys(summary.expensesByCategory)[0]} é sua maior categoria.\n\nInsight: ${insights[0]?.message || "Acompanhe seus limites de gastos mensalmente."}`;
    }

    if (lowerQuery.includes("dívida") || lowerQuery.includes("pendencia") || lowerQuery.includes("pendente")) {
      return `# 💸 Gestão de Dívidas e Pendências\n\nVocê tem R$ ${summary.pendingPayments.toFixed(2)} em pagamentos pendentes.\n\n**Ação:** Priorize o pagamento das despesas com maior juros. Veja mais em: ${documents[0]?.title || "gestão de caixa"}.`;
    }

    if (lowerQuery.includes("fluxo") || lowerQuery.includes("caixa")) {
      return `# 🌊 Fluxo de Caixa\n\nSeu fluxo este mês é de R$ ${summary.netFlow.toFixed(2)}. (Entradas - Saídas).\n\n**Status:** ${summary.netFlow >= 0 ? "Positivo" : "Negativo"}. Acompanhe seu ${documents[0]?.title || "fluxo de caixa"} diariamente.`;
    }

    if (lowerQuery.includes("saúde") || lowerQuery.includes("geral") || lowerQuery.includes("insights")) {
      const scores = cagEngine.calculateScores(financialData);
      return `# 🏥 Saúde Financeira: ${scores.healthScore.toFixed(0)}/100\n\nInsights capturados:\n${insights.map(i => `- **${i.title}**: ${i.message}`).join("\n")}\n\n**Dica:** Foque em resolver os itens URGENTES primeiro.`;
    }

    // Default: Combine Top Insight with Knowledge
    const topInsight = insights[0];
    const topDoc = documents[0];

    return `# 💡 Insights do Copiloto\n\n${topInsight ? `**${topInsight.title}**: ${topInsight.message}\n\n` : ""}Baseado na sua dúvida e nos seus dados, recomendo focar em: ${topDoc?.title || "organização financeira"}.\n\nVocê tem R$ ${summary.totalBalance.toFixed(2)} de saldo e seu fluxo este mês é de R$ ${summary.netFlow.toFixed(2)}.`;
  }

  private _generateExpenseOptimizationResponse(
    insights: FinancialInsight[],
    expensesByCategory: Record<string, number>,
    total: number
  ): string {
    const concentration = insights.find(i => i.id === "high-concentration");
    const topExpenses = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return `# 💰 Otimização de Gastos\n\n${concentration ? `### 🎯 Foco Principal\n${concentration.message}\n\n` : ""}### 📊 Seus 3 Maiores Gastos\n${topExpenses.map(([cat, val]) => `- **${cat}**: R$ ${val.toFixed(2)} (${((val/total)*100).toFixed(1)}%)`).join("\n")}\n\n**Ação sugerida:** Tente reduzir 10% na maior categoria para economizar R$ ${(topExpenses[0][1]*0.1).toFixed(2)} este mês.`;
  }
}

export const ragQueryEngine = new RAGQueryEngine();
