import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './theme/dark.css'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { cssVariables } from './config/theme.js'
import { AuthProvider } from './context/AuthContext'
import { ThemeModeProvider } from './context/ThemeContext'
import { applyDocumentTheme, readStoredThemeMode } from './theme/themeMode'
import { installConsoleGuard } from './utils/consoleGuard'

// Silence the console and deter casual inspection in production builds.
// No-op in development, so local debugging is unaffected.
installConsoleGuard();

// Apply CSS variables to root element to ensure consistency
const applyThemeVariables = () => {
  Object.entries(cssVariables).forEach(([variable, value]) => {
    document.documentElement.style.setProperty(variable, value);
  });
};


// Initialize theme
applyThemeVariables();

// Apply the saved light/dark choice before the first render so a dark
// session never flashes white.
applyDocumentTheme(readStoredThemeMode());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ThemeModeProvider>
          <App />
        </ThemeModeProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
)
