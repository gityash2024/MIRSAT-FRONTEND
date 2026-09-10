import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Strip console output from production bundles.
  //
  // The app ships ~400 console.* calls, several of which dump the signed-in
  // user's email, role and full permission array to anyone who opens devtools.
  // console.error is kept so genuine failures remain diagnosable.
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log', 'console.info', 'console.debug', 'console.trace'],
  },
  build: {
    // Never emit source maps for production: they would republish the entire
    // readable source, including internal route and permission logic.
    sourcemap: false,
    assetsDir: 'static',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'fullcalendar': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true
  }
})
