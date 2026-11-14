import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/**
 * Конфигурация Vite для RecipeHub.
 *
 * Алиас `@` указывает на `src`, чтобы импорты не зависели от глубины файла.
 * Моковый API запускается отдельно (`npm run api`) на порту 3000, поэтому
 * адрес API задаётся через VITE_API_BASE_URL (см. .env.example).
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
