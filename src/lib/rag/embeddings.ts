// Simple TF-IDF based embedding for local RAG
export interface Embedding {
  text: string;
  tokens: string[];
  tfidf: Record<string, number>;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function createEmbedding(text: string): Embedding {
  const tokens = tokenize(text);
  const tfidf: Record<string, number> = {};

  // Simple TF calculation
  const termFrequency: Record<string, number> = {};
  tokens.forEach((token) => {
    termFrequency[token] = (termFrequency[token] || 0) + 1;
  });

  // Normalize TF-IDF scores
  const totalTokens = tokens.length;
  Object.entries(termFrequency).forEach(([term, freq]) => {
    tfidf[term] = freq / totalTokens;
  });

  return {
    text,
    tokens,
    tfidf,
  };
}

export function cosineSimilarity(
  embedding1: Embedding,
  embedding2: Embedding
): number {
  const allTerms = new Set([
    ...Object.keys(embedding1.tfidf),
    ...Object.keys(embedding2.tfidf),
  ]);

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  allTerms.forEach((term) => {
    const score1 = embedding1.tfidf[term] || 0;
    const score2 = embedding2.tfidf[term] || 0;

    dotProduct += score1 * score2;
    magnitude1 += score1 * score1;
    magnitude2 += score2 * score2;
  });

  const denominator = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export function findMostSimilar(
  queryEmbedding: Embedding,
  documentEmbeddings: Embedding[],
  topK: number = 3
): Array<{ embedding: Embedding; similarity: number }> {
  const similarities = documentEmbeddings.map((doc) => ({
    embedding: doc,
    similarity: cosineSimilarity(queryEmbedding, doc),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
