import { z } from "zod";

const optionalDate = z
  .string().optional().nullable()
  .transform((v) => (v === "" || v === null ? undefined : v))
  .refine((v) => v === undefined || !isNaN(Date.parse(v)), "Data inválida");

const optionalUuid = z
  .string().optional().nullable()
  .transform((v) => (v === "" || v === null ? undefined : v))
  .refine(
    (v) =>
      v === undefined ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
    "ID inválido"
  );

export const TransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "Descrição obrigatória").max(255),
  categoryId: optionalUuid,
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  dueDate: optionalDate,
  paidAt: optionalDate,
  amountPaid: z.coerce.number().min(0).optional(),
  observations: z.string().max(1000).optional(),
  frequency: z.enum(["NONE", "MONTHLY", "WEEKLY"]).default("NONE"),
  paymentStatus: z.enum(["PAID", "PENDING"]).default("PAID"),
  attachmentUrl: z.string().url().optional().or(z.literal("")).nullable(),
  blobUrl: z.string().url().optional().or(z.literal("")).nullable(),
  accountId: optionalUuid,
  tagIds: z.array(z.string().uuid()).optional(),
});

export const RecurrenceSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória").max(255),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
  frequency: z.enum(["MONTHLY", "WEEKLY"]),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  categoryId: z.string().uuid("Categoria inválida"),
  isActive: z.boolean().optional(),
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

export const InvoiceInstallmentSchema = z.object({
  installmentNumber: z.number().int().positive(),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  status: z.enum(["PENDING", "RECEIVED", "OVERDUE"]).default("PENDING"),
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Número da nota obrigatório"),
  clientName: z.string().min(1, "Nome do cliente obrigatório"),
  clientEmail: z.string().email("Email inválido").optional(),
  description: z.string().optional(),
  totalAmount: z.coerce.number().positive("Valor total deve ser positivo"),
  emissionDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida").optional(),
  observations: z.string().max(1000).optional(),
  paymentMethod: z.string().optional(),
  installments: z.array(InvoiceInstallmentSchema).min(1, "Mínimo 1 parcela"),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type RecurrenceInput = z.infer<typeof RecurrenceSchema>;
export type AccountInput = z.infer<typeof AccountSchema>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
export type TagInput = z.infer<typeof TagSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type InvoiceInput = z.infer<typeof InvoiceSchema>;
export type InvoiceInstallmentInput = z.infer<typeof InvoiceInstallmentSchema>;
