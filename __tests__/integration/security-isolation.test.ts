import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/blob-download/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

vi.mock("next-auth");
vi.mock("@/lib/prisma", () => ({
  prisma: {
    importedDocument: { findFirst: vi.fn() },
    transaction: { findFirst: vi.fn() },
  },
}));

describe("Security Hardening - Data Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should block access to a blob if the user is not the owner", async () => {
    // Mock user A
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-A" } } as any);

    // Mock document owned by user B
    vi.mocked(prisma.importedDocument.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3010/api/blob-download?url=https://blob.com/secret.pdf");
    const response = await GET(req);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toContain("Forbidden");
  });

  it("should allow access to a blob if the user IS the owner", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-A" } } as any);
    
    // Mock document owned by user A
    vi.mocked(prisma.importedDocument.findFirst).mockResolvedValue({ id: "doc-1", userId: "user-A" } as any);
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
      headers: new Headers({ "content-type": "application/pdf" }),
    });

    const req = new NextRequest("http://localhost:3010/api/blob-download?url=https://blob.com/my-file.pdf");
    const response = await GET(req);

    expect(response.status).toBe(200);
  });
});
