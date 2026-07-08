import Logger from '../../shared/utils/logger.js';
import type { Context } from 'hono';
import { fetchDiscordUserProfile } from './discord.service.js';
import type { ApiResponse } from '../../../types/index.js';
import { jsonError, jsonOk } from '../../shared/http/respond.js';

export async function getDiscordProfile(c: Context): Promise<Response> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const userId = process.env.DISCORD_USER_ID;

  if (!botToken || !userId) {
    return jsonError(c, {
      error: 'Discord not configured',
      message: 'DISCORD_BOT_TOKEN and DISCORD_USER_ID must be set on the server.',
      status: 503,
    });
  }

  try {
    const data = await fetchDiscordUserProfile(userId.trim(), botToken.trim());
    return jsonOk(c, data);
  } catch (error: unknown) {
    const rawStatus =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: number }).status)
        : 502;
    const message = error instanceof Error ? error.message : 'Unknown Discord error';

    Logger.error('Discord API Error:', message);

    const httpStatus = rawStatus === 404 ? 404 : rawStatus === 403 ? 403 : 502;

    return c.json(
      {
        success: false,
        error: 'Failed to fetch Discord profile',
        message,
      } satisfies ApiResponse,
      httpStatus,
    );
  }
}
