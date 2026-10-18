import { defineConfig } from 'vite';
export default defineConfig({
  // Shared design-system JSX lives outside this app's TypeScript configuration.
  esbuild: { jsx: 'automatic' },
  server: {
    port: 5173,
    strictPort: true,
    fs: { allow: ['../..'] },
    proxy: { '/api': 'http://127.0.0.1:4100' },
  },
  build: { outDir: 'dist' },
});
