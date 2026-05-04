declare global {
	namespace NodeJS {
		interface ProcessEnv {

            // Project
            PROJECT_NAME: string;
            PROJECT_URL: string;

            // Riot Games API
            RIOT_API_KEY: string;

            // Spotify API
            SPOTIFY_CLIENT_ID: string;
            SPOTIFY_CLIENT_SECRET: string;
            REDIRECT_ENDPOINT: string;

            // Discord Bot API (profile via GET /users/:id — bot must share a server with the user)
            DISCORD_BOT_TOKEN: string;
            DISCORD_USER_ID: string;

			// Session Secret
			SESSION_SECRET: string;

			// Server
			PORT: string;            
			NODE_ENV: "development" | "production";
		}
	}
}

export { };