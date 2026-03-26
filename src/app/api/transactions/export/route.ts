import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import * as xlsx from "xlsx";

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

  const rows = transactions.map((t) => ({
    "Data": format(new Date(t.date), "dd/MM/yyyy"),
    "Tipo": t.type === "INCOME" ? "Receita" : "Despesa",
    "Descrição": t.description,
    "Categoria": t.category?.name || "",
    "Conta": t.account?.name || "",
    "Valor (R$)": t.type === "INCOME" ? t.amount : -t.amount,
    "Status": t.status,
    "Observações": t.observations || ""
  }));

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
}
