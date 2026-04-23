import { createWorker, Worker } from "tesseract.js";
import { logger } from "@/lib/logger";

let globalWorker: Worker | null = null;

export interface OCRResult {
  text: string;
  confidence: number;
  metadata?: any;
}

export interface StructuredFinanceData {
  merchant?: string;
  date?: string;
  amount?: number;
  category?: string;
  paymentMethod?: string;
  documentNumber?: string;
  notes?: string;
}

export class PaddleOCRService {
  private async getWorker(): Promise<Worker> {
    if (globalWorker) return globalWorker;
    
    logger.info("PaddleOCR: initializing Tesseract worker");
    const worker = await createWorker("por+eng");
    globalWorker = worker;
    return worker;
  }

  async process(buffer: Buffer, mimeType: string): Promise<{ raw: OCRResult; structured: StructuredFinanceData }> {
    logger.info("PaddleOCR: starting pipeline", { mimeType, size: buffer.length });

    try {
      let text = "";
      if (mimeType === "application/pdf") {
        text = await this.executePDFParse(buffer);
      } else {
        text = await this.executeOCR(buffer);
      }
      
      const structured = this.structureData(text);

      return {
        raw: {
          text,
          confidence: 0.9,
        },
        structured
      };
    } catch (error) {
      logger.error("PaddleOCR pipeline failed", { error });
      // Reset worker on error to be safe
      if (globalWorker) {
        await globalWorker.terminate();
        globalWorker = null;
      }
      throw error;
    }
  }

  private async executePDFParse(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import to handle CommonJS/ESM interop in Next.js build
      const pdfParseModule = await import("pdf-parse") as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      logger.error("PDF Parsing failed", { error: error instanceof Error ? error.message : String(error) });
      throw new Error("Falha ao ler o PDF.");
    }
  }

  private async executeOCR(buffer: Buffer): Promise<string> {
    const worker = await this.getWorker();
    const { data: { text } } = await worker.recognize(buffer);
    return text;
  }

  private structureData(text: string): StructuredFinanceData {
    const amount = this.extractAmount(text);
    const date = this.extractDate(text);
    const merchant = this.extractMerchant(text);

    return {
      amount,
      date,
      merchant,
      notes: text.slice(0, 500)
    };
  }

  private extractAmount(text: string): number | undefined {
    const normalized = text.replace(/([0-9])O/g, "$10").replace(/O([0-9])/g, "0$1");
    const amounts: number[] = [];

    // Pattern 1: R$ 1.234,56
    const pattern1 = /(?:R\$|VALOR|TOTAL|PAGO)[\s:]*([\d.]+),(\d{2})/gi;
    for (const match of normalized.matchAll(pattern1)) {
      const value = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);
      if (!isNaN(value) && value > 0) {
        amounts.push(value);
      }
    }

    // Pattern 2: 1234,56 (sem R$)
    const pattern2 = /\b(\d{1,3}(?:\.\d{3})*),(\d{2})\b/g;
    for (const match of normalized.matchAll(pattern2)) {
      const value = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);
      if (!isNaN(value) && value > 0) {
        amounts.push(value);
      }
    }

    if (amounts.length === 0) return undefined;
    return Math.max(...amounts);
  }

  private extractDate(text: string): string | undefined {
    const pattern = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/;
    const match = pattern.exec(text);
    if (match) {
      const [_, d, m, yRaw] = match;
      const y = yRaw.length === 2 ? "20" + yRaw : yRaw;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return undefined;
  }

  private extractMerchant(text: string): string | undefined {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 3);
    return lines[0];
  }
}

export const paddleOCR = new PaddleOCRService();
