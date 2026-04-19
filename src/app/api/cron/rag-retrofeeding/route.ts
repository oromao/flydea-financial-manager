import { NextResponse, NextRequest } from "next/server";
import { runRAGRetrofeeding } from "@/jobs/rag-retrofeeding";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Verify the request is from Vercel Cron (or internal)
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET || "local-dev";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== expectedSecret && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }

  try {
    const result = await runRAGRetrofeeding();

    return NextResponse.json({
      success: result.success,
      message: `RAG retrofeeding completed. Added ${result.documentsAdded} documents.`,
      stats: {
        documentsAdded: result.documentsAdded,
        totalDocuments: result.totalDocuments,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("RAG Retrofeeding Cron Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to run retrofeeding",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Allow GET for testing in development
  if (process.env.NODE_ENV !== "production") {
    try {
      const result = await runRAGRetrofeeding();

      return NextResponse.json({
        success: result.success,
        message: `RAG retrofeeding test completed. Added ${result.documentsAdded} documents.`,
        stats: {
          documentsAdded: result.documentsAdded,
          totalDocuments: result.totalDocuments,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to run retrofeeding",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: "GET not allowed in production" },
    { status: 403 }
  );
}
