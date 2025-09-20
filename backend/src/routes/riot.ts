import { Hono } from 'hono';
import * as RiotController from '../controllers/RiotController.js';

// Create router
const riotRouter = new Hono();

// Riot Games API Routes
riotRouter.get('/:gameName/:tag', RiotController.getRiotSummonerInfo);

// Test API key
riotRouter.get('/test-key', RiotController.testRiotApiKey);

export default riotRouter;