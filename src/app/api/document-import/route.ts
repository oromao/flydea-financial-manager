import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { parseDocumentText, computeFileHash } from "@/lib/document-parser";
import { classifyDocument } from "@/lib/category-classifier";
import { checkForDuplicate } from "@/lib/duplicate-detector";
import { uploadFileToBlobStorage } from "@/lib/blob-storage";
import { paddleOCR } from "@/lib/ocr/paddle-ocr";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "text/plain"];

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  logger.info("DocumentImport: processing upload", { userId: session.user.id });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Tipo de arquivo não suportado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeFileHash(buffer);

    logger.info("DocumentImport: file received", { name: file.name, mimeType, bytes: buffer.length });

    // 1. PaddleOCR Pipeline
    const { raw, structured } = await paddleOCR.process(buffer, mimeType);
    
    if (!raw.text || raw.text.length < 5) {
      return NextResponse.json({
        error: "Não foi possível extrair texto do documento via PaddleOCR",
        warning: "Certifique-se que o arquivo é legível.",
      }, { status: 400 });
    }

    // 2. Data Parsing & Normalization
    const extractedData = parseDocumentText(raw.text);
    
    // Merge heuristic data with PaddleOCR structured data (favoring heuristics if robust)
    if (structured.amount) extractedData.totalAmount = structured.amount;
    if (structured.date) extractedData.emissionDate = structured.date;
    if (structured.merchant) extractedData.emitterName = structured.merchant;

    const duplicateCheck = await checkForDuplicate(session.user.id, extractedData, fileHash);

    const classification = await classifyDocument(
      extractedData,
      session.user.id,
      async (userId: string) => {
        return prisma.category.findMany({
          where: {
            OR: [{ userId: null }, { userId }],
          },
          select: { id: true, name: true, type: true },
        });
      }
    );

    const userCategories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
      },
      select: { id: true, name: true, type: true },
    });

    const category = userCategories.find(
      (c) => c.name === classification.categoryName
    ) || userCategories.find((c) => c.name === "Outros");

    // Upload file to Vercel Blob Storage
    let blobUrl = "";
    try {
      blobUrl = await uploadFileToBlobStorage(file.name, buffer, mimeType);
      logger.info("DocumentImport: file uploaded to blob", { url: blobUrl });
    } catch (blobError) {
      logger.warn("DocumentImport: blob upload failed, continuing without file", {
        error: blobError instanceof Error ? blobError.message : String(blobError),
      });
      blobUrl = ""; // Continue without blob URL
    }

    const importedDoc = await prisma.importedDocument.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileType: mimeType,
        fileSize: file.size,
        fileHash,
        blobUrl: blobUrl || null,
        status: "PENDING_REVIEW",
        extractedData: extractedData as unknown as object,
        rawText: raw.text.slice(0, 10000),
        confidence: classification.confidence,
      },
    });

    logger.info("DocumentImport: document created", { id: importedDoc.id, hasBlob: !!blobUrl });

    return NextResponse.json({
      id: importedDoc.id,
      fileName: file.name,
      blobUrl: blobUrl || null,
      extractedData: {
        documentType: extractedData.documentType,
        documentNumber: extractedData.documentNumber,
        emitterName: extractedData.emitterName,
        emitterDocument: extractedData.emitterDocument,
        emissionDate: extractedData.emissionDate,
        dueDate: extractedData.dueDate,
        paymentDate: extractedData.paymentDate,
        totalAmount: extractedData.totalAmount,
        netAmount: extractedData.netAmount,
        taxAmount: extractedData.taxAmount,
        installments: extractedData.installments,
        currentInstallment: extractedData.currentInstallment,
        description: extractedData.description,
        lineItems: extractedData.lineItems,
      },
      classification: {
        transactionType: classification.transactionType,
        categoryName: classification.categoryName,
        categoryId: category?.id,
        paymentStatus: classification.paymentStatus,
        confidence: classification.confidence,
        reasoning: classification.reasoning,
      },
      duplicateCheck,
      needsReview: classification.confidence < 0.8 || duplicateCheck.isDuplicate,
    }, { status: 201 });
  } catch (error) {
    logger.error("DocumentImport error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Erro ao processar documento" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const PAGE_SIZE = 20;
  const where: any = {
    userId: session.user.id,
  };
  if (status) {
    where.status = status;
  }

  const [total, documents] = await Promise.all([
    prisma.importedDocument.count({ where }),
    prisma.importedDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({
    data: documents,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}