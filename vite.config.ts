import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This ensures process.env.API_KEY is available in the browser code
    EnvironmentPlugin(['API_KEY'])
  ],
  server: {
    host: '0.0.0.0',
    port: 8080
  }
});