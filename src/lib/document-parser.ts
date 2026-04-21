import crypto from "crypto";
import { paddleOCR, StructuredFinanceData } from "./ocr/paddle-ocr";

export interface ExtractedDocumentData {
  documentType: "NOTA_FISCAL" | "RECIBO" | "BOLETO" | "COMPROVANTE" | "EXTRATO" | "OUTRO" | "UNKNOWN";
  documentNumber: string | null;
  emitterName: string | null;
  emitterDocument: string | null;
  receiverName: string | null;
  receiverDocument: string | null;
  emissionDate: string | null;
  dueDate: string | null;
  paymentDate: string | null;
  totalAmount: number | null;
  netAmount: number | null;
  taxAmount: number | null;
  installments: number | null;
  currentInstallment: number | null;
  description: string | null;
  lineItems: Array<{
    description: string;
    quantity: number | null;
    unitPrice: number | null;
    totalPrice: number | null;
  }>;
  confidence: number;
  extractedText: string;
}

const CNPJ_PATTERN = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g;
const CPF_PATTERN = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const DATA_BR_PATTERN = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/g;
const VALOR_PATTERN = /(?:R\$|VALOR|TOTAL|PAGO)[\s:]*([\d.]+,\d{2})/gi;
const VALOR_SIMPLES_PATTERN = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
const NUMERO_DOC_PATTERN = /(?:N[º°]?|N[º°]\s*(?:fe)?|N\.?F\.?e\.?|NFse?|Recibo|Fatura|Boleto)[\s:]*([\d\-\/]+)/i;
const INSTALMENTES_PATTERN = /(\d+)\s*\/\s*(\d+)|(\d+)º?\s*(?:parcela|parcelas?)|(?:(?:pos|parcelas?|x)\s*(?:de\s*)?(\d+))/i;

// Transfer/PIX specific patterns
const PIX_ID_PATTERN = /(?:ID|E2E|id|Autenticação)\s*(?:da\s*)?(?:transação|transferência)?[\s:]*([a-z0-9]{32}|[a-z0-9\-]{36}|\d{20,})/gi;
const TRANSFER_DESTINO_PATTERN = /(?:destino|para|favorecido|recebedor|pago a|crédito para)[\s:]*(.{0,80}?)(?:\n|CNPJ|CPF|Banco|Valor|$)/i;
const TRANSFER_ORIGEM_PATTERN = /(?:origem|de|remetente|pagador|nome do pagador)[\s:]*(.{0,80}?)(?:\n|CNPJ|CPF|Banco|Valor|$)/i;
const TRANSFER_BANCO_PATTERN = /(?:banco|instituição|agência|isbp)[\s:]*([^\n]{0,100})/i;

export async function extractDocumentText(buffer: Buffer, mimeType: string): Promise<string> {
  const result = await paddleOCR.process(buffer, mimeType);
  return result.raw.text;
}

export function parseDocumentText(text: string): ExtractedDocumentData {
  // We can use the structured output from paddleOCR if we pass it here,
  // but for backward compatibility with the existing parseDocumentText signature,
  // we'll keep the heuristic logic but pointed to the new structured fields if needed.
  
  // Detect document type
  const docType = detectDocumentType(text);
  
  // Use heuristic extraction (robust and already tested)
  const emissionDate = extractDate(text);
  const totalAmount = extractAmount(text, "total");
  const docNumber = extractDocumentNumber(text);
  const emitterName = extractEmitterName(text);

  return {
    documentType: docType,
    documentNumber: docNumber,
    emitterName,
    emitterDocument: null,
    receiverName: null,
    receiverDocument: null,
    emissionDate,
    dueDate: extractDueDate(text),
    paymentDate: extractPaymentDate(text) || emissionDate,
    totalAmount,
    netAmount: totalAmount,
    taxAmount: 0,
    installments: extractInstallments(text).total,
    currentInstallment: extractInstallments(text).current,
    description: extractDescription(text, emitterName, docNumber),
    lineItems: [],
    confidence: calculateConfidence(docType, totalAmount, emissionDate, docNumber),
    extractedText: text.slice(0, 10000),
  };
}

function detectDocumentType(text: string): ExtractedDocumentData["documentType"] {
  const lower = text.toLowerCase();

  if (lower.includes("nota fiscal") || lower.includes("nfe") || lower.includes("nf-e") || lower.includes("nfse") || lower.includes("cupom fiscal")) {
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
  return matches?.[0] || null;
}

function extractEmitterName(text: string): string | null {
  const lines = text.split("\n").slice(0, 20);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed.length < 100 && !trimmed.match(/^\d/) && !trimmed.match(/^[\s\-\/]+$/)) {
      const cleaned = trimmed.replace(/[^\w\s\.\-]/g, "").trim();
      if (cleaned.length > 3) {
        return cleaned.slice(0, 80);
      }
    }
  }
  return null;
}

function extractDate(text: string): string | null {
  const matches = text.match(DATA_BR_PATTERN);
  if (matches) {
    for (const match of matches) {
      const parts = match.split(/[\/\-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
          return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        }
      }
    }
  }
  return null;
}

