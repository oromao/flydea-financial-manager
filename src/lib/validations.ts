import { z } from "zod";

export const TransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "Descrição obrigatória").max(255),
  categoryId: z.string().uuid("Categoria inválida"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  observations: z.string().max(1000).optional(),
  frequency: z.enum(["NONE", "MONTHLY", "WEEKLY"]).default("NONE"),
  attachmentUrl: z.string().url().optional().or(z.literal("")),
  blobUrl: z.string().url().optional().or(z.literal("")),
  accountId: z.string().uuid().optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const RecurrenceSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória").max(255),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
  frequency: z.enum(["MONTHLY", "WEEKLY"]),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  categoryId: z.string().uuid("Categoria inválida"),
});

export const AccountSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  type: z.enum(["CHECKING", "SAVINGS", "CREDIT", "CASH"]),
  balance: z.coerce.number().default(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").optional(),
});

export const BudgetSchema = z.object({
  categoryId: z.string().uuid("Categoria inválida"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  period: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  alertAt: z.coerce.number().min(1).max(100).default(80),
});

export const TagSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida").default("#3B82F6"),
});

export const CategorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type RecurrenceInput = z.infer<typeof RecurrenceSchema>;
export type AccountInput = z.infer<typeof AccountSchema>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
export type TagInput = z.infer<typeof TagSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
