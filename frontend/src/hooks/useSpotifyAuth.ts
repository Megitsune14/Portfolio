import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface SpotifyAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
}

export const useSpotifyAuth = () => {
  const [authState, setAuthState] = useState<SpotifyAuthState>({
    isAuthenticated: false,
    isLoading: false, // Start with false, will be set to true when needed
    error: null,
    userId: null
  });

  // Check authentication status on mount
  const checkAuthStatus = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE}/spotify/auth/status/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: result.data.authenticated,
          isLoading: false,
          error: null,
          userId: result.data.authenticated ? userId : null
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          error: result.error || 'Failed to check auth status',
          userId: null
        }));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: 'Network error while checking auth status',
        userId: null
      }));
    }
  }, []);

  // Initiate Spotify login
  const login = useCallback((userId?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    const loginUrl = userId 
      ? `${API_BASE}/spotify/auth/login?state=${encodeURIComponent(userId)}`
      : `${API_BASE}/spotify/auth/login`;
    window.location.href = loginUrl;
  }, []);

  // Logout user
  const logout = useCallback(async (userId: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`${API_BASE}/spotify/auth/logout/${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          userId: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to logout'
        }));
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error during logout'
      }));
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = useCallback((userId: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    checkAuthStatus(userId);
  }, [checkAuthStatus]);

  return {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    handleCallback
  };
};
