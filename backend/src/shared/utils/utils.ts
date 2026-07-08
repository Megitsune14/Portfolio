import Logger from './logger.js';

export function logIntegrations(): void {
  Logger.info('Checking integrations...');

  if (process.env.RIOT_API_KEY) {
    Logger.success(`Riot API configured (${process.env.RIOT_API_KEY.substring(0, 8)}...)`);
  }

  if (process.env.SPOTIFY_CLIENT_ID) {
    Logger.success('Spotify API configured');
  }

  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_USER_ID) {
    Logger.success('Discord API configured');
  }

  if (process.env.NEXUS_MASTER_PASSWORD) {
    Logger.success('Nexus dashboard configured');
  }

  Logger.success(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
