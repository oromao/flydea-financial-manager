import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { PrismaAgentExecutionRepository } from "@/infrastructure/repositories/PrismaAgentExecutionRepository";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agentRepository = new PrismaAgentRepository();
    const agent = await agentRepository.findById(params.id);

    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const executionRepository = new PrismaAgentExecutionRepository();
    const executions = await executionRepository.findByAgentId(params.id);

    const formatted = executions.map((e) => ({
      id: e.id,
      status: e.status,
      output: typeof e.output === "string" ? e.output : JSON.stringify(e.output || {}),
      error: e.error,
      createdAt: e.createdAt.toISOString(),
      startedAt: e.startedAt?.toISOString() || null,
      completedAt: e.completedAt?.toISOString() || null,
    }));

    return NextResponse.json({ executions: formatted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error fetching executions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
