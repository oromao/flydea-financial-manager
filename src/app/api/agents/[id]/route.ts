import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { PrismaAgentExecutionRepository } from "@/infrastructure/repositories/PrismaAgentExecutionRepository";
import { ExecuteAgentUseCase } from "@/application/agent/use-cases/ExecuteAgentUseCase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const repository = new PrismaAgentRepository();
    const agent = await repository.findById(params.id);

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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agentRepository = new PrismaAgentRepository();
    const executionRepository = new PrismaAgentExecutionRepository();
    const useCase = new ExecuteAgentUseCase(agentRepository, executionRepository);

    const result = await useCase.execute(params.id, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error executing agent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
