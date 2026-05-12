import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const clientName = searchParams.get("clientName");

  const where: Record<string, unknown> = {
    userId: session.user.id,
    ...(status ? { status } : {}),
    ...(clientName ? { clientName: { contains: clientName, mode: "insensitive" as const } } : {})
  };

  const invoices = await prisma.invoice.findMany({
    where,
    include: { installments: true },
    orderBy: { emissionDate: "desc" }
  });

  return NextResponse.json({ data: invoices });
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = InvoiceSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const errorMsg = Object.entries(flattened)
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
      .join(" | ");
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const {
    invoiceNumber,
    clientName,
    clientEmail,
    description,
    totalAmount,
    emissionDate,
    dueDate,
    observations,
    paymentMethod,
    installments
  } = parsed.data;

  try {
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        invoiceNumber,
        clientName,
        clientEmail: clientEmail || null,
        description: description || null,
        totalAmount,
        emissionDate: new Date(emissionDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        observations: observations || null,
        paymentMethod: paymentMethod || null,
        status: "EMITTED",
        installments: {
          create: installments.map((inst, idx) => ({
            installmentNumber: inst.installmentNumber || idx + 1,
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
            status: inst.status || "PENDING"
          }))
        }
      },
      include: { installments: true }
    });

    // Note: Cashflow forecast is now computed on-the-fly by the financial engine.
    // No cache invalidation needed when invoices are created.

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "INVOICE",
        entityId: invoice.id,
        details: `Nova nota: ${invoiceNumber} - ${clientName}`,
        userId: session.user.id
      }
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Invoice creation error", { error: err.message });
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Número de nota já existe para este mês" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erro ao criar nota" }, { status: 500 });
  }
});
