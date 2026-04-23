import crypto from "crypto";
import { paddleOCR, StructuredFinanceData } from "./ocr/paddle-ocr";

export interface ExtractedDocumentData {
  documentType: "NOTA_FISCAL" | "RECIBO" | "BOLETO" | "COMPROVANTE" | "EXTRATO" | "OUTRO" | "UNKNOWN";
  documentNumber: string | null;
  emitterName: string | null;
  emitterDocument: string | null; // CPF or CNPJ
  emissionDate: string | null; // ISO Format YYYY-MM-DD
  dueDate: string | null;
  paymentDate: string | null;
  totalAmount: number | null;
  netAmount: number | null;
  taxAmount: number | null;
  installments: number | null;
  currentInstallment: number | null;
  description: string | null;
  extractedText: string;
  confidence: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const CNPJ_PATTERN = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
const CPF_PATTERN = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
const DATA_BR_PATTERN = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g;
const NUMERO_DOC_PATTERN = /(?:nota|nº|numero|número|id|doc)[\s:]*([\d\w.-]+)/i;

export function parseDocumentText(text: string): ExtractedDocumentData {
  const documentType = extractDocumentType(text);
  const documentNumber = extractDocumentNumber(text);
  const emitterDocument = extractDocument(text, CNPJ_PATTERN) || extractDocument(text, CPF_PATTERN);
  const emitterName = extractEmitterName(text);
  const emissionDate = extractDate(text);
  const dueDate = extractDueDate(text, emissionDate);
  const paymentDate = extractPaymentDate(text);
  const totalAmount = extractAmount(text, "total");
  const netAmount = extractAmount(text, "net");
  const taxAmount = totalAmount && netAmount ? Math.max(0, totalAmount - netAmount) : null;
  const description = extractDescription(text, emitterName, documentNumber);
  const installmentData = extractInstallments(text);

  return {
    documentType,
    documentNumber,
    emitterName,
    emitterDocument,
    emissionDate,
    dueDate,
    paymentDate,
    totalAmount,
    netAmount,
    taxAmount,
    installments: installmentData.installments,
    currentInstallment: installmentData.currentInstallment,
    description,
    extractedText: text,
    confidence: calculateConfidence(totalAmount, emissionDate, emitterName, documentNumber),
    lineItems: [],
  };
}

function extractDocumentType(text: string): ExtractedDocumentData["documentType"] {
  const lower = text.toLowerCase();
  if (lower.includes("nota fiscal") || lower.includes("nfe") || lower.includes("nf-e") || lower.includes("danfe")) {
    return "NOTA_FISCAL";
  }
  if (lower.includes("recibo") || lower.includes("recebemos")) {
    return "RECIBO";
  }
  if (lower.includes("boleto") || lower.includes("boleto de cobrança") || lower.includes("codigo de barras")) {
    return "BOLETO";
  }
  if (lower.includes("comprovante") || lower.includes("confirmação") || lower.includes("pix")) {
    return "COMPROVANTE";
  }
  if (lower.includes("extrato") || lower.includes("extrato bancário")) {
    return "EXTRATO";
  }
  if (lower.length > 50) {
    return "OUTRO";
  }
  return "UNKNOWN";
}

function extractDocumentNumber(text: string): string | null {
  const match = text.match(NUMERO_DOC_PATTERN);
  return match?.[1] || null;
}

function extractDocument(text: string, pattern: RegExp): string | null {
  const matches = text.match(pattern);
  return matches ? matches[0] : null;
}

function extractEmitterName(text: string): string | null {
  const lines = text.split("\n").slice(0, 20);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed.length < 100 && !trimmed.match(/^\d/) && !trimmed.match(/^[\s\-\/]+$/)) {
      const cleaned = trimmed.replace(/[^\w\s\.\-\u00C0-\u017F]/g, "").trim();
      if (cleaned.length > 3) {
        return cleaned.slice(0, 80);
      }
    }
  }
  return null;
}

function extractDate(text: string): string | null {
  // Normalizar possíveis erros de OCR em datas (O -> 0, I -> 1)
  const normalized = text.replace(/([0-9])O/g, "$10").replace(/O([0-9])/g, "0$1")
                         .replace(/([0-9])I/g, "$11").replace(/I([0-9])/g, "1$1");
                         
  const matches = normalized.match(DATA_BR_PATTERN);
  if (matches) {
    for (const match of matches) {
      const parts = match.split(/[\/\-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }
    }
  }
  return null;
}

function extractDueDate(text: string, emissionDate: string | null): string | null {
  const lower = text.toLowerCase();
  const dateMatch = lower.match(/(?:vencimento|vence|vcto)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    let year = parseInt(dateMatch[3]);
    if (year < 100) year += 2000;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (lower.includes("vencimento") || lower.includes("data de vencimento")) {
    if (lower.includes("à vista") || lower.includes("avista") || lower.includes("pagamento imediato")) {
      return emissionDate || new Date().toISOString().split("T")[0];
    }
  }

  return null;
}

function extractPaymentDate(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("pagamento") || lower.includes("pago") || lower.includes("quitado") || lower.includes("compensação")) {
    const dateMatch = lower.match(/(?:pagamento|pago|data)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000;
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

function extractInstallments(text: string): { installments: number | null; currentInstallment: number | null } {
  const lower = text.toLowerCase();
  // e.g. "Parcela: 1/3" or "01/03"
  const instMatch = lower.match(/(?:parcelas?|parc\.?)[\s:]*(\d+)\s*[\/\-de]\s*(\d+)/i);
  if (instMatch) {
    const curr = parseInt(instMatch[1], 10);
    const total = parseInt(instMatch[2], 10);
    if (curr > 0 && total >= curr) {
      return { currentInstallment: curr, installments: total };
    }
  }
  
  // e.g. "3x de R$ 1.000,00"
  const multiplierMatch = lower.match(/(\d+)\s*x\s*(?:de\s*)?(?:r\$)?\s*[\d.]+,[\d]{2}/);
  if (multiplierMatch) {
    const total = parseInt(multiplierMatch[1], 10);
    if (total > 1) {
      return { currentInstallment: 1, installments: total };
    }
  }

  return { currentInstallment: null, installments: null };
}

function extractAmount(text: string, type: "total" | "net"): number | null {
  // Normalize O -> 0 in potential numbers
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

  if (amounts.length === 0) return null;

  if (type === "total") {
    return Math.max(...amounts);
  }
  return amounts[0];
}

function extractDescription(text: string, emitterName: string | null, docNumber: string | null): string | null {
  const lines = text.split("\n").filter((l) => l.trim().length > 5);
  if (emitterName && emitterName.length > 3 && !emitterName.toLowerCase().includes("nota fiscal") && !emitterName.toLowerCase().includes("comprovante")) {
    return emitterName;
  }
  
  if (docNumber) {
    return `Documento ${docNumber}`;
  }

  return lines[0]?.trim().slice(0, 100) || null;
}

function calculateConfidence(totalAmount: number | null, emissionDate: string | null, emitterName: string | null, docNumber: string | null): number {
  let score = 0.1;
  if (totalAmount) score += 0.4;
  if (emitterName) score += 0.2;
  if (emissionDate) score += 0.2;
  if (docNumber) score += 0.2;

  return Math.min(1, score);
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}
