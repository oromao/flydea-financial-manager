import { createWorker } from "tesseract.js";
import { logger } from "@/lib/logger";

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
  async process(buffer: Buffer, mimeType: string): Promise<{ raw: OCRResult; structured: StructuredFinanceData }> {
    logger.info("PaddleOCR: starting pipeline", { mimeType, size: buffer.length });

    try {
      const text = await this.executeOCR(buffer);
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
      throw error;
    }
  }

  private async executeOCR(buffer: Buffer): Promise<string> {
    const worker = await createWorker("por+eng");
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
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
    const pattern = /(?:R\$|VALOR|TOTAL|PAGO)[\s:]*([\d.]+,\d{2})/gi;
    const match = pattern.exec(text);
    if (match) {
      return parseFloat(match[1].replace(/\./g, "").replace(",", "."));
    }
    return undefined;
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
