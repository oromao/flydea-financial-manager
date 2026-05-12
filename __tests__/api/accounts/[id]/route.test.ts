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

import { PUT, DELETE } from "@/app/api/accounts/[id]/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("PUT /api/accounts/[id]", () => {
  const params = Promise.resolve({ id: "acc-1" });
  const existingAccount = { id: "acc-1", userId: "user-1", name: "Nubank", type: "CHECKING", balance: 1000, color: null, isActive: true };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.account.findUnique.mockResolvedValue(existingAccount);
    mockPrisma.account.update.mockImplementation(async (args: any) => ({ ...existingAccount, ...(args.data || {}) }));
  });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await PUT(makeRequest("/api/accounts/acc-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when account not found", async () => {
    mockPrisma.account.findUnique.mockResolvedValue(null);

    const res = await PUT(makeRequest("/api/accounts/acc-999", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    }), { params: Promise.resolve({ id: "acc-999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 404 when account belongs to another user", async () => {
    mockPrisma.account.findUnique.mockResolvedValue({ id: "acc-other", userId: "other-user", name: "Other", type: "CHECKING" });

    const res = await PUT(makeRequest("/api/accounts/acc-other", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hacked" }),
    }), { params: Promise.resolve({ id: "acc-other" }) });
    expect(res.status).toBe(404);
  });

  it("updates account name", async () => {
    const res = await PUT(makeRequest("/api/accounts/acc-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Novo Nome" }),
    }), { params });

    expect(res.status).toBe(200);
    expect(mockPrisma.account.update).toHaveBeenCalled();
  });

  it("rejects invalid data", async () => {
    const res = await PUT(makeRequest("/api/accounts/acc-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "INVALID" }),
    }), { params });
    expect(res.status).toBe(400);
  });

  it("archives account setting isActive=false", async () => {
    await PUT(makeRequest("/api/accounts/acc-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    }), { params });

    expect(mockPrisma.account.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      })
    );
  });
});

describe("DELETE /api/accounts/[id]", () => {
  const params = Promise.resolve({ id: "acc-1" });
  const existingAccount = { id: "acc-1", userId: "user-1", name: "Nubank" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.account.findUnique.mockResolvedValue(existingAccount);
    mockPrisma.account.delete.mockResolvedValue(existingAccount);
  });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await DELETE(makeRequest("/api/accounts/acc-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when account not found", async () => {
    mockPrisma.account.findUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest("/api/accounts/acc-999", { method: "DELETE" }), { params: Promise.resolve({ id: "acc-999" }) });
    expect(res.status).toBe(404);
  });

  it("deletes own account", async () => {
    const res = await DELETE(makeRequest("/api/accounts/acc-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
