import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist/**']),
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { files: ['src/**/*.{js,vue}'], languageOptions: { globals: globals.browser } },
])
