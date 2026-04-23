/**
 * Financial Knowledge Base
 * 
 * Centralizes financial tips, market context and best practices
 * to enrich AI responses with external knowledge.
 */

export interface KnowledgeNode {
  id: string;
  theme: "INVESTMENT" | "SAVINGS" | "TAX" | "PSYCHOLOGY" | "CASHFLOW" | "MINDSET" | "DEBT";
  title: string;
  content: string;
  keywords: string[];
  updatedAt: string;
}

export const initialKnowledge: KnowledgeNode[] = [
  {
    id: "kb-001",
    theme: "CASHFLOW",
    title: "Regra dos 50/30/20",
    content: "Divida sua renda em: 50% para necessidades básicas, 30% para desejos pessoais e 20% para poupança ou pagamento de dívidas.",
    keywords: ["dividir", "regra", "50/30/20", "porcentagem", "distribuição"],
    updatedAt: "2026-04-20"
  },
  {
    id: "kb-002",
    theme: "SAVINGS",
    title: "Reserva de Emergência",
    content: "O ideal é ter guardado entre 3 a 6 meses do seu custo de vida mensal em um investimento de alta liquidez.",
    keywords: ["emergência", "reserva", "guardar", "segurança", "liquidez"],
    updatedAt: "2026-04-21"
  },
  {
    id: "kb-003",
    theme: "INVESTMENT",
    title: "Juros Compostos",
    content: "O tempo é o fator mais importante no investimento. Começar cedo, mesmo com pouco, é melhor do que esperar ter muito para começar.",
    keywords: ["juros", "compostos", "investimento", "tempo", "multiplicar"],
    updatedAt: "2026-04-22"
  },
  {
    id: "kb-004",
    theme: "PSYCHOLOGY",
    title: "Gatilhos Mentais de Consumo",
    content: "Evite comprar por impulso identificando gatilhos de escassez e urgência em anúncios. Espere 24h antes de confirmar uma compra grande.",
    keywords: ["impulso", "comprar", "gatilhos", "psicologia", "esperar"],
    updatedAt: "2026-04-23"
  },
  {
    id: "kb-005",
    theme: "DEBT",
    title: "Efeito Bola de Neve",
    content: "Pague primeiro as dívidas com os juros mais altos. Isso reduzirá o montante total pago ao longo do tempo drasticamente.",
    keywords: ["dívida", "juros", "pagar", "atraso", "bola de neve"],
    updatedAt: "2026-04-23"
  }
];

export class KnowledgeService {
  /**
   * Performs a weighted keyword search to find relevant knowledge nodes.
   */
  async getRelevantNodes(query: string, limit = 3): Promise<KnowledgeNode[]> {
    const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const words = normalized.split(/\s+/).filter(w => w.length > 2);

    const scoredNodes = initialKnowledge.map(node => {
      let score = 0;
      
      const normalizedTitle = node.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedKeywords = node.keywords.map(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      const normalizedContent = node.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 1. Exact Phrases (Very High weight)
      if (normalizedTitle.includes(normalized)) score += 20;
      if (normalizedContent.includes(normalized)) score += 10;
      
      // 2. Keyword/Word Matches
      for (const keyword of normalizedKeywords) {
        if (words.includes(keyword)) {
          score += 15; // Exact word match
        } else if (normalized.includes(keyword)) {
          score += 5; // Substring match
        }
      }

      // 3. Theme Relevance
      if (normalized.includes(node.theme.toLowerCase())) score += 5;

      // 4. Term Frequency across content
      for (const word of words) {
        if (normalizedTitle.includes(word)) score += 2;
        if (normalizedContent.includes(word)) score += 0.5;
      }

      return { node, score };
    });

    const MIN_THRESHOLD = 8;

    return scoredNodes
      .filter(sn => sn.score >= MIN_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sn => sn.node);
  }

  async getAll(): Promise<KnowledgeNode[]> {
    return initialKnowledge;
  }
}

export const knowledgeService = new KnowledgeService();

