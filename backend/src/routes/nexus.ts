import { Hono } from 'hono';
import * as NexusController from '../controllers/NexusController.js';
import { nexusAuthMiddleware } from '../middleware/nexusAuth.js';
import nexusGoalsRouter from './nexusGoals.js';

const nexusRouter = new Hono();

nexusRouter.post('/track', NexusController.trackVisit);
nexusRouter.post('/auth/login', NexusController.login);
nexusRouter.get('/auth/me', NexusController.me);

const protectedVisitors = new Hono();
protectedVisitors.use('*', nexusAuthMiddleware);
protectedVisitors.get('/', NexusController.listVisitors);
protectedVisitors.get('/stats', NexusController.visitorStats);
nexusRouter.route('/visitors', protectedVisitors);
nexusRouter.route('/goals', nexusGoalsRouter);

export default nexusRouter;
