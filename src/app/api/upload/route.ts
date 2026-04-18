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

  const validMimeTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];
  const validExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".txt"];

  // Validate MIME type and extension
  const contentType = request.headers.get("content-type") || "";
  const safeFilename = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
  const fileExt = path.extname(safeFilename);

  if (!validExtensions.includes(fileExt)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
  }

  // If Vercel Blob token is missing and we are in development, save locally
  if (!token && process.env.NODE_ENV === "development") {
    try {
      let fileBuffer: Buffer;

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file in form data");
        if (!validMimeTypes.includes(file.type)) {
          throw new Error("Tipo de arquivo não permitido");
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Arquivo muito grande (máximo 10MB)");
        }
        fileBuffer = Buffer.from(await file.arrayBuffer());
      } else {
        fileBuffer = Buffer.from(await request.arrayBuffer());
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, safeFilename);
      fs.writeFileSync(filePath, fileBuffer);

      logger.info("Local upload success", { path: `/uploads/${safeFilename}` });
      return NextResponse.json({
        url: `/uploads/${safeFilename}`,
        downloadUrl: `/uploads/${safeFilename}`,
        pathname: safeFilename,
        contentType: contentType,
      });
    } catch (error) {
      logger.error("Local upload error", { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }

  // Production / Token present: Use Vercel Blob
  try {
    let body: any;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!validMimeTypes.includes(file.type)) {
        return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
      }
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)" }, { status: 400 });
      }
      body = file;
    } else {
      body = request.body;
    }

    const blob = await put(safeFilename, body, {
      access: "public",
      token
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
