import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename || !request.body) {
    return NextResponse.json({ error: "Missing filename or body" }, { status: 400 });
  }

  // To run this, the user must have BLOB_READ_WRITE_TOKEN in Vercel
  // In development, handle missing token gracefully to allow local testing
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.NODE_ENV === "development") {
      console.warn("BLOB_READ_WRITE_TOKEN is missing. Returning a mock URL for development.");
      return NextResponse.json({
        url: `https://dummy-cloud.com/${filename}`,
        downloadUrl: `https://dummy-cloud.com/${filename}`,
        pathname: filename,
        contentType: "application/octet-stream",
        contentDisposition: `attachment; filename="${filename}"`
      });
    }
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
