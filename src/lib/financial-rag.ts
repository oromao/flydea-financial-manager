import { prisma } from "@/lib/prisma";

export interface UserFinancialData {
  userId: string;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
  }>;
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    category: string;
    paymentStatus: string;
  }>;
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netFlow: number;
    pendingPayments: number;
    expensesByCategory: Record<string, number>;
    incomeByCategory: Record<string, number>;
  };
}

export async function getUserFinancialData(
  userId: string
): Promise<UserFinancialData> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get accounts
  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
    },
  });

  // Get all transactions for analysis
  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  // Get monthly transactions
  const monthlyTransactions = allTransactions.filter((t) => {
    const date = new Date(t.date);
    return date >= monthStart && date <= monthEnd;
  });

  // Calculate summary
  const totalBalance = accounts.reduce(
    (sum, a) => sum + a.balance,
    0
  );

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = allTransactions
    .filter((t) => t.paymentStatus === "PENDING" && t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Categorize expenses and income
  const expensesByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  monthlyTransactions.forEach((t) => {
    const categoryName = t.category?.name || "Outros";
    if (t.type === "EXPENSE") {
      expensesByCategory[categoryName] =
        (expensesByCategory[categoryName] || 0) + t.amount;
    } else {
      incomeByCategory[categoryName] =
        (incomeByCategory[categoryName] || 0) + t.amount;
    }
  });

  return {
    userId,
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: a.balance,
    })),
    transactions: monthlyTransactions.map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type as "INCOME" | "EXPENSE",
      date: t.date.toISOString().split("T")[0],
      category: t.category?.name || "Outros",
      paymentStatus: t.paymentStatus,
    })),
    summary: {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      netFlow: monthlyIncome - monthlyExpenses,
      pendingPayments,
      expensesByCategory,
      incomeByCategory,
    },
  };
}

export function buildFinancialContext(
  financialData: UserFinancialData
): string {
  const { summary, accounts, transactions } = financialData;
  const { expensesByCategory, incomeByCategory } = summary;

  return `
# Contexto Financeiro do Usuário

## Resumo Financeiro
- **Patrimônio Total**: R$ ${summary.totalBalance.toFixed(2)}
- **Receita Mensal**: R$ ${summary.monthlyIncome.toFixed(2)}
- **Despesa Mensal**: R$ ${summary.monthlyExpenses.toFixed(2)}
- **Fluxo Líquido**: R$ ${summary.netFlow.toFixed(2)}
- **Contas a Pagar**: R$ ${summary.pendingPayments.toFixed(2)}

## Contas
${accounts
  .map(
    (a) =>
      `- ${a.name} (${a.type}): R$ ${a.balance.toFixed(2)}`
  )
  .join("\n")}

## Top Despesas (Este Mês)
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
  .join("\n")}

## Receitas por Categoria
${Object.entries(incomeByCategory)
  .map(([cat, val]) => `- ${cat}: R$ ${val.toFixed(2)}`)
  .join("\n") || "Nenhuma receita este mês"}

## Transações Recentes
${transactions
  .slice(0, 10)
  .map(
    (t) =>
      `- ${t.date}: ${t.type === "INCOME" ? "+" : "-"}R$ ${t.amount.toFixed(2)} - ${t.description} (${t.category})`
  )
  .join("\n")}
`;
}

export function buildRAGSystemPrompt(): string {
  return `Você é um especialista em finanças pessoais e planejamento financeiro.
Sua função é analisar dados financeiros do usuário e fornecer recomendações práticas e acionáveis.

IMPORTANTE:
- Analise os dados financeiros fornecidos
- Identifique padrões e oportunidades
- Forneça insights específicos baseados nos dados reais do usuário
- Sugira ações práticas para melhorar a saúde financeira
- Seja específico com números e percentuais
- Considere contexto de pessoa brasileira (em reais)
- Evite recomendações genéricas - tudo deve ser baseado nos dados do usuário

ANÁLISE ESPERADA:
1. Saúde Financeira Geral (Patrimônio, Fluxo, Liquidez)
2. Padrões de Gastos (Maiores despesas, tendências)
3. Oportunidades de Otimização (Onde cortar, como otimizar)
4. Previsões (Próximos 3 meses, considerando fluxo médio)
5. Recomendações Acionáveis (Passos específicos para melhorar)

Responda em português brasileiro, de forma clara e estruturada.`;
}
