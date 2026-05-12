import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockSession = vi.hoisted(() => ({ user: { id: "user-1", email: "test@example.com" } }));

const mockPrisma = vi.hoisted(() => ({
  transaction: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: { create: vi.fn() },
  account: { findMany: vi.fn(), findUnique: vi.fn() },
  category: { findMany: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve(mockSession)),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/rate-limit", () => ({
  withRateLimit: (handler: Function) => handler,
}));

vi.mock("@/infrastructure/services/BehavioralIntelligenceService", () => ({
  BehavioralIntelligenceService: vi.fn(() => ({
    onTransactionCreated: vi.fn(),
  })),
}));

import { GET, POST } from "@/app/api/transactions/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/transactions", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await GET(makeRequest("/api/transactions"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns paginated transactions", async () => {
    const txs = [{ id: "1", type: "EXPENSE", amount: 100, date: new Date(), category: null, account: null, tags: [] }];
    mockPrisma.transaction.count.mockResolvedValue(1);
    mockPrisma.transaction.findMany.mockResolvedValue(txs);

    const res = await GET(makeRequest("/api/transactions"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
  });

  it("filters by type", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?type=INCOME"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: "INCOME" }),
      })
    );
  });

  it("filters by paymentStatus", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?paymentStatus=PENDING"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ paymentStatus: "PENDING" }),
      })
    );
  });

  it("returns all transactions when all=true", async () => {
    const txs = Array.from({ length: 50 }, (_, i) => ({
      id: String(i), type: "EXPENSE", amount: 100, date: new Date(), category: null, account: null, tags: [],
    }));
    mockPrisma.transaction.findMany.mockResolvedValue(txs);

    const res = await GET(makeRequest("/api/transactions?all=true"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(50);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5000 })
    );
  });

  it("searches by description", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?search=mercado"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { description: { contains: "mercado", mode: "insensitive" } },
            { observations: { contains: "mercado", mode: "insensitive" } },
          ],
        }),
      })
    );
  });

  it("filters by date range", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?startDate=2026-01-01&endDate=2026-01-31"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });

  it("filters by accountId", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?accountId=acc-1"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: "acc-1" }),
      })
    );
  });

  it("filters by tagId", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/transactions?tagId=tag-1"));

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tags: { some: { tagId: "tag-1" } },
        }),
      })
    );
  });

  it("handles empty result set", async () => {
    mockPrisma.transaction.count.mockResolvedValue(0);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("/api/transactions"));
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
  });
});

describe("POST /api/transactions", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "EXPENSE", description: "Test", amount: 100, date: "2026-01-15", categoryId: "cat-1" }),
    }));
    expect(res.status).toBe(401);
  });

  it("creates a transaction with valid data", async () => {
    const created = {
      id: "new-id", type: "EXPENSE", description: "Mercado", amount: 150.50,
      date: new Date("2026-01-15"), category: { id: "cat-1", name: "Food" },
      account: null, tags: [],
    };
    mockPrisma.transaction.create.mockResolvedValue(created);

    const res = await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EXPENSE", description: "Mercado", amount: 150.50,
        date: "2026-01-15", categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("new-id");
    expect(body.description).toBe("Mercado");
  });

  it("rejects missing categoryId", async () => {
    const res = await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "EXPENSE", description: "Test", amount: 100, date: "2026-01-15" }),
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Categoria obrigatória");
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "EXPENSE", description: "", amount: -1, date: "invalid" }),
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Descrição");
  });

  it("creates transaction with tagIds", async () => {
    const created = {
      id: "tx-1", type: "EXPENSE", description: "With tags", amount: 200,
      date: new Date(), category: null, account: null, tags: [],
    };
    mockPrisma.transaction.create.mockResolvedValue(created);

    const res = await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EXPENSE", description: "With tags", amount: 200,
        date: "2026-02-01", categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        tagIds: ["b1b2c3d4-e5f6-7890-abcd-ef1234567890", "c1c2c3d4-e5f6-7890-abcd-ef1234567890"],
      }),
    }));
    expect(res.status).toBe(200);
    expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tags: { create: [{ tagId: "b1b2c3d4-e5f6-7890-abcd-ef1234567890" }, { tagId: "c1c2c3d4-e5f6-7890-abcd-ef1234567890" }] },
        }),
      })
    );
  });

  it("creates transaction without tagIds", async () => {
    mockPrisma.transaction.create.mockResolvedValue({
      id: "tx-1", type: "EXPENSE", description: "No tags", amount: 100,
      date: new Date(), category: null, account: null, tags: [],
    });

    await POST(makeRequest("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "EXPENSE", description: "No tags", amount: 100,
        date: "2026-02-01", categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    }));

    const call = mockPrisma.transaction.create.mock.calls[0][0];
    expect(call.data.tags).toBeUndefined();
  });
});
