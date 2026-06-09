import { useCallback, useEffect, useState } from 'react';
import type { DiscordProfileResponse } from '../types/index';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const useDiscordProfile = () => {
  const [data, setData] = useState<DiscordProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (): Promise<DiscordProfileResponse | null> => {
    try {
      const response = await fetch(`${API_BASE}/discord/profile`);
      const result = await response.json();

      if (!result.success) {
        setError(result.message ?? 'Unable to fetch Discord profile');
        return null;
      }

      setError(null);
      return result.data as DiscordProfileResponse;
    } catch (e) {
      console.error('Error fetching Discord profile:', e);
      setError('Unable to fetch Discord profile');
      return null;
    }
  }, []);

  const load = useCallback(async () => {
    const profile = await fetchProfile();
    setData(profile);
    setIsLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  return {
    data,
    isLoading,
    error,
    refetch: load,
  };
};
