import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    // Shared design-system JSX lives outside this app's TypeScript configuration.
    esbuild: { jsx: 'automatic' },
    // Only the restricted browser key is exposed; server-side provider credentials never enter the bundle.
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
        process.env.VITE_GOOGLE_MAPS_API_KEY ?? environment.VITE_GOOGLE_MAPS_API_KEY ?? '',
      ),
      'import.meta.env.VITE_GOOGLE_MAP_ID': JSON.stringify(
        process.env.VITE_GOOGLE_MAP_ID ?? environment.VITE_GOOGLE_MAP_ID ?? '',
      ),
    },
    server: {
      port: 5173,
      strictPort: true,
      fs: { allow: ['../..'] },
      proxy: { '/api': 'http://127.0.0.1:4100' },
    },
    build: { outDir: 'dist' },
  };
});
