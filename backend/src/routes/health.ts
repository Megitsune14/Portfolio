import { Hono } from 'hono';
import * as HealthController from '../controllers/HealthController.js';

// Create router
const healthRouter = new Hono();

// Health check route
healthRouter.get('/', HealthController.healthCheck);

export default healthRouter;