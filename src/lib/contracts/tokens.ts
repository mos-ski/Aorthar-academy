const SIGNING_TOKEN_TTL_DAYS = 7;

export function createTokenExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SIGNING_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function isTokenExpired(expiresAt: string, now: Date = new Date()): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}
