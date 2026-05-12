import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const revenues = await prisma.revenue.findMany({
      where: { userId: user.id },
      include: {
        installments: true,
        category: true,
      },
      orderBy: { emissionDate: "desc" },
    });

    return new Response(JSON.stringify(revenues), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Error fetching revenues", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: "Failed to fetch revenues" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

export const POST = withRateLimit(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const {
      description,
      totalAmount,
      emissionDate,
      type = "PARCELADO",
      categoryId,
      installmentData = [],
    } = body;

    if (!description || !totalAmount || !emissionDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Criar receita
    const revenue = await prisma.revenue.create({
      data: {
        userId: user.id,
        description,
        totalAmount,
        emissionDate: new Date(emissionDate),
        type,
        categoryId,
        observations: body.observations,
      },
    });

    // Criar parcelas
    let installments: typeof installmentData = installmentData;

    // Se AVISTA, criar 1 parcela
    if (type === "AVISTA" && installments.length === 0) {
      installments = [
        {
          amount: totalAmount,
          dueDate: new Date(emissionDate),
        },
      ];
    }

    // Se PARCELADO sem parcelas, distribuir uniformemente
    if (
      type === "PARCELADO" &&
      installments.length === 0 &&
      body.numberOfInstallments
    ) {
      const monthlyAmount = totalAmount / body.numberOfInstallments;
      const baseDate = new Date(emissionDate);

      installments = Array.from(
        { length: body.numberOfInstallments },
        (_, i) => {
          const dueDate = new Date(baseDate);
          dueDate.setMonth(dueDate.getMonth() + i + 1);
          return {
            amount: monthlyAmount,
            dueDate,
          };
        }
      );
    }

    // Criar installments no banco
    const createdInstallments = await Promise.all(
      installments.map((inst: { amount: number; dueDate: string | Date }, idx: number) =>
        prisma.revenueInstallment.create({
          data: {
            revenueId: revenue.id,
            installmentNumber: idx + 1,
            amount: inst.amount,
            dueDate: new Date(inst.dueDate),
            status: "PENDING",
          },
        })
      )
    );

    return new Response(
      JSON.stringify({
        revenue,
        installments: createdInstallments,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Error creating revenue", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({
        error: "Failed to create revenue",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
