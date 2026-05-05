import { CleanedContent } from "./content-cleaner";
import { logger } from "@/lib/logger";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  CASHFLOW: ["fluxo", "caixa", "receita", "despesa", "saldo"],
  BUDGET: ["orcamento", "planejamento", "gastar", "gasto", "categoria"],
  DEBT: ["divida", "juros", "emprestimo", "cartao", "parcelar"],
  SAVINGS: ["poupanca", "reserva", "economia", "guardar", "investir"],
  INVESTMENT: ["investimento", "renda fixa", "renda variavel", "fundo"],
  CREDIT: ["credito", "score", "serasa", "limite"],
  TAX: ["imposto", "IR", "IPTU", "taxa", "tributo"],
  PSYCHOLOGY: ["comportamento", "impulso", "decisao"],
  GOALS: ["meta", "objetivo", "sonho"]
};

export class KnowledgeExtractor {
  /**
   * Extract knowledge from cleaned content
   */
  extract(cleaned: CleanedContent): ExtractedKnowledge | null {
    try {
      const category = this.detectCategory(cleaned.content);
      const insights = this.extractInsights(cleaned);
      const tags = this.extractTags(cleaned.content, category);

      if (!category && !insights.length) {
        logger.warn("KnowledgeExtractor: No relevant knowledge found", {
          url: cleaned.url
        });
        return null;
      }

      const confidence = this.calculateConfidence(cleaned, category, insights);

      return {
        url: cleaned.url,
        domain: cleaned.domain,
        title: cleaned.title,
        category: category || "GENERAL",
        insights,
        tags,
        confidence,
        content: cleaned.content.slice(0, 2000),
        sourceTitle: cleaned.title,
        sourceDomain: cleaned.domain,
        extractedAt: new Date()
      };
    } catch (error) {
      logger.error("KnowledgeExtractor: Error extracting", {
        url: cleaned.url,
        error
      });
      return null;
    }
  }

  /**
   * Detect category based on content
   */
  private detectCategory(content: string): string | null {
    const scores: Record<string, number> = {};

    const lower = content.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      scores[category] = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, "gi");
        const matches = lower.match(regex);
        if (matches) {
          scores[category] += matches.length;
        }
      }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    if (sorted[0][1] >= 2) {
      return sorted[0][0];
    }

    return null;
  }

  /**
   * Extract simple insights using keyword matching
   */
  private extractInsights(cleaned: CleanedContent): ExtractedInsight[] {
    const insights: ExtractedInsight[] = [];
    const content = cleaned.content.toLowerCase();

    const keywordInsights = [
      { keywords: ["economize", "poupe"], insight: "Economize parte da renda", action: "Criar habito" },
      { keywords: ["reserva", "emergencia"], insight: "Mantenha reserva de emergencia", action: "Calcular reserva" },
      { keywords: ["divida", "juros"], insight: "quite dividas com juros altos primeiro", action: "Listar dividas" },
      { keywords: ["cartao", "credito"], insight: "Evite usar cartao rotativo", action: "Ver fatura" },
      { keywords: ["orcamento", "planejar"], insight: "Mantenha orcamento mensal", action: "Criar orcamento" },
      { keywords: ["investimento", "renda fixa"], insight: "Invista em renda fixa", action: "Ver opcoes" },
      { keywords: ["score", "serasa"], insight: "Mantenha score alto", action: "Melhorar score" }
    ];

    for (const ki of keywordInsights) {
      const found = ki.keywords.some(k => content.includes(k));
      if (found && insights.length < 3) {
        insights.push({
          insight: ki.insight,
          action: ki.action,
          source: cleaned.url
        });
      }
    }

    return insights;
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string, category: string | null): string[] {
    const tags = new Set<string>();

    if (category) tags.add(category.toLowerCase());

    const lower = content.toLowerCase();

    for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          tags.add(keyword.toLowerCase());
        }
      }
    }

    return Array.from(tags).slice(0, 10);
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    content: CleanedContent,
    category: string | null,
    insights: ExtractedInsight[]
  ): number {
    let score = 0;

    if (category) score += 15;

    if (content.cleanLength > 3000) score += 15;
    else if (content.cleanLength > 1500) score += 10;
    else score += 5;

    if (content.paragraphs > 5) score += 15;
    else if (content.paragraphs > 3) score += 10;
    else score += 5;

    for (const insight of insights) {
      score += 15;
      if (score >= 70) break;
    }

    return Math.min(score, 100);
  }
}

export interface ExtractedKnowledge {
  url: string;
  domain: string;
  title: string;
  category: string;
  insights: ExtractedInsight[];
  tags: string[];
  confidence: number;
  content: string;
  sourceTitle: string;
  sourceDomain: string;
  extractedAt: Date;
}

export interface ExtractedInsight {
  insight: string;
  action: string;
  source: string;
}

export interface KnowledgeNodeV2 {
  id: string;
  category: string;
  level: string;
  title: string;
  content: string;
  keywords: string[];
  action?: string;
  url?: string;
  confidence: number;
  source: string;
  extractedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export const knowledgeExtractor = new KnowledgeExtractor();