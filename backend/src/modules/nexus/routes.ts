import { Hono } from 'hono';
import * as NexusController from './visitors/visitors.controller.js';
import { nexusAuthMiddleware } from '../../shared/middleware/nexusAuth.js';
import nexusGoalsRouter from './goals/routes.js';
import nexusSpotifyRouter from '../spotify/routes/nexus.js';
import portfolioNexusRouter from '../portfolio/routes/nexus.js';

const nexusRouter = new Hono();

nexusRouter.post('/visit', NexusController.trackVisit);
nexusRouter.post('/auth/login', NexusController.login);
nexusRouter.get('/auth/me', NexusController.me);

const protectedVisitors = new Hono();
protectedVisitors.use('*', nexusAuthMiddleware);
protectedVisitors.get('/', NexusController.listVisitors);
protectedVisitors.get('/stats', NexusController.visitorStats);
nexusRouter.route('/visitors', protectedVisitors);
nexusRouter.route('/goals', nexusGoalsRouter);
nexusRouter.route('/spotify', nexusSpotifyRouter);
nexusRouter.route('/', portfolioNexusRouter);

export default nexusRouter;
