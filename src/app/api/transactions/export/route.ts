import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const category = searchParams.get("category");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(category && category !== "Todos" ? { category: { name: category } } : {}),
      ...(startDate || endDate ? {
        date: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {})
        }
      } : {})
    },
    include: { category: true, account: true },
    orderBy: { date: "desc" }
  });

  // Build CSV
  const header = ["Data", "Tipo", "Descrição", "Categoria", "Conta", "Valor (R$)", "Status", "Observações"];
  const rows = transactions.map((t) => [
    format(new Date(t.date), "dd/MM/yyyy"),
    t.type === "INCOME" ? "Receita" : "Despesa",
    `"${t.description.replace(/"/g, '""')}"`,
    t.category?.name || "",
    t.account?.name || "",
    t.type === "INCOME" ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`,
    t.status,
    `"${(t.observations || "").replace(/"/g, '""')}"`
  ]);

  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flydea-transacoes-${format(new Date(), "yyyy-MM-dd")}.csv"`
    }
  });
}
