import { describe, it, expect, beforeEach } from "vitest";
import { KnowledgeBase } from "@/lib/rag/knowledge-base";
import type { KnowledgeDocument } from "@/lib/rag/knowledge-base";

describe("RAG Knowledge Base", () => {
  let kb: KnowledgeBase;

  beforeEach(() => {
    kb = new KnowledgeBase();
  });

  describe("getDocuments", () => {
    it("should return initial documents", () => {
      const docs = kb.getDocuments();

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBeGreaterThan(0);
    });

    it("should return documents with required properties", () => {
      const docs = kb.getDocuments();

      docs.forEach((doc) => {
        expect(doc).toHaveProperty("id");
        expect(doc).toHaveProperty("title");
        expect(doc).toHaveProperty("content");
        expect(doc).toHaveProperty("category");
        expect(doc).toHaveProperty("tags");
        expect(doc).toHaveProperty("createdAt");
      });
    });
  });

  describe("addDocument", () => {
    it("should add new document", () => {
      const initialCount = kb.getDocuments().length;

      const newDoc: KnowledgeDocument = {
        id: "test-doc",
        title: "Test Document",
        content: "This is a test document",
        category: "budgeting",
        tags: ["test"],
        createdAt: new Date(),
      };

      kb.addDocument(newDoc);

      const docs = kb.getDocuments();
      expect(docs.length).toBe(initialCount + 1);
      expect(docs.find((d) => d.id === "test-doc")).toBeDefined();
    });

    it("should not add duplicate document", () => {
      const newDoc: KnowledgeDocument = {
        id: "duplicate-test",
        title: "Duplicate Test",
        content: "Content",
        category: "general",
        tags: [],
        createdAt: new Date(),
      };

      kb.addDocument(newDoc);
      const countAfterFirst = kb.getDocuments().length;

      kb.addDocument(newDoc);
      const countAfterSecond = kb.getDocuments().length;

      expect(countAfterSecond).toBe(countAfterFirst);
    });
  });

  describe("getDocumentsByCategory", () => {
    it("should return documents of specific category", () => {
      const budgetingDocs = kb.getDocumentsByCategory("budgeting");

      expect(Array.isArray(budgetingDocs)).toBe(true);
      budgetingDocs.forEach((doc) => {
        expect(doc.category).toBe("budgeting");
      });
    });

    it("should handle empty category", () => {
      const docs = kb.getDocumentsByCategory("investments");
      expect(Array.isArray(docs)).toBe(true);
    });
  });

  describe("getDocumentsByTag", () => {
    it("should find documents by tag", () => {
      const docs = kb.getDocumentsByTag("orçamento");

      expect(Array.isArray(docs)).toBe(true);
      docs.forEach((doc) => {
        expect(doc.tags.some((t) =>
          t.toLowerCase().includes("orçamento".toLowerCase())
        )).toBe(true);
      });
    });

    it("should be case insensitive", () => {
      const docsLower = kb.getDocumentsByTag("budgeting");
      const docsUpper = kb.getDocumentsByTag("BUDGETING");
      const docsMixed = kb.getDocumentsByTag("BuDgEtInG");

      expect(docsLower.length).toBeGreaterThanOrEqual(0);
      expect(docsUpper.length).toBe(docsLower.length);
      expect(docsMixed.length).toBe(docsLower.length);
    });

    it("should handle non-existent tag", () => {
      const docs = kb.getDocumentsByTag("nonexistent-tag-xyz");

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });
  });

  describe("searchDocuments", () => {
    it("should search by title", () => {
      const results = kb.searchDocuments("orçamento");

      expect(Array.isArray(results)).toBe(true);
      results.forEach((doc) => {
        const titleMatches = doc.title.toLowerCase().includes("orçamento");
        const contentMatches = doc.content.toLowerCase().includes("orçamento");
        const tagMatches = doc.tags.some((t) =>
          t.toLowerCase().includes("orçamento")
        );

        expect(titleMatches || contentMatches || tagMatches).toBe(true);
      });
    });

    it("should search by content", () => {
      const results = kb.searchDocuments("receita");

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", () => {
      const resultsLower = kb.searchDocuments("emergency");
      const resultsUpper = kb.searchDocuments("EMERGENCY");

      expect(resultsUpper.length).toBe(resultsLower.length);
    });

    it("should handle empty search", () => {
      const results = kb.searchDocuments("");

      expect(Array.isArray(results)).toBe(true);
    });

    it("should search by tags", () => {
      const results = kb.searchDocuments("poupança");

      expect(Array.isArray(results)).toBe(true);
      results.forEach((doc) => {
        expect(
          doc.title.toLowerCase().includes("poupança") ||
          doc.content.toLowerCase().includes("poupança") ||
          doc.tags.some((t) => t.toLowerCase().includes("poupança"))
        ).toBe(true);
      });
    });
  });

  describe("document structure", () => {
    it("should have valid categories", () => {
      const validCategories = [
        "budgeting",
        "cash-flow",
        "expenses",
        "income",
        "investments",
        "emergency",
        "debt",
        "general",
      ];

      kb.getDocuments().forEach((doc) => {
        expect(validCategories).toContain(doc.category);
      });
    });

    it("should have valid tags structure", () => {
      kb.getDocuments().forEach((doc) => {
        expect(Array.isArray(doc.tags)).toBe(true);
        // Tags can be empty in some documents, but structure should be valid
        expect(Array.isArray(doc.tags)).toBe(true);
      });
    });

    it("should have non-empty content", () => {
      kb.getDocuments().forEach((doc) => {
        expect(doc.content.length).toBeGreaterThan(0);
        expect(doc.title.length).toBeGreaterThan(0);
      });
    });
  });
});
