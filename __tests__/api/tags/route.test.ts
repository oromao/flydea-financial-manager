import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  tag: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { GET, POST } from "@/app/api/tags/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("GET /api/tags", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("returns unauthorized", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await GET(makeRequest("/api/tags"));
    expect(res.status).toBe(401);
  });

  it("returns user tags", async () => {
    mockPrisma.tag.findMany.mockResolvedValue([{ id: "t1", name: "Work", color: "#000", _count: { transactions: 3 } }]);
    const res = await GET(makeRequest("/api/tags"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Work");
  });
});

describe("POST /api/tags", () => {
  beforeEach(() => { vi.clearAllMocks() });

  it("creates a tag", async () => {
    mockPrisma.tag.create.mockResolvedValue({ id: "t1", name: "Freelance", color: "#FF5733" });
    const res = await POST(makeRequest("/api/tags", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Freelance", color: "#FF5733" }),
    }));
    expect(res.status).toBe(200);
  });

  it("rejects invalid data", async () => {
    const res = await POST(makeRequest("/api/tags", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", color: "bad" }),
    }));
    expect(res.status).toBe(400);
  });
});
