import { describe, it, expect } from "vitest";
import { formatZodError } from "../src/lib/format-errors";

describe("formatZodError", () => {
  it("returns 'Erro desconhecido' for null", () => {
    expect(formatZodError(null)).toBe("Erro desconhecido");
  });

  it("returns 'Erro desconhecido' for undefined", () => {
    expect(formatZodError(undefined)).toBe("Erro desconhecido");
  });

  it("returns the string directly if passed a string", () => {
    expect(formatZodError("Something went wrong")).toBe("Something went wrong");
  });

  it("formats a single field error with known label", () => {
    const result = formatZodError({ fieldErrors: { description: ["Descrição obrigatória"] } });
    expect(result).toBe("Descrição: Descrição obrigatória");
  });

  it("formats a single field error with unknown field (uses field name)", () => {
    const result = formatZodError({ fieldErrors: { unknownField: ["Required"] } });
    expect(result).toBe("unknownField: Required");
  });

  it("formats multiple field errors separated by ' • '", () => {
    const result = formatZodError({
      fieldErrors: {
        description: ["Descrição obrigatória"],
        amount: ["Valor deve ser positivo"],
      },
    });
    expect(result).toContain("Descrição: Descrição obrigatória");
    expect(result).toContain("Valor: Valor deve ser positivo");
    expect(result).toContain(" • ");
  });

  it("uses only the first error message per field", () => {
    const result = formatZodError({
      fieldErrors: { amount: ["Valor deve ser positivo", "Second error"] },
    });
    expect(result).toBe("Valor: Valor deve ser positivo");
    expect(result).not.toContain("Second error");
  });

  it("ignores fields with empty error arrays", () => {
    const result = formatZodError({
      fieldErrors: { description: ["Required"], amount: [] },
    });
    expect(result).toBe("Descrição: Required");
  });

  it("returns 'Erro ao processar solicitação' for empty fieldErrors object", () => {
    const result = formatZodError({ fieldErrors: {} });
    expect(result).toBe("Erro ao processar solicitação");
  });

  it("handles flat error object without fieldErrors wrapper", () => {
    const result = formatZodError({ date: ["Data inválida"] });
    expect(result).toBe("Data: Data inválida");
  });

  it("handles all known label keys", () => {
    const fields = [
      ["type", "Tipo"],
      ["description", "Descrição"],
      ["categoryId", "Categoria"],
      ["amount", "Valor"],
      ["date", "Data"],
      ["dueDate", "Vencimento"],
      ["paidAt", "Data de pagamento"],
      ["frequency", "Frequência"],
      ["paymentStatus", "Status"],
      ["attachmentUrl", "Anexo"],
      ["blobUrl", "Arquivo"],
      ["accountId", "Conta"],
      ["observations", "Observações"],
      ["name", "Nome"],
      ["balance", "Saldo"],
      ["period", "Período"],
      ["alertAt", "Alerta"],
    ];

    for (const [field, label] of fields) {
      const result = formatZodError({ [field]: ["test error"] });
      expect(result).toBe(`${label}: test error`);
    }
  });
});
