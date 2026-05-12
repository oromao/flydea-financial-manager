import { describe, it, expect } from "vitest";
import {
  DomainError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "@/domain/shared/errors/DomainError";

describe("DomainError", () => {
  it("is an abstract class", () => {
    expect(() => new (class extends DomainError {
      readonly code = "TEST";
      constructor() { super("test"); }
    })()).not.toThrow();
  });

  it("sets prototype correctly", () => {
    const error = new ValidationError("test");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error).toBeInstanceOf(ValidationError);
  });
});

describe("ValidationError", () => {
  it("creates with message", () => {
    const error = new ValidationError("Valor inválido");
    expect(error.message).toBe("Valor inválido");
    expect(error.code).toBe("VALIDATION_ERROR");
  });
});

describe("NotFoundError", () => {
  it("creates with message", () => {
    const error = new NotFoundError("Conta não encontrada");
    expect(error.message).toBe("Conta não encontrada");
    expect(error.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("creates with message", () => {
    const error = new UnauthorizedError("Não autenticado");
    expect(error.message).toBe("Não autenticado");
    expect(error.code).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("creates with message", () => {
    const error = new ForbiddenError("Sem permissão");
    expect(error.message).toBe("Sem permissão");
    expect(error.code).toBe("FORBIDDEN");
  });
});
