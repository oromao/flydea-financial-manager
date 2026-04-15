import crypto from "crypto";

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
const VALOR_PATTERN = /R\$\s*([\d.]+,\d{2})/g;
const VALOR_SIMPLES_PATTERN = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/g;
const NUMERO_DOC_PATTERN = /(?:N[º°]?|N[º°]\s*(?:fe)?|N\.?F\.?e\.?|NFse?|Recibo|Fatura|Boleto)[\s:]*([\d\-\/]+)/i;
const INSTALMENTES_PATTERN = /(\d+)\s*\/\s*(\d+)|(\d+)º?\s*(?:parcela|parcelas?)|(?:(?:pos|parcelas?|x)\s*(?:de\s*)?(\d+))/i;

export function extractDocumentText(buffer: Buffer, mimeType: string): string {
  console.log(`[DocumentParser] Extracting text from ${mimeType}, ${buffer.length} bytes`);

  if (mimeType === "application/pdf") {
    return extractFromPdf(buffer);
  }

  if (mimeType.startsWith("image/")) {
    return extractFromImage(buffer, mimeType);
  }

  if (mimeType === "text/plain" || mimeType === "text/csv") {
    return buffer.toString("utf-8");
  }

  return buffer.toString("utf-8").slice(0, 5000);
}

function extractFromPdf(buffer: Buffer): string {
  try {
    const text = buffer.toString("utf-8");
    if (text.length > 100) {
      const cleaned = text
        .replace(/\\x[0-9a-fA-F]{2}/g, " ")
        .replace(/<[^\x20-\x7E\n]/g, "")
        .replace(/\s+/g, " ")
        .slice(0, 50000);
      console.log(`[DocumentParser] Extracted ${cleaned.length} chars from PDF`);
      return cleaned;
    }
    return "";
  } catch (e) {
    console.error("[DocumentParser] PDF extraction error:", e);
    return "";
  }
}

function extractFromImage(buffer: Buffer, mimeType: string): string {
  return `[Image ${mimeType}] - ${buffer.length} bytes - OCR not configured`;
}

export function parseDocumentText(text: string): ExtractedDocumentData {
  console.log(`[DocumentParser] Parsing document text (${text.length} chars)`);

  const docType = detectDocumentType(text);
  const docNumber = extractDocumentNumber(text);
  const emitterName = extractEmitterName(text);
  const emitterDoc = extractDocument(text, CNPJ_PATTERN) || extractDocument(text, CPF_PATTERN);
  const emissionDate = extractDate(text);
  const dueDate = extractDueDate(text);
  const paymentDate = extractPaymentDate(text);
  const totalAmount = extractAmount(text, "total");
  const netAmount = extractAmount(text, "net") || totalAmount;
  const description = extractDescription(text, emitterName, docNumber);
  const installments = extractInstallments(text);
  const confidence = calculateConfidence(docType, totalAmount, emissionDate, docNumber);
  const lineItems = extractLineItems(text);

  return {
    documentType: docType,
    documentNumber: docNumber,
    emitterName,
    emitterDocument: emitterDoc,
    receiverName: null,
    receiverDocument: null,
    emissionDate,
    dueDate,
    paymentDate,
    totalAmount,
    netAmount,
    taxAmount: totalAmount && netAmount ? totalAmount - netAmount : null,
    installments: installments?.total,
    currentInstallment: installments?.current,
    description,
    lineItems,
    confidence,
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
  const matches = text.matchAll(/R\$\s*([\d.]+),(\d{2})/g);

  for (const match of matches) {
    const value = parseFloat(match[1].replace(/\./g, "") + "." + match[2]);
    if (!isNaN(value) && value > 0) {
      amounts.push(value);
    }
  }

  if (amounts.length === 0) {
    return null;
  }

  if (type === "total") {
    return Math.max(...amounts);
  }

  if (amounts.length > 1) {
    return amounts.reduce((a, b) => a + b, 0) - Math.max(...amounts);
  }

  return amounts[0];
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