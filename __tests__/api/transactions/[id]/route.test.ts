import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

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
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com", role: "USER" } })),
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

import { PUT, DELETE } from "@/app/api/transactions/[id]/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("PUT /api/transactions/[id]", () => {
  const params = Promise.resolve({ id: "tx-1" });
  const existingTx = { id: "tx-1", userId: "user-1", description: "Original", amount: 100, amountPaid: 0, paymentStatus: "PENDING" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.transaction.findFirst.mockResolvedValue(existingTx);
    mockPrisma.transaction.update.mockImplementation(async (args: any) => ({
      ...existingTx, ...(args.data || {}), category: null, account: null, tags: [],
    }));
  });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated" }),
    }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when transaction not found", async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue(null);

    const res = await PUT(makeRequest("/api/transactions/tx-999", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated" }),
    }), { params: Promise.resolve({ id: "tx-999" }) });
    expect(res.status).toBe(404);
  });

  it("updates a transaction with valid data", async () => {
    const res = await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated description", amount: 200 }),
    }), { params });

    expect(res.status).toBe(200);
    expect(mockPrisma.transaction.update).toHaveBeenCalled();
  });

  it("rejects invalid data", async () => {
    const res = await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: -1 }),
    }), { params });

    expect(res.status).toBe(400);
  });

  it("resolves amountPaid when marking as PAID with amount", async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue({ ...existingTx, amount: 200, amountPaid: 0 });

    await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: "PAID", amount: 200 }),
    }), { params });

    const updateArgs = mockPrisma.transaction.update.mock.calls[0][0];
    expect(updateArgs.data.amountPaid).toBe(200);
  });

  it("updates tags when provided", async () => {
    await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds: ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"] }),
    }), { params });

    const updateArgs = mockPrisma.transaction.update.mock.calls[0][0];
    expect(updateArgs.data.tags).toEqual({
      deleteMany: {},
      create: [{ tagId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" }],
    });
  });

  it("does not update tags when not provided", async () => {
    await PUT(makeRequest("/api/transactions/tx-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "No tag change" }),
    }), { params });

    const updateArgs = mockPrisma.transaction.update.mock.calls[0][0];
    expect(updateArgs.data.tags).toBeUndefined();
  });
});

describe("DELETE /api/transactions/[id]", () => {
  const params = Promise.resolve({ id: "tx-1" });
  const existingTx = { id: "tx-1", userId: "user-1", description: "To delete" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.transaction.findUnique.mockResolvedValue(existingTx);
    mockPrisma.transaction.delete.mockResolvedValue(existingTx);
  });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await DELETE(makeRequest("/api/transactions/tx-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when transaction not found", async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest("/api/transactions/tx-999", { method: "DELETE" }), { params: Promise.resolve({ id: "tx-999" }) });
    expect(res.status).toBe(404);
  });

  it("allows owner to delete their own transaction", async () => {
    const res = await DELETE(makeRequest("/api/transactions/tx-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("allows admin to delete any transaction", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "admin-1", email: "admin@example.com", role: "ADMIN" } });

    mockPrisma.transaction.findUnique.mockResolvedValue({ id: "tx-other", userId: "other-user", description: "Other's tx" });

    const res = await DELETE(makeRequest("/api/transactions/tx-other", { method: "DELETE" }), { params: Promise.resolve({ id: "tx-other" }) });
    expect(res.status).toBe(200);
  });

  it("blocks non-owner non-admin from deleting", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", email: "test@example.com", role: "USER" } });

    mockPrisma.transaction.findUnique.mockResolvedValue({ id: "tx-other", userId: "other-user", description: "Not mine" });

    const res = await DELETE(makeRequest("/api/transactions/tx-other", { method: "DELETE" }), { params: Promise.resolve({ id: "tx-other" }) });
    expect(res.status).toBe(403);
  });
});
