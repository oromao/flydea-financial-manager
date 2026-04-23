import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkForDuplicate } from "@/lib/duplicate-detector";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    importedDocument: { findMany: vi.fn() },
  },
}));

describe("DuplicateDetector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockExtractedData = (overrides = {}): any => ({
    documentNumber: "123",
    emitterDocument: "456",
    totalAmount: 100,
    emissionDate: "2026-04-23",
    extractedText: "test",
    confidence: 1.0,
    ...overrides,
  });

  it("should return isDuplicate=true if fileHash matches exactly", async () => {
    vi.mocked(prisma.importedDocument.findMany).mockResolvedValue([
      { id: "doc-1", fileHash: "hash-123" } as any
    ]);

    const result = await checkForDuplicate("user-1", mockExtractedData(), "hash-123");

    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.reason).toContain("Arquivo idêntico");
  });

  it("should detect duplicate based on docNumber, emitter and amount", async () => {
    vi.mocked(prisma.importedDocument.findMany).mockResolvedValue([
      { 
        id: "doc-1", 
        extractedData: { documentNumber: "123", emitterDocument: "456", totalAmount: 100 } 
      } as any
    ]);

    const result = await checkForDuplicate("user-1", mockExtractedData(), "new-hash");

    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.reason).toContain("Mesma nota");
  });

  it("should detect duplicate based on docNumber, amount and date", async () => {
    vi.mocked(prisma.importedDocument.findMany).mockResolvedValue([
      { 
        id: "doc-2", 
        extractedData: { documentNumber: "123", totalAmount: 100, emissionDate: "2026-04-23" } 
      } as any
    ]);

    const result = await checkForDuplicate("user-1", mockExtractedData(), "new-hash");

    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(0.85);
  });

  it("should return isDuplicate=false if no matches found", async () => {
    vi.mocked(prisma.importedDocument.findMany).mockResolvedValue([]);

    const result = await checkForDuplicate("user-1", mockExtractedData(), "unique-hash");

    expect(result.isDuplicate).toBe(false);
  });
});
