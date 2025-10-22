import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in on app start
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // Verify token by getting user profile
                    const profileResponse = await apiService.getProfile();
                    if (profileResponse.success) {
                        setUser(profileResponse.data);
                    } else {
                        // Token is invalid, clear it
                        apiService.clearToken();
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                apiService.clearToken();
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await apiService.login(email, password);
            
            if (response.success) {
                setUser(response.data);
                return { success: true, user: response.data };
            } else {
                setError(response.message || 'Login failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await apiService.register(userData);
            
            if (response.success) {
                setUser(response.data);
                return { success: true, user: response.data };
            } else {
                setError(response.message || 'Registration failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiService.logout();
            setUser(null);
            setError(null);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            setUser(null);
            setError(null);
            return { success: true };
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await apiService.updateProfile(profileData);
            
            if (response.success) {
                setUser(prevUser => ({ ...prevUser, ...response.data }));
                return { success: true, user: response.data };
            } else {
                setError(response.message || 'Profile update failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Profile update failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            const response = await apiService.changePassword(currentPassword, newPassword);
            
            if (response.success) {
                return { success: true };
            } else {
                setError(response.message || 'Password change failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Password change failed. Please try again.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (!user) return false;
        
        // Map permissions based on user type
        const permissionMap = {
            admin: [
                'create_company',
                'manage_verifiers', 
                'view_all_applications',
                'assign_applications',
                'view_documents',
                'verify_documents',
                'manage_users',
                'access_reports',
                'view_dashboard',
                'view_clients',
                'view_employees',
                'view_applications',
                'view_help'
            ],
            verifier: [
                'view_assigned_applications',
                'review_applications',
                'approve_applications',
                'reject_applications',
                'view_documents',
                'verify_documents',
                'view_verifier_dashboard',
                'view_verifier_applications',
                'view_pending',
                'view_approved',
                'view_verifier_help'
            ],
            company: [
                'view_company_applications',
                'view_company_stats'
            ]
        };

        return permissionMap[user.user_type]?.includes(permission) || false;
    };

    // Check if user is specific role
    const isRole = (role) => {
        return user?.user_type === role;
    };

    // Get user's display name
    const getUserDisplayName = () => {
        if (!user) return '';
        return user.full_name || `${user.first_name} ${user.last_name}`;
    };

    // Context value
    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        hasPermission,
        isRole,
        getUserDisplayName,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
