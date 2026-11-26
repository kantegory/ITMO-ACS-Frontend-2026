import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const fromHere = path => fileURLToPath(new URL(path, import.meta.url));
const alias = {
  '@lab1': fromHere('../lab1'),
  '@lab2': fromHere('../lab2'),
  '@homework': fromHere('../../../../homeworks/К3439/Кутуков Даниил'),
};

export default defineConfig(() => {
  const target = process.env.STOLIK_API_TARGET || 'http://127.0.0.1:3000';
  const proxy = { '/api': { target } };
  return {
    plugins: [vue()],
    resolve: { alias },
    server: { fs: { allow: [fromHere('./'), ...Object.values(alias)] }, proxy },
    preview: { proxy },
  };
});
