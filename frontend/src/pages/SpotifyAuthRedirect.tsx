import { useEffect } from 'react';

export default function SpotifyAuthRedirect() {
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${API_BASE}/spotify/auth/login`;
  }, []);

  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="surface-panel w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-(--primary)" />
        <p className="text-lg text-foreground">Redirecting to Spotify...</p>
      </div>
    </div>
  );
}
