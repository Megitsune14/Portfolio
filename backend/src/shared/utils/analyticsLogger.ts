import Logger from './logger.js';

export function logAnalytics(message: string, meta?: Record<string, unknown>): void {
  Logger.debug(message, meta);
}
