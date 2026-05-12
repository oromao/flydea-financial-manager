import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  budget: {
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: { create: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { PUT, DELETE } from "@/app/api/budgets/[id]/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("PUT /api/budgets/[id]", () => {
  const params = Promise.resolve({ id: "b-1" });
  beforeEach(() => { vi.clearAllMocks() });

  it("returns 401 without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await PUT(makeRequest("/api/budgets/b-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 2000 }),
    }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue(null);
    const res = await PUT(makeRequest("/api/budgets/b-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 2000 }),
    }), { params });
    expect(res.status).toBe(404);
  });

  it("updates budget amount", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue({ id: "b-1", userId: "user-1" });
    mockPrisma.budget.update.mockResolvedValue({ id: "b-1", amount: 2000 });

    const res = await PUT(makeRequest("/api/budgets/b-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 2000 }),
    }), { params });
    expect(res.status).toBe(200);
  });

  it("rejects invalid data", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue({ id: "b-1", userId: "user-1" });
    const res = await PUT(makeRequest("/api/budgets/b-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -1 }),
    }), { params });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/budgets/[id]", () => {
  const params = Promise.resolve({ id: "b-1" });
  beforeEach(() => { vi.clearAllMocks() });

  it("returns 401 without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await DELETE(makeRequest("/api/budgets/b-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("/api/budgets/b-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(404);
  });

  it("deletes budget", async () => {
    mockPrisma.budget.findFirst.mockResolvedValue({ id: "b-1", userId: "user-1" });
    mockPrisma.budget.delete.mockResolvedValue({});

    const res = await DELETE(makeRequest("/api/budgets/b-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
