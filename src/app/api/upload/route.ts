import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || `upload-${Date.now()}`;

  // If Vercel Blob token is missing and we are in development, save locally
  if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === "development") {
    try {
      const contentType = request.headers.get("content-type") || "";
      let fileBuffer: Buffer;

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file in form data");
        fileBuffer = Buffer.from(await file.arrayBuffer());
      } else {
        fileBuffer = Buffer.from(await request.arrayBuffer());
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const safeFilename = filename.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
      const filePath = path.join(uploadDir, safeFilename);
      fs.writeFileSync(filePath, fileBuffer);

      console.log(`Local upload success: /uploads/${safeFilename}`);
      return NextResponse.json({
        url: `/uploads/${safeFilename}`,
        downloadUrl: `/uploads/${safeFilename}`,
        pathname: safeFilename,
        contentType: contentType,
      });
    } catch (error) {
      console.error("Local upload error:", error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }

  // Production / Token present: Use Vercel Blob
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      body = file;
    } else {
      body = request.body;
    }

    const blob = await put(filename, body, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
