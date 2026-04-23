import { describe, it, expect } from "vitest";
import { KnowledgeService } from "@/lib/ai/knowledge-base/service";

describe("KnowledgeService", () => {
  const service = new KnowledgeService();

  it("should return relevant nodes for emergency fund query", async () => {
    const nodes = await service.getRelevantNodes("Como fazer uma reserva de emergencia?");
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].title).toBe("Reserva de Emergência");
  });

  it("should return relevant nodes for debt query", async () => {
    const nodes = await service.getRelevantNodes("Tenho dividas e juros altos, como pagar?");
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].title).toBe("Efeito Bola de Neve");
  });

  it("should return relevant nodes for 50/30/20 query", async () => {
    const nodes = await service.getRelevantNodes("Regra 50/30/20 para dividir salario");
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0].title).toBe("Regra dos 50/30/20");
  });

  it("should return empty array for unrelated query", async () => {
    const nodes = await service.getRelevantNodes("Qual a cor do céu?");
    expect(nodes.length).toBe(0);
  });

  it("should handle limit parameter", async () => {
    const nodes = await service.getRelevantNodes("investimento e reserva", 1);
    expect(nodes.length).toBe(1);
  });
});
