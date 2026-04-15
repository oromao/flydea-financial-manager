import { describe, it, expect } from "vitest";
import { extractDocumentText, parseDocumentText, computeFileHash } from "@/lib/document-parser";

describe("DocumentParser", () => {
  describe("parseDocumentText", () => {
    it("should parse nota fiscal text", () => {
      const text = `
NOTA FISCAL ELETRÔNICA - NFE
Série: 001
Número: 12345
Data de emissão: 15/03/2026

EMITENTE:
Empresa XPTO Ltda
CNPJ: 12.345.678/0001-90

DESTINATÁRIO:
Cliente ABC
CNPJ: 98.765.432/0001-11

VALOR TOTAL: R$ 1.500,00
      `.trim();

      const result = parseDocumentText(text);

      expect(result.documentType).toBe("NOTA_FISCAL");
      expect(result.totalAmount).toBe(1500);
      expect(result.emissionDate).toBe("2026-03-15");
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("should parse receipt text", () => {
      const text = `
RECIBO DE PAGAMENTO
Recibo nº: 2026/001
Data: 10/04/2026
Valor: R$ 250,00
Recebemos de: João Silva
      `.trim();

      const result = parseDocumentText(text);

      expect(result.documentType).toBe("RECIBO");
      expect(result.totalAmount).toBe(250);
    });

    it("should parse invoice with installments", () => {
      const text = `
NOTA FISCAL
Número: 5555
Data: 01/03/2026
Valor Total: R$ 3.000,00
Parcelas: 3x de R$ 1.000,00
      `.trim();

      const result = parseDocumentText(text);

      expect(result.installments).toBe(3);
      expect(result.totalAmount).toBe(3000);
    });

    it("should detect document type correctly", () => {
      const notaFiscalText = "NOTA FISCAL ELETRÔNICA NFE 123";
      const result = parseDocumentText(notaFiscalText);
      expect(result.documentType).toBe("NOTA_FISCAL");

      const reciboText = "RECIBO de pagamento 2026";
      const result2 = parseDocumentText(reciboText);
      expect(result2.documentType).toBe("RECIBO");

      const boletoText = "BOLETO DE COBRANÇA";
      const result3 = parseDocumentText(boletoText);
      expect(result3.documentType).toBe("BOLETO");

      const comprovanteText = "COMPROVANTE DE PAGAMENTO PIX";
      const result4 = parseDocumentText(comprovanteText);
      expect(result4.documentType).toBe("COMPROVANTE");
    });
  });

  describe("extractDocumentText", () => {
    it("should extract text from plain text buffer", () => {
      const buffer = Buffer.from("Nota fiscal teste valor R$ 100,00");
      const result = extractDocumentText(buffer, "text/plain");
      expect(result).toContain("Nota fiscal");
    });
  });

  describe("computeFileHash", () => {
    it("should compute consistent hash", () => {
      const buffer = Buffer.from("test content");
      const hash1 = computeFileHash(buffer);
      const hash2 = computeFileHash(buffer);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(16);
    });

    it("should compute different hashes for different content", () => {
      const buffer1 = Buffer.from("content 1");
      const buffer2 = Buffer.from("content 2");
      const hash1 = computeFileHash(buffer1);
      const hash2 = computeFileHash(buffer2);
      expect(hash1).not.toBe(hash2);
    });
  });
});

describe("CategoryClassifier", () => {
  it("should classify fuel expenses", async () => {
    const { classifyDocument } = await import("@/lib/category-classifier");

    const extractedData = {
      documentType: "NOTA_FISCAL" as const,
      documentNumber: "123",
      emitterName: "Posto Shell",
      emitterDocument: "12.345.678/0001-90",
      receiverName: null,
      receiverDocument: null,
      emissionDate: "2026-03-15",
      dueDate: null,
      paymentDate: null,
      totalAmount: 300,
      netAmount: 300,
      taxAmount: null,
      installments: null,
      currentInstallment: null,
      description: "Posto Shell - Combustível",
      lineItems: [],
      confidence: 0.8,
      extractedText: "Posto Shell Combustível",
    };

    const result = await classifyDocument(extractedData, "user-id", async () => []);

    expect(result.categoryName).toBe("Combustível");
    expect(result.transactionType).toBe("EXPENSE");
  });

  it("should classify rental expenses", async () => {
    const { classifyDocument } = await import("@/lib/category-classifier");

    const extractedData = {
      documentType: "NOTA_FISCAL" as const,
      documentNumber: "456",
      emitterName: "Imobiliária XPTO",
      emitterDocument: null,
      receiverName: null,
      receiverDocument: null,
      emissionDate: "2026-03-01",
      dueDate: "2026-04-01",
      paymentDate: null,
      totalAmount: 2500,
      netAmount: 2500,
      taxAmount: null,
      installments: null,
      currentInstallment: null,
      description: "Aluguel março 2026",
      lineItems: [],
      confidence: 0.8,
      extractedText: "Aluguel",
    };

    const result = await classifyDocument(extractedData, "user-id", async () => []);

    expect(result.categoryName).toBe("Aluguel");
  });

  it("should classify energy bill", async () => {
    const { classifyDocument } = await import("@/lib/category-classifier");

    const extractedData = {
      documentType: "NOTA_FISCAL" as const,
      documentNumber: "789",
      emitterName: "CPFL Paulista",
      emitterDocument: null,
      receiverName: null,
      receiverDocument: null,
      emissionDate: "2026-03-10",
      dueDate: "2026-04-10",
      paymentDate: null,
      totalAmount: 180,
      netAmount: 180,
      taxAmount: null,
      installments: null,
      currentInstallment: null,
      description: "Conta de luz março",
      lineItems: [],
      confidence: 0.8,
      extractedText: "Energia elétrica",
    };

    const result = await classifyDocument(extractedData, "user-id", async () => []);

    expect(result.categoryName).toBe("Energia");
  });
});