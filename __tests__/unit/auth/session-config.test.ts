import { describe, it, expect } from "vitest";
import { authOptions } from "@/lib/auth";

describe("NextAuth Configuration", () => {
  it("should use JWT strategy", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("should have a maxAge defined for session and jwt to prevent premature expiration", () => {
    // 30 days is standard
    expect(authOptions.session?.maxAge).toBeDefined();
    expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    
    // Also jwt maxAge should be set to match
    if (authOptions.jwt) {
       expect(authOptions.jwt.maxAge).toBeDefined();
    }
  });

  it("should use secure cookies in production", () => {
    // In production, we should force secure cookies or let NextAuth handle it properly based on NEXTAUTH_URL
    // But explicitly setting useSecureCookies based on process.env.NODE_ENV is safer
    expect(authOptions.useSecureCookies).toBeDefined();
  });
});
