import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Клиент и API живут на разных портах, поэтому запросы на /api Vite
// проксирует на json-server. В коде остаются относительные адреса,
// CORS не нужен, а сам json-server раздаёт /api/* через routes.json.
const proxy = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
};

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy }
});
