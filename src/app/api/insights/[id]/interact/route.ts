import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-helpers";
import { BehavioralIntelligenceService } from "@/infrastructure/services/BehavioralIntelligenceService";
import { withRateLimit } from "@/lib/rate-limit";

const InsightInteractSchema = z.object({
  type: z.enum(["VIEWED", "CLICKED", "DISMISSED", "ACTED"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const POST = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const body = await request.json();
  const parsed = InsightInteractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { type, metadata } = parsed.data;

  try {
    const service = new BehavioralIntelligenceService();
    await service.trackInteraction(id, type, metadata);

    return NextResponse.json({ success: true });
  } catch {
    return apiError("Erro ao registrar interação", 500, "INTERNAL_ERROR");
  }
});
