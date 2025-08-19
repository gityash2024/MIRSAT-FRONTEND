import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch user profile if token exists but no user
      if (!user) {
        fetchUserProfile();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/v1/users/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      // If token is invalid, logout
      if (error.response && error.response.status === 401) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;
      
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    // Clear any other user-related data from localStorage if needed
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/register', userData);
      const { token: authToken, user: newUser } = response.data;
      
      setToken(authToken);
      setUser(newUser);
      localStorage.setItem('token', authToken);
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset request
  const forgotPassword = async (email) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send password reset email. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password with token
  const resetPassword = async (token, password) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await axios.post('/api/v1/auth/reset-password', { token, password });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (updates) => {
    try {
      // Update user state while preserving all existing user data
      setUser(prev => {
        if (!prev) return prev;
        
        // Filter out timezone updates to prevent corruption
        const { timezone, ...safeUpdates } = updates;
        const updatedUser = { ...prev, ...safeUpdates };
        
        return updatedUser;
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        fetchUserProfile,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 