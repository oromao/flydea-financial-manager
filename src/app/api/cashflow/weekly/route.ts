import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateWeeklyCashflow, canSpendThisWeek } from "@/lib/cashflow";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  try {
    const cashflow = await calculateWeeklyCashflow(session.user.id, date);
    const spendDecision = await canSpendThisWeek(session.user.id);

    return NextResponse.json({
      cashflow,
      spendDecision,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Cashflow calculation error:", error);
    return NextResponse.json(
      { error: "Erro ao calcular fluxo de caixa" },
      { status: 500 }
    );
  }
}
