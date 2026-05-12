export const FINANCIAL_LABELS = {
  // Dashboard
  "saldo.disponivel": "Saldo disponível",
  "saldo.projetado": "Saldo projetado",
  "saldo.real": "Saldo real",
  
  // Transaction types
  "expense": "Despesa",
  "income": "Receita",
  "transfer": "Transferência",
  
  // Payment status
  "paid": "Pago",
  "pending": "Pendente",
  "overdue": "Vencido",
  "received": "Recebido",
  
  // Periods
  "this.month": "Este mês",
  "last.month": "Mês passado",
  "next.7.days": "Próximos 7 dias",
  
  // Actions
  "to.pay": "A pagar",
  "to.receive": "A receber",
  overdue2: "Vencido",
  paid2: "Pago",
  pending2: "Pendente",
  
  // Insights
  "savings.rate": "Taxa de economia",
  "budget.usage": "Uso do orçamento",
  "cash.flow": "Fluxo de caixa",
  
  // Categories
  "uncategorized": "Sem categoria",
  "other": "Outros",
  "food": "Alimentação",
  "transport": "Transporte",
  "housing": "Moradia",
  "health": "Saúde",
  "education": "Educação",
  "leisure": "Lazer",
  "services": "Serviços",
  "sales": "Vendas",
  "salary": "Salário",
};

export function formatMoney(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
  
  if (showSign && amount > 0) {
    return `+${formatted}`;
  }
  return formatted;
}

export function formatCompactMoney(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `R$ ${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `R$ ${(amount / 1000).toFixed(1)}K`;
  }
  return formatMoney(amount);
}

export function getPercentageLabel(percentage: number): string {
  if (percentage >= 100) {
    return "Acima do limite";
  }
  if (percentage >= 80) {
    return "Perto do limite";
  }
  return "Dentro do orçamento";
}

export function getHealthLabel(balance: number, expenses: number, income: number): {
  label: string;
  color: string;
} {
  if (balance < 0) {
    return { label: "Negativo", color: "text-destructive" };
  }
  if (income > 0 && expenses / income > 0.9) {
    return { label: "Atenção", color: "text-warning" };
  }
  if (income > 0 && expenses / income <= 0.7) {
    return { label: "Saudável", color: "text-success" };
  }
  return { label: "Estável", color: "text-primary" };
}