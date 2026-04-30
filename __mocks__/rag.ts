export interface MockDocument {
  id: string;
  content: string;
  source: string;
  relevance: number;
}

export const mockKnowledgeBase: MockDocument[] = [
  {
    id: "doc-1",
    content: "Para calcular o saldo final, some todas as receitas e subtraia todas as despesas do período.",
    source: "Financial Guide",
    relevance: 0.95,
  },
  {
    id: "doc-2",
    content: "Transações recorrentes são lançadas automaticamente pelo sistema de cron todas as manhãs às 6h.",
    source: "System Docs",
    relevance: 0.88,
  },
  {
    id: "doc-3",
    content: "Para exportar relatórios, vá em Relatórios > Exportar e escolha o formato (CSV, PDF, XLSX).",
    source: "User Guide",
    relevance: 0.82,
  },
];

export async function searchKnowledgeBase(query: string, limit?: number): Promise<MockDocument[]> {
  const results = mockKnowledgeBase
    .map(doc => ({
      ...doc,
      relevance: Math.random() * 0.3 + 0.7,
    }))
    .sort((a, b) => b.relevance - a.relevance);
  
  return limit ? results.slice(0, limit) : results;
}

export async function getContextForQuery(query: string): Promise<string> {
  const docs = await searchKnowledgeBase(query, 3);
  return docs.map(d => d.content).join("\n\n");
}

export async function addDocumentToKnowledgeBase(content: string, source: string): Promise<string> {
  const id = `doc-${Date.now()}`;
  mockKnowledgeBase.push({ id, content, source, relevance: 1.0 });
  return id;
}

export const ragService = {
  search: searchKnowledgeBase,
  getContext: getContextForQuery,
  addDocument: addDocumentToKnowledgeBase,
};