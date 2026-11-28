# CarpetShop — фронтенд + мок-API (json-server)

## Запуск

1. Мок-сервер (нужен Node.js):

```bash
npm install
npm start
```

API будет на `http://localhost:3000`.

2. Фронтенд: открыть папку в VS Code и запустить `index.html` через Live Server
   (или любой статический сервер, например `npx serve`).

## Тестовый пользователь

`test@test.ru` / `12345678` (можно зарегистрировать нового).

## Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/carpets` | список ковров (фильтры и сортировка — в query) |
| GET | `/carpets/:id` | один ковёр |
| GET | `/categories` | категории |
| POST | `/auth/register` | регистрация, возвращает `{ token, user }` |
| POST | `/auth/login` | вход, возвращает `{ token, user }` |
| POST | `/auth/logout` | выход (нужен токен) |
| GET | `/auth/me` | текущий пользователь (нужен токен) |
| PATCH | `/auth/me` | изменить имя и телефон (нужен токен) |
| DELETE | `/auth/me` | удалить аккаунт (нужен токен) |

Токен передаётся в заголовке `Authorization: Bearer <token>`.

Параметры `/carpets` (встроенные возможности json-server):
`title_like`, `categoryId`, `shape`, `material_like`, `color_like`,
`price_gte`, `price_lte`, `is_handmade`, `_sort`, `_order`, `_expand=category`.
