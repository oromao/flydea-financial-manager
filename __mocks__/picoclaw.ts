export interface MockInsight {
  type: "spending_warning" | "saving_opportunity" | "trend" | "anomaly";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export const mockInsights: MockInsight[] = [
  {
    type: "spending_warning",
    title: "Gasto acima da média",
    description: "Seus gastos this month estão 15% acima da média dos últimos 3 meses",
    confidence: 0.85,
    actionable: true,
  },
  {
    type: "saving_opportunity",
    title: "Assinatura duplicada",
    description: "Você tem 2 cobranças de streaming similares",
    confidence: 0.92,
    actionable: true,
  },
  {
    type: "trend",
    title: "Gastos crescendo",
    description: "Seus gastos com alimentação aumentaram 20% comparado ao mês passado",
    confidence: 0.78,
    actionable: true,
  },
  {
    type: "anomaly",
    title: "Transação atípica",
    description: "Uma transação de R$ 500,00 foi identificada como atypica",
    confidence: 0.65,
    actionable: false,
  },
];

export async function analyzeTransactions(transactions: any[]): Promise<MockInsight[]> {
  return Promise.resolve(mockInsights);
}

export async function getSpendPrediction(transactions: any[]): Promise<{ predicted: number; confidence: number }> {
  return Promise.resolve({
    predicted: 3500,
    confidence: 0.75,
  });
}

export async function categorizeTransaction(description: string): Promise<{ category: string; confidence: number }> {
  return Promise.resolve({
    category: "Alimentação",
    confidence: 0.88,
  });
}

export const picoClawService = {
  analyzeTransactions,
  getSpendPrediction,
  categorizeTransaction,
};