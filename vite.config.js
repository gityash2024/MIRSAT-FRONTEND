export default {
  build: {
    target: 'es2015',
    rollupOptions: {
      external: [
        '@fullcalendar/core',
        '@fullcalendar/react'
      ],
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: false
  },
  optimizeDeps: {
    include: ['@fullcalendar/core', '@fullcalendar/react']
  }
}