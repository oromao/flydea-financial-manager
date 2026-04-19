export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: 'budgeting' | 'cash-flow' | 'expenses' | 'income' | 'investments' | 'emergency' | 'debt' | 'general';
  tags: string[];
  createdAt: Date;
}

const INITIAL_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  {
    id: 'budget-basics',
    title: 'Fundamentos do Orçamento Pessoal',
    content: `Um orçamento é um plano financeiro que mostra onde seu dinheiro vem e para onde vai.

Os principais passos para criar um orçamento efetivo são:
1. Liste todas as suas receitas mensais
2. Liste todas as suas despesas mensais
3. Compare receita com despesa
4. Se a despesa excede a receita, identifique onde cortar
5. Revise e ajuste mensalmente

A regra 50/30/20 é um bom ponto de partida:
- 50% para necessidades (aluguel, comida, transporte)
- 30% para desejos (entretenimento, hobbies)
- 20% para economia e pagamento de dívidas

Dica: Comece pelo maior item de despesa. Se você reduzir isso em 10%, terá um impacto imediato.`,
    category: 'budgeting',
    tags: ['orçamento', 'planejamento', 'básico'],
    createdAt: new Date(),
  },
  {
    id: 'emergency-fund',
    title: 'Fundo de Emergência: Sua Rede de Segurança Financeira',
    content: `Um fundo de emergência é dinheiro guardado para situações inesperadas como perda de emprego ou despesas médicas.

Quanto guardar?
- Fase 1: R$ 1.000 (começo da jornada)
- Fase 2: 3 meses de despesas essenciais
- Fase 3: 6 meses de despesas essenciais (ideal)

Como construir:
1. Abra uma conta separada (não use para despesas do dia a dia)
2. Depósitos automáticos de 10-15% do seu salário
3. Quando receber bônus ou ganho extra, coloque lá
4. Use APENAS em emergências reais

Benefícios:
- Reduz estresse financeiro
- Permite tomar melhores decisões (não precisa aceitar qualquer emprego por desespero)
- Evita dívidas em juros altos

Lembre-se: Um fundo de emergência não é luxo, é essencial.`,
    category: 'emergency',
    tags: ['fundo-emergência', 'poupança', 'segurança'],
    createdAt: new Date(),
  },
  {
    id: 'expense-categories',
    title: 'Como Categorizar Despesas Corretamente',
    content: `Categorizar despesas ajuda a entender para onde seu dinheiro vai e onde economizar.

Categorias principais:
- Moradia: aluguel, hipoteca, condomínio, IPTU
- Utilidades: água, luz, internet, gás
- Alimentação: supermercado, restaurantes
- Transporte: combustível, transporte público, seguro
- Saúde: medicamentos, consultas, academia
- Educação: cursos, livros
- Seguros: saúde, carro, vida
- Diversão: cinema, viagens, hobbies
- Dívidas: empréstimos, cartão de crédito

Por que é importante?
1. Visibilidade: você vê exatamente onde vai seu dinheiro
2. Padrões: identifica gastos recorrentes desnecessários
3. Otimização: prioriza cortes nos itens que podem impactar mais

Dica de implementação:
- Use consistência: mesmas categorias todos os meses
- Revise semanalmente para capturar tudo
- Compare mês com mês para ver tendências`,
    category: 'expenses',
    tags: ['categorias', 'despesas', 'organização'],
    createdAt: new Date(),
  },
  {
    id: 'reduce-expenses-strategy',
    title: 'Estratégias Comprovadas para Reduzir Despesas',
    content: `Aqui estão as estratégias mais eficazes para cortar gastos sem sacrificar qualidade de vida:

Abordagem 80/20: Foque nas 20% de despesas que representam 80% do gasto
1. Identifique seus 3 maiores gastos
2. Negocie cada um deles
3. Mesmo 10% de redução em cada = 3% do orçamento total economizado

Estratégias rápidas (implementar em 1 semana):
- Cancelar assinaturas não usadas
- Pedir desconto em seguros e serviços
- Usar aplicativos de cashback
- Comprar genéricos em vez de marcas

Estratégias médias (implementar em 1 mês):
- Mudar de plano de dados/internet
- Reduzir consumo de energia (LED, ar-condicionado inteligente)
- Cozinhar em casa mais frequentemente
- Usar transporte público em dias específicos

Estratégias grandes (implementar em 3 meses):
- Renegociar aluguel ou mudança
- Otimizar seguro do carro (cobertura menor, franquia maior)
- Refinanciar dívidas em juros altos
- Encontrar emprego com salário maior

Lembre-se: Pequenos cortes consistentes superam grandes sacrifícios ocasionais.`,
    category: 'expenses',
    tags: ['redução', 'economia', 'gastos'],
    createdAt: new Date(),
  },
  {
    id: 'cash-flow-basics',
    title: 'Fluxo de Caixa: O Pulso da Sua Vida Financeira',
    content: `Fluxo de caixa é a circulação de dinheiro: quanto entra, quanto sai e quando.

Por que é importante?
- Você pode ser lucrativo mas falir (sem dinheiro na hora certa)
- Ajuda a antecipar problemas
- Permite planejamento melhor

Como calculá-lo:
Fluxo Líquido = Receitas do Mês - Despesas do Mês

Interpretação:
- Fluxo positivo (receita > despesa): Você está economizando
- Fluxo negativo (despesa > receita): Você está usando poupança ou endividando
- Fluxo zero: Está equilibrado (mas sem economizar)

Análise de padrões:
1. Calcule o fluxo dos últimos 3 meses
2. Identifique o padrão (sazonal? consistente?)
3. Preveja os próximos 3 meses baseado no padrão
4. Ajuste despesas para manter fluxo positivo

Dica: Meses com fluxo negativo (férias, Natal) devem ser compensados por meses com fluxo muito positivo.`,
    category: 'cash-flow',
    tags: ['fluxo-caixa', 'receita', 'planejamento'],
    createdAt: new Date(),
  },
  {
    id: 'income-optimization',
    title: 'Aumentar Renda: Quando e Como',
    content: `Às vezes, cortar gastos não é suficiente. Aumentar renda é a solução.

Quando aumentar renda?
- Você já cortou tudo que pode cortar
- Seu fluxo está negativo mesmo após otimizações
- Você quer acelerar metas financeiras

Opções de aumento de renda:

Curto prazo (1-3 meses):
- Trabalho freelancer ou gig economy
- Vender coisas que não usa mais
- Trabalho temporário/sazonal
- Aluguel de quarto/garagem

Médio prazo (3-12 meses):
- Pedir aumento ou bônus
- Mudar para emprego melhor remunerado
- Desenvolver habilidade valiosa para freelancing
- Criar renda passiva (blog, ebook)

Longo prazo (1+ anos):
- Educação/certificações para carreira melhor
- Empreendedorismo
- Investimentos (juros, dividendos)
- Aposentadoria do trabalho anterior (renda de pensão)

Análise custo-benefício:
- Quanto você ganha vs quanto tempo investe?
- Vale a pena 10 horas extras por semana por 30% a mais de renda?
- Considere o cansaço e qualidade de vida`,
    category: 'income',
    tags: ['renda', 'aumento', 'oportunidades'],
    createdAt: new Date(),
  },
  {
    id: 'debt-management',
    title: 'Gestão Inteligente de Dívidas',
    content: `Nem toda dívida é ruim, mas dívidas de alto juro destroem patrimônio.

Classificação de dívidas:
Boas (juros baixos):
- Hipoteca (financiamento de casa)
- Financiamento de carro (juros moderados)

Ruins (juros altos):
- Cartão de crédito (15-20% ao mês!)
- Cheque especial
- Empréstimo pessoal sem garantia
- Compra parcelada em loja

Estratégias de pagamento:

Método Avalanche (mais rápido economicamente):
1. Pague o mínimo em todas
2. Todo dinheiro extra vai para dívida de maior juros
3. Quando essa zera, ataque a próxima

Método Bola de Neve (psicologicamente motivador):
1. Pague o mínimo em todas
2. Todo dinheiro extra vai para dívida menor
3. Ao zerar, o momento psicológico ajuda a continuar

Negociação:
- Ligue e peça redução de juros
- Ofereça pagar à vista com desconto
- Consolide dívidas em uma só com juros menores

Nunca:
- Contratar outra dívida para pagar dívida
- Ignorar dívida (juros continuam)
- Parcelar dívida de forma irresponsável`,
    category: 'debt',
    tags: ['dívida', 'crédito', 'juros'],
    createdAt: new Date(),
  },
  {
    id: 'savings-strategy',
    title: 'Estratégia de Poupança Progressiva',
    content: `Poupar é construir o seu futuro. Aqui está como fazer de forma consistente.

Princípio fundamental:
Pague-se primeiro: Separe o dinheiro para poupar ANTES de gastar

Plano de 3 fases:

Fase 1: Foundation (0-6 meses)
- Meta: 5-10% da receita
- Objetivo: Fundo de emergência de R$ 1.000
- Abra conta separada, configure depósito automático
- Se não conseguir 10%, comece com 5%

Fase 2: Acceleration (6-24 meses)
- Meta: 15-20% da receita
- Objetivo: Fundo de emergência 3-6 meses
- Explore investimentos simples (CDB, Tesouro)
- Mantenha disciplina

Fase 3: Multiplication (24+ meses)
- Meta: 20-30% da receita
- Objetivo: Multiplicar patrimônio
- Invista em ações, fundos, imóveis
- Pense em aposentadoria

Dicas práticas:
1. Automação é tudo: depósitos automáticos são mais eficazes
2. Aumente gradualmente: quando receber aumento, aumente poupança também
3. Rastreie o progresso: veja o dinheiro crescer é motivador
4. Diversifique: não guarde tudo em uma conta corrente

Lembre-se: Não é sobre quanto você ganha, é sobre quanto você economiza.`,
    category: 'budgeting',
    tags: ['poupança', 'economia', 'disciplina'],
    createdAt: new Date(),
  },
  {
    id: 'financial-health-check',
    title: 'Check-up Financeiro Mensal: O que Revisar',
    content: `Dedique 30 minutos por mês para revisar sua saúde financeira.

O que revisar:

1. Receita Real vs Planejada
- Você recebeu o que esperava?
- Teve receita extra?
- Alguma receita esperada não chegou?

2. Despesas por Categoria
- Qual categoria foi maior?
- Houve gastos inesperados?
- Onde você consegue economizar?

3. Fluxo de Caixa
- Receita - Despesa = quanto?
- Acumulado nos últimos 3 meses?
- Tendência positiva ou negativa?

4. Saldo de Contas
- Contas crescendo ou diminuindo?
- Poupança aumentou?

5. Dívidas
- Total de dívidas diminuiu?
- Juros estão altos?
- Precisa renegociar?

6. Metas Financeiras
- Está no caminho para a meta?
- Precisa ajustar o plano?

Documento útil:
Crie uma planilha com:
- Data
- Receita total
- Despesa total
- Fluxo líquido
- Saldo total
- Dívidas totais
- Notas/observações

Use dados históricos para ver progressão e ajustar estratégia.`,
    category: 'general',
    tags: ['análise', 'revisão', 'planejamento'],
    createdAt: new Date(),
  },
];

export class KnowledgeBase {
  private documents: KnowledgeDocument[] = INITIAL_KNOWLEDGE_BASE;

  getDocuments(): KnowledgeDocument[] {
    return this.documents;
  }

  addDocument(doc: KnowledgeDocument): void {
    const exists = this.documents.some(d => d.id === doc.id);
    if (!exists) {
      this.documents.push(doc);
    }
  }

  getDocumentsByCategory(category: KnowledgeDocument['category']): KnowledgeDocument[] {
    return this.documents.filter(doc => doc.category === category);
  }

  getDocumentsByTag(tag: string): KnowledgeDocument[] {
    return this.documents.filter(doc =>
      doc.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  searchDocuments(query: string): KnowledgeDocument[] {
    const lowerQuery = query.toLowerCase();
    return this.documents.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}

export const knowledgeBase = new KnowledgeBase();
