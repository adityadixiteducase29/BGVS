import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectUser, selectUserType, clearCredentials } from '../store/slices/authSlice';
import AuthStorage from '../utils/storage';
import AppSidebar from './AppSidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const userType = useAppSelector(selectUserType);

  const handleLogout = async () => {
    try {
      // Clear from simple localStorage
      AuthStorage.clearAuth();
      
      // Clear from Redux state
      dispatch(clearCredentials());
      
      console.log('✅ Logout successful - cleared from both localStorage and Redux');
      
      // Redirect will happen automatically via App.jsx routing
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't render if no user (shouldn't happen due to ProtectedRoute)
  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <AppSidebar 
        userType={userType} 
        user={user} 
        onLogout={handleLogout}
      />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;