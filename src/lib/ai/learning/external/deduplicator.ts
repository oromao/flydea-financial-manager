import { logger } from "@/lib/logger";
import { ExtractedKnowledge } from "./knowledge-extractor";

const MIN_SIMILARITY_THRESHOLD = 0.7;
const WORD_SIMILARITY_THRESHOLD = 0.6;
const KNOWN_TERMS = new Set([
  "50/30/20", "reserva de emergência", "juros compostos", "bola de neve",
  "orçamento", "poupança", "score", "crédito", "dívida", "investimento",
  "fluxo de caixa", "controle financeiro", "planejamento", "meta"
]);

export class Deduplicator {
  /**
   * Check if candidate is duplicate of existing knowledge
   * Simplified version without external knowledge service dependency
   */
  async isDuplicate(candidate: ExtractedKnowledge): Promise<boolean> {
    try {
      const keywords = this.extractKeywords(candidate.content + " " + candidate.title);
      
      const knownMatches = keywords.filter(k => KNOWN_TERMS.has(k.toLowerCase()));
      if (knownMatches.length >= 3) {
        logger.info("Deduplicator: Contains known terms", {
          url: candidate.url,
          known: knownMatches.length
        });
        return true;
      }

      if (candidate.confidence < 40) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Deduplicator: Error checking duplicate", { error });
      return false;
    }
  }

  /**
   * Compare two candidates for similarity
   */
  areSimilar(candidate1: ExtractedKnowledge, candidate2: ExtractedKnowledge): boolean {
    const similarity = this.calculateSimilarity(
      candidate1.content,
      candidate2.content
    );

    if (similarity >= MIN_SIMILARITY_THRESHOLD) {
      return true;
    }

    const keywords1 = this.extractKeywords(candidate1.content);
    const keywords2 = this.extractKeywords(candidate2.content);

    const intersection = keywords1.filter(k => keywords2.includes(k));
    const union = new Set([...keywords1, ...keywords2]);

    const jaccardScore = intersection.length / union.size;

    return jaccardScore >= WORD_SIMILARITY_THRESHOLD;
  }

  /**
   * Get unique candidates from list
   */
  deduplicate(candidates: ExtractedKnowledge[]): ExtractedKnowledge[] {
    const unique: ExtractedKnowledge[] = [];
    const processed = new Set<string>();

    for (const candidate of candidates) {
      const key = candidate.url;
      if (processed.has(key)) continue;

      const isDuplicate = unique.some(
        existing => this.areSimilar(candidate, existing)
      );

      if (!isDuplicate) {
        unique.push(candidate);
        processed.add(key);
      }
    }

    logger.info("Deduplicator: Results", {
      total: candidates.length,
      unique: unique.length,
      removed: candidates.length - unique.length
    });

    return unique;
  }

  /**
   * Calculate string similarity using Levenshtein + token overlap
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const intersection = words1.filter(w => words2.includes(w));
    const union = new Set([...words1, ...words2]);

    const jaccard = intersection.length / union.size;

    const levenshtein = this.levenshteinSimilarity(text1, text2);

    return (jaccard + levenshtein) / 2;
  }

  /**
   * Calculate Levenshtein similarity
   */
  private levenshteinSimilarity(text1: string, text2: string): number {
    const s1 = text1.toLowerCase().slice(0, 100);
    const s2 = text2.toLowerCase().slice(0, 100);

    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 1; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLength = Math.max(s1.length, s2.length);

    return maxLength > 0 ? 1 - distance / maxLength : 0;
  }

  /**
   * Extract significant keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "o", "a", "os", "as", "um", "uma", "uns", "umas",
      "de", "da", "do", "das", "dos", "em", "na", "no",
      "nas", "nos", "para", "por", "pela", "pelo",
      "é", "são", "foi", "foram", "será", "serão",
      "que", "qual", "quem", "onde", "como", "quando",
      "e", "ou", "mas", "nem", "se", "sim", "não",
      "também", "ainda", "já", "muito", "pouco"
    ]);

    const words = text.toLowerCase()
      .replace(/[^a-záàâãéêíóôõúüç]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !stopWords.has(w));

    return Array.from(new Set(words));
  }

  /**
   * Get summary of deduplication
   */
  getSummary(
    candidates: ExtractedKnowledge[],
    unique: ExtractedKnowledge[]
  ): DeduplicationSummary {
    return {
      totalCandidates: candidates.length,
      uniqueCandidates: unique.length,
      duplicatesRemoved: candidates.length - unique.length,
      avgConfidence: unique.reduce((sum, c) => sum + c.confidence, 0) / unique.length,
      byCategory: this.groupByCategory(unique)
    };
  }

  private groupByCategory(candidates: ExtractedKnowledge[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    for (const c of candidates) {
      grouped[c.category] = (grouped[c.category] || 0) + 1;
    }

    return grouped;
  }
}

export interface DeduplicationSummary {
  totalCandidates: number;
  uniqueCandidates: number;
  duplicatesRemoved: number;
  avgConfidence: number;
  byCategory: Record<string, number>;
}

export const deduplicator = new Deduplicator();