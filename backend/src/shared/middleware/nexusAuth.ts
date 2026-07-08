import { Context, Next } from 'hono';
import { extractBearerToken, verifySessionToken } from '../../modules/nexus/auth/auth.service.js';

export async function nexusAuthMiddleware(c: Context, next: Next) {
  const token = extractBearerToken(c.req.header('Authorization'));

  if (!token || !verifySessionToken(token)) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Session invalide ou expirée',
      },
      401,
    );
  }

  await next();
}
