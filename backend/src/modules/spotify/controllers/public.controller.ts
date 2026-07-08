import Logger from '../../../shared/utils/logger.js';
import { Context } from 'hono';
import {
  generateAuthUrl,
  exchangeCodeForTokens,
  getCurrentlyPlaying,
  getRecentlyPlayed,
  checkAuthStatus,
  logoutUser,
} from '../live/spotify-live.service.js';
import { saveSyncToken } from '../sync/sync-token.repository.js';
import { triggerSpotifySync } from '../sync/sync.service.js';
import type { ApiResponse } from '../../../../types/index.js';

export async function generateSpotifyAuthUrl(c: Context): Promise<Response> {
  try {
    const { state } = c.req.query();
    const redirectUri = `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`;

    const authUrl = generateAuthUrl(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      redirectUri,
      state,
    );

    return c.redirect(authUrl);
  } catch (error) {
    Logger.error('Auth URL generation error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to generate authorization URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function handleSpotifyCallback(c: Context): Promise<Response> {
  try {
    const { code, error, state } = c.req.query();

    if (error) {
      Logger.error('Spotify auth error:', error);
      return c.redirect(`${process.env.PROJECT_URL}/?error=auth_failed#stats`);
    }

    if (!code) {
      Logger.error('No authorization code received from Spotify');
      return c.redirect(`${process.env.PROJECT_URL}/?error=no_code#stats`);
    }

    const { accessToken, refreshToken, userId: spotifyUserId, displayName } =
      await exchangeCodeForTokens(
        code,
        process.env.SPOTIFY_CLIENT_ID!,
        process.env.SPOTIFY_CLIENT_SECRET!,
        `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`,
      );

    await saveSyncToken({
      spotifyUserId,
      accessToken,
      refreshToken,
      displayName,
    });
    triggerSpotifySync({ backfill: true });

    return c.redirect(
      `${process.env.PROJECT_URL}/?auth=success&userId=${state || spotifyUserId}#stats`,
    );
  } catch (error) {
    Logger.error('Error exchanging code for token:', error);
    return c.redirect(`${process.env.PROJECT_URL}/?error=token_exchange_failed#stats`);
  }
}

export async function getSpotifyCurrentlyPlaying(c: Context): Promise<Response> {
  try {
    const result = await getCurrentlyPlaying();

    return c.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error) {
    Logger.error('Currently Playing API Error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch currently playing track',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function checkSpotifyAuthStatus(c: Context): Promise<Response> {
  try {
    const result = await checkAuthStatus();

    return c.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error) {
    Logger.error('Auth status check error:', error);
    return c.json(
      {
        success: false,
        error: 'Error checking authentication status',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function getSpotifyRecentlyPlayed(c: Context): Promise<Response> {
  try {
    const limit = parseInt(c.req.query('limit') || '3');
    const result = await getRecentlyPlayed(limit);

    return c.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error) {
    Logger.error('Recently Played API Error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch recently played tracks',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}

export async function logoutSpotifyUser(c: Context): Promise<Response> {
  try {
    const result = await logoutUser();

    return c.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error) {
    Logger.error('Logout error:', error);
    return c.json(
      {
        success: false,
        error: 'Error during logout',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ApiResponse,
      500,
    );
  }
}
