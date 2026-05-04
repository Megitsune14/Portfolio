import type { Context } from 'hono';
import { fetchDiscordUserProfile } from '../services/DiscordService.js';
import type { ApiResponse } from '../../types/index.js';

export async function getDiscordProfile(c: Context): Promise<Response> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const userId = process.env.DISCORD_USER_ID;

  if (!botToken || !userId) {
    return c.json(
      {
        success: false,
        error: 'Discord not configured',
        message: 'DISCORD_BOT_TOKEN and DISCORD_USER_ID must be set on the server.',
      } satisfies ApiResponse,
      503
    );
  }

  try {
    const data = await fetchDiscordUserProfile(userId.trim(), botToken.trim());

    return c.json({
      success: true,
      data,
    } satisfies ApiResponse<typeof data>);
  } catch (error: unknown) {
    const rawStatus =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status: number }).status)
        : 502;
    const message = error instanceof Error ? error.message : 'Unknown Discord error';

    console.error('Discord API Error:', message);

    const httpStatus =
      rawStatus === 404 ? 404 : rawStatus === 403 ? 403 : 502;

    return c.json(
      {
        success: false,
        error: 'Failed to fetch Discord profile',
        message,
      } satisfies ApiResponse,
      httpStatus
    );
  }
}
