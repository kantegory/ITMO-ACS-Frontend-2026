# ДЗ5 — npm и основы Vue

Катков Алексей Сергеевич, K3339, ИСУ 367275.

Приложение кулинарных заметок по мануалу курса. Vue 3, Vue Router, Pinia, Axios, Bootstrap и JSON Server.

## Запуск

Нужен Node.js 24.13 или новее.

```sh
npm ci
npm start
```

Сайт: http://127.0.0.1:8080. API: http://127.0.0.1:3005/notes.

`npm run build` создаёт production-сборку в `dist`. `npm run dev` и `npm run api` запускают части приложения отдельно. Для другого адреса API можно задать `VITE_API_URL`.

## Структура

- `src/api` — общий экземпляр Axios и класс NotesApi.
- `src/stores/notes.js` — загрузка, создание и удаление заметок через Pinia.
- `src/components/NoteForm.vue` — форма с v-model и проверкой ввода.
- `src/components/NoteCard.vue` — карточка с props и событием удаления.
- `src/layouts/BaseLayout.vue` — общий макет со slot.
- `src/views/NotesPage.vue` — v-for, v-if, computed, methods и mounted.

Заметки сохраняются JSON Server в `db.json` и остаются после перезапуска. Фиксированный `userId: 1` соответствует примеру из мануала; авторизация в этой домашней работе не предусмотрена.

Проверены создание, очистка формы, сохранение после перезагрузки страницы и удаление заметки. Сборка проходит, `npm audit` — 0 уязвимостей. Скриншот компонентов находится в `screenshots/notes.jpg`.
