import { Context, Next } from 'hono';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://megitsune.xyz',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function getAllowedOrigins(): string[] {
  const fromEnv = [
    process.env.PROJECT_URL,
    process.env.FRONTEND_URL,
  ].filter((value): value is string => Boolean(value));

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv])];
}

export const corsMiddleware = async (c: Context, next: Next) => {
  const requestOrigin = c.req.header('Origin');
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin =
    requestOrigin && allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0];

  c.header('Access-Control-Allow-Origin', allowOrigin);
  c.header('Vary', 'Origin');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  return await next();
};