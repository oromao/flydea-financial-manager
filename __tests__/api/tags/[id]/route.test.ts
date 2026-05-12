import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = vi.hoisted(() => ({
  tag: {
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1" } })),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/rate-limit", () => ({ withRateLimit: (h: Function) => h }));

import { DELETE } from "@/app/api/tags/[id]/route";

const makeRequest = (url: string, init?: RequestInit) => new NextRequest(new URL(url, "http://localhost"), init);

describe("DELETE /api/tags/[id]", () => {
  const params = Promise.resolve({ id: "t-1" });
  beforeEach(() => { vi.clearAllMocks() });

  it("returns 401 without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const res = await DELETE(makeRequest("/api/tags/t-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("/api/tags/t-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(404);
  });

  it("deletes tag", async () => {
    mockPrisma.tag.findFirst.mockResolvedValue({ id: "t-1", userId: "user-1" });
    mockPrisma.tag.delete.mockResolvedValue({});
    const res = await DELETE(makeRequest("/api/tags/t-1", { method: "DELETE" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
