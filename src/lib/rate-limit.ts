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
