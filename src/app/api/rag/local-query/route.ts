import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserFinancialData } from "@/lib/financial-rag";
import { ragQueryEngine } from "@/lib/rag/query-engine";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query é obrigatória" },
        { status: 400 }
      );
    }

    // Get user financial data
    const financialData = await getUserFinancialData(session.user.id);

    // Process query through RAG engine
    const ragResponse = ragQueryEngine.processQuery(
      query,
      financialData,
      3
    );

    return NextResponse.json({
      response: ragResponse.response,
      sources: ragResponse.sources.map(doc => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
      })),
      metrics: ragResponse.relevantMetrics,
    });
  } catch (error) {
    console.error("RAG Error:", error);

    const message =
      error instanceof Error ? error.message : "Erro ao processar query";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// GET endpoint to check RAG availability
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "available",
    message: "Local RAG endpoint is ready",
    type: "local-rag",
  });
}
