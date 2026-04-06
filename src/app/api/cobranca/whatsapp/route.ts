import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { installmentId, message, phoneNumber } = body;

  if (!installmentId || !phoneNumber) {
    return NextResponse.json(
      { error: "installmentId e phoneNumber são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const installment = await prisma.invoiceInstallment.findUnique({
      where: { id: installmentId },
      include: { invoice: true }
    });

    if (!installment || installment.invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Installment não encontrada" }, { status: 404 });
    }

    // Gerar mensagem padrão se não fornecida
    const defaultMessage = `Olá ${installment.invoice.clientName},\n\nVencimento: ${new Date(installment.dueDate).toLocaleDateString("pt-BR")}\nValor: R$ ${installment.amount.toFixed(2)}\n\nFavor confirmar o recebimento. Obrigado!`;
    const finalMessage = message || defaultMessage;

    // AQUI: Integração real com WhatsApp (Twilio, WhatsApp Business API, etc.)
    // Por agora, simulamos o envio
    console.log(`[WhatsApp] Para: ${phoneNumber}`);
    console.log(`[WhatsApp] Mensagem: ${finalMessage}`);

    // Salvar registro de cobrança
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Cobrança Enviada",
        message: `Cobrança enviada para ${phoneNumber}`,
        type: "PAYMENT_REMINDER",
        relatedId: installmentId,
        relatedType: "INVOICE_INSTALLMENT"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "SEND_PAYMENT_REMINDER",
        entity: "INVOICE_INSTALLMENT",
        entityId: installmentId,
        details: `Cobrança enviada via WhatsApp para ${phoneNumber}`,
        userId: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cobrança enviada com sucesso",
      installmentId,
      phoneNumber,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json(
      { error: "Erro ao enviar cobrança" },
      { status: 500 }
    );
  }
}
