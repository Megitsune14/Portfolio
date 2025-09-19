import SpotifyWebApi from 'spotify-web-api-node';
import * as cheerio from 'cheerio';
import express from 'express';
import cors from 'cors';

import { Client } from 'shieldbow';

import 'dotenv/config';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuration
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const REDIRECT_URI = process.env.REDIRECT_URI;

// Initialize Spotify Web API
const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: REDIRECT_URI
});

const riotClient = new Client(process.env.RIOT_API_KEY);

riotClient.initialize();

// Store user tokens (in production, use a database)
const userTokens = new Map();

// Get user token (for personal data)
const getUserToken = (userId) => {
    return userTokens.get(userId);
}

// Set user token
const setUserToken = (userId, accessToken, refreshToken = null) => {
    userTokens.set(userId, {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + (3600 * 1000) // 1 hour
    });
}

// Refresh user token if needed
const refreshUserTokenIfNeeded = async (userId) => {
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
        
        // Set the refresh token and get a new access token
        spotifyApi.setRefreshToken(userTokenData.refreshToken);
        const data = await spotifyApi.refreshAccessToken();
        const newAccessToken = data.body.access_token;
        
        // Update the stored token
        setUserToken(userId, newAccessToken, userTokenData.refreshToken);
        
        console.log(`Token refreshed successfully for user ${userId}`);
        return newAccessToken;
        
    } catch (error) {
        console.error(`Failed to refresh token for user ${userId}:`, error.message);
        // Remove invalid tokens
        userTokens.delete(userId);
        return null;
    }
}

// Spotify OAuth Routes
app.get('/api/auth/login', (req, res) => {
    const scopes = [
        'user-read-currently-playing',
        'user-read-recently-played',
        'user-top-read',
        'user-read-playback-state'
    ];

    const authUrl = spotifyApi.createAuthorizeURL(scopes, 'user');
    res.redirect(authUrl);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        console.error('Spotify auth error:', error);
        return res.redirect('https://megitsune.xyz/#stats?error=auth_failed');
    }

    if (!code) {
        return res.redirect('https://megitsune.xyz/#stats?error=no_code');
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        // Set the access token
        spotifyApi.setAccessToken(access_token);

        // Get user info to identify the user
        const userData = await spotifyApi.getMe();
        const userId = userData.body.id;

        // Store user tokens
        setUserToken(userId, access_token, refresh_token);

        res.redirect('https://megitsune.xyz/#stats?auth=success');
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.redirect('https://megitsune.xyz/#stats?error=token_exchange_failed');
    }
});

// Riot Games API - Get summoner info (supports both summoner names and Riot IDs)
app.get('/api/riot/:region/:gameName/:tag', async (req, res) => {

    const { region, gameName, tag } = req.params;

    try {
        // Set the region for this request
        riotClient.region = region;

        // 1) Riot ID -> Account (PUUID)
        const account = await riotClient.accounts.fetchByNameAndTag(gameName, tag);
        console.log(account);

        // 2) PUUID -> Summoner
        const summoner = await riotClient.summoners.fetchByPlayerId(account.playerId);

        // 3) League / Rank (SoloQ)
        let soloQ = null;
        try {
            const fetchOpgg = await fetch(`http://megitsune.xyz/api/opgg/${region}/${gameName}/${tag}`);
            
            if (!fetchOpgg.ok) {
                throw new Error(`HTTP error! status: ${fetchOpgg.status}`);
            }
            
            soloQ = await fetchOpgg.json();
        } catch (error) {
            console.error(error);
            // unranked ou pas de données → soloQ reste null
        }

        // 4) Champion mastery la plus haute
        const highest = await summoner.championMastery.highest();

        res.json({
            region,
            riotId: `${gameName}#${tag}`,
            summoner: {
                name: summoner.name,
                level: summoner.level,
                id: summoner.id,
                puuid: summoner.playerId,
            },
            rank: soloQ, // null si non classé
            icon: summoner.profileIcon,
            topMastery: {
                championId: highest.champion.id,
                championName: highest.champion.name,
                masteryLevel: highest.level,
                masteryPoints: highest.points,
            },
        });
    } catch (err) {
        console.error(err);
        const status = err?.status ?? 500;
        res.status(status).json({
            error: true,
            message:
                err?.message ??
                'Une erreur est survenue lors de la récupération des données Riot.',
        });
    }
});

