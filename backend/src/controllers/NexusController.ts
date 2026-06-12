import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';
import {
  createSessionToken,
  verifyMasterPassword,
  verifySessionToken,
  extractBearerToken,
} from '../services/NexusAuthService.js';
import {
  enrichVisitorForDisplay,
  getVisitors,
  getVisitorStats,
  recordVisit,
} from '../services/VisitorService.js';
import { logAnalytics } from '../utils/analyticsLogger.js';
import { getCountryCodeFromHeaders } from '../utils/visitorMetadata.js';

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
    const queryPath = c.req.query('path')?.trim();
    let path = queryPath || '/';
    let bodyParsed = false;

    try {
      const body = await c.req.json<{ path?: string }>();
      bodyParsed = true;
      if (body.path) {
        path = body.path;
      }
    } catch {
      if (!queryPath) {
        logAnalytics('Corps requête track illisible - path par défaut', {
          contentType: c.req.header('content-type') ?? null,
        });
      }
    }

    const ip = getClientIp(c);
    logAnalytics('Requête track visit reçue', { ip, path, bodyParsed, queryPath: queryPath ?? null });

    const countryCode = getCountryCodeFromHeaders({
      cfIpCountry: c.req.header('cf-ipcountry'),
      xCountry: c.req.header('x-country') ?? c.req.header('x-vercel-ip-country'),
    });

    const visit = await recordVisit({
      ip,
      userAgent: c.req.header('user-agent') || 'unknown',
      referrer: c.req.header('referer') || c.req.header('referrer') || null,
      path,
      countryCode,
    });

    logAnalytics('Track visit enregistré', { id: visit._id?.toString(), ip, path });

    return c.json({
      success: true,
      data: { id: visit._id?.toString() },
    } as ApiResponse);
  } catch (error) {
    logAnalytics('Track visit - échec', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
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
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') || '25', 10)));

    const result = await getVisitors({ page, limit });
    const visitors = await Promise.all(result.visitors.map((visitor) => enrichVisitorForDisplay(visitor)));

    return c.json({
      success: true,
      data: {
        visitors,
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
