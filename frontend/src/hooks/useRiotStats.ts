import { useState, useEffect, useCallback } from 'react';
import type { RiotResponse } from '../types/index';
import { riotCache } from '../utils/cache';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const GAME_NAME = 'Megitsune';
const TAG = '0014';
const UPDATE_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const useRiotStats = () => {
  const [data, setData] = useState<RiotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRiotStats = useCallback(async (): Promise<RiotResponse | null> => {
    try {
      const response = await fetch(`${API_BASE}/riot/${GAME_NAME}/${TAG}`);
      const result = await response.json();
      console.log('Riot stats fetched:', result);
      const riotData = result.success ? result.data : null;
      
      // Mettre en cache les données récupérées
      if (riotData) {
        riotCache.set(riotData);
      }
      
      return riotData;
    } catch (error) {
      console.error('Error fetching Riot stats:', error);
      return null;
    }
  }, []);

  const formatTier = useCallback((tier: string, division: string): string => {
    if (!tier) return 'Unranked';
    return tier.slice(0, 1).toUpperCase() + tier.slice(1).toLowerCase() + ' ' + division;
  }, []);

  const formatWinRate = useCallback((winRate: string): string => {
    if (!winRate) return 'N/A';
    return winRate;
  }, []);

  const formatWinLoss = useCallback((wins: number, losses: number): string => {
    if (!wins && !losses) return 'N/A';
    return `${wins}V ${losses}D`;
  }, []);

  const formatLP = useCallback((lp: number): string => {
    if (lp === null || lp === undefined) return 'N/A';
    return `${lp} LP`;
  }, []);

  const updateStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier d'abord le cache
      const cachedData = riotCache.get();
      if (cachedData) {
        console.log('Using cached Riot data');
        setData(prevData => {
          // Éviter les re-renders inutiles si les données sont identiques
          if (JSON.stringify(prevData) === JSON.stringify(cachedData)) {
            return prevData;
          }
          return cachedData;
        });
        setIsLoading(false);
        
        // Récupérer les données fraîches en arrière-plan
        const freshData = await fetchRiotStats();
        if (freshData) {
          setData(prevData => {
            // Éviter les re-renders inutiles si les données sont identiques
            if (JSON.stringify(prevData) === JSON.stringify(freshData)) {
              return prevData;
            }
            return freshData;
          });
        }
        return;
      }
      
      // Si pas de cache, récupérer les données
      const riotData = await fetchRiotStats();
      setData(riotData);
    } catch (error) {
      console.error('Error updating Riot stats:', error);
      setError('Failed to fetch Riot data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRiotStats]);

  useEffect(() => {
    // Initial fetch
    updateStats();

    // Set up interval for updates
    const interval = setInterval(updateStats, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    data,
    isLoading,
    error,
    formatTier,
    formatWinRate,
    formatWinLoss,
    formatLP,
    refetch: updateStats,
  };
};
