import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { CreateAgentUseCase } from "@/application/agent/use-cases/CreateAgentUseCase";
import { ListAgentsUseCase } from "@/application/agent/use-cases/ListAgentsUseCase";
import { withRateLimit } from "@/lib/rate-limit";

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const repository = new PrismaAgentRepository();
    const useCase = new CreateAgentUseCase(repository);

    const result = await useCase.execute({
      userId: session.user.id,
      name: body.name,
      description: body.description,
      type: body.type,
      schedule: body.schedule,
      timezone: body.timezone,
      config: body.config || {},
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error creating agent";
    return NextResponse.json({ error: message }, { status: 400 });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error listing agents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
