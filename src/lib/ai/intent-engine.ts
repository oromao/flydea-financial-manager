export type UserIntent = "QUERY" | "INSIGHT" | "ACTION" | "HELP" | "UNKNOWN";

export interface IntentMatch {
  intent: UserIntent;
  confidence: number;
}

const INTENT_PATTERNS: Record<UserIntent, string[]> = {
  QUERY: [
    "saldo", "quanto tenho", "extrato", "gastei", "recebi", 
    "total", "contas", "faturamento", "lucro", "balanço",
    "valor", "transações", "movimentações", "pendente"
  ],
  INSIGHT: [
    "análise", "insight", "dica", "sugestão", "como economizar",
    "previsão", "futuro", "tendência", "padrão", "comportamento",
    "ajuda financeira", "melhorar", "gasto alto", "economizar"
  ],
  ACTION: [
    "pagar", "pagamento", "pago", "receber", "recebimento", "recebi",
    "editar", "excluir", "deletar", "criar", "lançar", "lançamento",
    "novo", "adicionar", "baixar", "upload", "importar"
  ],
  HELP: [
    "ajuda", "como funciona", "tutorial", "suporte", "dúvida",
    "guia", "manual", "o que é", "quem é você", "explicar"
  ],
  UNKNOWN: []
};

export class IntentEngine {
  /**
   * Classifies user query into an intent using a simple TF-IDF inspired approach.
   */
  classify(query: string): IntentMatch {
    const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const words = normalized.split(/\s+/);
    
    let bestIntent: UserIntent = "UNKNOWN";
    let maxScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_PATTERNS)) {
      if (intent === "UNKNOWN") continue;
      
      let score = 0;
      for (const keyword of keywords) {
        // Multi-word fuzzy match (e.g. "quanto tenho" matches "quanto eu tenho")
        const keywordWords = keyword.split(/\s+/);
        if (keywordWords.length > 1) {
          // All words of keyword must be present in query
          const allPresent = keywordWords.every(kw => normalized.includes(kw));
          if (allPresent) {
            score += 2.0;
          }
        } else if (normalized.includes(keyword)) {
          const isExact = words.includes(keyword);
          score += isExact ? 1.5 : 0.8;
        } else {
          // Simple stem matching
          const stem = keyword.length > 4 ? keyword.slice(0, -2) : keyword;
          if (normalized.includes(stem)) {
            score += 0.5;
          }
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as UserIntent;
      }
    }

    // Normalize confidence
    const confidence = Math.min(1, maxScore / 2);

    return {
      intent: maxScore > 0 ? bestIntent : "UNKNOWN",
      confidence: maxScore > 0 ? confidence : 0
    };
  }
}

export const intentEngine = new IntentEngine();
