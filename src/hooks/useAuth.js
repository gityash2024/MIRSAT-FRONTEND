import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction, restoreUser } from '../store/slices/authSlice';
import FrontendLogger from '../services/frontendLogger.service';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const login = useCallback(async (email, password) => {
    try {
      let result = await dispatch(loginAction({ email, password })).unwrap();
      console.log(result,'result')
      
      // Log successful login
      await FrontendLogger.logLogin(email, true);
      
      navigate('/dashboard');
    } catch (error) {
      // Log failed login
      await FrontendLogger.logLogin(email, false);
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    // Log logout before clearing session
    await FrontendLogger.logLogout();
    
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  const updateUser = useCallback((updatedUserData) => {
    // Update user data in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    // Restore user from localStorage to update the Redux state
    dispatch(restoreUser());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser
  };
};