# ЛР3. «Поварёшка» на Vue.js

Сайт рецептов из ЛР1–ЛР2 (с доработками ДЗ2–ДЗ4), переписанный как одностраничное приложение:
Vue 3, Vue Router, Pinia (+ `pinia-persists`), axios, Bootstrap 5. API — `json-server` с `json-server-auth`.

## Запуск

Нужен Node.js 22.18+ или 24.12+ (требование create-vue и Vite 8).

```bash
npm install
npm run dev        # API на :3000 и приложение на :8080 одной командой
```

Или по отдельности: `npm run api` и `npm start`. Сборка: `npm run build`, проверка кода: `npm run lint`.

Демо-аккаунт: `demo@povaryoshka.ru` / `povar2026`. json-server сохраняет изменения в `db.json`;
вернуть исходные данные — `git checkout db.json`.

## Маршруты

| Путь | Страница |
| --- | --- |
| `/` | поиск рецептов с фильтрами (`?type=Супы`, `?q=блины`) |
| `/recipes/:id` | рецепт: фото, ингредиенты, шаги, видео, лайки, комментарии |
| `/cooks`, `/cooks/:id` | список кулинаров и страница кулинара с подпиской |
| `/profile` | личный кабинет (только после входа) |
| `/login`, `/register` | вход и регистрация (только для гостей) |

## Структура `src`

- `api/` — общий экземпляр axios (токен, ошибки) и классы API: рецепты, пользователи, комментарии, лайки/сохранения/подписки;
- `stores/` — Pinia: хранилище авторизации, сохраняется в `localStorage`;
- `composables/` — повторяющаяся логика: `useRecipeSearch`, `useSaved`, `useFollow`, `useTheme`, `useToast`, `useApiError`;
- `components/` — карточки, фильтры, комментарии, модальные окна, шапка, переключатель темы и т. д.;
- `layouts/BaseLayout.vue` — шапка, `<main>` и подвал;
- `views/` — страницы для маршрутов;
- `router/` — маршруты, ленивая загрузка страниц, navigation guards.
