import { useState, useEffect, useCallback } from 'react';
import type { SpotifyResponse } from '../types/index';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UPDATE_INTERVAL = 22000; // 22 seconds

export const useSpotifyStats = (userId?: string | null) => {
  const [data, setData] = useState<SpotifyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentlyPlaying = useCallback(async (): Promise<SpotifyResponse | null> => {
    if (!userId) {
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE}/spotify/currently-playing/${userId}`);
      const result = await response.json();
      console.log('Spotify data fetched:', result);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching currently playing:', error);
      return null;
    }
  }, [userId]);


  const formatTime = useCallback((milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const updateStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const spotifyData = await fetchCurrentlyPlaying();
      setData(spotifyData);
    } catch (error) {
      console.error('Error updating Spotify stats:', error);
      setError('Failed to fetch Spotify data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentlyPlaying]);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Initial fetch
    updateStats();

    // Set up interval for updates
    const interval = setInterval(updateStats, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [updateStats, userId]);

  return {
    data,
    isLoading,
    error,
    formatTime,
    refetch: updateStats,
  };
};
