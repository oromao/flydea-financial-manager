import { prisma } from "./prisma";
import type { ExtractedDocumentData } from "./document-parser";

export interface DuplicateCheck {
  isDuplicate: boolean;
  duplicateOf: string | null;
  confidence: number;
  reason: string;
}

export async function checkForDuplicate(
  userId: string,
  extractedData: ExtractedDocumentData,
  fileHash: string
): Promise<DuplicateCheck> {
  const existingDocs = await prisma.importedDocument.findMany({
    where: {
      userId,
      status: { in: ["IMPORTED", "PENDING_REVIEW"] },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (!existingDocs) {
    return { isDuplicate: false, duplicateOf: null, confidence: 0, reason: "Nenhuma duplicata identificada" };
  }

  const docNumber = extractedData.documentNumber;
  const emitterDoc = extractedData.emitterDocument;
  const amount = extractedData.totalAmount;
  const emissionDate = extractedData.emissionDate;

  if (fileHash) {
    const exactMatch = existingDocs.find((d: { fileHash: string | null }) => d.fileHash === fileHash);
    if (exactMatch) {
      return {
        isDuplicate: true,
        duplicateOf: exactMatch.id,
        confidence: 1.0,
        reason: "Arquivo idêntico já importado",
      };
    }
  }

  if (docNumber && emitterDoc && amount) {
    for (const doc of existingDocs) {
      if (!doc.extractedData) continue;
      const data = doc.extractedData as Record<string, unknown>;
      const existingDocNum = data.documentNumber as string | null;
      const existingEmitter = data.emitterDocument as string | null;
      const existingAmount = data.totalAmount as number | null;
      if (existingDocNum === docNumber && existingEmitter === emitterDoc && existingAmount === amount) {
        return {
          isDuplicate: true,
          duplicateOf: doc.id,
          confidence: 0.95,
          reason: "Mesma nota para mesmo emitente e valor",
        };
      }
    }
  }

  if (docNumber && amount && emissionDate) {
    for (const doc of existingDocs) {
      if (!doc.extractedData) continue;
      const data = doc.extractedData as Record<string, unknown>;
      const existingDocNum = data.documentNumber as string | null;
      const existingAmount = data.totalAmount as number | null;
      const existingDate = data.emissionDate as string | null;
      if (existingDocNum === docNumber && existingAmount === amount && existingDate === emissionDate) {
        return {
          isDuplicate: true,
          duplicateOf: doc.id,
          confidence: 0.85,
          reason: "Documento, valor e data iguais",
        };
      }
    }
  }

  return {
    isDuplicate: false,
    duplicateOf: null,
    confidence: 0,
    reason: "Nenhuma duplicata identificada",
  };
}