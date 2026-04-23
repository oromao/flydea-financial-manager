import { describe, it, expect, vi, beforeEach } from "vitest";
import * as tesseract from "tesseract.js";
import * as pdfParseModule from "pdf-parse";
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(),
}));

vi.mock("pdf-parse", () => ({
  default: vi.fn(),
}));

describe("PaddleOCRService", () => {
  let service: any;
  let mockWorker: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockWorker = {
      recognize: vi.fn(),
      terminate: vi.fn(),
    };

    vi.mocked(tesseract.createWorker).mockResolvedValue(mockWorker);

    const { PaddleOCRService } = await import("@/lib/ocr/paddle-ocr");
    service = new PaddleOCRService();
  });

  describe("process", () => {
    it("should process document successfully and extract structured data", async () => {
      const ocrText = `
        SUPERMERCADOS BH
        15/03/2026
        Batata frita 10,00
        Refrigerante 5,00
        VALOR TOTAL R$ 15,00
      `;
      mockWorker.recognize.mockResolvedValue({ data: { text: ocrText } });

      const buffer = Buffer.from("dummy-image");
      const result = await service.process(buffer, "image/jpeg");

      expect(tesseract.createWorker).toHaveBeenCalledWith("por+eng");
      expect(mockWorker.recognize).toHaveBeenCalledWith(buffer);
      
      expect(result.raw.text).toBe(ocrText);
      expect(result.structured.amount).toBe(15.00);
      expect(result.structured.date).toBe("2026-03-15");
      expect(result.structured.merchant).toBe("SUPERMERCADOS BH");
    });

    it("should process document and handle missing structured data gracefully", async () => {
      const ocrText = `Apenas um texto sem sentido`;
      mockWorker.recognize.mockResolvedValue({ data: { text: ocrText } });

      const buffer = Buffer.from("dummy-image");
      const result = await service.process(buffer, "image/jpeg");

      expect(result.raw.text).toBe(ocrText);
      expect(result.structured.amount).toBeUndefined();
      expect(result.structured.date).toBeUndefined();
      expect(result.structured.merchant).toBe("Apenas um texto sem sentido");
    });

    it("should extract different date formats", async () => {
      const ocrText = `01/12/26`;
      mockWorker.recognize.mockResolvedValue({ data: { text: ocrText } });
      const buffer = Buffer.from("dummy-image");
      const result = await service.process(buffer, "image/jpeg");
      expect(result.structured.date).toBe("2026-12-01");
    });

    it("should extract amount with comma and dot", async () => {
      const ocrText = `TOTAL R$ 1.234,56`;
      mockWorker.recognize.mockResolvedValue({ data: { text: ocrText } });
      const buffer = Buffer.from("dummy-image");
      const result = await service.process(buffer, "image/jpeg");
      expect(result.structured.amount).toBe(1234.56);
    });

    it("should process application/pdf using pdf-parse", async () => {
      const pdfText = `Texto extraído do PDF com sucesso VALOR TOTAL R$ 500,00`;
      vi.mocked(pdfParse).mockResolvedValue({ text: pdfText } as any);
      
      const buffer = Buffer.from("dummy-pdf");
      const result = await service.process(buffer, "application/pdf");
      
      expect(pdfParse).toHaveBeenCalledWith(buffer);
      expect(mockWorker.recognize).not.toHaveBeenCalled();
      expect(result.raw.text).toBe(pdfText);
      expect(result.structured.amount).toBe(500);
    });

    it("should terminate worker and rethrow if recognize fails", async () => {
      mockWorker.recognize.mockRejectedValue(new Error("OCR Failed"));

      const buffer = Buffer.from("dummy-image");
      await expect(service.process(buffer, "image/jpeg")).rejects.toThrow("OCR Failed");
      
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });
});
