import Logger from '../../../shared/utils/logger.js';
import SpotifyWebApi from 'spotify-web-api-node';
import type { SpotifyTrack, SpotifyAuthResponse } from '../../../../types/index.js';
import { deleteSyncToken } from '../sync/sync-token.repository.js';
import { getSpotifyWebApi, getValidSyncAccessToken } from '../sync/sync-token.service.js';

let spotifyApi: SpotifyWebApi | null = null;

function getOAuthApi(clientId: string, clientSecret: string, redirectUri: string): SpotifyWebApi {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });
  }
  return spotifyApi;
}

export function generateAuthUrl(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  state?: string,
): string {
  const api = getOAuthApi(clientId, clientSecret, redirectUri);
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state',
  ];

  return api.createAuthorizeURL(scopes, state || 'user');
}

export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<{ accessToken: string; refreshToken: string; userId: string; displayName?: string }> {
  try {
    const api = getOAuthApi(clientId, clientSecret, redirectUri);
    const data = await api.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    api.setAccessToken(access_token);

    const userData = await api.getMe();
    const userId = userData.body.id;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      userId,
      displayName: userData.body.display_name ?? undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function getCurrentlyPlaying(): Promise<SpotifyAuthResponse> {
  try {
    const accessToken = await getValidSyncAccessToken();

    if (!accessToken) {
      return {
        isPlaying: false,
        message: 'User not authenticated. Please login to Spotify.',
        authenticated: false,
      };
    }

    const api = getSpotifyWebApi();
    api.setAccessToken(accessToken);
    const currentlyPlayingData = await api.getMyCurrentPlayingTrack();

    if (currentlyPlayingData.body?.item) {
      const track = currentlyPlayingData.body.item;

      if ('artists' in track && 'album' in track && track.artists?.length) {
        const trackData: SpotifyTrack = {
          name: track.name,
          artist: track.artists[0]!.name,
          album: track.album.name,
          isPlaying: currentlyPlayingData.body.is_playing,
          progress: currentlyPlayingData.body.progress_ms || 0,
          duration: track.duration_ms,
          image: track.album.images[0]?.url,
          externalUrl: track.external_urls.spotify,
        };

        return {
          authenticated: true,
          ...trackData,
        } as SpotifyAuthResponse;
      }
    }

    return {
      isPlaying: false,
      message: 'No track currently playing',
      authenticated: true,
    };
  } catch (error) {
    Logger.error(
      'Currently Playing API Error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw new Error(
      `Failed to fetch currently playing track: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function checkAuthStatus(): Promise<{ authenticated: boolean; message: string }> {
  try {
    const accessToken = await getValidSyncAccessToken();
    const isAuthenticated = !!accessToken;

    return {
      authenticated: isAuthenticated,
      message: isAuthenticated ? 'User is authenticated' : 'User not authenticated',
    };
  } catch (error) {
    Logger.error('Auth status check error:', error);
    return {
      authenticated: false,
      message: 'Error checking authentication status',
    };
  }
}

export async function getRecentlyPlayed(
  limit: number = 3,
): Promise<{ tracks: SpotifyTrack[]; authenticated: boolean; message?: string }> {
  try {
    const accessToken = await getValidSyncAccessToken();

    if (!accessToken) {
      return {
        tracks: [],
        authenticated: false,
        message: 'User not authenticated. Please login to Spotify.',
      };
    }

    const api = getSpotifyWebApi();
    api.setAccessToken(accessToken);
    const recentlyPlayedData = await api.getMyRecentlyPlayedTracks({ limit });

    if (recentlyPlayedData.body?.items) {
      const tracks: SpotifyTrack[] = recentlyPlayedData.body.items
        .map((item: { track: unknown; played_at: string }) => {
          const track = item.track;

          if (
            track &&
            typeof track === 'object' &&
            'artists' in track &&
            'album' in track &&
            Array.isArray((track as { artists?: unknown[] }).artists) &&
            (track as { artists: { name: string }[] }).artists.length > 0
          ) {
            const t = track as {
              name: string;
              artists: { name: string }[];
              album: { name: string; images: { url: string }[] };
              duration_ms: number;
              external_urls: { spotify: string };
            };
            return {
              name: t.name,
              artist: t.artists[0]!.name,
              album: t.album.name,
              isPlaying: false,
              progress: 0,
              duration: t.duration_ms,
              image: t.album.images[0]?.url,
              externalUrl: t.external_urls.spotify,
              playedAt: item.played_at,
            } as SpotifyTrack & { playedAt: string };
          }
          return null;
        })
        .filter((track): track is SpotifyTrack & { playedAt: string } => track !== null);

      return {
        tracks,
        authenticated: true,
      };
    }

    return {
      tracks: [],
      authenticated: true,
      message: 'No recently played tracks found',
    };
  } catch (error) {
    Logger.error(
      'Recently Played API Error:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw new Error(
      `Failed to fetch recently played tracks: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  await deleteSyncToken();
  return {
    success: true,
    message: 'User logged out successfully',
  };
}
