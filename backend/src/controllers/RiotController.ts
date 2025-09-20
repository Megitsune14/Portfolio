import { Context } from 'hono';
import { getSummonerInfo, testApiKey } from '../services/RiotService.js';
import type { ApiResponse } from '../../types/index.js';

// Get summoner info
export async function getRiotSummonerInfo(c: Context): Promise<Response> {
  try {
    const gameName = c.req.param('gameName');
    const tag = c.req.param('tag');

    if (!gameName || !tag) {
      return c.json({
        success: false,
        error: 'Missing required parameters',
        message: 'gameName and tag are required'
      } as ApiResponse, 400);
    }

    const result = await getSummonerInfo(gameName, tag, process.env.RIOT_API_KEY!);
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error: any) {
    console.error('Riot API Error:', error);
    const status = error?.status ?? 500;
    
    return c.json({
      success: false,
      error: 'Failed to fetch summoner information',
      message: error?.message ?? 'Une erreur est survenue lors de la récupération des données Riot.'
    } as ApiResponse, status);
  }
}


// Test Riot API key
export async function testRiotApiKey(c: Context): Promise<Response> {
  try {
    const apiKey = process.env.RIOT_API_KEY;
    const result = await testApiKey(apiKey || '');
    
    if (result.status === 'error') {
      return c.json({
        success: false,
        error: result.message,
        data: result
      } as ApiResponse, 400);
    }
    
    return c.json({
      success: true,
      data: result
    } as ApiResponse);
  } catch (error) {
    console.error('API key test error:', error);
    return c.json({
      success: false,
      error: 'Failed to test Riot API key',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse, 500);
  }
}
