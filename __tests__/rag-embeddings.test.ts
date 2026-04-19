import { describe, it, expect } from "vitest";
import {
  createEmbedding,
  cosineSimilarity,
  findMostSimilar,
} from "@/lib/rag/embeddings";

describe("RAG Embeddings", () => {
  describe("createEmbedding", () => {
    it("should create embedding from text", () => {
      const text = "Hello world test";
      const embedding = createEmbedding(text);

      expect(embedding).toHaveProperty("text", text);
      expect(embedding).toHaveProperty("tokens");
      expect(embedding).toHaveProperty("tfidf");
      expect(Array.isArray(embedding.tokens)).toBe(true);
    });

    it("should tokenize text correctly", () => {
      const text = "Hello World! This is a test.";
      const embedding = createEmbedding(text);

      expect(embedding.tokens.length).toBeGreaterThan(0);
      expect(embedding.tokens[0]).toBe("hello");
      expect(embedding.tokens).not.toContain("is"); // "is" has only 2 chars
    });

    it("should calculate TF-IDF scores", () => {
      const text = "test test test word";
      const embedding = createEmbedding(text);

      expect(embedding.tfidf["test"]).toBeGreaterThan(
        embedding.tfidf["word"]
      );
    });

    it("should normalize TF-IDF scores", () => {
      const text = "hello world test";
      const embedding = createEmbedding(text);

      const totalScore = Object.values(embedding.tfidf).reduce(
        (sum, val) => sum + val,
        0
      );
      expect(totalScore).toBeCloseTo(1, 1);
    });

    it("should handle empty text", () => {
      const embedding = createEmbedding("");
      expect(embedding.tokens.length).toBe(0);
      expect(Object.keys(embedding.tfidf).length).toBe(0);
    });

    it("should handle text with only short words", () => {
      const embedding = createEmbedding("a is it");
      expect(embedding.tokens.length).toBe(0);
    });
  });

  describe("cosineSimilarity", () => {
    it("should return 1 for identical embeddings", () => {
      const emb1 = createEmbedding("hello world");
      const emb2 = createEmbedding("hello world");

      const similarity = cosineSimilarity(emb1, emb2);
      expect(similarity).toBeCloseTo(1, 1);
    });

    it("should return 0 for completely different embeddings", () => {
      const emb1 = createEmbedding("apple orange banana");
      const emb2 = createEmbedding("xyz123 abc456");

      const similarity = cosineSimilarity(emb1, emb2);
      expect(similarity).toBeLessThan(0.5);
    });

    it("should return value between 0 and 1", () => {
      const emb1 = createEmbedding("financial planning budgeting");
      const emb2 = createEmbedding("money management savings");

      const similarity = cosineSimilarity(emb1, emb2);
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it("should handle empty embeddings", () => {
      const emb1 = createEmbedding("");
      const emb2 = createEmbedding("");

      const similarity = cosineSimilarity(emb1, emb2);
      expect(similarity).toBe(0);
    });

    it("should be commutative", () => {
      const emb1 = createEmbedding("budget money save");
      const emb2 = createEmbedding("expense tracking financial");

      const sim1to2 = cosineSimilarity(emb1, emb2);
      const sim2to1 = cosineSimilarity(emb2, emb1);

      expect(sim1to2).toBeCloseTo(sim2to1, 5);
    });
  });

  describe("findMostSimilar", () => {
    it("should find most similar document", () => {
      const query = createEmbedding("budget money savings");
      const docs = [
        createEmbedding("financial planning and budgeting"),
        createEmbedding("apple orange banana fruit"),
        createEmbedding("cash flow and money management"),
      ];

      const results = findMostSimilar(query, docs, 1);

      expect(results).toHaveLength(1);
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it("should return documents sorted by similarity", () => {
      const query = createEmbedding("expense reduction tips");
      const docs = [
        createEmbedding("how to save money fast"),
        createEmbedding("expense tracking tools"),
        createEmbedding("cat dog animal pets"),
      ];

      const results = findMostSimilar(query, docs, 3);

      expect(results).toHaveLength(3);
      expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity);
      expect(results[1].similarity).toBeGreaterThanOrEqual(results[2].similarity);
    });

    it("should respect topK parameter", () => {
      const query = createEmbedding("test");
      const docs = Array.from({ length: 10 }, (_, i) =>
        createEmbedding(`document ${i}`)
      );

      const results = findMostSimilar(query, docs, 3);

      expect(results).toHaveLength(3);
    });

    it("should handle topK larger than documents", () => {
      const query = createEmbedding("query");
      const docs = [
        createEmbedding("document one"),
        createEmbedding("document two"),
      ];

      const results = findMostSimilar(query, docs, 10);

      expect(results).toHaveLength(2);
    });

    it("should return embeddings in results", () => {
      const query = createEmbedding("budget");
      const docs = [createEmbedding("financial planning")];

      const results = findMostSimilar(query, docs, 1);

      expect(results[0]).toHaveProperty("embedding");
      expect(results[0]).toHaveProperty("similarity");
      expect(results[0].embedding).toHaveProperty("text");
    });
  });
});
