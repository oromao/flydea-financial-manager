import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const period = request.nextUrl.searchParams.get("period") || "0";
  const ref = subMonths(new Date(), parseInt(period, 10));
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    include: { category: true, account: true },
    orderBy: { date: "desc" }
  });

  const lines = [
    ["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor", "Status Pagamento", "Vencimento", "Pago em"].join(","),
    ...transactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy"),
      `"${t.description.replaceAll('"', '""')}"`,
      t.type,
      `"${(t.category?.name || "").replaceAll('"', '""')}"`,
      `"${(t.account?.name || "").replaceAll('"', '""')}"`,
      t.amount,
      t.paymentStatus,
      t.dueDate ? format(new Date(t.dueDate), "dd/MM/yyyy") : "",
      t.paidAt ? format(new Date(t.paidAt), "dd/MM/yyyy") : "",
    ].join(","))
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fechamento-${format(ref, "yyyy-MM")}.csv"`
    }
  });
}
