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
import { generateRequestId } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "text/plain"];

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  logger.info("DocumentImport: starting process", { requestId, userId });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      logger.warn("DocumentImport: no file in request", { requestId, userId });
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      logger.warn("DocumentImport: file too large", { requestId, userId, size: file.size });
      return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.includes(mimeType)) {
      logger.warn("DocumentImport: unsupported type", { requestId, userId, mimeType });
      return NextResponse.json({ error: "Tipo de arquivo não suportado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeFileHash(buffer);

    // Start blob upload in background early
    const blobUploadPromise = uploadFileToBlobStorage(file.name, buffer, mimeType).catch((blobError) => {
      logger.error("DocumentImport: blob upload failed", {
        requestId,
        userId,
        error: blobError instanceof Error ? blobError.message : String(blobError),
      });
      return "";
    });

    // 1. Extraction Pipeline (Fast-path for text files)
    let rawText = "";
    let structured: any = {};
    const ocrStartTime = Date.now();

    if (mimeType === "text/plain") {
      rawText = buffer.toString("utf-8");
      logger.info("DocumentImport: plain text bypass used", { requestId, userId, length: rawText.length });
    } else {
      logger.info("DocumentImport: calling OCR/PDF parser", { requestId, userId, mimeType });
      const ocrResult = await paddleOCR.process(buffer, mimeType);
      rawText = ocrResult.raw.text;
      structured = ocrResult.structured;
      logger.info("DocumentImport: Extraction finished", { 
        requestId, 
        userId, 
        length: rawText.length,
        duration: Date.now() - ocrStartTime 
      });
    }
    
    if (!rawText || rawText.length < 5) {
      logger.warn("DocumentImport: extraction yielded no text", { requestId, userId });
      return NextResponse.json({
        error: "Não foi possível extrair texto do documento",
        warning: "Certifique-se que o arquivo é legível.",
      }, { status: 400 });
    }

    // 2. Data Parsing & Normalization
    const extractedData = parseDocumentText(rawText);
    
    // Merge heuristic data with PaddleOCR structured data (favoring heuristics if robust)
    if (structured.amount) extractedData.totalAmount = structured.amount;
    if (structured.date) extractedData.emissionDate = structured.date;
    if (structured.merchant) extractedData.emitterName = structured.merchant;

    // Run classification and duplicate check in parallel
    const duplicateCheckPromise = checkForDuplicate(session.user.id, extractedData, fileHash);
    const classificationPromise = classifyDocument(
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

    const [classification, duplicateCheck, blobUrl] = await Promise.all([
      classificationPromise,
      duplicateCheckPromise,
      blobUploadPromise
    ]);

    const userCategories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: session.user.id }],
      },
      select: { id: true, name: true, type: true },
    });

    const category = userCategories.find(
      (c) => c.name === classification.categoryName
    ) || userCategories.find((c) => c.name === "Outros");

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
        rawText: rawText.slice(0, 10000),
        confidence: classification.confidence,
      },
    });

    const totalDuration = Date.now() - startTime;
    logger.track("DOCUMENT_IMPORTED", { 
      requestId, 
      userId, 
      docId: importedDoc.id, 
      duration: totalDuration,
      confidence: classification.confidence,
      hasBlob: !!blobUrl
    });

    return NextResponse.json({
      id: importedDoc.id,
      fileName: file.name,
      blobUrl: blobUrl || null,
      extractedData,
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
    logger.error("DocumentImport: critical error", { 
      requestId, 
      userId, 
      error: error instanceof Error ? error.stack : String(error) 
    });
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