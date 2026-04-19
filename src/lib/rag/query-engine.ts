import { createEmbedding, findMostSimilar } from "./embeddings";
import { knowledgeBase, KnowledgeDocument } from "./knowledge-base";
import type { UserFinancialData } from "@/lib/financial-rag";

export interface RAGResponse {
  response: string;
  sources: KnowledgeDocument[];
  relevantMetrics?: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netFlow: number;
    topExpenseCategory?: string;
  };
}

export class RAGQueryEngine {
  private knowledgeBase = knowledgeBase;

  processQuery(
    query: string,
    financialData: UserFinancialData,
    topK: number = 3
  ): RAGResponse {
    // Create embedding for user query
    const queryEmbedding = createEmbedding(query);

    // Create embeddings for all knowledge documents
    const docEmbeddings = this.knowledgeBase.getDocuments().map((doc) => ({
      embedding: createEmbedding(doc.content),
      document: doc,
    }));

    // Find most relevant documents
    const similarities = docEmbeddings.map((item) => ({
      document: item.document,
      similarity: this._cosineSimilarity(queryEmbedding, item.embedding),
    }));

    const topDocuments = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => item.document);

    // Generate response based on query type and financial data
    const response = this._generateResponse(
      query,
      topDocuments,
      financialData
    );

