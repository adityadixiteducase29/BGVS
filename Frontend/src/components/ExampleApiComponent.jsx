import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setError, clearError } from '../store/slices/authSlice';
import apiService from '../services/api';

// Example component showing how to make API calls directly
const ExampleApiComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  // Example: Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      dispatch(clearError());
      
      // Make API call directly in component
      const response = await apiService.getDashboardData();
      
      if (response.success) {
        setData(response.data);
        console.log('Dashboard data fetched:', response.data);
      } else {
        // Handle API error
        dispatch(setError(response.message));
        console.error('Failed to fetch dashboard:', response.message);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      dispatch(setError('Failed to fetch dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  // Example: Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      dispatch(clearError());
      
      // Make API call directly in component
      const response = await apiService.updateProfile(profileData);
      
      if (response.success) {
        // Update local state or Redux if needed
        console.log('Profile updated:', response.data);
        // You could dispatch an action to update Redux state here
      } else {
        dispatch(setError(response.message));
        console.error('Profile update failed:', response.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      dispatch(setError('Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  // Example: Get user stats (admin only)
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      dispatch(clearError());
      
      // Make API call directly in component
      const response = await apiService.getUserStats();
      
      if (response.success) {
        setData(response.data);
        console.log('User stats fetched:', response.data);
      } else {
        dispatch(setError(response.message));
        console.error('Failed to fetch user stats:', response.message);
      }
    } catch (error) {
      console.error('User stats fetch error:', error);
      dispatch(setError('Failed to fetch user stats'));
    } finally {
      setLoading(false);
    }
  };

  // Example: Conditional API call based on user role
  const fetchRoleSpecificData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      dispatch(clearError());
      
      let response;
      
      // Make different API calls based on user role
      switch (user.user_type) {
        case 'admin':
          response = await apiService.getUserStats();
          break;
        case 'verifier':
          response = await apiService.getVerifierApplications();
          break;
        case 'company':
          response = await apiService.getCompanyStats();
          break;
        default:
          throw new Error('Unknown user role');
      }
      
      if (response.success) {
        setData(response.data);
        console.log('Role-specific data fetched:', response.data);
      } else {
        dispatch(setError(response.message));
      }
    } catch (error) {
      console.error('Role-specific data fetch error:', error);
      dispatch(setError('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="example-api-component">
      <h3>Example API Component</h3>
      
      {/* Show current user */}
      {user && (
        <div className="user-info">
          <p>Logged in as: {user.full_name} ({user.user_type})</p>
        </div>
      )}
      
      {/* API Call Buttons */}
      <div className="api-buttons">
        <button 
          onClick={fetchDashboardData} 
          disabled={loading}
          className="btn btn-primary me-2"
        >
          {loading ? 'Loading...' : 'Fetch Dashboard'}
        </button>
        
        <button 
          onClick={fetchUserStats} 
          disabled={loading || user?.user_type !== 'admin'}
          className="btn btn-secondary me-2"
        >
          {loading ? 'Loading...' : 'Fetch User Stats (Admin Only)'}
        </button>
        
        <button 
          onClick={fetchRoleSpecificData} 
          disabled={loading}
          className="btn btn-info me-2"
        >
          {loading ? 'Loading...' : 'Fetch Role-Specific Data'}
        </button>
      </div>
      
      {/* Display fetched data */}
      {data && (
        <div className="data-display">
          <h4>Fetched Data:</h4>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
};

export default ExampleApiComponent;
