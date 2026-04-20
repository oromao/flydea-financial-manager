import { NextResponse, NextRequest } from "next/server";
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[AgentScheduler] Critical error in DailyOrchestrator:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
