import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || `upload-${Date.now()}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

  // More flexible MIME types and extensions
  const validMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "text/plain", "image/heic", "image/heif"];
  const validExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt", ".heic", ".heif"];

  // Validate extension
  const contentType = request.headers.get("content-type") || "";
  let safeFilename = filename;

  // Only sanitize dangerous characters, keep dots and dashes
  safeFilename = safeFilename.replace(/[^a-z0-9._-]/gi, "_").toLowerCase();

  // Ensure extension is preserved
  const fileExt = path.extname(safeFilename);
  if (!validExtensions.includes(fileExt)) {
    return NextResponse.json({ error: `Tipo de arquivo não permitido. Extensão: ${fileExt}` }, { status: 400 });
  }

  // If Vercel Blob token is missing and we are in development, save locally
  if (!token && process.env.NODE_ENV === "development") {
    try {
      let fileBuffer: Buffer;

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file in form data");

        // Validate file size (more lenient with MIME types)
        if (file.size > 20 * 1024 * 1024) {
          throw new Error("Arquivo muito grande (máximo 20MB)");
        }

        fileBuffer = Buffer.from(await file.arrayBuffer());
      } else {
        fileBuffer = Buffer.from(await request.arrayBuffer());
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      fs.writeFileSync(filePath, fileBuffer);

      const uploadUrl = `/uploads/${safeFilename}`;
      logger.info("Local upload success", { path: uploadUrl, size: fileBuffer.length });
      return NextResponse.json({
        url: uploadUrl,
        downloadUrl: uploadUrl,
        pathname: safeFilename,
        contentType: contentType,
        size: fileBuffer.length,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error("Local upload error", { error: errorMsg, filename: safeFilename });
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
  }

  // Production / Token present: Use Vercel Blob
  try {
    let body: any;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: "Arquivo muito grande (máximo 20MB)" }, { status: 400 });
      }
      body = file;
    } else {
      body = request.body;
    }

    const blob = await put(safeFilename, body, {
      access: "public",
      token
    });

    logger.info("Vercel blob upload success", { url: blob.url });
    return NextResponse.json(blob);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("Vercel blob upload error", { error: errorMsg });
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
