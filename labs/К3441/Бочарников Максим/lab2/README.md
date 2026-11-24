# VICE BITES — Лабораторная работа 2

Сайт обмена рецептами с **моковым API** (JSON Server) и **авторизацией** (`json-server-auth`).

Вариант курса: *«Сервис для обмена рецептами и кулинарных блогов»*. Развитие ЛР1.

## Стек

- HTML / CSS / Bootstrap 5 (из ЛР1)
- Vanilla JS + `fetch`
- `json-server` + `json-server-auth`

## Структура

```
lab2/
  index.html, login.html, register.html, profile.html, recipe.html
  css/styles.css
  js/api.js      — запросы к API
  js/auth.js     — сессия (localStorage)
  js/main.js     — UI-логика
  db.json        — данные API
  package.json
  README.md
```

## Запуск

### 1. API (порт 3000)

```bash
cd "labs/К3441/Бочарников Максим/lab2"
npm install
npm start
```

API будет на `http://127.0.0.1:3000`.

### 2. Фронт

Открой HTML через Live Server / VS Code Live Server  
или:

```bash
npx --yes live-server --port=5500
```

Важно: страницы открывай через `http://127.0.0.1:5500` (или localhost), не как `file://`.

## Демо-аккаунт

| Поле | Значение |
|------|----------|
| Email | `max@vice.bites` |
| Пароль | `password123` |

Можно зарегистрировать нового пользователя на `register.html`.

## Что сделано

- Рецепты, авторы, комментарии, лайки, сохранённые, подписки — в `db.json`
- Вход / регистрация через `POST /login` и `POST /register`
- Токен и пользователь в `localStorage`
- Защищённые действия (`/600/...`): лайки, комментарии, подписки
- Каталог и страница рецепта грузятся с API
- Личный кабинет требует авторизации

## API (кратко)

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/login` | вход |
| POST | `/register` | регистрация |
| GET | `/recipes` | каталог |
| GET | `/recipes/:id` | рецепт |
| GET | `/comments?recipeId=` | комментарии |
| POST | `/600/comments` | новый комментарий (Bearer) |
| POST/DELETE | `/600/likes` | лайки (Bearer) |
| GET/POST/DELETE | `/following`, `/600/following` | подписки |
