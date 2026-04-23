import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Proxy endpoint for downloading files from Vercel Blob
 * Handles authentication and token injection for protected blobs
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  const filename = searchParams.get("filename") || "download";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // 1. Ownership Check (Crucial for Production Security)
    const [doc, transaction] = await Promise.all([
      prisma.importedDocument.findFirst({
        where: { userId: session.user.id, blobUrl: url }
      }),
      prisma.transaction.findFirst({
        where: { userId: session.user.id, blobUrl: url }
      })
    ]);

    if (!doc && !transaction) {
      logger.warn("Unauthorized blob access attempt", { userId: session.user.id, url });
      return NextResponse.json({ error: "Forbidden: You don't own this file" }, { status: 403 });
    }

    // 2. Fetch from Vercel Blob (Injection of token)
    let fetchUrl = url;
    if (url.includes("blob.vercelusercontent.com") || url.includes("vercel-blob.com")) {
      const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;
      if (token) {
        // Vercel Blob private access requires token header or param
        fetchUrl = `${url}?token=${token}`;
      }
    }

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("Blob download error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
