import { NextResponse, NextRequest } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { DailyIntelligenceOrchestrator } from "@/infrastructure/services/DailyIntelligenceOrchestrator";

const CRON_SECRET = process.env.CRON_SECRET || "development";

/**
 * Daily agent processor (runs once per day via Vercel cron at 09:00)
 * Acts as the single central orchestrator for the Mini IA features and agents.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orchestrator = new DailyIntelligenceOrchestrator();
    const result = await orchestrator.runDailyPipeline();

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        results: result,
      },
      { status: 200 }
    );
  } catch {
    console.error("[AgentScheduler] Critical error in DailyOrchestrator");
    return apiError("Erro interno no processamento diário", 500, "INTERNAL_ERROR");
  }
}

/**
 * Manual trigger for development/testing
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Manual trigger only in development" },
      { status: 405 }
    );
  }

  try {
    const orchestrator = new DailyIntelligenceOrchestrator();
    const result = await orchestrator.runDailyPipeline();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: result,
    });
  } catch {
    return apiError("Erro interno no processamento diário", 500, "INTERNAL_ERROR");
  }
}
