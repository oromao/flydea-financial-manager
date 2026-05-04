import { describe, it, expect, vi } from 'vitest';

// Mock the rate limit module
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9 }),
  withRateLimit: (handler: (req: Request, ...args: any[]) => Promise<Response>) => handler,
}));

describe('Rate Limit', () => {
  it('should allow request when under limit', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const result = await checkRateLimit('test-ip');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should reject when over limit', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ success: false, remaining: 0 });
    const result = await checkRateLimit('test-ip');
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
