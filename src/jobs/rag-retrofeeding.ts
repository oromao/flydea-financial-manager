import { knowledgeBase } from "@/lib/rag/knowledge-base";
import type { KnowledgeDocument } from "@/lib/rag/knowledge-base";

const FINANCIAL_KNOWLEDGE_SOURCES = [
  {
    title: "Regra 50-30-20 na Prática",
    content: `A regra 50-30-20 é uma das estratégias mais simples e eficazes de orçamento pessoal.

Como funciona:
- 50% da receita vai para necessidades (moradia, alimentação, transporte, saúde)
- 30% vai para desejos (entretenimento, hobbies, refeições fora, roupas)
- 20% vai para objetivos financeiros (poupança, investimentos, pagamento de dívidas)

Exemplo prático:
Se você ganha R$ 3.000/mês:
- R$ 1.500 para necessidades
- R$ 900 para desejos
- R$ 600 para objetivos financeiros

Benefícios:
- Simples de acompanhar
- Balanceada entre necessidade, desejos e metas
- Permite crescimento patrimonial mesmo com salário modesto

Dica: Se suas necessidades excedem 50%, é hora de procurar maneiras de aumentar receita ou reduzir custos fixos.`,
    category: "budgeting" as const,
    tags: ["50-30-20", "orçamento", "regra"],
  },
  {
    title: "Ciclo de Vida Financeiro: Onde Você Está?",
    content: `Pessoas atravessam diferentes estágios financeiros. Conhecer seu estágio ajuda a tomar melhores decisões.

Estágio 1: Acúmulo (20-35 anos)
- Construir fundo de emergência
- Pagar dívidas (especialmente cartão de crédito)
- Começar a investir para aposentadoria
- Foco: disciplina e hábitos

Estágio 2: Consolidação (35-50 anos)
- Fundo de emergência completo
- Aumentar investimentos
- Planejamento de aposentadoria agressivo
- Possivelmente aumentar estilo de vida
- Foco: maximizar renda e retorno de investimentos

Estágio 3: Pré-aposentadoria (50-65 anos)
- Verificar se consegue se aposentar
- Consolidar investimentos
- Reduzir risco
- Começar a sacar aposentadoria
- Foco: segurança patrimonial

Estágio 4: Aposentadoria (65+ anos)
- Viver da renda de investimentos
- Passar herança para próximas gerações
- Foco: preservar capital

Qual é seu estágio? Suas decisões financeiras deveriam refletir seu estágio de vida.`,
    category: "general" as const,
    tags: ["ciclo-vida", "etapas", "aposentadoria"],
  },
  {
    title: "Investimento Inicial: Por Onde Começar",
    content: `Investir assusta muita gente, mas começar é mais fácil do que parece.

Pré-requisitos para investir:
1. Fundo de emergência completo (3-6 meses de despesas)
2. Sem dívidas de alto juro (cartão de crédito, empréstimo pessoal)
3. Receita consistente

Primeiros investimentos:

1. Tesouro Direto
- Títulos do governo brasileiro
- Rendimento garantido
- Sem taxas altas
- Bom começo para aprender

2. CDB (Certificado de Depósito Bancário)
- Oferecido por bancos
- Rentável (melhor que poupança)
- Seguro (até R$ 250 mil)

3. Fundo de Índice
- Diversificado
- Segue índices como Ibovespa
- Taxa baixa
- Bom para longo prazo

Quanto investir?
- Comece pequeno (R$ 100-500)
- Aumente gradualmente conforme aumenta confiança
- Objetivo: 10-20% da receita a longo prazo

Mentalidade correta:
- Investir é para longo prazo (5+ anos)
- Não tente "ficar rico rápido"
- Diversifique (não coloque tudo em um lugar)
- Educação financeira é seu melhor investimento`,
    category: "investments" as const,
    tags: ["investimento", "tesouro", "primeiros-passos"],
  },
  {
    title: "Negociação Financeira: Como Conseguir Descontos",
    content: `A maioria das pessoas não negocia suas contas. Essa é a maior deixa de dinheiro.

O que negociar:

1. Seguros (auto, saúde, residencial)
- Ligue com oferta de concorrente
- Peça desconto
- Cancele se não conseguir redução
- Economiza potencial: 10-30%

2. Internet e Telefone
- Pesquise planos da concorrência
- Ameace mudar
- Solicite desconto ou upgrade grátis
- Economiza potencial: 10-40%

3. Cartão de Crédito
- Peça redução de taxa de juros
- Solicite aumento de limite sem taxa
- Ameace migrar para outro banco
- Economiza potencial: 5-15%

4. Assinaturas
- Cancele serviços não usados
- Renegocie pacotes (ex: streaming)
- Busque planos compartilhados com amigos
- Economiza potencial: 20-100+

Como negociar bem:
1. Pesquise alternativas primeiro
2. Tenha confiança (eles querem manter você)
3. Seja educado mas firme
4. Esteja disposto a mudar
5. Faça por escrito (print da conversa)

Resultado: Uma pessoa média pode economizar R$ 300-500/mês apenas negociando.`,
    category: "expenses" as const,
    tags: ["negociação", "desconto", "economia"],
  },
  {
    title: "Planejamento Trimestral: Como Revisar Seu Progresso",
    content: `Revisar finanças a cada 3 meses ajuda a manter no caminho.

O Ciclo Trimestral:

Semana 1: Análise
- Calcule o fluxo de caixa do trimestre
- Compare com trimestre passado
- Identifique padrões (sazonalidade, gastos extras)
- Revise as metas definidas

Semana 2: Ajustes
- Qual categoria saiu do planejado?
- Que ações você pode tomar?
- Corte? Aumento de receita? Investimento?
- Atualize orçamento para próximo trimestre

Semana 3: Investimentos
- Você tem dinheiro extra?
- Aumentar fundo de emergência?
- Começar/aumentar investimentos?
- Pagar dívidas adiantado?

Semana 4: Planejamento
- Defina 3 objetivos para o próximo trimestre
- Que ações precisam ser tomadas?
- Como vai acompanhar?
- Comunique metas com família se necessário

Perguntas chave a cada trimestre:
- Minha receita aumentou ou diminuiu?
- Minhas despesas estão controladas?
- Estou no caminho para minhas metas?
- O que está funcionando? O que não está?

Uma revisão trimestral de 2 horas economiza centenas/meses.`,
    category: "budgeting" as const,
    tags: ["trimestral", "revisão", "planejamento"],
  },
  {
    title: "Psicologia do Gasto: Por Que Gastamos Demais",
    content: `Entender por que gastamos ajuda a controlar o gasto.

Razões psicológicas comuns:

1. Gasto Emocional
- Compra para se sentir melhor
- Ansiedade, estresse, tristeza disparam compras
- Solução: Identifique o gatilho emocional e ache alternativa

2. Comparação Social
- Vê outros gastando e quer fazer igual
- Redes sociais amplificam isso
- Solução: Redija tempo em redes sociais, lembre-se que vê apenas o melhor dos outros

3. Urgência Artificial
- "Promoção por tempo limitado"
- "Hoje é o último dia"
- "Black Friday"
- Solução: Espere 30 dias, pergunte se realmente precisa

4. Impulso e Disponibilidade
- Um produto na frente = compra
- Carrinho de compras fácil
- Solução: Liste antes de ir, use lista de desejos, espere 30 dias

5. Sunk Cost Fallacy
- "Já gastei tanto, por que parar?"
- Continua gastando para justificar gastos anteriores
- Solução: Reconheça que dinheiro anterior é perdido, foque no presente

Técnicas para controlar:

1. Sistema de 48 horas
- Qualquer compra não planejada espera 48 horas
- Se ainda quer depois, pode comprar

2. Pague em dinheiro
- Usar dinheiro dói mais que cartão
- Reduz compras impulsivas em até 50%

3. Visualize futuro
- Essa compra tira de que meta?
- Vale a pena?

4. Encontre substituto saudável
- Ao invés de comprar, faça algo que goste
- Caminhada, leitura, hobby

Lembre-se: Gastos impulsivos são a maior causa de dívida.`,
    category: "general" as const,
    tags: ["psicologia", "comportamento", "impulso"],
  },
];

export async function runRAGRetrofeeding(): Promise<{
  success: boolean;
  documentsAdded: number;
  totalDocuments: number;
}> {
  try {
    let documentsAdded = 0;
    const existingIds = new Set(
      knowledgeBase.getDocuments().map((doc) => doc.id)
    );

    FINANCIAL_KNOWLEDGE_SOURCES.forEach((source, index) => {
      const docId = `knowledge-${Date.now()}-${index}`;

      if (!existingIds.has(docId)) {
        const document: KnowledgeDocument = {
          id: docId,
          title: source.title,
          content: source.content,
          category: source.category,
          tags: source.tags,
          createdAt: new Date(),
        };

        knowledgeBase.addDocument(document);
        documentsAdded++;
      }
    });

    const totalDocuments = knowledgeBase.getDocuments().length;

    console.log(
      `[RAG Retrofeeding] Added ${documentsAdded} new documents. Total: ${totalDocuments}`
    );

    return {
      success: true,
      documentsAdded,
      totalDocuments,
    };
  } catch (error) {
    console.error("[RAG Retrofeeding Error]", error);
    return {
      success: false,
      documentsAdded: 0,
      totalDocuments: knowledgeBase.getDocuments().length,
    };
  }
}
