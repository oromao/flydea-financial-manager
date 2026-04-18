import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    documentId,
    overrideType,
    overrideCategoryId,
    overrideAmount,
    overrideDate,
    overrideDueDate,
    overridePaymentStatus,
    overrideDescription,
    confirmAnyway,
  } = body;

  logger.info("DocumentImportConfirm: confirming", { userId: session.user.id, documentId });

  if (!documentId) {
    return NextResponse.json({ error: "ID do documento obrigatório" }, { status: 400 });
  }

  const importedDoc = await prisma.importedDocument.findUnique({
    where: { id: documentId, userId: session.user.id },
  });

  if (!importedDoc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  if (importedDoc.status === "IMPORTED") {
    return NextResponse.json({ error: "Documento já importado" }, { status: 400 });
  }

  const extractedData = importedDoc.extractedData as Record<string, unknown> | null;
  
  const transactionType = overrideType || 
    (extractedData?.documentType === "NOTA_FISCAL" ? "EXPENSE" : "EXPENSE");

  const amount = overrideAmount || extractedData?.totalAmount;
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Valor inválido ou não encontrado" }, { status: 400 });
  }

  const dateStr = overrideDate || extractedData?.emissionDate as string | null;
  if (!dateStr) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  if (!overrideCategoryId) {
    return NextResponse.json({ error: "Categoria obrigatória" }, { status: 400 });
  }

  const dueDateStr = overrideDueDate || extractedData?.dueDate as string | null;
  const paymentStatus = overridePaymentStatus || extractedData?.paymentStatus as string | null || "PENDING";
  
  const paidAt = paymentStatus === "PAID" 
    ? new Date() 
    : extractedData?.paymentDate 
      ? new Date(extractedData.paymentDate as string) 
      : null;

  const description = overrideDescription || 
    extractedData?.description as string || 
    importedDoc.fileName;

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: transactionType,
          description,
          categoryId: overrideCategoryId,
          amount,
          date: new Date(dateStr),
          dueDate: dueDateStr ? new Date(dueDateStr) : null,
          paidAt: paidAt || null,
          amountPaid: paymentStatus === "PAID" ? amount : 0,
          paymentStatus,
          attachmentUrl: importedDoc.blobUrl,
          blobUrl: importedDoc.blobUrl,
          userId: session.user.id,
          importedDocumentId: importedDoc.id,
        },
      });

      await tx.importedDocument.update({
        where: { id: importedDoc.id },
        data: {
          status: "IMPORTED",
          updatedAt: new Date(),
        },
      });

      return newTransaction;
    });

    await prisma.auditLog.create({
      data: {
        action: "IMPORT",
        entity: "TRANSACTION",
        entityId: transaction.id,
        details: `Importado de ${importedDoc.fileName}`,
        userId: session.user.id,
      },
    });

    logger.info("DocumentImportConfirm: transaction created", { transactionId: transaction.id });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        paymentStatus: transaction.paymentStatus,
      },
    });
  } catch (error) {
    logger.error("DocumentImportConfirm error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const documentId = searchParams.get("id");

  if (!documentId) {
    return NextResponse.json({ error: "ID do documento obrigatório" }, { status: 400 });
  }

  const importedDoc = await prisma.importedDocument.findUnique({
    where: { id: documentId, userId: session.user.id },
  });

  if (!importedDoc) {
    return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  }

  await prisma.importedDocument.update({
    where: { id: documentId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({ success: true });
}