import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  category: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma, ensureBasicData: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { GET, POST } from "@/app/api/categories/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/categories", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("/api/categories"));
    expect(res.status).toBe(401);
  });

  it("returns system and user categories", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      { id: "c1", name: "Alimentação", type: "EXPENSE", userId: null },
      { id: "c2", name: "Salário", type: "INCOME", userId: null },
      { id: "c3", name: "Custom", type: "EXPENSE", userId: "user-1" },
    ]);

    const res = await GET(makeRequest("/api/categories"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(3);
  });
});

describe("POST /api/categories", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("creates a new category", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);
    mockPrisma.category.create.mockResolvedValue({ id: "c-new", name: "Transporte", type: "EXPENSE", userId: "user-1" });

    const res = await POST(makeRequest("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Transporte", type: "EXPENSE" }),
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Transporte");
  });

  it("rejects duplicate category", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({ id: "c1", name: "Transporte", type: "EXPENSE" });

    const res = await POST(makeRequest("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Transporte", type: "EXPENSE" }),
    }));
    expect(res.status).toBe(409);
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", type: "INVALID" }),
    }));
    expect(res.status).toBe(400);
  });
});
