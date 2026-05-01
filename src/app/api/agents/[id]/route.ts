import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { PrismaAgentExecutionRepository } from "@/infrastructure/repositories/PrismaAgentExecutionRepository";
import { ExecuteAgentUseCase } from "@/application/agent/use-cases/ExecuteAgentUseCase";
import { DeleteAgentUseCase } from "@/application/agent/use-cases/DeleteAgentUseCase";
import { withRateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repository = new PrismaAgentRepository();
    const agent = await repository.findById(id);

    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agent);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching agent" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agentRepository = new PrismaAgentRepository();
    const executionRepository = new PrismaAgentExecutionRepository();
    const useCase = new ExecuteAgentUseCase(agentRepository, executionRepository);

    const result = await useCase.execute(id, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error executing agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const DELETE = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repository = new PrismaAgentRepository();
    const useCase = new DeleteAgentUseCase(repository);

    await useCase.execute({
      agentId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error deleting agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
});
