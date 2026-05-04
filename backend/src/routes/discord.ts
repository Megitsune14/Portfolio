import { Hono } from 'hono';
import * as DiscordController from '../controllers/DiscordController.js';

const discordRouter = new Hono();

discordRouter.get('/profile', DiscordController.getDiscordProfile);

export default discordRouter;
