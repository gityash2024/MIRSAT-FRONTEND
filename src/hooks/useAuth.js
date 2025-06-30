import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction, restoreUser } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const login = useCallback(async (email, password) => {
    try {
      let result = await dispatch(loginAction({ email, password })).unwrap();
      console.log(result,'result')
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
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