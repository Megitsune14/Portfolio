import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';
import {
  createSessionToken,
  verifyMasterPassword,
  verifySessionToken,
  extractBearerToken,
} from '../services/NexusAuthService.js';
import { getVisitors, getVisitorStats, recordVisit } from '../services/VisitorService.js';

function getClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return c.req.header('x-real-ip') || 'unknown';
}

export async function login(c: Context): Promise<Response> {
  try {
    const body = await c.req.json<{ password?: string }>();
    const password = body.password?.trim();

    if (!password) {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Mot de passe requis',
        } as ApiResponse,
        400,
      );
    }

    if (!verifyMasterPassword(password)) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Mot de passe incorrect',
        } as ApiResponse,
        401,
      );
    }

    const token = createSessionToken();

    return c.json({
      success: true,
      data: { token },
    } as ApiResponse);
  } catch (error) {
    console.error('Nexus login error:', error);
    return c.json(
      {
        success: false,
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function me(c: Context): Promise<Response> {
  const token = extractBearerToken(c.req.header('Authorization'));

  if (!token || !verifySessionToken(token)) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Session invalide ou expirée',
      } as ApiResponse,
      401,
    );
  }

  return c.json({
    success: true,
    data: { authenticated: true },
  } as ApiResponse);
}

export async function trackVisit(c: Context): Promise<Response> {
  try {
    let path = '/';

    try {
      const body = await c.req.json<{ path?: string }>();
      if (body.path) {
        path = body.path;
      }
    } catch {
      // Beacon may send empty body
    }

    const visit = await recordVisit({
      ip: getClientIp(c),
      userAgent: c.req.header('user-agent') || 'unknown',
      referrer: c.req.header('referer') || c.req.header('referrer') || null,
      path,
    });

    return c.json({
      success: true,
      data: { id: visit._id?.toString() },
    } as ApiResponse);
  } catch (error) {
    console.error('Track visit error:', error);
    return c.json(
      {
        success: false,
        error: 'Tracking failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function listVisitors(c: Context): Promise<Response> {
  try {
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '50', 10)));

    const result = await getVisitors({ page, limit });

    return c.json({
      success: true,
      data: {
        visitors: result.visitors.map((visitor) => ({
          id: visitor._id?.toString(),
          ip: visitor.ip,
          userAgent: visitor.userAgent,
          referrer: visitor.referrer,
          path: visitor.path,
          createdAt: visitor.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error('List visitors error:', error);
    return c.json(
      {
        success: false,
        error: 'Fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function visitorStats(c: Context): Promise<Response> {
  try {
    const stats = await getVisitorStats();

    return c.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error) {
    console.error('Visitor stats error:', error);
    return c.json(
      {
        success: false,
        error: 'Stats failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}
