import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryManager } from "@/lib/ai/memory-manager";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: { findMany: vi.fn() },
    userIntelligence: { findUnique: vi.fn() },
    insightInteraction: { findMany: vi.fn() },
  },
}));

describe("MemoryManager", () => {
  let manager: MemoryManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new MemoryManager();
  });

  it("should load recent chat history from audit logs", async () => {
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
      { details: "Query 1", createdAt: new Date() } as any,
      { details: "Query 2", createdAt: new Date() } as any,
    ]);

    const context = await manager.getRecentContext("user-1");
    expect(context.length).toBe(2);
    expect(context[0].content).toBe("Query 2"); // reverse order logic
  });

  it("should derive preferences from insight interactions", async () => {
    vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue({ riskScore: 80 } as any);
    vi.mocked(prisma.insightInteraction.findMany).mockResolvedValue([
      { interactionType: "ACTED", metadata: { category: "Lazer" } } as any,
      { interactionType: "ACTED", metadata: { category: "Lazer" } } as any,
      { interactionType: "DISMISSED", metadata: { type: "CASHFLOW_RISK" } } as any,
      { interactionType: "DISMISSED", metadata: { type: "CASHFLOW_RISK" } } as any,
      { interactionType: "DISMISSED", metadata: { type: "CASHFLOW_RISK" } } as any,
      { interactionType: "DISMISSED", metadata: { type: "CASHFLOW_RISK" } } as any,
    ]);

    const prefs = await manager.getUserPreferences("user-1");
    expect(prefs.riskScore).toBe(80);
    expect(prefs.favoriteCategories).toContain("Lazer");
    expect(prefs.ignoreList).toContain("CASHFLOW_RISK");
  });
});
