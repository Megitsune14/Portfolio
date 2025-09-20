import { useState, useEffect, useCallback } from 'react';
import type { RiotResponse } from '../types/index';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const GAME_NAME = 'Megitsune';
const TAG = '0014';
const UPDATE_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

export const useRiotStats = () => {
  const [data, setData] = useState<RiotResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [nextUpdate, setNextUpdate] = useState<Date | null>(null);

  const fetchRiotStats = useCallback(async (): Promise<RiotResponse | null> => {
    try {
      const response = await fetch(`${API_BASE}/riot/${GAME_NAME}/${TAG}`);
      const result = await response.json();
      console.log('Riot stats fetched:', result);
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching Riot stats:', error);
      return null;
    }
  }, []);

  const formatTier = useCallback((tier: string): string => {
    if (!tier) return 'Unranked';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
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
      const riotData = await fetchRiotStats();
      setData(riotData);
      
      // Update timestamps
      const now = new Date();
      setLastUpdate(now);
      setNextUpdate(new Date(now.getTime() + UPDATE_INTERVAL));
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
    lastUpdate,
    nextUpdate,
    formatTier,
    formatWinRate,
    formatWinLoss,
    formatLP,
    refetch: updateStats,
  };
};
