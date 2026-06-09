import { useCallback, useEffect, useState } from 'react';
import { checkNexusAuth, clearNexusToken, loginNexus } from '../utils/nexus-api';

export function useNexusAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async () => {
    const authenticated = await checkNexusAuth();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    return authenticated;
  }, []);

  useEffect(() => {
    void verify();
  }, [verify]);

  const login = async (password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await loginNexus(password);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setError(err instanceof Error ? err.message : 'Connexion impossible');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearNexusToken();
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    verify,
  };
}
