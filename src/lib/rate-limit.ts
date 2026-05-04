/**
 * Rate limiting with Upstash Redis.
 * Falls back to a no-op in development or when env vars are missing.
 */

let ratelimit: { limit: (id: string) => Promise<{ success: boolean; remaining: number }> } | null = null;

async function getRateLimiter() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const redis = new Redis({ url, token });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: false,
    });
    return ratelimit;
  } catch {
    return null;
  }
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = await getRateLimiter();
  if (!limiter) return { success: true, remaining: 999 };

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withRateLimit(handler: Function, opts?: { limit?: number; window?: string }) {
  return async (req: Request, ...args: any[]) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const identifier = `${ip}:${req.url}`;
    const limiter = await getRateLimiter();
    if (!limiter) return handler(req, ...args);

    const result = await limiter.limit(identifier);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60", "X-RateLimit-Remaining": String(result.remaining) },
      });
    }

    return handler(req, ...args);
  };
}
