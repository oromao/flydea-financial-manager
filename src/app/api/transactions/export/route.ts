import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, endOfDay } from "date-fns";
import * as xlsx from "xlsx";
import { computeExportSummary, formatExportValue } from "@/lib/export-helpers";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");
  const paymentStatus = searchParams.get("paymentStatus");

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        ...(type ? { type } : {}),
        ...(category && category !== "Todos" ? { category: { name: category } } : {}),
        ...(paymentStatus && paymentStatus !== "ALL" ? { paymentStatus } : {}),
        ...(startDate || endDate ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: endOfDay(new Date(endDate)) } : {})
          }
        } : {})
      },
      include: { category: true, account: true },
      orderBy: { date: "desc" }
    });

    logger.info('XLSX export generated', {
      userId: session.user.id,
      transactionCount: transactions.length,
      filters: { type, category, paymentStatus, startDate, endDate },
    });

    const rows = transactions.map((t) => ({
      "Data": format(new Date(t.date), "dd/MM/yyyy"),
      "Tipo": t.type === "INCOME" ? "Receita" : "Despesa",
      "Descrição": t.description,
      "Categoria": t.category?.name || "",
      "Conta": t.account?.name || "",
      "Valor (R$)": t.type === "INCOME" ? t.amount : -t.amount,
      "Status": t.status,
      "Pagamento": t.paymentStatus,
      "Vencimento": t.dueDate ? format(new Date(t.dueDate), "dd/MM/yyyy") : "",
      "Pago em": t.paidAt ? format(new Date(t.paidAt), "dd/MM/yyyy") : "",
      "Pago parcial (R$)": t.amountPaid || 0,
      "Restante (R$)": t.type === "EXPENSE" ? Math.max(0, t.amount - (t.amountPaid || 0)) : 0,
      "Observações": t.observations || ""
    }));

    // Compute summary totals — consistent with financial engine definitions
    const summary = computeExportSummary(transactions);

    // Add summary footer rows
    const summaryRows: Record<string, string | number | Date | null>[] = [
      {},
      { "Data": "RESUMO", "Descrição": "", "Valor (R$)": "", "Observações": "" },
      { "Descrição": "Receitas", "Valor (R$)": summary.totalIncome, "Observações": formatExportValue(summary.totalIncome) },
      { "Descrição": "Despesas", "Valor (R$)": -summary.totalExpenses, "Observações": formatExportValue(summary.totalExpenses) },
      { "Descrição": "Saldo", "Valor (R$)": summary.balance, "Observações": formatExportValue(summary.balance) },
      { "Descrição": "Despesas Pagas", "Valor (R$)": -summary.totalPaid, "Observações": formatExportValue(summary.totalPaid) },
      { "Descrição": "Despesas Pendentes", "Valor (R$)": -summary.totalPending, "Observações": formatExportValue(summary.totalPending) },
    ];

    rows.push(...summaryRows as any);

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Transações");

    const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="flydea-transacoes-${format(new Date(), "yyyy-MM-dd")}.xlsx"`
      }
    });
  } catch (error) {
    logger.error('XLSX export failed', {
      userId: session.user.id,
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return NextResponse.json(
      { error: "Erro ao gerar exportação XLSX" },
      { status: 500 }
    );
  }
});
