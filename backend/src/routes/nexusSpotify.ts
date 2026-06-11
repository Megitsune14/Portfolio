import { Hono } from 'hono';
import * as SpotifyNexusController from '../controllers/SpotifyNexusController.js';
import { nexusAuthMiddleware } from '../middleware/nexusAuth.js';

const nexusSpotifyRouter = new Hono();

nexusSpotifyRouter.use('*', nexusAuthMiddleware);

nexusSpotifyRouter.get('/status', SpotifyNexusController.getStatus);
nexusSpotifyRouter.get('/wrapped/all-time', SpotifyNexusController.getWrapped);
nexusSpotifyRouter.get('/wrapped', SpotifyNexusController.getWrapped);
nexusSpotifyRouter.get('/top', SpotifyNexusController.getTop);
nexusSpotifyRouter.post('/sync', SpotifyNexusController.postSync);

export default nexusSpotifyRouter;
