import { Context } from 'hono';
import { generateAuthUrl, exchangeCodeForTokens, getCurrentlyPlaying, getRecentlyPlayed, checkAuthStatus, logoutUser, setUserToken, mapUserIds, getSpotifyUserId } from '../services/SpotifyService.js';
import type { ApiResponse } from '../../types/index.js';

// Generate Spotify authorization URL
export async function generateSpotifyAuthUrl(c: Context): Promise<Response> {
  try {
    const { state } = c.req.query();
    const redirectUri = `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`;
    
    console.log('Generating Spotify auth URL:');
    console.log('- Client ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('- Redirect URI:', redirectUri);
    console.log('- State:', state);
    
    const authUrl = generateAuthUrl(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      redirectUri,
      state
    );
    
    console.log('Generated auth URL:', authUrl);
    return c.redirect(authUrl);
  } catch (error) {
    console.error('Auth URL generation error:', error);
    return c.json({
      success: false,
      error: 'Failed to generate authorization URL',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}

// Handle Spotify OAuth callback
export async function handleSpotifyCallback(c: Context): Promise<Response> {
  try {
    const { code, error, state } = c.req.query();
    
    // Debug logs
    console.log('Spotify callback received:');
    console.log('- code:', code);
    console.log('- error:', error);
    console.log('- state:', state);
    console.log('- full URL:', c.req.url);

    if (error) {
      console.error('Spotify auth error:', error);
      return c.redirect(`${process.env.PROJECT_URL}/?error=auth_failed#stats`);
    }

    if (!code) {
      console.error('No authorization code received from Spotify');
      return c.redirect(`${process.env.PROJECT_URL}/?error=no_code#stats`);
    }

    const { accessToken, refreshToken, userId: spotifyUserId } = await exchangeCodeForTokens(
      code,
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`
    );
    
    // Store user tokens using Spotify user ID
    setUserToken(spotifyUserId, accessToken, refreshToken);

    // If we have a frontend user ID in state, map it
    if (state) {
      mapUserIds(state, spotifyUserId);
    }

    return c.redirect(`${process.env.PROJECT_URL}/?auth=success&userId=${state || spotifyUserId}#stats`);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return c.redirect(`${process.env.PROJECT_URL}/?error=token_exchange_failed#stats`);
  }
}

// Get currently playing track
export async function getSpotifyCurrentlyPlaying(c: Context): Promise<Response> {
  try {
    const frontendUserId = c.req.param('userId');
    
    if (!frontendUserId) {
      return c.json({
        success: false,
        error: 'User ID is required',
        message: 'Please provide a valid user ID'
      } as ApiResponse, 400);
    }

    // Get the actual Spotify user ID
    const spotifyUserId = getSpotifyUserId(frontendUserId) || frontendUserId;

    const result = await getCurrentlyPlaying(
      spotifyUserId,
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`
    );
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('Currently Playing API Error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch currently playing track',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}

// Check authentication status
export async function checkSpotifyAuthStatus(c: Context): Promise<Response> {
  try {
    const frontendUserId = c.req.param('userId');
    
    if (!frontendUserId) {
      return c.json({
        success: false,
        error: 'User ID is required',
        message: 'Please provide a valid user ID'
      } as ApiResponse, 400);
    }

    // Get the actual Spotify user ID
    const spotifyUserId = getSpotifyUserId(frontendUserId) || frontendUserId;

    const result = await checkAuthStatus(
      spotifyUserId,
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`
    );
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('Auth status check error:', error);
    return c.json({
      success: false,
      error: 'Error checking authentication status',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}

// Get recently played tracks
export async function getSpotifyRecentlyPlayed(c: Context): Promise<Response> {
  try {
    const frontendUserId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '3');
    
    if (!frontendUserId) {
      return c.json({
        success: false,
        error: 'User ID is required',
        message: 'Please provide a valid user ID'
      } as ApiResponse, 400);
    }

    // Get the actual Spotify user ID
    const spotifyUserId = getSpotifyUserId(frontendUserId) || frontendUserId;

    const result = await getRecentlyPlayed(
      spotifyUserId,
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
      `${process.env.BACKEND_URL}${process.env.REDIRECT_ENDPOINT}`,
      limit
    );
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('Recently Played API Error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch recently played tracks',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}

// Logout user
export async function logoutSpotifyUser(c: Context): Promise<Response> {
  try {
    const frontendUserId = c.req.param('userId');
    
    if (!frontendUserId) {
      return c.json({
        success: false,
        error: 'User ID is required',
        message: 'Please provide a valid user ID'
      } as ApiResponse, 400);
    }

    // Get the actual Spotify user ID
    const spotifyUserId = getSpotifyUserId(frontendUserId) || frontendUserId;

    const result = logoutUser(spotifyUserId);
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({
      success: false,
      error: 'Error during logout',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}
