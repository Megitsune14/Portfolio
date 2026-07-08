import type { Context } from 'hono';
import type { ApiResponse } from '../../../types/index.js';
import Logger from '../utils/logger.js';

type ContentfulStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 500 | 502 | 503;

export function jsonOk<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ success: true, data } satisfies ApiResponse<T>, status);
}

export function jsonError(
  c: Context,
  options: { error: string; message: string; status?: ContentfulStatusCode },
) {
  const { error, message, status = 500 } = options;
  return c.json({ success: false, error, message } satisfies ApiResponse, status);
}

export async function handleApi<T>(
  c: Context,
  fn: () => Promise<T>,
  label = 'Request failed',
): Promise<Response> {
  try {
    const data = await fn();
    return jsonOk(c, data);
  } catch (error) {
    Logger.error(label, error);
    return jsonError(c, {
      error: label,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
