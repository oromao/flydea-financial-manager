import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { picoClaw } from "@/lib/ai/pico-claw";
import { knowledgeService } from "@/lib/ai/knowledge-base/service";
import { logger } from "@/lib/logger";

/**
 * Endpoint for local financial queries (Intelligent Copilot)
 * 
 * This implements the missing RAG-like behavior requested by the UI.
 * It combines real user data from PicoClaw with a local knowledge base.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const userId = session.user.id;
    
    // 1. Fetch real financial context & Knowledge
    const [financialData, knowledgeNodes] = await Promise.all([
      picoClaw.fetchData(userId),
      knowledgeService.getRelevantNodes(query)
    ]);

    const summary = await picoClaw.getQuickSummary(financialData);
    const insights = await picoClaw.generateInsights(financialData);

    // 2. Simple Heuristic Router (instead of expensive LLM)
    let response = "";
    const lowerQuery = query.toLowerCase();

    if (knowledgeNodes.length > 0 && (lowerQuery.includes("dica") || lowerQuery.includes("como") || lowerQuery.includes("ajuda"))) {
      const node = knowledgeNodes[0];
      response = `${node.content} Além disso, analisando seus dados: ${summary}`;
    } else if (lowerQuery.includes("saldo") || lowerQuery.includes("quanto eu tenho")) {
      response = `Atualmente você possui um saldo total de R$ ${financialData.summary.totalBalance.toFixed(2)} em suas contas.`;
    } else if (lowerQuery.includes("gastei") || lowerQuery.includes("despesa")) {
      response = `Neste mês, suas despesas somam R$ ${financialData.summary.monthlyExpenses.toFixed(2)}. ${financialData.summary.netFlow < 0 ? "Atenção: seus gastos estão acima das suas receitas." : "Seu fluxo de caixa está positivo."}`;
    } else if (lowerQuery.includes("insight") || lowerQuery.includes("dica") || lowerQuery.includes("ajuda")) {
      if (insights.length > 0) {
        response = `Aqui estão alguns insights: ${insights.map(i => `${i.title}: ${i.message}`).join(" ")}`;
      } else {
        response = "Sua situação financeira parece estável e não detectei alertas críticos no momento. Continue acompanhando seus lançamentos!";
      }
    } else {
      // Default semantic fallback
      response = `Analisando seus dados: ${summary}. Como posso te ajudar com mais detalhes?`;
    }

    return NextResponse.json({
      answer: response,
      context: {
        totalBalance: financialData.summary.totalBalance,
        monthlyExpenses: financialData.summary.monthlyExpenses,
        netFlow: financialData.summary.netFlow,
        insights: insights.slice(0, 2)
      }
    });

  } catch (error) {
    logger.error("RAG Query Error", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
