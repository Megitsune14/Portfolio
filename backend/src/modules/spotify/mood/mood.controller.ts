import Logger from '../../../shared/utils/logger.js'
import { Context } from 'hono'
import type { ApiResponse } from '../../../../types/index.js'
import { getSpotifyMood } from './mood.service.js'

export async function getMood(c: Context): Promise<Response> {
  try {
    const data = await getSpotifyMood()
    return c.json({ success: true, data } as ApiResponse)
  } catch (error) {
    Logger.error('Nexus Spotify mood error:', error)
    return c.json(
      {
        success: false,
        error: 'Mood analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    )
  }
}
