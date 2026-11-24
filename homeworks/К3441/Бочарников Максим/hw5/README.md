# ДЗ5 — npm + Vue (Notes app)

Учебный проект по мануалу курса: Vue 3 + Vite, Vue Router, Pinia, Axios, Bootstrap, JSON Server.

## Запуск

Два терминала:

```bash
cd "homeworks/К3441/Бочарников Максим/hw5"
npm install
npm run api
```

```bash
npm start
```

- API: http://127.0.0.1:3000  
- Фронт: http://localhost:8080  

## Что внутри

- `src/api` — axios instance + NotesApi
- `src/stores` — pinia + persist, store заметок
- `src/components/NoteCard.vue` — карточка
- `src/layouts/BaseLayout.vue` — обёртка
- `src/views/NotesPage.vue` — страница со списком и формой
