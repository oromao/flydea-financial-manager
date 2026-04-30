import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const resetToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpires: expires,
    }
  });

  try {
    await sendPasswordResetEmail({
      to: user.email!,
      name: user.name || "Usuário",
      token: resetToken,
    });
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }

  return NextResponse.json({ 
    message: "Se o email existir, você receberá um link de recuperação." 
  });
}