// OP.GG Web Scraping - Get summoner rank from OP.GG
app.get('/api/opgg/:region/:gameName/:tag', async (req, res) => {
    const { region, gameName, tag } = req.params;
    
    try {
        // Construire l'URL OP.GG
        const opggUrl = `https://op.gg/fr/lol/summoners/${region}/${gameName}-${tag}`;
        console.log(`Scraping OP.GG: ${opggUrl}`);
        
        // Faire la requête HTTP
        const response = await fetch(opggUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Chercher la section "Classé en solo/duo"
        let soloRankData = null;
        
        // Parcourir toutes les sections pour trouver celle qui contient "Classé en solo/duo"
        $('section.w-full.bg-gray-0').each((index, element) => {
            const sectionText = $(element).text();
            if (sectionText.includes('Classé en solo/duo')) {
                // Trouver les données de rang dans cette section
                const rankContainer = $(element).find('.flex.w-full.flex-col.gap-3.p-3');
                
                if (rankContainer.length > 0) {
                    // Chercher toutes les divs avec les données de rang
                    const rankDivs = rankContainer.find('.flex.w-full.items-center.justify-between');
                    
                    // Prendre la première div qui contient le tier principal
                    const firstDiv = rankDivs.first();
                    const divText = firstDiv.text();
                    
                    // Extraire le tier
                    const tierElement = firstDiv.find('strong.text-xl.first-letter\\:uppercase');
                    const tierText = tierElement.text().trim();
                    
                    // Extraire les LP - prendre le premier span avec LP
                    const lpElement = firstDiv.find('span.text-xs.text-gray-500').first();
                    let lpText = lpElement.text().trim();
                    
                    // Nettoyer les LP si ils sont concaténés
                    if (lpText.includes('LP')) {
                        const lpMatch = lpText.match(/(\d+\s+LP)/);
                        lpText = lpMatch ? lpMatch[1] : lpText;
                    }
                    
                    // Extraire les wins/losses et taux de victoire du texte complet
                    const winLossMatch = divText.match(/(\d+V\s+\d+D)/);
                    const winRateMatch = divText.match(/Taux de victoire\s+(\d+%)/);
                    
                    const winLossText = winLossMatch ? winLossMatch[1] : '';
                    const winRateText = winRateMatch ? winRateMatch[1] : '';
                    
                    if (tierText && tierText !== 'Unranked') {
                        soloRankData = {
                            tier: tierText,
                            lp: lpText || '0 LP',
                            winLoss: winLossText,
                            winRate: winRateText,
                            queue: 'RANKED_SOLO_5x5'
                        };
                    }
                }
                return false; // Arrêter la boucle une fois trouvé
            }
        });
        
        // Si pas de données trouvées, essayer une approche alternative
        if (!soloRankData) {
            // Chercher dans les tableaux de données
            $('table').each((index, table) => {
                const tableText = $(table).text();
                if (tableText.includes('Classé en solo/duo') || tableText.includes('S2024') || tableText.includes('S2025')) {
                    const rows = $(table).find('tbody tr');
                    rows.each((i, row) => {
                        const rowText = $(row).text();
                        if (rowText.includes('S2024') || rowText.includes('S2025')) {
                            // Extraire les données du tableau
                            const cells = $(row).find('td');
                            if (cells.length >= 3) {
                                const season = $(cells[0]).text().trim();
                                const tierCell = $(cells[1]);
                                const tierImg = tierCell.find('img');
                                const tierText = tierCell.find('span').text().trim();
                                const lp = $(cells[2]).text().trim();
                                
                                if (tierText && tierText !== 'Unranked') {
                                    soloRankData = {
                                        tier: tierText,
                                        lp: lp,
                                        season: season,
                                        queue: 'RANKED_SOLO_5x5'
                                    };
                                }
                            }
                        }
                    });
                }
            });
        }
        
        res.json({
            region,
            gameName,
            tag,
            opggUrl,
            rank: soloRankData,
            scrapedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('OP.GG scraping error:', error);
        res.status(500).json({
            error: true,
            message: 'Erreur lors du scraping OP.GG',
            details: error.message,
            region,
            gameName,
            tag
        });
    }
});

// Get currently playing track
app.get('/api/spotify/currently-playing/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Try to refresh token if needed
        const accessToken = await refreshUserTokenIfNeeded(userId);
        
        if (!accessToken) {
            return res.json({
                isPlaying: false,
                message: 'User not authenticated. Please login to Spotify.',
                authenticated: false
            });
        }

        spotifyApi.setAccessToken(accessToken);
        const currentlyPlayingData = await spotifyApi.getMyCurrentPlayingTrack();

        if (currentlyPlayingData.body && currentlyPlayingData.body.item) {
            const track = currentlyPlayingData.body.item;
            const currentlyPlaying = {
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                isPlaying: currentlyPlayingData.body.is_playing,
                progress: currentlyPlayingData.body.progress_ms,
                duration: track.duration_ms,
                image: track.album.images[0]?.url,
                externalUrl: track.external_urls.spotify
            };

            res.json(currentlyPlaying);
        } else {
            res.json({
                isPlaying: false,
                message: 'No track currently playing',
                authenticated: true
            });
        }

    } catch (error) {
        console.error('Currently Playing API Error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch currently playing track',
            details: error.message
        });
    }
});

