import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useRoutePersistence = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Save current route to localStorage
  useEffect(() => {
    if (location.pathname !== '/login' && location.pathname !== '/') {
      localStorage.setItem('lastRoute', location.pathname);
    }
  }, [location.pathname]);

  // Restore route from localStorage
  const restoreRoute = () => {
    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute && lastRoute !== location.pathname) {
      navigate(lastRoute, { replace: true });
    }
  };

  return { restoreRoute };
};
