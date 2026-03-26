import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, ensureBasicData } from "@/lib/prisma";
import { CategorySchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBasicData();

  // Return system categories (userId null) + user's own categories
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: null },
        { userId: session.user.id }
      ]
    },
    orderBy: { name: "asc" }
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = CategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { name, type } = parsed.data;

  // Check for duplicate name for this user
  const existing = await prisma.category.findFirst({
    where: { name, userId: session.user.id }
  });
  if (existing) return NextResponse.json({ error: "Categoria já existe" }, { status: 409 });

  const category = await prisma.category.create({
    data: { name, type, userId: session.user.id }
  });

  return NextResponse.json(category);
}
