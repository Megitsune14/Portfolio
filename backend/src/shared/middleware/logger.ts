import { Context, Next } from 'hono';
import Logger from '../utils/logger.js';

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;

  Logger.debug(`${method} ${url}`);

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  Logger.debug(`${method} ${url} - ${status} (${duration}ms)`);
};
