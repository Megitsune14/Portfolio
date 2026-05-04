// Import
import { errorHandler } from './middleware/errorHandler.js';
import { loggerMiddleware } from './middleware/logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import 'dotenv/config';

// Routes
import spotifyRouter from './routes/spotify.js';
import riotRouter from './routes/riot.js';
import discordRouter from './routes/discord.js';
import healthRouter from './routes/health.js';

try {

    // Create Hono app
    const app = new Hono();

    // Global middleware
    app.use('*', corsMiddleware);
    // app.use('*', loggerMiddleware);

    // Error handler
    app.onError(errorHandler);

    // Health check route
    app.route('/health', healthRouter);

    // API routes
    app.route('/spotify', spotifyRouter);
    app.route('/riot', riotRouter);
    app.route('/discord', discordRouter);

    // Root route
    app.get('/', (c) => {
        return c.json({
            success: true,
            message: 'API endpoint',
            version: '2.0.0',
            endpoints: {
                health: '/health',
                spotify: '/spotify',
                riot: '/riot',
                discord: '/discord'
            }
        });
    });

    // 404 handler
    app.notFound((c) => {
        return c.json({
            success: false,
            error: 'Not Found',
            message: 'The requested resource was not found'
        }, 404);
    });

    // Start server
    const port = process.env.PORT;

    console.log('🚀 Starting API...');
    console.log(`🎮 Riot API: ${process.env.RIOT_API_KEY ? `Configured (${process.env.RIOT_API_KEY.substring(0, 8)}...)` : 'Not configured'}`);
    console.log(`🎵 Spotify API: ${process.env.SPOTIFY_CLIENT_ID ? 'Configured' : 'Not configured'}`);
    console.log(`💬 Discord API: ${process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_USER_ID ? 'Configured' : 'Not configured'}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    serve({
        fetch: app.fetch,
        port: parseInt(port)
    }, (info) => {
        console.log(`🚀 Server running on http://${info.address}:${info.port}`);
    });

} catch (error) {
    console.error('Error loading environment variables:', error);
    process.exit(1);
}