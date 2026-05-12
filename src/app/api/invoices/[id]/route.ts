import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";

const InvoiceUpdateSchema = z.object({
  installmentId: z.string().min(1),
  status: z.enum(["PENDING", "RECEIVED", "OVERDUE"]),
  paidAmount: z.number().positive().optional(),
});

export const GET = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { installments: true }
  });

  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Invoice não encontrada" }, { status: 404 });
  }

  return NextResponse.json(invoice);
});

export const PUT = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = InvoiceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { installmentId, status, paidAmount } = parsed.data;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { installments: true }
    });

    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice não encontrada" }, { status: 404 });
    }

    const originalInstallment = await prisma.invoiceInstallment.findUnique({
      where: { id: installmentId }
    });

    if (!originalInstallment) {
      return NextResponse.json({ error: "Installment não encontrada" }, { status: 404 });
    }

    const installment = await prisma.invoiceInstallment.update({
      where: { id: installmentId },
      data: {
        status,
        paidAt: status === "RECEIVED" ? new Date() : null,
        paidAmount: paidAmount || (status === "RECEIVED" ? originalInstallment.amount : null)
      }
    });

    // Verificar se todas as parcelas foram recebidas
    const allInstallments = await prisma.invoiceInstallment.findMany({
      where: { invoiceId: id }
    });

    const allReceived = allInstallments.every(inst => inst.status === "RECEIVED");

    if (allReceived) {
      await prisma.invoice.update({
        where: { id },
        data: { status: "FULLY_PAID" }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "INVOICE_INSTALLMENT",
        entityId: installmentId,
        details: `Parcela atualizada: ${status}`,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true, installment });
  } catch (error) {
    logger.error("Invoice update error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
});
