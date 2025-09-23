import { useState, useEffect, useCallback } from 'react';
import type { SpotifyRecentlyPlayedResponse } from '../types/index';
import { cacheManager } from '../utils/cache';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes (recently played doesn't change as often)

export const useSpotifyRecentlyPlayed = (userId?: string | null, limit: number = 3) => {
  const [data, setData] = useState<SpotifyRecentlyPlayedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyPlayed = useCallback(async (): Promise<SpotifyRecentlyPlayedResponse | null> => {
    if (!userId) {
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE}/spotify/recently-played/${userId}?limit=${limit}`);
      const result = await response.json();
      console.log('Recently played data fetched:', result);
      const recentlyPlayedData = result.success ? result.data : null;
      
      return recentlyPlayedData;
    } catch (error) {
      console.error('Error fetching recently played:', error);
      return null;
    }
  }, [userId, limit]);

  const formatTimeAgo = useCallback((playedAt: string): string => {
    const now = new Date();
    const playedTime = new Date(playedAt);
    const diffInMinutes = Math.floor((now.getTime() - playedTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }, []);

  const updateRecentlyPlayed = useCallback(async (isInitialLoad = false) => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Pour le chargement initial, vérifier d'abord le cache
      if (isInitialLoad) {
        const cacheKey = `recently_played_${userId}`;
        const cachedData = cacheManager.get<SpotifyRecentlyPlayedResponse>(cacheKey);
        console.log('Initial load - Recently played cache check:', { userId, hasCachedData: !!cachedData });
        
        if (cachedData) {
          console.log('Using cached recently played data for initial load');
          setData(cachedData);
          setIsLoading(false);
          
          // Récupérer les données fraîches en arrière-plan
          const freshData = await fetchRecentlyPlayed();
          if (freshData) {
            cacheManager.set(cacheKey, freshData, 5 * 60 * 1000); // 5 minutes TTL
            setData(freshData);
          }
          return;
        } else {
          // Pas de cache, on a besoin de charger
          setIsLoading(true);
        }
      }
      
      // Récupérer les données fraîches
      const freshData = await fetchRecentlyPlayed();
      
      if (freshData) {
        const cacheKey = `recently_played_${userId}`;
        cacheManager.set(cacheKey, freshData, 5 * 60 * 1000); // 5 minutes TTL
        setData(freshData);
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error updating recently played:', error);
      setError('Failed to fetch recently played tracks');
      setData(null);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [fetchRecentlyPlayed, userId]);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Initial fetch
    updateRecentlyPlayed(true);

    // Set up interval for updates (less frequent than currently playing)
    const interval = setInterval(() => updateRecentlyPlayed(false), UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [updateRecentlyPlayed, userId]);

  const refreshHistory = useCallback(() => {
    console.log('Refreshing recently played history due to track change');
    updateRecentlyPlayed(false);
  }, [updateRecentlyPlayed]);

  return {
    data,
    isLoading,
    error,
    formatTimeAgo,
    refetch: updateRecentlyPlayed,
    refreshHistory,
  };
};
