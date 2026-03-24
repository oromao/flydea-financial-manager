import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, ensureBasicData } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBasicData();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return NextResponse.json(categories);
}
