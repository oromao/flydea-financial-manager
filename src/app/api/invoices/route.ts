import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceSchema } from "@/lib/validations";
import { calculateWeeklyCashflow, saveCashflowForecast } from "@/lib/cashflow";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const clientName = searchParams.get("clientName");

  const where: any = {
    userId: session.user.id,
    ...(status ? { status } : {}),
    ...(clientName ? { clientName: { contains: clientName, mode: "insensitive" } } : {})
  };

  const invoices = await prisma.invoice.findMany({
    where,
    include: { installments: true },
    orderBy: { emissionDate: "desc" }
  });

  return NextResponse.json({ data: invoices });
}

export async function POST(request: NextRequest) {
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

    // Recalcular fluxo semanal e salvar no cache
    const monthYear = new Date(emissionDate).toLocaleDateString("pt-BR", {
      month: "2-digit",
      year: "numeric"
    });
    const cashflow = await calculateWeeklyCashflow(session.user.id, new Date(emissionDate));

    for (const week of cashflow.weeks) {
      await saveCashflowForecast(session.user.id, monthYear, week);
    }

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
  } catch (error: any) {
    console.error("Invoice creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Número de nota já existe para este mês" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erro ao criar nota" }, { status: 500 });
  }
}
