import { ZodSchema } from "zod";
import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  fields?: Record<string, string[] | undefined>;
}

export function apiError(
  message: string,
  status: number = 400,
  code?: string,
  fields?: Record<string, string[] | undefined>,
  headers?: Record<string, string>
): NextResponse {
  const body: ApiErrorResponse = { error: message };
  if (code) body.code = code;
  if (fields) body.fields = fields;
  return NextResponse.json(body, { status, headers });
}

export function apiSuccess<T>(data: T, status: number = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(data, { status, headers });
}

export function withValidation<T>(schema: ZodSchema<T>, handler: (body: T, req: Request, ...args: unknown[]) => Promise<Response>) {
  return async (req: Request, ...args: unknown[]) => {
    try {
      const raw = await req.json().catch(() => null);
      if (!raw) {
        return apiError("Corpo da requisição inválido", 400, "VALIDATION_ERROR");
      }

      const parsed = schema.safeParse(raw);
      if (!parsed.success) {
        return apiError("Dados inválidos", 400, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
      }

      return handler(parsed.data, req, ...args);
    } catch {
      return apiError("Erro ao processar requisição", 500, "INTERNAL_ERROR");
    }
  };
}
