// Simple localStorage utility for authentication
class AuthStorage {
  // Storage keys
  static TOKEN_KEY = 'auth_token';
  static USER_KEY = 'auth_user';
  static STATUS_KEY = 'auth_status';
  static TIMESTAMP_KEY = 'auth_timestamp';

  // Save authentication data
  static saveAuth(token, user) {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      localStorage.setItem(this.STATUS_KEY, 'authenticated');
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
      
      console.log('✅ Auth data saved to localStorage');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User:', user);
    } catch (error) {
      console.error('❌ Failed to save auth data:', error);
    }
  }

  // Get authentication data
  static getAuth() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      const status = localStorage.getItem(this.STATUS_KEY);
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);

      if (!token || !userStr || status !== 'authenticated') {
        return null;
      }

      const user = JSON.parse(userStr);
      
      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (tokenAge > maxAge) {
        console.log('🕐 Token expired, clearing auth data');
        this.clearAuth();
        return null;
      }

      return { token, user, status, timestamp: parseInt(timestamp) };
    } catch (error) {
      console.error('❌ Failed to get auth data:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const auth = this.getAuth();
    return auth !== null;
  }

  // Get token
  static getToken() {
    const auth = this.getAuth();
    return auth ? auth.token : null;
  }

  // Get user
  static getUser() {
    const auth = this.getAuth();
    return auth ? auth.user : null;
  }

  // Clear authentication data
  static clearAuth() {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.STATUS_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      
      console.log('✅ Auth data cleared from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
    }
  }

  // Update user data (keep token, update user info)
  static updateUser(user) {
    try {
      const currentAuth = this.getAuth();
      if (currentAuth) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        console.log('✅ User data updated in localStorage');
      }
    } catch (error) {
      console.error('❌ Failed to update user data:', error);
    }
  }

  // Get storage info for debugging
  static getStorageInfo() {
    return {
      token: localStorage.getItem(this.TOKEN_KEY) ? 'Present' : 'Missing',
      user: localStorage.getItem(this.USER_KEY) ? 'Present' : 'Missing',
      status: localStorage.getItem(this.STATUS_KEY) || 'Not set',
      timestamp: localStorage.getItem(this.TIMESTAMP_KEY) || 'Not set',
      totalSize: this.getTotalSize()
    };
  }

  // Get total size of auth data
  static getTotalSize() {
    try {
      const keys = [this.TOKEN_KEY, this.USER_KEY, this.STATUS_KEY, this.TIMESTAMP_KEY];
      let totalSize = 0;
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      });
      
      return `${totalSize} characters`;
    } catch (error) {
      return 'Unknown';
    }
  }
}

export default AuthStorage;

