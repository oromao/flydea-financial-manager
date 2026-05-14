const ALLOWED_DOMAINS = [
  "blob.vercelusercontent.com",
  "vercel-blob.com",
];

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
];

const BLOCKED_IPS = new Set([
  "169.254.169.254",
  "0.0.0.0",
  "255.255.255.255",
]);

const IPV4_LITERAL = /^\d{1,3}(\.\d{1,3}){3}$/;

export function isAllowedImageUrl(urlString: string): { allowed: boolean; error?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { allowed: false, error: "Invalid URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { allowed: false, error: "Only HTTP and HTTPS URLs are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  if (IPV4_LITERAL.test(hostname)) {
    if (BLOCKED_IPS.has(hostname)) {
      return { allowed: false, error: "URL points to a blocked internal service" };
    }
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { allowed: false, error: "URL points to a private IP range" };
      }
    }
  }

  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith("." + domain)
  );
  if (!isAllowed) {
    return { allowed: false, error: `Domain "${hostname}" is not in the allowlist` };
  }

  return { allowed: true };
}
