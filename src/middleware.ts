import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  if (path === "/api/setup") {
    return NextResponse.next();
  }

  const authMiddleware = withAuth({
    pages: {
      signIn: "/login",
    },
  });

  return authMiddleware(req as any, {} as any);
}

export const config = {
  matcher: [
    "/((?!api/auth|login|public|_next/static|_next/image|favicon.ico).*)",
  ],
};
