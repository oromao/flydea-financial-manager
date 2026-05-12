import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  account: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
  auditLog: { create: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
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

import { GET, POST } from "@/app/api/accounts/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/accounts", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await GET(makeRequest("/api/accounts"));
    expect(res.status).toBe(401);
  });

  it("returns accounts with computed balance", async () => {
    mockPrisma.account.findMany.mockResolvedValue([
      { id: "acc-1", name: "Nubank", type: "CHECKING", balance: 1000, isActive: true, createdAt: new Date(), _count: { transactions: 5 } },
      { id: "acc-2", name: "Caixa", type: "SAVINGS", balance: 5000, isActive: true, createdAt: new Date(), _count: { transactions: 3 } },
    ]);
    mockPrisma.transaction.findMany.mockImplementation(async ({ where }: any) => {
      if (where.accountId === "acc-1") return [{ type: "EXPENSE", amount: 300 }, { type: "INCOME", amount: 200 }];
      if (where.accountId === "acc-2") return [{ type: "INCOME", amount: 1000 }];
      return [];
    });

    const res = await GET(makeRequest("/api/accounts"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].currentBalance).toBe(900);
    expect(body[1].currentBalance).toBe(6000);
  });

  it("includes archived accounts when archived=true", async () => {
    mockPrisma.account.findMany.mockResolvedValue([]);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await GET(makeRequest("/api/accounts?archived=true"));

    expect(mockPrisma.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ isActive: true }),
      })
    );
  });

  it("handles empty accounts", async () => {
    mockPrisma.account.findMany.mockResolvedValue([]);
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("/api/accounts"));
    const body = await res.json();
    expect(body).toEqual([]);
  });
});

describe("POST /api/accounts", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await POST(makeRequest("/api/accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nubank", type: "CHECKING", balance: 1000 }),
    }));
    expect(res.status).toBe(401);
  });

  it("creates an account with valid data", async () => {
    const created = { id: "acc-new", name: "Nubank", type: "CHECKING", balance: 1000, color: null };
    mockPrisma.account.create.mockResolvedValue(created);

    const res = await POST(makeRequest("/api/accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Nubank", type: "CHECKING", balance: 1000 }),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Nubank");
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", type: "INVALID" }),
    }));
    expect(res.status).toBe(400);
  });

  it("creates account without optional fields", async () => {
    mockPrisma.account.create.mockResolvedValue({ id: "acc-new", name: "Cash", type: "CASH", balance: 0, color: null });

    const res = await POST(makeRequest("/api/accounts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Cash", type: "CASH" }),
    }));
    expect(res.status).toBe(200);
  });
});
