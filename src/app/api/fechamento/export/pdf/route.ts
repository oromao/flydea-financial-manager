import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { computeExportSummary, formatExportValue } from "@/lib/export-helpers";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = request.nextUrl.searchParams.get("period") || "0";
  const ref = subMonths(new Date(), parseInt(period, 10));
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id, date: { gte: start, lte: end } },
      include: { category: true, account: true },
      orderBy: { date: "desc" }
    });

    logger.info('PDF export generated', {
      userId: session.user.id,
      period,
      transactionCount: transactions.length,
    });

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape" });
    const title = `Fechamento Mensal - ${format(ref, "MMMM yyyy")}`;

    doc.setFontSize(18);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 25);

    const rows = transactions.map((t) => ([
      format(new Date(t.date), "dd/MM/yyyy"),
      t.description,
      t.type === "INCOME" ? "Receita" : "Despesa",
      t.category?.name || "",
      t.account?.name || "",
      t.amount.toFixed(2),
      (t.amountPaid || 0).toFixed(2),
      t.type === "EXPENSE" ? Math.max(0, t.amount - (t.amountPaid || 0)).toFixed(2) : "0.00",
      t.paymentStatus,
      t.dueDate ? format(new Date(t.dueDate), "dd/MM/yyyy") : "",
      t.paidAt ? format(new Date(t.paidAt), "dd/MM/yyyy") : "",
    ]));

    // Compute summary totals — consistent with financial engine definitions
    const summary = computeExportSummary(transactions);

    // Add summary footer rows
    rows.push([]);
    rows.push(["", "", "", "", "RESUMO DO PERÍODO", "", "", "", "", "", ""]);
    rows.push(["", "", "", "", "Receitas", formatExportValue(summary.totalIncome), "", "", "", "", ""]);
    rows.push(["", "", "", "", "Despesas", formatExportValue(summary.totalExpenses), "", "", "", "", ""]);
    rows.push(["", "", "", "", "Saldo", formatExportValue(summary.balance), "", "", "", "", ""]);
    rows.push(["", "", "", "", "Despesas Pagas", formatExportValue(summary.totalPaid), "", "", "", "", ""]);
    rows.push(["", "", "", "", "Despesas Pendentes", formatExportValue(summary.totalPending), "", "", "", "", ""]);

    autoTable(doc, {
      startY: 32,
      head: [["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor", "Pago parcial", "Restante", "Pagamento", "Vencimento", "Pago em"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [9, 9, 11] },
    });

    const pdf = doc.output("arraybuffer");
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="fechamento-${format(ref, "yyyy-MM")}.pdf"`
      }
    });
  } catch (error) {
    logger.error('PDF export failed', {
      userId: session.user.id,
      period,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json(
      { error: "Erro ao gerar exportação PDF" },
      { status: 500 }
    );
  }
}
