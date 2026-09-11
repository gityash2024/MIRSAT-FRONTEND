// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { StyleSheetManager } from 'styled-components';
import store from './store/store';
import { ThemeProvider } from '@mui/material/styles';
import theme, { darkTheme } from './config/theme';
import AppRoutes from './routes';
import { restoreUser } from './store/slices/authSlice';
import './App.css';
import { LoadingProvider } from './context/LoadingContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { useThemeMode } from './context/ThemeContext';
import { stylisDarkPlugin } from './theme/stylisDarkPlugin';
import './i18n';

// Stable references so StyleSheetManager only regenerates CSS on a real toggle.
const DARK_STYLIS_PLUGINS = [stylisDarkPlugin];
const LIGHT_STYLIS_PLUGINS = [];

function App() {
  const { isDark } = useThemeMode();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(restoreUser());
    }
  }, []);

  return (
    <StyleSheetManager stylisPlugins={isDark ? DARK_STYLIS_PLUGINS : LIGHT_STYLIS_PLUGINS}>
    <Provider store={store}>
      <LanguageProvider>
        <LoadingProvider>
          <ThemeProvider theme={isDark ? darkTheme : theme}>
            <NotificationProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster
                position="bottom-right"
                limit={2}
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
                  right: '20px',
                }}
                />
              </BrowserRouter>
            </NotificationProvider>
          </ThemeProvider>
        </LoadingProvider>
      </LanguageProvider>
    </Provider>
    </StyleSheetManager>
  );
}

export default App;
