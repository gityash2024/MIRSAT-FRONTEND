import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const login = useCallback(async (email, password) => {
    try {
      await dispatch(loginAction({ email, password })).unwrap();
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };
};