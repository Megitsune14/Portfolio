import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logAnalytics } from '../utils/analyticsLogger';
import { trackVisit } from '../utils/visit-tracking';

export function useVisitorTracking() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/nexus')) {
      return;
    }

    const path = location.pathname + location.search;
    logAnalytics('Navigation détectée - enregistrement visite', { path });
    void trackVisit(path);
  }, [location.pathname, location.search]);
}
