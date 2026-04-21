import { NextResponse, NextRequest } from "next/server";
import { BehavioralIntelligenceService } from "@/infrastructure/services/BehavioralIntelligenceService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { type, metadata } = body;

    if (!type || !["VIEWED", "CLICKED", "DISMISSED", "ACTED"].includes(type)) {
      return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
    }

    const service = new BehavioralIntelligenceService();
    await service.trackInteraction(id, type, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
