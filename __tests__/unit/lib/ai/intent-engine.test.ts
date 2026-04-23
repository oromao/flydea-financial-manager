import { describe, it, expect } from "vitest";
import { intentEngine } from "@/lib/ai/intent-engine";

describe("IntentEngine", () => {
  it("should classify query about balance as QUERY", () => {
    const result = intentEngine.classify("Qual meu saldo?");
    expect(result.intent).toBe("QUERY");
    expect(result.confidence).toBeGreaterThanOrEqual(0.4);
  });

  it("should classify query about spending as QUERY", () => {
    const result = intentEngine.classify("Quanto eu gastei este mês?");
    expect(result.intent).toBe("QUERY");
    expect(result.confidence).toBeGreaterThan(0.4);
  });

  it("should classify query about tips as INSIGHT", () => {
    const result = intentEngine.classify("Me dê uma dica para economizar");
    expect(result.intent).toBe("INSIGHT");
  });

  it("should classify query about actions as ACTION", () => {
    const result = intentEngine.classify("Como eu faço para pagar uma conta?");
    expect(result.intent).toBe("ACTION");
  });

  it("should classify query about help as HELP", () => {
    const result = intentEngine.classify("Como funciona o sistema?");
    expect(result.intent).toBe("HELP");
  });

  it("should handle accents and casing", () => {
    const result = intentEngine.classify("SÁLDO");
    expect(result.intent).toBe("QUERY");
  });

  it("should return UNKNOWN for gibberish", () => {
    const result = intentEngine.classify("asdfghjkl");
    expect(result.intent).toBe("UNKNOWN");
    expect(result.confidence).toBe(0);
  });
});
