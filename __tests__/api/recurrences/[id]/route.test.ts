import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  recurrence: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  auditLog: { create: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { PUT, DELETE } from "@/app/api/recurrences/[id]/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("PUT /api/recurrences/[id]", () => {
  const params = Promise.resolve({ id: "r-1" });
  beforeEach(() => { vi.clearAllMocks() });

  it("returns 401 without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await PUT(makeRequest("/api/recurrences/r-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated" }),
    }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue(null);
    const res = await PUT(makeRequest("/api/recurrences/r-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated" }),
    }), { params });
    expect(res.status).toBe(404);
  });

  it("updates recurrence", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue({ id: "r-1", userId: "user-1" });
    mockPrisma.recurrence.update.mockResolvedValue({ id: "r-1", description: "Updated Netflix" });
    const res = await PUT(makeRequest("/api/recurrences/r-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Updated Netflix", amount: 49.9 }),
    }), { params });
    expect(res.status).toBe(200);
  });

  it("rejects invalid data", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue({ id: "r-1", userId: "user-1" });
    const res = await PUT(makeRequest("/api/recurrences/r-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency: "INVALID" }),
    }), { params });
    expect(res.status).toBe(400);
  });

  it("reactivates recurrence on type change", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue({ id: "r-1", userId: "user-1" });
    mockPrisma.recurrence.update.mockResolvedValue({ id: "r-1", description: "Test" });
    await PUT(makeRequest("/api/recurrences/r-1", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "INCOME", frequency: "WEEKLY" }),
    }), { params });
    const updateData = mockPrisma.recurrence.update.mock.calls[0][0].data;
    expect(updateData.isActive).toBe(true);
  });
});

describe("DELETE /api/recurrences/[id]", () => {
  const params = Promise.resolve({ id: "r-1" });
  beforeEach(() => { vi.clearAllMocks() });

  it("returns 401 without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await DELETE(makeRequest("/api/recurrences/r-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue(null);
    const res = await DELETE(makeRequest("/api/recurrences/r-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(404);
  });

  it("deletes recurrence", async () => {
    mockPrisma.recurrence.findUnique.mockResolvedValue({ id: "r-1", userId: "user-1", description: "Netflix" });
    mockPrisma.recurrence.delete.mockResolvedValue({});
    const res = await DELETE(makeRequest("/api/recurrences/r-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(200);
  });
});
