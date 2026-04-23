import { describe, it, expect, vi } from "vitest";
import { classifyDocument } from "@/lib/category-classifier";

describe("CategoryClassifier", () => {
  const mockGetUserCategories = async () => [
    { id: "c1", name: "Alimentação", type: "EXPENSE" },
    { id: "c2", name: "Salário", type: "INCOME" },
    { id: "c3", name: "Transporte", type: "EXPENSE" },
  ];

  it("should classify based on keywords in emitter name", async () => {
    const data: any = {
      documentType: "RECIBO",
      emitterName: "McDonalds",
      totalAmount: 50,
      extractedText: "mcdonalds",
      confidence: 1.0
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.categoryName).toBe("Alimentação");
    expect(result.transactionType).toBe("EXPENSE");
  });

  it("should classify as INCOME for nota fiscal with 'emitida contra'", async () => {
    const data: any = {
      documentType: "NOTA_FISCAL",
      description: "NF-e emitida contra Cliente X",
      totalAmount: 5000,
      extractedText: "...",
      confidence: 1.0
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.transactionType).toBe("INCOME");
    expect(result.categoryName).toBe("Vendas");
  });

  it("should classify BOLETO as EXPENSE with PENDING status", async () => {
    const data: any = {
      documentType: "BOLETO",
      totalAmount: 200,
      dueDate: "2099-12-31",
      extractedText: "...",
      confidence: 1.0
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.transactionType).toBe("EXPENSE");
    expect(result.paymentStatus).toBe("PENDING");
  });

  it("should detect OVERDUE status for old BOLETOs", async () => {
    const data: any = {
      documentType: "BOLETO",
      totalAmount: 200,
      dueDate: "2020-01-01",
      extractedText: "...",
      confidence: 1.0
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.paymentStatus).toBe("OVERDUE");
  });

  it("should identify known CNPJs", async () => {
    const data: any = {
      documentType: "NOTA_FISCAL",
      emitterDocument: "12.345.678/0001-90",
      totalAmount: 100,
      extractedText: "...",
      confidence: 1.0
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.categoryName).toBe("Vendas");
    expect(result.transactionType).toBe("INCOME");
  });

  it("should handle unknown documents with fallback", async () => {
    const data: any = {
      documentType: "UNKNOWN",
      extractedText: "gibberish",
      confidence: 0.1
    };

    const result = await classifyDocument(data, "user-1", mockGetUserCategories);
    expect(result.categoryName).toBe("Outros");
    expect(result.confidence).toBe(0.3);
  });
});
