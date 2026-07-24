/**
 * Client-side Rate Limiting for Forms
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitRecord>();

  check(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now >= record.resetAt) {
      this.storage.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return { allowed: true };
    }

    if (record.count < config.maxRequests) {
      record.count++;
      return { allowed: true };
    }

    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  reset(key: string) {
    this.storage.delete(key);
  }
}

const limiter = new RateLimiter();

export const RATE_LIMITS = {
  GATE_PASS: { maxRequests: 3, windowMs: 60000 },
  CHAT_MESSAGE: { maxRequests: 10, windowMs: 60000 },
  SCHOOLGPT: { maxRequests: 10, windowMs: 60000 },
  COMMUNITY_POST: { maxRequests: 5, windowMs: 300000 },
  WORRY_JAR: { maxRequests: 5, windowMs: 60000 },
};

export function checkRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMITS
): { allowed: boolean; error?: string; retryAfter?: number } {
  const key = `${userId}:${action}`;
  const config = RATE_LIMITS[action];
  const result = limiter.check(key, config);

  if (!result.allowed) {
    return {
      allowed: false,
      error: `Too many requests. Wait ${result.retryAfter}s.`,
      retryAfter: result.retryAfter,
    };
  }

  return { allowed: true };
}
