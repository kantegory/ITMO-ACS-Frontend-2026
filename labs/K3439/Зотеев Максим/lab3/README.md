# ЛР3. Сервис для аренды недвижимости (SPA на Vue 3)

Миграция сервиса аренды недвижимости (вариант 4) из ЛР1/ЛР2 и ДЗ2–ДЗ4 на одностраничное приложение Vue 3 с Vue Router, Pinia, Axios и composables.

## Запуск

Для работы нужен Node.js 22 (от 22.18) или 24.12 и новее. Из папки `lab3` установите зависимости:

```sh
npm install
```

Запустите моковое API в одном терминале:

```sh
npm run api
```

Запустите SPA во втором терминале:

```sh
npm start
```

Сайт откроется по адресу [http://localhost:8080](http://localhost:8080), API работает на [http://localhost:3000](http://localhost:3000).

## Тестовые аккаунты

- `alexey@example.com` / `password123` (арендатор и владелец)
- `olga@example.com` / `password123` (владелец)
- `dmitry@example.com` / `password123` (владелец)
- `maria@example.com` / `password123` (арендатор)

## Проверка и сборка

- `npm run lint` — проверка кода через ESLint
- `npm run build` — production-сборка в `dist/`
- `npm run preview` — предпросмотр собранного приложения при работающем API