function extractDueDate(text: string): string | null {
  const lower = text.toLowerCase();
  const dateMatch = lower.match(/vencimento[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]);
    let year = parseInt(dateMatch[3]);
    if (year < 100) year += 2000;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (lower.includes("vencimento") || lower.includes("data de vencimento")) {
    if (lower.includes("à vista") || lower.includes("avista") || lower.includes("pagamento imediato")) {
      return new Date().toISOString().split("T")[0];
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

function extractAmount(text: string, type: "total" | "net"): number | null {
  const amounts: number[] = [];

  // Pattern 1: R$ 1.234,56
  const pattern1 = /(?:R\$|VALOR|TOTAL|PAGO)[\s:]*([\d.]+),(\d{2})/gi;
  for (const match of text.matchAll(pattern1)) {
    const value = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  // Pattern 2: 1234,56 (without R$)
  const pattern2 = /\b(\d{1,3}(?:\.\d{3})*),(\d{2})\b/g;
  for (const match of text.matchAll(pattern2)) {
    const value = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);
    if (!isNaN(value) && value > 0 && value < 1000000) {
      // Reasonable upper limit
      amounts.push(value);
    }
  }

  // Pattern 3: Valor: number, Valor = number
  const pattern3 = /(?:valor|amount|total|transferência|pagamento)[\s:=]*[\s]*([\d,.]+)/gi;
  for (const match of text.matchAll(pattern3)) {
    const cleanValue = match[1].replace(/\./g, "").replace(",", ".");
    const value = parseFloat(cleanValue);
    if (!isNaN(value) && value > 0 && value < 1000000) {
      amounts.push(value);
    }
  }

  // Remove duplicates and sort
  const uniqueAmounts = Array.from(new Set(amounts.map((a) => parseFloat(a.toFixed(2))))).sort((a, b) => b - a);

  if (uniqueAmounts.length === 0) {
    return null;
  }

  if (type === "total") {
    // Return the largest amount (most likely the total)
    return uniqueAmounts[0];
  }

  if (uniqueAmounts.length > 1) {
    // For "net", return sum of all but the largest
    return uniqueAmounts.slice(1).reduce((a, b) => a + b, 0);
  }

  return uniqueAmounts[0];
}

function extractDescription(text: string, emitterName: string | null, docNumber: string | null): string | null {
  const lines = text.split("\n").filter((l) => l.trim().length > 5);

  for (const line of lines.slice(0, 10)) {
    if (line.includes(emitterName || "") && line.length > 5) {
      return line.trim().slice(0, 150);
    }
  }

  if (docNumber) {
    return `${emitterName || "Documento"} ${docNumber}`.trim();
  }

  return emitterName || lines[0]?.trim().slice(0, 100) || null;
}

function extractInstallments(text: string): { current: number | null; total: number | null } {
  const match = text.match(INSTALMENTES_PATTERN);
  if (match) {
    if (match[1] && match[2]) {
      return { current: parseInt(match[1]), total: parseInt(match[2]) };
    }
    if (match[3]) {
      return { current: 1, total: parseInt(match[3]) };
    }
    if (match[4]) {
      return { current: 1, total: parseInt(match[4]) };
    }
  }
  return { current: null, total: null };
}

function extractLineItems(text: string): ExtractedDocumentData["lineItems"] {
  const lines = text.split("\n").filter((l) => l.trim().length > 10);
  const items: ExtractedDocumentData["lineItems"] = [];

  for (const line of lines.slice(5, 25)) {
    const qtyMatch = line.match(/(\d+)\s+x\s+/);
    const priceMatch = line.match(/R\$\s*([\d.]+,\d{2})/);
    const descMatch = line.replace(/R\$\s*[\d.,]+/g, "").replace(/\d+x\s+/gi, "").trim();

    if (priceMatch && descMatch.length > 2) {
      items.push({
        description: descMatch.slice(0, 100),
        quantity: qtyMatch ? parseInt(qtyMatch[1]) : 1,
        unitPrice: null,
        totalPrice: parseFloat(priceMatch[1].replace(/\./g, "").replace(",", ".")),
      });
    }
  }

  return items.slice(0, 20);
}

function extractPixId(text: string): string | null {
  const match = text.match(PIX_ID_PATTERN);
  return match?.[1] || null;
}

function extractTransferField(text: string, fieldType: "origem" | "destino"): string | null {
  const pattern = fieldType === "origem" ? TRANSFER_ORIGEM_PATTERN : TRANSFER_DESTINO_PATTERN;
  const match = text.match(pattern);
  if (match?.[1]) {
    return match[1].trim().replace(/\s+/g, " ").slice(0, 100);
  }
  return null;
}

function extractTransferDescription(
  text: string,
  origin: string | null,
  destination: string | null,
  amount: number | null
): string | null {
  const parts = [];

  if (origin) parts.push(`De: ${origin}`);
  if (destination) parts.push(`Para: ${destination}`);
  if (amount) parts.push(`Valor: R$ ${amount.toFixed(2)}`);

  if (parts.length > 0) {
    return parts.join(" | ");
  }

  return extractDescription(text, null, null);
}

function calculateConfidence(
  docType: ExtractedDocumentData["documentType"],
  totalAmount: number | null,
  emissionDate: string | null,
  docNumber: string | null
): number {
  let score = 0;

  if (docType !== "UNKNOWN") score += 0.3;
  if (totalAmount && totalAmount > 0) score += 0.3;
  if (emissionDate) score += 0.2;
  if (docNumber) score += 0.2;

  return Math.min(1, score);
}

export function computeFileHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}