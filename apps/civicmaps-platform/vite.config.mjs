import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
    fs: { allow: ['../..'] },
    proxy: { '/api': 'http://127.0.0.1:4100' },
  },
  build: { outDir: 'dist' },
});
