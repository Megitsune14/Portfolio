import { Context } from 'hono';
import type { ApiResponse } from '../../../types/index.js';
import Logger from '../utils/logger.js';

export const errorHandler = (error: Error, c: Context) => {
  Logger.error('Unhandled error', error);

  return c.json(
    {
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    } as ApiResponse,
    500,
  );
};
