# ЛР3 — VICE BITES на Vue SPA

Миграция сайта обмена рецептами на Vue 3.

## Стек

- Vue 3 + Vite + Vue Router + Pinia + Axios + Bootstrap 5
- JSON Server + json-server-auth

## Запуск

Два терминала:

```bash
cd "labs/К3441/Бочарников Максим/lab3"
npm install
npm run api
```

```bash
npm start
```

- API: http://127.0.0.1:3000  
- Фронт: http://127.0.0.1:8080  

Демо: `max@vice.bites` / `password123`

## Структура

- `src/api` — axios instance и модули API
- `src/stores/auth.js` — сессия
- `src/composables` — useAuth, useTheme, useRecipes, useLikes, useIcons
- `src/components` — Header, RecipeCard, LikeButton, FilterPanel…
- `src/views` — Catalog, Recipe, Profile, Login, Register
- `src/router` — роуты + guards
