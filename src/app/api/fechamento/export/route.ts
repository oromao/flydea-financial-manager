import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { computeExportSummary, formatExportValue } from "@/lib/export-helpers";
import { logger } from "@/lib/logger";

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

    logger.info('CSV export generated', {
      userId: session.user.id,
      period,
      transactionCount: transactions.length,
    });

    // Compute summary totals — consistent with financial engine definitions
    const summary = computeExportSummary(transactions);

  // UTF-8 BOM for Excel compatibility on Windows
  const BOM = "\uFEFF";

  const lines = [
    // Header row
    ["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor", "Status Pagamento", "Vencimento", "Pago em"].join(","),
    // Transaction rows
    ...transactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy"),
      `"${t.description.replaceAll('"', '""')}"`,
      t.type === "INCOME" ? "Receita" : "Despesa",
      `"${(t.category?.name || "").replaceAll('"', '""')}"`,
      `"${(t.account?.name || "").replaceAll('"', '""')}"`,
      t.type === "INCOME" ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
      t.paymentStatus,
      t.dueDate ? format(new Date(t.dueDate), "dd/MM/yyyy") : "",
      t.paidAt ? format(new Date(t.paidAt), "dd/MM/yyyy") : "",
    ].join(",")),
    // Blank separator
    "",
    // Summary totals — matching UI Fechamento cards
    `Resumo do Período: ${format(ref, "MMMM yyyy")}`,
    `Receitas,${formatExportValue(summary.totalIncome)}`,
    `Despesas,${formatExportValue(summary.totalExpenses)}`,
    `Saldo,${formatExportValue(summary.balance)}`,
    `Despesas Pagas,${formatExportValue(summary.totalPaid)}`,
    `Despesas Pendentes,${formatExportValue(summary.totalPending)}`,
  ];

  return new NextResponse(BOM + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fechamento-${format(ref, "yyyy-MM")}.csv"`
    }
  });
  } catch (error) {
    logger.error('CSV export failed', {
      userId: session.user.id,
      period,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json(
      { error: "Erro ao gerar exportação CSV" },
      { status: 500 }
    );
  }
}