// Check authentication status
app.get('/api/auth/status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Try to refresh token if needed
        const accessToken = await refreshUserTokenIfNeeded(userId);
        const isAuthenticated = !!accessToken;

        res.json({
            authenticated: isAuthenticated,
            message: isAuthenticated ? 'User is authenticated' : 'User not authenticated'
        });
    } catch (error) {
        console.error('Auth status check error:', error);
        res.json({
            authenticated: false,
            message: 'Error checking authentication status'
        });
    }
});

// Logout user
app.get('/api/auth/logout/:userId', (req, res) => {
    const { userId } = req.params;

    // Remove user tokens from memory
    userTokens.delete(userId);

    res.json({
        success: true,
        message: 'User logged out successfully'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test Riot API key
app.get('/api/test-riot-key', async (req, res) => {
    if (!RIOT_API_KEY) {
        return res.status(400).json({
            error: 'RIOT_API_KEY not configured',
            message: 'Please set RIOT_API_KEY in your .env file',
            help: {
                steps: [
                    '1. Go to https://developer.riotgames.com/',
                    '2. Sign in with your Riot Games account',
                    '3. Go to "Personal API Key" section',
                    '4. Generate a new API key',
                    '5. Copy the key and add it to your .env file as RIOT_API_KEY=your_key_here'
                ]
            }
        });
    }

    try {
        // Test with a simple API call to check if the key is valid
        const testResponse = await fetch(
            'https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations',
            {
                headers: { 'X-Riot-Token': RIOT_API_KEY }
            }
        );

        console.log(`Test API URL: https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations`);
        console.log(`Test API Key: ${RIOT_API_KEY.substring(0, 8)}...`);

        if (testResponse.ok) {
            res.json({
                status: 'success',
                message: 'Riot API key is valid',
                keyPreview: RIOT_API_KEY.substring(0, 8) + '...'
            });
        } else {
            const errorText = await testResponse.text();
            let errorMessage = `Riot API key is invalid (${testResponse.status})`;
            let help = null;

            if (testResponse.status === 401) {
                errorMessage = 'Riot API key is unknown or invalid';
                help = {
                    steps: [
                        '1. Go to https://developer.riotgames.com/',
                        '2. Sign in with your Riot Games account',
                        '3. Go to "Personal API Key" section',
                        '4. Generate a new API key',
                        '5. Copy the key and add it to your .env file as RIOT_API_KEY=your_key_here',
                        '6. Restart the server'
                    ]
                };
            }

            res.status(testResponse.status).json({
                status: 'error',
                message: errorMessage,
                details: errorText,
                help: help
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to test Riot API key',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🎮 Riot API: ${RIOT_API_KEY ? `Configured (${RIOT_API_KEY.substring(0, 8)}...)` : 'Not configured'}`);
    console.log(`🎵 Spotify API: ${SPOTIFY_CLIENT_ID ? 'Configured' : 'Not configured'}`);

    if (!RIOT_API_KEY) {
        console.warn('⚠️  WARNING: RIOT_API_KEY is not set in .env file');
    }
    if (!SPOTIFY_CLIENT_ID) {
        console.warn('⚠️  WARNING: SPOTIFY_CLIENT_ID is not set in .env file');
    }
});

export default app;
