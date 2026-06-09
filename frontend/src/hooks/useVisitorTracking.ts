import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit } from '../utils/nexus-api';

export function useVisitorTracking() {
  const location = useLocation();

  useEffect(() => {
    trackVisit(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
