import { ZodSchema } from "zod";
import { NextResponse } from "next/server";

export function withValidation<T>(schema: ZodSchema<T>, handler: (body: T, req: Request, ...args: any[]) => Promise<Response>) {
  return async (req: Request, ...args: any[]) => {
    try {
      const raw = await req.json().catch(() => null);
      if (!raw) {
        return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
      }

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      return handler(parsed.data, req, ...args);
    } catch {
      return NextResponse.json({ error: "Erro ao processar requisição" }, { status: 500 });
    }
  };
}
