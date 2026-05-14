import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-helpers";
import { z } from "zod";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { CreateAgentUseCase } from "@/application/agent/use-cases/CreateAgentUseCase";
import { ListAgentsUseCase } from "@/application/agent/use-cases/ListAgentsUseCase";
import { withRateLimit } from "@/lib/rate-limit";

const CreateAgentSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  type: z.enum([
    "BUDGET_REVIEW", "EXPENSE_ALERT", "INCOME_CHECK",
    "CASHFLOW_FORECAST", "SAVINGS_GOAL", "CUSTOM",
  ]).optional(),
  schedule: z.string().min(1, "Schedule obrigatório"),
  timezone: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const repository = new PrismaAgentRepository();
    const useCase = new CreateAgentUseCase(repository);

    const result = await useCase.execute({
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      type: parsed.data.type || "CUSTOM",
      schedule: parsed.data.schedule,
      timezone: parsed.data.timezone,
      config: parsed.data.config || {},
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return apiError("Erro ao criar agente", 400, "VALIDATION_ERROR");
  }
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repository = new PrismaAgentRepository();
    const useCase = new ListAgentsUseCase(repository);

    const agents = await useCase.execute(session.user.id);

    return NextResponse.json({ agents });
  } catch {
    return apiError("Erro ao listar agentes", 500, "INTERNAL_ERROR");
  }
}
