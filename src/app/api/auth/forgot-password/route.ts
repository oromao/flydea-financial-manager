import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import { withRateLimit } from "@/lib/rate-limit";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const body = await request.json();
  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  const resetToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  if (user) {
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
  }

  // Always return same message to prevent user enumeration
  return NextResponse.json({ 
    message: "Se o email existir, você receberá um link de recuperação." 
  });
})