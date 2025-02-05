export default {
  esbuild: {
    target: 'es2015',
    jsx: 'transform',
    loader: 'jsx',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    target: 'es2015',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: ['@fullcalendar/core', '@fullcalendar/react'],
      output: {
        format: 'es',
        strict: false
      }
    }
  }
}