    return {
      response,
      sources: topDocuments,
      relevantMetrics: {
        totalBalance: financialData.summary.totalBalance,
        monthlyIncome: financialData.summary.monthlyIncome,
        monthlyExpenses: financialData.summary.monthlyExpenses,
        netFlow: financialData.summary.netFlow,
        topExpenseCategory: Object.entries(
          financialData.summary.expensesByCategory
        ).sort(([, a], [, b]) => b - a)[0]?.[0],
      },
    };
  }

  private _cosineSimilarity(emb1: any, emb2: any): number {
    const allTerms = new Set([
      ...Object.keys(emb1.tfidf),
      ...Object.keys(emb2.tfidf),
    ]);

    let dotProduct = 0;
    let magnitude1 = 0;
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
    financialData: UserFinancialData
  ): string {
    const lowerQuery = query.toLowerCase();
    const { summary, transactions, accounts } = financialData;
    const {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netFlow,
      pendingPayments,
      expensesByCategory,
    } = summary;

    // Detect query intent
    if (
      lowerQuery.includes("economiz") ||
      lowerQuery.includes("reduz") ||
      lowerQuery.includes("cortar")
    ) {
      return this._generateExpenseOptimizationResponse(
        documents,
        expensesByCategory,
        monthlyExpenses
      );
    }

    if (
      lowerQuery.includes("receita") ||
      lowerQuery.includes("renda") ||
      lowerQuery.includes("aument")
    ) {
      return this._generateIncomeResponse(documents, monthlyIncome, netFlow);
    }

    if (
      lowerQuery.includes("fluxo") ||
      lowerQuery.includes("caixa") ||
      lowerQuery.includes("projeç")
    ) {
      return this._generateCashFlowResponse(
        documents,
        monthlyIncome,
        monthlyExpenses,
        netFlow,
        transactions
      );
    }

    if (
      lowerQuery.includes("padrão") ||
      lowerQuery.includes("gasto") ||
      lowerQuery.includes("despesa")
    ) {
      return this._generateSpendingPatternResponse(
        documents,
        expensesByCategory,
        monthlyExpenses
      );
    }

    if (
      lowerQuery.includes("dívida") ||
      lowerQuery.includes("pendente") ||
      lowerQuery.includes("vencer")
    ) {
      return this._generateDebtResponse(documents, pendingPayments);
    }

    if (
      lowerQuery.includes("saúde") ||
      lowerQuery.includes("situação") ||
      lowerQuery.includes("geral")
    ) {
      return this._generateHealthCheckResponse(
        documents,
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netFlow,
        accounts
      );
    }

    // Default: combine knowledge with basic recommendations
    return this._generateGeneralResponse(documents, financialData);
  }

  private _generateExpenseOptimizationResponse(
    documents: KnowledgeDocument[],
    expensesByCategory: Record<string, number>,
    monthlyExpenses: number
  ): string {
    const topExpenses = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topExpensesText = topExpenses
      .map(
        ([cat, val]) =>
          `- ${cat}: R$ ${val.toFixed(2)} (${((val / monthlyExpenses) * 100).toFixed(1)}%)`
      )
      .join("\n");

    const knowledge = documents[0]?.content || "";

    return `# 💰 Oportunidades de Economia

Analisando seus gastos, identifiquei as principais áreas onde você pode economizar:

## Suas Maiores Despesas
${topExpensesText}

## Recomendações Específicas para Você

${topExpenses[0] ? `1. **${topExpenses[0][0]}** é sua maior despesa. Mesmo uma redução de 10% geraria R$ ${(topExpenses[0][1] * 0.1).toFixed(2)} em economia mensal.` : ""}

${topExpenses[1] ? `2. **${topExpenses[1][0]}** é a segunda. Considere revisar as opções disponíveis nesta categoria.` : ""}

3. Use a estratégia 80/20: foque em seus 3 maiores gastos para impacto máximo.

## Próximos Passos
- Negocie contratos (telefone, internet, seguros)
- Cancele assinaturas não usadas
- Revise compras recorrentes

Com essas mudanças, você poderia aumentar suas economias em ${(topExpenses.slice(0, 3).reduce((sum, [, val]) => sum + val * 0.1, 0)).toFixed(2)}/mês.`;
  }

  private _generateIncomeResponse(
    documents: KnowledgeDocument[],
    monthlyIncome: number,
    netFlow: number
  ): string {
    const incomeDoc = documents.find((d) => d.category === "income");

    if (netFlow < 0) {
      return `# 📈 Estratégia de Aumento de Renda

Sua receita atual de R$ ${monthlyIncome.toFixed(2)} está sendo superada pelas despesas. Aumentar renda é uma opção viável.

## Sua Situação
- Receita mensal: R$ ${monthlyIncome.toFixed(2)}
- Déficit: R$ ${Math.abs(netFlow).toFixed(2)}

## Opções Rápidas (1-3 meses)
1. Trabalho freelancer em sua área
2. Venda de itens não utilizados
3. Trabalho temporário ou sazonal
4. Aluguel de espaço (quarto, garagem)

## Opções Médias (3-12 meses)
1. Pedir aumento ao empregador
2. Buscar novo emprego com melhor salário
3. Desenvolver habilidade para freelancing
4. Criar renda complementar (blog, ebook)

## Recomendação
Comece com uma opção rápida enquanto trabalha em soluções médias. Um aumento de 20% na sua receita resolveria completamente o problema de fluxo.`;
    }

    return `# 📈 Otimização de Renda

Com um fluxo mensal positivo de R$ ${netFlow.toFixed(2)}, você está em boa posição. Agora é hora de amplificar ganhos.

## Sua Situação Atual
- Receita: R$ ${monthlyIncome.toFixed(2)}
- Fluxo positivo: R$ ${netFlow.toFixed(2)}

## Próximos Passos
1. Mantenha seu fluxo positivo enquanto explora oportunidades
2. Invista em desenvolvimento de habilidades
3. Considere freelancing em sua área
4. Após 6 meses de disciplina, considere investimentos

## Mentalidade
Sua receita é como uma semente - quanto mais você cuida, mais ela cresce. Pequenos ganhos extras somados criam mudanças significativas.`;
  }

  private _generateCashFlowResponse(
    documents: KnowledgeDocument[],
    monthlyIncome: number,
    monthlyExpenses: number,
    netFlow: number,
    transactions: any[]
  ): string {
    const flowStatus =
      netFlow > 0
        ? "✅ POSITIVO"
        : netFlow < 0
          ? "⚠️ NEGATIVO"
          : "⚪ EQUILIBRADO";

    const recentTransactions = transactions.slice(0, 5);
    const avgTransactionAmount =
      transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length || 0;

    return `# 📊 Análise de Fluxo de Caixa

## Status Atual
**Fluxo: ${flowStatus}**

- Receita: R$ ${monthlyIncome.toFixed(2)}
- Despesas: R$ ${monthlyExpenses.toFixed(2)}
- Resultado: R$ ${netFlow.toFixed(2)}

## Interpretação
${
  netFlow > 0
    ? `Você está em uma posição saudável! Cada mês sobram R$ ${netFlow.toFixed(2)} para economizar ou investir.`
    : `Suas despesas estão excedendo a receita em R$ ${Math.abs(netFlow).toFixed(2)}/mês. Isso é insustentável a longo prazo.`
}

## Tendências Recentes
- Ticket médio das transações: R$ ${avgTransactionAmount.toFixed(2)}
- Últimas 5 transações: ${recentTransactions.length} movimentações

## Recomendações

${
  netFlow > 0
    ? `1. **Mantenha a disciplina**: Continue no seu padrão atual
2. **Aumente as economias**: Direcione o excedente para fundo emergencial
3. **Monitore mês a mês**: Fluxo de caixa pode variar (férias, 13º, etc)`
    : `1. **Ação urgente**: Você está deficitário, precisa aumentar receita ou reduzir despesas
2. **Identifique cortes**: Quais despesas podem ser eliminadas?
3. **Aumente receita**: Trabalho extra, freelancing, ou buscar melhor salário
4. **Próximos 30 dias**: Implemente pelo menos 2 ações`
}

## Previsão Próximos 3 Meses
Com o fluxo atual, seu saldo ${netFlow > 0 ? "aumentará" : "diminuirá"} em ${Math.abs(netFlow * 3).toFixed(2)} nos próximos 3 meses.`;
  }

  private _generateSpendingPatternResponse(
    documents: KnowledgeDocument[],
    expensesByCategory: Record<string, number>,
    totalExpenses: number
  ): string {
    const sorted = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const categoryBreakdown = sorted
      .map(
        ([cat, val]) =>
          `- **${cat}**: R$ ${val.toFixed(2)} (${((val / totalExpenses) * 100).toFixed(1)}%)`
      )
      .join("\n");

    return `# 📈 Padrão de Gastos

## Distribuição de Despesas
${categoryBreakdown}

## Análise
Seus gastos estão distribuídos em suas principais categorias. A maioria do seu dinheiro vai para:

1. **${sorted[0]?.[0] || "Categoria principal"}**: Sua maior categoria de gasto
2. **${sorted[1]?.[0] || "Categoria secundária"}**: Segunda maior
3. **Outras**: Distribuído entre as demais

## Insights
- Você tem ${Object.keys(expensesByCategory).length} categorias de gasto
- Despesa total mensal: R$ ${totalExpenses.toFixed(2)}
- Gastos concentrados: ${sorted[0] ? ((sorted[0][1] / totalExpenses) * 100).toFixed(1) : "N/A"}% na categoria principal

## Próximas Ações
1. Compare este mês com o anterior - há mudanças significativas?
2. Identifique gastos sazonais (energia no verão, aquecimento no inverno)
3. Revise a categoria maior - há oportunidade de redução?

Padrões consistentes ajudam a fazer orçamentos melhores e identificar anomalias rapidamente.`;
  }

  private _generateDebtResponse(
    documents: KnowledgeDocument[],
    pendingPayments: number
  ): string {
    const hasDebt = pendingPayments > 0;

    return `# 💳 Análise de Dívidas

## Sua Situação
${
  hasDebt
    ? `Contas a pagar: **R$ ${pendingPayments.toFixed(2)}**

### Status: ⚠️ ATENÇÃO NECESSÁRIA

Você tem ${pendingPayments > 0 ? "dívidas vencidas ou próximas" : "contas pendentes"}.

## Ações Imediatas
1. **Organize por vencimento**: Quais vencem primeiro?
2. **Priorize pagamento**: Pague contas de alto juro primeiro
3. **Comunique-se**: Se não conseguir pagar, negocie antes da data de vencimento
4. **Prevent futuras**: Implemente sistema de alertas com 5 dias antes do vencimento

## Estratégia
- Use método Bola de Neve: pague o mínimo em todas, concentre no vencimento mais próximo
- Negocie prazos: muitas empresas aceitam parcelar sem juros extras
- Evite novos débitos: pare de gastar em crédito até quitar`
    : `✅ Excelente! Você não tem contas a pagar no momento.

## Mantenha Assim
1. Configure alertas para datas de vencimento
2. Procure pagar à vista quando possível (evita juros)
3. Se usar crédito, pague integral no vencimento
4. Reserve fundo de emergência para evitar dívidas futuras

## Próximo Nível
Com zero dívidas, você está em posição ideal para:
- Construir fundo de emergência mais robusto
- Investir para longo prazo
- Buscar melhor qualidade de vida com segurança financeira`
}`;
  }

  private _generateHealthCheckResponse(
    documents: KnowledgeDocument[],
    totalBalance: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    netFlow: number,
    accounts: any[]
  ): string {
    let healthScore = 0;
    let feedback = [];

    // Check balance
    if (totalBalance > monthlyExpenses * 3) {
      healthScore += 30;
      feedback.push(
        "✅ Fundo de emergência saudável (3+ meses de despesas)"
      );
    } else if (totalBalance > monthlyExpenses) {
      healthScore += 20;
      feedback.push(
        "⚠️ Fundo de emergência em desenvolvimento (1-3 meses)"
      );
    } else {
      feedback.push("🔴 Fundo de emergência insuficiente (< 1 mês)");
    }

    // Check flow
    if (netFlow > monthlyIncome * 0.1) {
      healthScore += 30;
      feedback.push("✅ Fluxo de caixa positivo robusto (>10% receita)");
    } else if (netFlow > 0) {
      healthScore += 15;
      feedback.push("⚠️ Fluxo de caixa positivo, mas pequeno (<10%)");
    } else {
      feedback.push("🔴 Fluxo de caixa negativo - situação crítica");
    }

    // Check expense ratio
    const expenseRatio = monthlyExpenses / monthlyIncome;
    if (expenseRatio < 0.5) {
      healthScore += 25;
      feedback.push(
        "✅ Despesas bem controladas (<50% da receita)"
      );
    } else if (expenseRatio < 0.8) {
      healthScore += 15;
      feedback.push(
        "⚠️ Despesas moderadas (50-80% da receita)"
      );
    } else {
      feedback.push("🔴 Despesas altas (>80% da receita)");
    }

    // Check accounts diversity
    if (accounts.length > 1) {
      healthScore += 15;
      feedback.push(
        "✅ Múltiplas contas (melhor organização)"
      );
    } else {
      feedback.push("⚠️ Considere múltiplas contas para organização");
    }

    return `# 🏥 Check-up Financeiro

## Saúde Geral: ${healthScore}/100
${
  healthScore >= 80
    ? "🟢 Excelente"
    : healthScore >= 60
      ? "🟡 Bom"
      : "🔴 Precisa de atenção"
}

## Indicadores
${feedback.join("\n")}

## Números Chave
- **Saldo Total**: R$ ${totalBalance.toFixed(2)}
- **Receita Mensal**: R$ ${monthlyIncome.toFixed(2)}
- **Despesas Mensais**: R$ ${monthlyExpenses.toFixed(2)}
- **Fluxo Líquido**: R$ ${netFlow.toFixed(2)}
- **Contas**: ${accounts.length}

## Próximos Passos
${
  healthScore >= 80
    ? `1. Mantenha a disciplina atual
2. Explore investimentos para fazer dinheiro trabalhar
3. Revise metas anuais`
    : healthScore >= 60
      ? `1. Identifique a área crítica acima
2. Foque em resolver uma coisa por vez
3. Revise em 30 dias`
      : `1. URGENTE: Enfrente o fluxo negativo em 30 dias
2. Corte despesas ou aumente receita imediatamente
3. Fale com profissional se precisar de ajuda`
}

Lembre-se: Saúde financeira é um processo contínuo, não um destino.`;
  }

  private _generateGeneralResponse(
    documents: KnowledgeDocument[],
    financialData: UserFinancialData
  ): string {
    const { summary } = financialData;
    const topDoc = documents[0];

    return `# 💡 Insights Financeiros

${topDoc ? `## Tema do Mês: ${topDoc.title}\n${topDoc.content.split("\n").slice(0, 5).join("\n")}` : ""}

## Sua Situação Atual
- Patrimônio: R$ ${summary.totalBalance.toFixed(2)}
- Fluxo mensal: R$ ${summary.netFlow.toFixed(2)}
- Contas a pagar: R$ ${summary.pendingPayments.toFixed(2)}

## Recomendação
${
  summary.netFlow > 0
    ? "Você está indo bem! Continue economizando consistentemente e aumente o fundo de emergência."
    : "Sua situação atual requer ajustes. Foco em aumentar receita ou reduzir despesas."
}

Faça perguntas específicas sobre economia, fluxo de caixa, estratégias de renda, ou padrões de gastos!`;
  }
}

export const ragQueryEngine = new RAGQueryEngine();
