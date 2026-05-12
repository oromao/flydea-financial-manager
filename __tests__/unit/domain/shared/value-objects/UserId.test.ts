import { describe, it, expect } from "vitest";
import { UserId } from "@/domain/shared/value-objects/UserId";
import { ValidationError } from "@/domain/shared/errors/DomainError";

describe("UserId", () => {
  it("creates a valid UserId", () => {
    const id = UserId.create("user-123");
    expect(id.getValue()).toBe("user-123");
  });

  it("trims whitespace", () => {
    const id = UserId.create("  user-123  ");
    expect(id.getValue()).toBe("user-123");
  });

  it("rejects empty string", () => {
    expect(() => UserId.create("")).toThrow(ValidationError);
    expect(() => UserId.create("")).toThrow("UserId inválido");
  });

  it("rejects whitespace-only string", () => {
    expect(() => UserId.create("   ")).toThrow(ValidationError);
  });

  it("compares equality correctly", () => {
    const a = UserId.create("user-1");
    const b = UserId.create("user-1");
    const c = UserId.create("user-2");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it("converts to string", () => {
    const id = UserId.create("user-abc");
    expect(id.toString()).toBe("user-abc");
  });
});
