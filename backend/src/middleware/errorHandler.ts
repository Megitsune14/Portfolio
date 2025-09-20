import { Context } from 'hono';
import type { ApiResponse } from '../../types/index.js';

export const errorHandler = (error: Error, c: Context) => {
  console.error('Unhandled error:', error);
  
  return c.json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  } as ApiResponse, 500);
};