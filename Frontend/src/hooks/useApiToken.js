import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/slices/authSlice';
import apiService from '../services/api';

// Hook to sync API service token with Redux state
export const useApiToken = () => {
  const token = useAppSelector(selectToken);

  useEffect(() => {
    // Update API service token whenever Redux token changes
    if (token) {
      apiService.setToken(token);
    } else {
      apiService.clearToken();
    }
  }, [token]);

  return token;
};
