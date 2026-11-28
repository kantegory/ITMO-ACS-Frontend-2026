import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: Object.fromEntries(['index', 'recipe', 'login', 'register', 'profile', 'author', 'publish'].map((page) => [page, resolve(import.meta.dirname, `${page}.html`)])),
    },
  },
})
