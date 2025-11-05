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
import { LanguageProvider } from './context/LanguageContext';
import './i18n';

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
      <LanguageProvider>
        <LoadingProvider>
          <ThemeProvider theme={theme}>
            <BrowserRouter>
              <AppRoutes />
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                    padding: '12px 16px',
                    maxWidth: '400px',
                    borderRadius: '8px',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                      color: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    style: {
                      background: '#ef4444',
                      color: '#fff',
                    },
                  },
                }}
                containerStyle={{
                  bottom: '20px',
                }}
              />
            </BrowserRouter>
          </ThemeProvider>
        </LoadingProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;

