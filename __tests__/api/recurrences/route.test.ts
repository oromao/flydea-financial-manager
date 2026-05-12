import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  recurrence: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  transaction: { create: vi.fn() },
  auditLog: { create: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { GET, POST } from "@/app/api/recurrences/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/recurrences", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("/api/recurrences"));
    expect(res.status).toBe(401);
  });

  it("returns user recurrences", async () => {
    mockPrisma.recurrence.findMany.mockResolvedValue([
      { id: "r1", description: "Netflix", amount: 39.9, frequency: "MONTHLY", category: { name: "Lazer" } },
    ]);

    const res = await GET(makeRequest("/api/recurrences"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].description).toBe("Netflix");
  });
});

describe("POST /api/recurrences", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("creates a recurrence with startDate in the past", async () => {
    const pastDate = "2026-01-01";
    mockPrisma.recurrence.create.mockResolvedValue({
      id: "r-new", description: "Netflix", amount: 39.9, type: "EXPENSE",
      frequency: "MONTHLY", startDate: new Date(pastDate),
    });
    mockPrisma.transaction.create.mockResolvedValue({ id: "tx-1" });
    mockPrisma.recurrence.update.mockResolvedValue({});

    const res = await POST(makeRequest("/api/recurrences", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Netflix", amount: 39.9, frequency: "MONTHLY",
        startDate: pastDate, categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    }));
    expect(res.status).toBe(200);
    expect(mockPrisma.transaction.create).toHaveBeenCalled();
    expect(mockPrisma.recurrence.update).toHaveBeenCalled();
  });

  it("creates a recurrence without triggering transaction for future date", async () => {
    const futureDate = "2030-01-01";
    mockPrisma.recurrence.create.mockResolvedValue({
      id: "r-new", description: "Future", amount: 100, type: "EXPENSE",
      frequency: "MONTHLY", startDate: new Date(futureDate),
    });

    const res = await POST(makeRequest("/api/recurrences", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Future", amount: 100, frequency: "MONTHLY",
        startDate: futureDate, categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      }),
    }));
    expect(res.status).toBe(200);
    expect(mockPrisma.transaction.create).not.toHaveBeenCalled();
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/recurrences", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "", amount: -1, frequency: "INVALID", startDate: "bad" }),
    }));
    expect(res.status).toBe(400);
  });
});
