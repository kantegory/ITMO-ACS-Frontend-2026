# TableBook — лабораторная работа №3 (миграция на Vue.js)

Миграция приложения бронирования столиков (ЛР1, ЛР2) на Vue 3 + Vite.

## Стек

- Vue 3 (`<script setup>`)
- Vue Router 4 (`src/router`)
- Axios (`src/api`)
- Composables (`src/composables`): `useAuth`, `useAsync`, `useRestaurantDisplay`

## Структура

- `src/views` — страницы, на которые ведёт роутер (главная, вход, регистрация, профиль, страница ресторана)
- `src/components` — переиспользуемые компоненты (навбар, карточка ресторана, фильтры, модалка бронирования, звёздный рейтинг, пункт истории бронирований)
- `src/api` — axios-клиент и обёртки над REST-эндпоинтами мокового API
- `src/composables` — общая логика, не привязанная к конкретному компоненту

## Запуск

```bash
npm install
npm run server   # json-server-auth на http://localhost:3001
npm run dev       # Vite dev server на http://localhost:5173
```
