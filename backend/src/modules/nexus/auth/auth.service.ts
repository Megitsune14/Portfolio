import { createHmac, timingSafeEqual } from 'crypto';

/** Durée de validité du token de session Nexus (JWT signé HMAC). */
const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return secret;
}

export function verifyMasterPassword(password: string): boolean {
  const masterPassword = process.env.NEXUS_MASTER_PASSWORD;
  if (!masterPassword) {
    throw new Error('NEXUS_MASTER_PASSWORD is not configured');
  }

  const input = Buffer.from(password);
  const expected = Buffer.from(masterPassword);

  if (input.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(input, expected);
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    sub: 'nexus',
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  });

  const encoded = Buffer.from(payload).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(encoded).digest('base64url');

  return `${encoded}.${signature}`;
}

export function decodeSessionTokenPayload(token: string): { sub: string; iat: number; exp: number } | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      sub: string;
      iat: number;
      exp: number;
    };
  } catch {
    return null;
  }
}

export function verifySessionToken(token: string): boolean {
  const payload = decodeSessionTokenPayload(token);
  if (!payload) {
    return false;
  }

  return payload.sub === 'nexus' && payload.exp > Date.now();
}

export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  return authorization.slice(7).trim() || null;
}
