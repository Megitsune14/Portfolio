import { Hono } from 'hono';
import * as SpotifyController from '../controllers/SpotifyController.js';

// Create router
const spotifyRouter = new Hono();

// Spotify OAuth Routes
spotifyRouter.get('/auth/login', SpotifyController.generateSpotifyAuthUrl);
spotifyRouter.get('/auth/callback', SpotifyController.handleSpotifyCallback);

// Spotify API Routes
spotifyRouter.get('/currently-playing/:userId', SpotifyController.getSpotifyCurrentlyPlaying);
spotifyRouter.get('/auth/status/:userId', SpotifyController.checkSpotifyAuthStatus);
spotifyRouter.get('/auth/logout/:userId', SpotifyController.logoutSpotifyUser);

export default spotifyRouter;