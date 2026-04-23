/**
 * Financial Knowledge Base
 * 
 * Centralizes financial tips, market context and best practices
 * to enrich AI responses with external knowledge.
 */

export interface KnowledgeNode {
  id: string;
  theme: "INVESTMENT" | "SAVINGS" | "TAX" | "PSYCHOLOGY" | "CASHFLOW";
  title: string;
  content: string;
  source?: string;
  updatedAt: string;
}

export const initialKnowledge: KnowledgeNode[] = [
  {
    id: "kb-001",
    theme: "CASHFLOW",
    title: "Regra dos 50/30/20",
    content: "Divida sua renda em: 50% para necessidades básicas, 30% para desejos pessoais e 20% para poupança ou pagamento de dívidas.",
    updatedAt: "2026-04-20"
  },
  {
    id: "kb-002",
    theme: "SAVINGS",
    title: "Reserva de Emergência",
    content: "O ideal é ter guardado entre 3 a 6 meses do seu custo de vida mensal em um investimento de alta liquidez.",
    updatedAt: "2026-04-21"
  },
  {
    id: "kb-003",
    theme: "INVESTMENT",
    title: "Juros Compostos",
    content: "O tempo é o fator mais importante no investimento. Começar cedo, mesmo com pouco, é melhor do que esperar ter muito para começar.",
    updatedAt: "2026-04-22"
  }
];

export class KnowledgeService {
  async getRelevantNodes(query: string): Promise<KnowledgeNode[]> {
    const lowerQuery = query.toLowerCase();
    return initialKnowledge.filter(node => 
      node.content.toLowerCase().includes(lowerQuery) || 
      node.title.toLowerCase().includes(lowerQuery) ||
      node.theme.toLowerCase().includes(lowerQuery)
    );
  }

  async getAll(): Promise<KnowledgeNode[]> {
    return initialKnowledge;
  }
}

export const knowledgeService = new KnowledgeService();
