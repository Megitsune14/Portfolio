import { errorHandler } from './shared/middleware/errorHandler.js';
import { corsMiddleware } from './shared/middleware/cors.js';
import { checkConfig } from './shared/config/checkConfig.js';
import { connectMongo } from './shared/db/mongodb.js';
import Logger from './shared/utils/logger.js';
import { logIntegrations } from './shared/utils/utils.js';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

import 'dotenv/config';

import spotifyRouter from './modules/spotify/routes/public.js';
import riotRouter from './modules/riot/routes.js';
import discordRouter from './modules/discord/routes.js';
import healthRouter from './modules/health/routes.js';
import nexusRouter from './modules/nexus/routes.js';
import portfolioPublicRouter from './modules/portfolio/routes/public.js';
import { getPublicAssetsRoot } from './modules/portfolio/assets.service.js';
import { startSpotifyScheduler } from './modules/spotify/sync/scheduler.js';
import { startRiotScheduler } from './modules/riot/scheduler.js';

try {
  Logger.separator();
  Logger.info('Checking configuration file...');
  await checkConfig();
  Logger.success('Configuration file is valid!');
  Logger.separator();

  Logger.info('Connecting to the database...');
  const db = await connectMongo();
  Logger.success(`Connected to the database (${db.databaseName})!`);
  Logger.separator();

  Logger.info('Starting background schedulers...');
  startSpotifyScheduler();
  startRiotScheduler();
  Logger.separator();

  logIntegrations();
  Logger.separator();

  const app = new Hono();

  app.use('*', corsMiddleware);
  app.use(
    '/assets/*',
    serveStatic({
      root: getPublicAssetsRoot(),
      rewriteRequestPath: (requestPath) => requestPath.replace(/^\/assets\//, ''),
    }),
  );
  app.onError(errorHandler);

  app.route('/health', healthRouter);
  app.route('/spotify', spotifyRouter);
  app.route('/riot', riotRouter);
  app.route('/discord', discordRouter);
  app.route('/nexus', nexusRouter);
  app.route('/portfolio', portfolioPublicRouter);

  app.get('/', (c) => {
    return c.json({
      success: true,
      message: 'API endpoint',
      version: '2.0.0',
      endpoints: {
        health: '/health',
        spotify: '/spotify',
        riot: '/riot',
        discord: '/discord',
        nexus: '/nexus',
        portfolio: '/portfolio',
      },
    });
  });

  app.notFound((c) => {
    return c.json(
      {
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found',
      },
      404,
    );
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);

  Logger.info('Starting server...');

  serve(
    {
      fetch: app.fetch,
      port,
    },
    () => {
      Logger.success(`Server listening on http://localhost:${port}`);
      Logger.separator();
    },
  );
} catch (error) {
  Logger.error('Failed to start application', error);
  process.exit(1);
}
