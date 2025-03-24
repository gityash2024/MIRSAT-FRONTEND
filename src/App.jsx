// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import { ThemeProvider } from '@mui/material/styles';
import theme from './config/theme';
import AppRoutes from './routes';
import { restoreUser } from './store/slices/authSlice';
import './App.css';
import { LoadingProvider } from './context/LoadingContext';

function App() {
  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(restoreUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <LoadingProvider>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: 'green',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: 'red',
                  },
                },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </LoadingProvider>
    </Provider>
  );
}

export default App;

