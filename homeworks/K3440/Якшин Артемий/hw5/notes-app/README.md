# ДЗ5. Заметки на Vue.js

Учебное приложение по мануалу курса: Vue 3 + Vue Router + Pinia (с `pinia-persists`) + axios + Bootstrap,
API заметок — `json-server`.

## Запуск

Нужен Node.js 22.18+ или 24.12+ (требование create-vue и Vite 8).

```bash
npm install      # установить зависимости из package.json
npm run api      # API заметок на http://localhost:3000 (json-server, db.json)
npm start        # приложение на http://localhost:8080
```

Другие команды: `npm run build` — сборка в `dist/`, `npm run lint` — проверка кода (oxlint + ESLint).

## Структура

```
src/
├── api/          instance.js (общий axios), notes.js (класс NotesApi), index.js
├── stores/       index.js (Pinia + pinia-persists), notes.js (хранилище заметок)
├── layouts/      BaseLayout.vue — обёртка-контейнер со слотом
├── components/   NoteCard.vue — карточка заметки (props name, text; событие delete)
├── views/        NotesPage.vue — страница с формой и списком заметок
├── router/       index.js — маршрут «/» с ленивой загрузкой страницы
├── App.vue       только <router-view />
└── main.js       подключение Pinia, роутера и Bootstrap
```
