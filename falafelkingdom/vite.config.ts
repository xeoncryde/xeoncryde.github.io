import { defineConfig } from 'vite'
export default defineConfig({
  base: '/falafelkingdom/',
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
})
