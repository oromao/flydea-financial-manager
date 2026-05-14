import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-helpers";
import { withRateLimit } from "@/lib/rate-limit";
import { isAllowedImageUrl } from "@/lib/url-validation";

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const validation = isAllowedImageUrl(url);
  if (!validation.allowed) {
    return apiError("URL não permitida", 422, "VALIDATION_ERROR");
  }

  try {
    // If it's a Vercel Blob URL, add the token
    let fetchUrl = url;
    if (url.includes("blob.vercelusercontent.com") || url.includes("vercel-blob.com")) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        // Fallback to returning the URL as-is for public blobs
        return NextResponse.redirect(url);
      }
      fetchUrl = `${url}?token=${token}`;
    }

    const response = await fetch(fetchUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to load image" },
      { status: 500 }
    );
  }
});
