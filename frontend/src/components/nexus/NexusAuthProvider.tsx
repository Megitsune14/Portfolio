import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkNexusAuth, clearNexusToken, loginNexus } from '@/utils/nexus-api';

type NexusAuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
  verify: () => Promise<boolean>;
};

const NexusAuthContext = createContext<NexusAuthContextValue | null>(null);

export function NexusAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
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

  const login = useCallback(async (password: string) => {
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
  }, []);

  const logout = useCallback(() => {
    clearNexusToken();
    setIsAuthenticated(false);
    navigate('/nexus/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, error, login, logout, verify }),
    [isAuthenticated, isLoading, error, login, logout, verify],
  );

  return <NexusAuthContext.Provider value={value}>{children}</NexusAuthContext.Provider>;
}

export function useNexusAuth() {
  const context = useContext(NexusAuthContext);
  if (!context) {
    throw new Error('useNexusAuth must be used within NexusAuthProvider');
  }
  return context;
}
