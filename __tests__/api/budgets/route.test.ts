import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  budget: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  transaction: {
    aggregate: vi.fn(),
  },
  auditLog: { create: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));
vi.mock("@/lib/email", () => ({ sendBudgetAlert: vi.fn() }));

import { GET, POST } from "@/app/api/budgets/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/budgets", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("/api/budgets"));
    expect(res.status).toBe(401);
  });

  it("returns budgets with spending calculations", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: "b1", categoryId: "c1", amount: 1000, period: "MONTHLY", alertAt: 80, category: { name: "Food" } },
    ]);
    mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: 500 } });

    const res = await GET(makeRequest("/api/budgets"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].spent).toBe(500);
    expect(body[0].percentage).toBe(50);
  });

  it("handles zero spending", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: "b1", categoryId: "c1", amount: 1000, period: "MONTHLY", alertAt: 80, category: { name: "Food" } },
    ]);
    mockPrisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: null } });

    const res = await GET(makeRequest("/api/budgets"));
    const body = await res.json();
    expect(body[0].spent).toBe(0);
    expect(body[0].percentage).toBe(0);
  });
});

describe("POST /api/budgets", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("creates a budget", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue(null);
    mockPrisma.budget.create.mockResolvedValue({
      id: "b-new", categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", amount: 1000,
      period: "MONTHLY", alertAt: 80, category: { name: "Food" },
    });

    const res = await POST(makeRequest("/api/budgets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", amount: 1000 }),
    }));
    expect(res.status).toBe(200);
  });

  it("rejects duplicate budget", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue({ id: "b1" });

    const res = await POST(makeRequest("/api/budgets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", amount: 1000 }),
    }));
    expect(res.status).toBe(409);
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/budgets", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: "bad", amount: -1 }),
    }));
    expect(res.status).toBe(400);
  });
});
