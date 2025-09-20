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

			// Session Secret
			SESSION_SECRET: string;

			// Server
			PORT: string;            
			NODE_ENV: "development" | "production";
		}
	}
}

export { };