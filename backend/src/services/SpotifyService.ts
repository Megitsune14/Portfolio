import SpotifyWebApi from 'spotify-web-api-node';
import type { SpotifyTrack, SpotifyUserToken, SpotifyAuthResponse } from '../../types/index.js';

// Global variables for Spotify service
let spotifyApi: SpotifyWebApi;
const userTokens: Map<string, SpotifyUserToken> = new Map();
const userMapping: Map<string, string> = new Map(); // Maps frontend userId to Spotify userId

// Initialize Spotify API
const initializeSpotifyApi = (clientId: string, clientSecret: string, redirectUri: string) => {
  if (!spotifyApi) {
    spotifyApi = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri
    });
  }
  return spotifyApi;
};

// Generate authorization URL
export function generateAuthUrl(clientId: string, clientSecret: string, redirectUri: string, state?: string): string {
  const api = initializeSpotifyApi(clientId, clientSecret, redirectUri);
  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-state'
  ];

  return api.createAuthorizeURL(scopes, state || 'user');
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
  try {
    const api = initializeSpotifyApi(clientId, clientSecret, redirectUri);
    const data = await api.authorizationCodeGrant(code);
    const { access_token, refresh_token } = data.body;

    // Set the access token
    api.setAccessToken(access_token);

    // Get user info to identify the user
    const userData = await api.getMe();
    const userId = userData.body.id;

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      userId
    };
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Store user tokens
export function setUserToken(userId: string, accessToken: string, refreshToken?: string): void {
  const tokenData: SpotifyUserToken = {
    accessToken,
    expiresAt: Date.now() + (3600 * 1000) // 1 hour
  };
  
  if (refreshToken) {
    tokenData.refreshToken = refreshToken;
  }
  
  userTokens.set(userId, tokenData);
}

// Map frontend user ID to Spotify user ID
export function mapUserIds(frontendUserId: string, spotifyUserId: string): void {
  userMapping.set(frontendUserId, spotifyUserId);
}

// Get Spotify user ID from frontend user ID
export function getSpotifyUserId(frontendUserId: string): string | undefined {
  return userMapping.get(frontendUserId);
}

// Get user token
export function getUserToken(userId: string): SpotifyUserToken | undefined {
  return userTokens.get(userId);
}

// Refresh user token if needed
export async function refreshUserTokenIfNeeded(userId: string, clientId: string, clientSecret: string, redirectUri: string): Promise<string | null> {
  const userTokenData = userTokens.get(userId);
    
  if (!userTokenData || !userTokenData.refreshToken) {
    return null;
  }
  
  // Check if token is expired or will expire in the next 5 minutes
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  if (userTokenData.expiresAt > fiveMinutesFromNow) {
    return userTokenData.accessToken; // Token is still valid
  }
  
  try {
    console.log(`Refreshing token for user ${userId}`);
    
    const api = initializeSpotifyApi(clientId, clientSecret, redirectUri);
    // Set the refresh token and get a new access token
    api.setRefreshToken(userTokenData.refreshToken);
    const data = await api.refreshAccessToken();
    const newAccessToken = data.body.access_token;
    
    // Update the stored token
    setUserToken(userId, newAccessToken, userTokenData.refreshToken);
    
    console.log(`Token refreshed successfully for user ${userId}`);
    return newAccessToken;
    
  } catch (error) {
    console.error(`Failed to refresh token for user ${userId}:`, error instanceof Error ? error.message : 'Unknown error');
    // Remove invalid tokens
    userTokens.delete(userId);
    return null;
  }
}

// Get currently playing track
export async function getCurrentlyPlaying(userId: string, clientId: string, clientSecret: string, redirectUri: string): Promise<SpotifyAuthResponse> {
  try {
    // Try to refresh token if needed
    const accessToken = await refreshUserTokenIfNeeded(userId, clientId, clientSecret, redirectUri);
    
    if (!accessToken) {
      return {
        isPlaying: false,
        message: 'User not authenticated. Please login to Spotify.',
        authenticated: false
      };
    }

    const api = initializeSpotifyApi(clientId, clientSecret, redirectUri);
    api.setAccessToken(accessToken);
    const currentlyPlayingData = await api.getMyCurrentPlayingTrack();

    if (currentlyPlayingData.body && currentlyPlayingData.body.item) {
      const track = currentlyPlayingData.body.item;
      
      // Type guard to ensure it's a track, not an episode
      if ('artists' in track && 'album' in track && track.artists && track.artists.length > 0) {
        const trackData: SpotifyTrack = {
          name: track.name,
          artist: track.artists[0]!.name,
          album: track.album.name,
          isPlaying: currentlyPlayingData.body.is_playing,
          progress: currentlyPlayingData.body.progress_ms || 0,
          duration: track.duration_ms,
          image: track.album.images[0]?.url,
          externalUrl: track.external_urls.spotify
        };

        return {
          authenticated: true,
          ...trackData
        } as SpotifyAuthResponse;
      }
    }
    
    return {
      isPlaying: false,
      message: 'No track currently playing',
      authenticated: true
    };

  } catch (error) {
    console.error('Currently Playing API Error:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error(`Failed to fetch currently playing track: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check authentication status
export async function checkAuthStatus(userId: string, clientId: string, clientSecret: string, redirectUri: string): Promise<{ authenticated: boolean; message: string }> {
  try {
    const accessToken = await refreshUserTokenIfNeeded(userId, clientId, clientSecret, redirectUri);
    const isAuthenticated = !!accessToken;

    return {
      authenticated: isAuthenticated,
      message: isAuthenticated ? 'User is authenticated' : 'User not authenticated'
    };
  } catch (error) {
    console.error('Auth status check error:', error);
    return {
      authenticated: false,
      message: 'Error checking authentication status'
    };
  }
}

// Logout user
export function logoutUser(userId: string): { success: boolean; message: string } {
  userTokens.delete(userId);
  return {
    success: true,
    message: 'User logged out successfully'
  };
}
