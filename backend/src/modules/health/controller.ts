import type { Context } from 'hono';
import { handleApi } from '../../shared/http/respond.js';

export async function healthCheck(c: Context): Promise<Response> {
  return handleApi(c, async () => ({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  }), 'Health check failed');
}
