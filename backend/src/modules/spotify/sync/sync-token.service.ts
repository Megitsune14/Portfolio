import SpotifyWebApi from 'spotify-web-api-node';
import Logger from '../../../shared/utils/logger.js';
import {
  getSyncToken,
  updateSyncAccessToken,
  type SpotifySyncTokenDocument,
} from './sync-token.repository.js';

let spotifyApi: SpotifyWebApi | null = null;
let refreshInProgress: Promise<string | null> | null = null;

function getRedirectUri(): string {
  return `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`;
}

function getSpotifyApi(): SpotifyWebApi {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: getRedirectUri(),
    });
  }
  return spotifyApi;
}

export function getSpotifyWebApi(): SpotifyWebApi {
  return getSpotifyApi();
}

async function refreshToken(token: SpotifySyncTokenDocument): Promise<string | null> {
  try {
    const api = getSpotifyApi();
    api.setRefreshToken(token.refreshToken);
    const data = await api.refreshAccessToken();
    const newAccessToken = data.body.access_token;
    const expiresAt = Date.now() + 3600 * 1000;
    await updateSyncAccessToken(newAccessToken, expiresAt);
    return newAccessToken;
  } catch (error) {
    Logger.error('Spotify token refresh failed', error);
    return null;
  }
}

export async function getValidSyncAccessToken(): Promise<string | null> {
  const token = await getSyncToken();
  if (!token?.refreshToken) return null;

  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
  if (token.expiresAt > fiveMinutesFromNow) {
    return token.accessToken;
  }

  if (!refreshInProgress) {
    refreshInProgress = refreshToken(token).finally(() => {
      refreshInProgress = null;
    });
  }

  return refreshInProgress;
}
