import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { picoClaw } from "@/lib/ai/pico-claw";
import { knowledgeService } from "@/lib/ai/knowledge-base/service";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

const RagQuerySchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
});

/**
 * Endpoint for local financial queries (Intelligent Copilot)
 * 
 * This implements the missing RAG-like behavior requested by the UI.
 * It combines real user data from PicoClaw with a local knowledge base.
 */
export const POST = withRateLimit(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RagQuerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { query } = parsed.data;

    const userId = session.user.id;
    
    // 1. Process via PicoClaw v2 (HIE)
    const [result, knowledgeNodes] = await Promise.all([
      picoClaw.processQuery(userId, query),
      knowledgeService.getRelevantNodes(query)
    ]);

    let finalResponse = result.response;

    // 2. Augment with Knowledge Base if relevant and confidence is high enough
    if (knowledgeNodes.length > 0 && (result.intent === "HELP" || result.intent === "INSIGHT" || result.confidence < 0.6)) {
      finalResponse = `${knowledgeNodes[0].content}\n\n${finalResponse}`;
    }

    return NextResponse.json({
      answer: finalResponse,
      context: {
        intent: result.intent,
        confidence: result.confidence,
        totalBalance: result.data.summary.totalBalance,
        monthlyExpenses: result.data.summary.monthlyExpenses,
        netFlow: result.data.summary.netFlow,
        insights: (await picoClaw.generateInsights(result.data)).slice(0, 2)
      }
    });

  } catch (error) {
    logger.error("RAG Query Error", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
