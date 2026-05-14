import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default function middleware(req: NextRequestWithAuth) {
  const path = req.nextUrl.pathname;
  
  if (path === "/api/setup") {
    return NextResponse.next();
  }

  const authMiddleware = withAuth({
    pages: {
      signIn: "/login",
    },
  });

  return authMiddleware(req, {} as never);
}

export const config = {
  matcher: [
    "/((?!api/auth|api/cron|login|public|_next/static|_next/image|favicon.ico).*)",
  ],
};
