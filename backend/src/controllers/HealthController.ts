import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';

// Health check endpoint
export async function healthCheck(c: Context): Promise<Response> {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    return c.json({
      success: true,
      data: healthData
    } as ApiResponse);
  } catch (error) {
    console.error('Health check error:', error);
    return c.json({
      success: false,
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}
