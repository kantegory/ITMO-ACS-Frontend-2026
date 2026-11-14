# RecipeHub — фронтенд сервиса обмена рецептами

Учебный проект по дисциплине «Фронтенд-разработка» (ИТМО).
Вариант №5: сервис для обмена рецептами и кулинарных блогов.

## Текущий этап — ЛР3: SPA на Vue 3

Приложение из ЛР1–ЛР2 и домашних работ перенесено на **Vue 3**:

- подключён **Vue Router** с историей, `meta` и navigation guards;
- работа с API переведена на **Axios** (единый клиент, interceptors,
  автоматическая подстановка JWT);
- состояние хранится в **Pinia** (`auth` и `catalog`);
- повторяющаяся логика вынесена в **composables** (`useTheme`,
  `useLiveRegion`, `useRecipeSearch`, `useBootstrapModal`);
- интерфейс разделён на **views** и **components**;
- сохранены все функции ЛР2: вход, регистрация, личный кабинет,
  публикации, сохранённые рецепты, подписки, поиск с фильтрами,
  страница рецепта, лайки, закладки и комментарии;
- сохранены ДР2–ДР4: доступность, светлая/тёмная темы и SVG-спрайт.

Моковый API и модель данных не изменились: это тот же `json-server`
с JWT-авторизацией. Статические страницы `pages/*.html` заменены
SPA-маршрутами; для старых адресов добавлены редиректы.

## Стек

- **Vue 3.5** (`<script setup>`), **Vue Router 4**, **Pinia 3**;
- **Axios 1.x** для запросов к API;
- **Vite 8** — dev-сервер и сборка;
- **Bootstrap 5.3.8** (npm) — сетка, компоненты, color modes;
- **json-server 0.17.4** — моковый REST API;
- **json-server-auth 2.1.0** — JWT, bcrypt и guards;
- Node.js 20.19+ (проверено на Node 24.12);
- JavaScript без TypeScript.

## Запуск

Нужны два процесса: API и dev-сервер Vite.

```bash
npm install

# терминал 1 — моковый API на http://localhost:3000
npm run api

# терминал 2 — фронтенд на http://localhost:5173
npm run dev
```

Открыть **http://localhost:5173/**.

`server/index.js` теперь отвечает только за API. CORS у `json-server`
включён по умолчанию, поэтому dev-сервер Vite может обращаться к
`http://localhost:3000` напрямую. Если `db.json` отсутствует (он в
`.gitignore`), сервер при старте создаст его из `db.seed.json`.

Адрес API можно переопределить через `.env`:

```bash
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:3000
```

### Сборка и предпросмотр

```bash
npm run build      # production-сборка в dist/
npm run preview    # просмотр собранной версии (обычно :4173)
```

Для history-роутинга сервер предпросмотра Vite отдаёт `index.html` на
все SPA-маршруты. При размещении на обычном статическом хостинге нужен
аналогичный rewrite на `index.html` (иначе прямой заход на `/profile`
вернёт 404).

### Полезные команды

```bash
npm run api        # API на http://localhost:3000
npm run dev        # Vite dev-сервер
npm run build      # production-сборка
npm run preview    # просмотр dist/
npm run reset-db   # восстановить db.json из db.seed.json (при остановленном API)
npm run smoke      # проверить API (нужен запущенный сервер)
```

## Демо-аккаунты

| E-mail | Пароль | Имя |
|---|---|---|
| `demo@recipehub.ru` | `demo1234` | Демо Пользователь |
| `anna@recipehub.ru` | `anna1234` | Анна Петрова |
| `igor@recipehub.ru` | `igor1234` | Игорь Смирнов |
| `maria@recipehub.ru` | `maria1234` | Мария Кузнецова |

В `db.json` пароли хранятся в виде bcrypt-хэшей, поэтому исходные
значения зафиксированы только в этой таблице.

## Маршруты

| Путь | View | Доступ |
|---|---|---|
| `/` | `HomeView` | всем |
| `/search` | `SearchView` | всем |
| `/recipe/:id` | `RecipeView` | всем |
| `/login` | `LoginView` | только гостям (`guestOnly`) |
| `/register` | `RegisterView` | только гостям (`guestOnly`) |
| `/profile` | `ProfileView` | только авторизованным (`requiresAuth`) |
| `/:pathMatch(.*)*` | `NotFoundView` | всем |

Guards находятся в `src/router/index.js`:

- `requiresAuth` — при отсутствии сессии редирект на `/login` с
  `?redirect=<исходный путь>`;
- `guestOnly` — уже вошедшего пользователя отправляет в `/profile`;
- после перехода обновляется `document.title` и фокус переносится на
  `<main id="main-content">` (улучшение доступности).

Старые адреса MPA-версии (`/pages/login.html` и т. п.) перенаправляются
на новые маршруты.

## Структура проекта

```text
recipe-hub-frontend/
├── index.html                      # точка входа Vite + inline-скрипт темы
├── vite.config.mjs                 # plugin-vue, alias @ → src
├── .env.example                    # пример VITE_API_BASE_URL
├── public/
│   └── assets/img/                 # sprite.svg, favicon.svg, заглушка
├── src/
│   ├── main.js                     # createApp, Pinia, Router, Bootstrap, CSS
│   ├── App.vue                     # skip-link, шапка, RouterView, подвал, live-region
│   ├── api/
│   │   ├── client.js               # axios, interceptors, ApiError, isApiOnline
│   │   ├── token.js                # JWT: get/save/clear/decode
│   │   └── resources.js            # users, recipes, comments, likes, bookmarks, subscriptions, auth
│   ├── stores/
│   │   ├── auth.js                 # сессия, login/register/logout/restore
│   │   └── catalog.js              # пользователи, лайки, закладки, подписки, комментарии
│   ├── composables/
│   │   ├── useTheme.js             # ДР3
│   │   ├── useLiveRegion.js        # announce() для ДР2
│   │   ├── useRecipeSearch.js      # debounce + AbortController
│   │   └── useBootstrapModal.js    # управление модалками Bootstrap
│   ├── router/
│   │   └── index.js                # маршруты, meta, guards, title, focus
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── ApiStatusBanner.vue
│   │   ├── BaseIcon.vue            # ДР4
│   │   ├── ThemeSwitcher.vue       # ДР3
│   │   ├── RecipeCard.vue
│   │   ├── RecipeGrid.vue
│   │   ├── AuthorCard.vue
│   │   ├── recipe/
│   │   │   ├── RecipeActions.vue
│   │   │   ├── CommentsSection.vue
│   │   │   └── ShareModal.vue
│   │   └── profile/
│   │       ├── NewRecipeModal.vue
│   │       └── EditProfileModal.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   ├── SearchView.vue
│   │   ├── RecipeView.vue
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ProfileView.vue
│   │   └── NotFoundView.vue
│   ├── utils/
│   │   ├── assets.js               # пути к public/assets
│   │   ├── format.js               # дата и длительность
│   │   └── validation.js           # проверка e-mail
│   ├── constants.js                # типы блюд и сложность
│   └── assets/css/
│       ├── variables.css           # токены светлой и тёмной темы
│       └── style.css               # минимальные кастомные стили
├── server/
│   └── index.js                    # json-server + auth + guards (только API)
├── scripts/
│   ├── reset-db.js
│   └── smoke.js
├── db.json                         # рабочая база (в .gitignore)
├── db.seed.json                    # эталон для сброса
├── package.json
└── README.md
```

## Архитектура клиента

### Слой API

`src/api/client.js` — единственное место с axios:

- `baseURL` из `VITE_API_BASE_URL` (по умолчанию `http://localhost:3000`);
- request interceptor добавляет `Authorization: Bearer <token>`;
- response interceptor нормализует ошибки в `ApiError` (`message`,
  `status`, `details`) и обновляет флаг `isApiOnline`;
- отменённые запросы (`AbortController`) не считаются ошибками;
- `buildParams()` собирает query-строку, включая повторяющиеся
  параметры (`id=1&id=2`) для выборки сохранённых рецептов.

`src/api/resources.js` повторяет контракт ЛР2: `users`, `recipes`,
`comments`, `likes`, `bookmarks`, `subscriptions`, `auth`.

### Состояние (Pinia)

- **`stores/auth.js`** — `user`, `ready`, `isAuthenticated`;
  `ensureRestored()` один раз восстанавливает сессию по JWT;
  `login`/`register` сохраняют токен и сразу загружают коллекции
  пользователя; `logout` очищает токен и социальное состояние.
- **`stores/catalog.js`** — справочник пользователей, лайки, закладки,
  подписки и комментарии. Селекторы `userById`, `userName`, `isLiked`,
  `isBookmarked`, `isSubscribed`, `commentsFor`; действия
  `toggleLike`, `toggleBookmark`, `toggleSubscription`,
  `loadComments`, `addComment`.

Благодаря реактивности Vue карточки, счётчики лайков, бейдж
«Сохранён» и списки в кабинете обновляются без ручной перерисовки DOM.

### Composable-функции

- **`useTheme`** — режимы `system` / `light` / `dark`, `matchMedia`,
  сохранение в `localStorage`, синхронизация между вкладками,
  озвучивание смены темы.
- **`useLiveRegion`** — единый `announce()` и `role="status"` в `App.vue`.
- **`useRecipeSearch`** — фильтры, debounce 300 мс, отмена устаревших
  запросов, сортировка, сброс, текст счётчика.
- **`useBootstrapModal`** — `show`/`hide` для модалок Bootstrap,
  обработка закрытия во время анимации открытия и очистка backdrop
  при размонтировании.

### Компоненты и views

- `AppHeader` / `AppFooter` / `App.vue` — единый каркас вместо
  копирования шапки и подвала на каждой странице.
- `RecipeCard` + `RecipeGrid` — карточка и сетка с состояниями
  загрузки, пустого результата и ошибки.
- `AuthorCard` — карточка кулинара с подпиской; используется на
  главной, в кабинете и на странице рецепта.
- `RecipeActions`, `CommentsSection`, `ShareModal` — социальные
  функции рецепта.
- `NewRecipeModal`, `EditProfileModal` — модальные формы кабинета.
- Views отвечают за загрузку данных и композицию компонентов.

### Пример потока данных

1. Router guard вызывает `auth.ensureRestored()`.
2. При наличии JWT выполняется `GET /users/:id`, затем
   `GET /likes?userId=`, `/bookmarks?userId=`, `/subscriptions?userId=`.
3. `RecipeCard` читает `catalog.isLiked()` / `isBookmarked()` и
   показывает актуальный счётчик.
4. Клик по лайку вызывает `catalog.toggleLike()`: запрос к API,
   обновление массива в store, реактивная перерисовка всех карточек.


## Соответствие требованиям ЛР3

| Требование | Где реализовано |
|---|---|
| Подключён роутер | `src/router/index.js`; `createRouter` + `createWebHistory`; `App.vue` использует `RouterView` |
| Маршрутизация: guards и meta | `meta.requiresAuth`, `meta.guestOnly`, `beforeEach`, редирект с `?redirect=` |
| Работа с внешним API | `src/api/client.js`, `src/api/resources.js`; все запросы через Axios |
| Разумное деление на компоненты | `src/views` (7 экранов) и `src/components` (общие, recipe/, profile/) |
| Composable для повторяющегося функционала | `useTheme`, `useLiveRegion`, `useRecipeSearch`, `useBootstrapModal` |
| Управление состоянием | Pinia: `stores/auth.js`, `stores/catalog.js` |

## Функциональность

- **Вход и регистрация** — JWT, «Запомнить меня», валидация, ошибки
  API, `aria-invalid`, `aria-busy`, фокус на первой ошибке.
- **Личный кабинет** — публикации, сохранённые рецепты, подписки;
  создание рецепта и редактирование профиля в модалках.
- **Поиск** — фильтры по типу блюда, сложности, ингредиенту и времени,
  сортировка, счётчик результатов, debounce и отмена запросов.
- **Страница рецепта** — фото, метаданные, ингредиенты, пошаговые
  инструкции, видео, автор, лайк, закладка, «Поделиться», комментарии.
- **Социальные функции** — лайки, закладки, подписки, комментарии;
  все изменения сохраняются на сервере.
- **Темы** — светлая, тёмная и «как в системе».
- **Доступность** — skip-link, ARIA, live-region, фокус, семантика.
- **SVG-спрайт** — все иконки через `BaseIcon` и `<use>`.

## API

Базовый URL: `http://localhost:3000`.

| Метод | Путь | Назначение | Доступ |
|---|---|---|---|
| POST | `/register` | Регистрация | публичный |
| POST | `/login` | Вход, возвращает `accessToken` | публичный |
| GET | `/users` | Список кулинаров | публичный |
| GET | `/users/:id` | Профиль пользователя | публичный |
| PATCH | `/users/:id` | Редактирование профиля | владелец |
| GET | `/recipes` | Список рецептов + фильтры | публичный |
| GET | `/recipes/:id` | Один рецепт | публичный |
| POST | `/recipes` | Создание рецепта | владелец |
| GET | `/comments?recipeId=` | Комментарии рецепта | публичный |
| POST | `/comments` | Добавить комментарий | владелец |
| GET | `/likes?userId=` | Лайки пользователя | публичный |
| POST / DELETE | `/likes`, `/likes/:id` | Поставить / снять лайк | владелец |
| GET | `/bookmarks?userId=` | Закладки пользователя | публичный |
| POST / DELETE | `/bookmarks`, `/bookmarks/:id` | Сохранить / убрать | владелец |
| GET | `/subscriptions?userId=` | Подписки пользователя | публичный |
| POST / DELETE | `/subscriptions`, `/subscriptions/:id` | Подписаться / отписаться | владелец |

### Фильтры и сортировка

`json-server` поддерживает query-параметры, которые использует
`useRecipeSearch`:

```text
GET /recipes?q=тыква
GET /recipes?dishType=Супы&difficulty=Средняя
GET /recipes?timeMinutes_lte=30
GET /recipes?ingredients_like=авокадо
GET /recipes?_sort=likes&_order=desc&_limit=6
GET /recipes?id=1&id=2
```

### Авторизация и права

```bash
# Вход
curl -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@recipehub.ru","password":"demo1234"}'
# → {"accessToken":"..."}

# Запрос с токеном
curl http://localhost:3000/users/1 \
  -H 'Authorization: Bearer <accessToken>'
```

JWT живёт 1 час. При истечении токена клиент очищает его и работает
как гость; защищённые действия требуют повторного входа.

В `server/index.js` для всех коллекций задан режим **`644`**:
владелец может читать и писать, остальные — только читать. Владелец
определяется по полю `userId` (для `users` — по `id`), поэтому
`POST /recipes` с чужим `userId` и `PATCH /users/:id` чужого профиля
возвращают `403`. Поле `password` вырезается из всех ответов.

## Модель данных

| Коллекция | Основные поля |
|---|---|
| `users` | `id`, `email`, `password` (bcrypt), `name`, `bio`, `subscribers` |
| `recipes` | `id`, `userId`, `title`, `dishType`, `difficulty`, `timeMinutes`, `servings`, `description`, `ingredients[]`, `steps[]`, `image`, `likes`, `videoUrl`, `createdAt` |
| `comments` | `id`, `recipeId`, `userId`, `text`, `createdAt` |
| `likes` | `id`, `userId`, `recipeId` |
| `bookmarks` | `id`, `userId`, `recipeId` |
| `subscriptions` | `id`, `userId`, `authorId` |


## Доступность (ДР2)

После миграции на Vue сохранены и усилены:

- skip-link «Перейти к основному содержимому» и `tabindex="-1"` у
  `<main id="main-content">` на каждом экране;
- лендмарки: `<nav aria-label>` в шапке и подвале, `<aside
  aria-label="Об авторе">`, поименованные секции и регион результатов;
- после смены маршрута фокус переносится на `<main>` (кроме первой
  загрузки), а `document.title` обновляется;
- формы: `label`, `aria-describedby`, `aria-invalid`, `aria-busy`,
  фокус на первом невалидном поле;
- динамические сообщения (лайк, закладка, комментарий, публикация,
  профиль, копирование ссылки, смена темы) озвучиваются через единый
  live-region (`useLiveRegion`);
- модалки Bootstrap сохраняют focus trap, `Esc` и возврат фокуса;
  `useBootstrapModal` дополнительно корректно закрывает окно во время
  анимации открытия;
- у карточек одна ссылка с понятным именем (`stretched-link`),
  декоративные изображения имеют `alt=""`, иконки — `aria-hidden`;
- сохранён порядок заголовков `h1 → h2 → h3` на всех экранах;
- контраст по WCAG AA не менялся: токены `--rh-*` и пары цветов
  описаны в `src/assets/css/variables.css`.

В ДР2 доступность проверялась через Firefox Accessibility Inspector
и Lighthouse. После миграции разметка и ARIA сохранены; при защите
ЛР3 рекомендуется повторно прогнать Lighthouse на маршрутах `/`,
`/search`, `/recipe/:id`, `/login`, `/register`, `/profile`.

Дополнительно после миграции выполнена проверка **axe-core 4.14**
(теги WCAG 2.0/2.1 A и AA) на production-сборке: главная (светлая и
тёмная тема), поиск, рецепт, вход, регистрация, 404 и все вкладки
личного кабинета. Нарушений **0**. В ходе проверки был исправлен
контраст бейджа «Сохранён» (`.rh-badge-saved`).

## Темизация (ДР3)

Темы переключаются атрибутом `data-bs-theme` на `<html>`:

| Тема | Значение | Когда применяется |
|---|---|---|
| Светлая | `light` | выбрана вручную или системная светлая |
| Тёмная | `dark` | выбрана вручную или системная тёмная |

По умолчанию используется режим **«Как в системе»**: тема следует за
`prefers-color-scheme` и меняется на лету. Ручной выбор сохраняется в
`localStorage` под ключом `recipehub-theme`.

Что сделано:

- `src/assets/css/variables.css` — два набора токенов `--rh-*` и
  проброс в `--bs-*`;
- `src/assets/css/style.css` — кастомные стили только на токенах;
- `src/composables/useTheme.js` — `setThemePreference`, `matchMedia`,
  синхронизация между вкладками, озвучивание;
- `src/components/ThemeSwitcher.vue` — доступное меню с
  `aria-pressed` и иконками `sun` / `moon` / `monitor` / `check`;
- в `index.html` — inline-скрипт, который применяет сохранённую или
  системную тему до загрузки CSS и предотвращает вспышку светлого
  экрана (FOUC).

Контраст (WCAG 2.1 AA, все пары ≥ 4.5):

| Пара | Светлая | Тёмная |
|---|---|---|
| основной текст / поверхность | 15.43 | 13.01 |
| приглушённый текст / фон | 5.87 | 8.49 |
| ссылка / фон | 6.11 | 8.36 |
| текст primary-кнопки | 4.91 | 6.42 |
| текст outline-кнопки | 5.87 | 10.32 |
| `rh-badge` | 14.63 | 14.85 |

Проверка:

1. Открыть сайт, нажать «Тема оформления» → «Тёмная»: страница должна
   перекраситься без перезагрузки, выбор сохраниться после F5.
2. Выбрать «Как в системе» и переключить тему ОС: страница должна
   последовать за системой.
3. Проверить `localStorage.getItem('recipehub-theme')` в DevTools.
4. Клавиатура: меню темы открывается Enter/Space, пункты доступны
   стрелками, `aria-pressed` отражает выбор.

## SVG-спрайт (ДР4)

Все иконки лежат в `public/assets/img/sprite.svg`, а компонент
`BaseIcon.vue` собирает путь от `BASE_URL`:

```vue
<BaseIcon name="clock" class="me-1" />
```

Правила:

- декоративная иконка всегда `aria-hidden="true"`, смысл передаётся
  текстом или доступным именем кнопки;
- размер задаёт `.rh-icon` (1em), цвет наследуется через
  `currentColor`;
- новые иконки добавляются как `<symbol id="icon-…" viewBox="0 0 24 24">`
  и используются только через `<use>`;
- в спрайте 17 символов, все используются.

## Проверка

### Сборка

```bash
npm run build
```

Сборка Vite проходит без ошибок; результат — `dist/`.

### API

```bash
npm run api
npm run smoke
```

`npm run smoke` проверяет чтение, вход, скрытие пароля, `401` без
токена, `403` на чужой ресурс, создание/удаление своего рецепта и
фильтры — **9 из 9** проверок.

### Сценарии в браузере

Миграция проверена в headless Chrome (Puppeteer) на dev-сервере:

- главная: лента и кулинары загружаются из API;
- тема: переключение на тёмную и запись в `localStorage`;
- router guard: гость с `/profile` попадает на `/login?redirect=…`;
- вход демо-аккаунтом и открытие кабинета;
- поиск с `?query=суп` и фильтром по типу блюда;
- страница рецепта: лайк (счётчик +1), закладка, комментарий,
  подписка, модалка «Поделиться»;
- кабинет: сохранённые рецепты, подписки, создание рецепта,
  редактирование профиля;
- выход и регистрация нового пользователя;
- консоль браузера без ошибок.

Все перечисленные сценарии прошли. Тестовые изменения в `db.json`
после проверки откатываются (`npm run reset-db` или резервная копия).

## Отличия от ЛР2

- MPA (`pages/*.html`) заменено на SPA с Vue Router.
- `fetch` заменён на Axios с interceptors.
- `store.js` заменён на Pinia-хранилища `auth` и `catalog`.
- Страничные модули `auth.js`, `recipes.js`, `recipe.js`, `profile.js`,
  `social.js` заменены на views и компоненты.
- `theme.js` и `main.js`-хелперы заменены на composables.
- Шапка и подвал больше не дублируются в HTML — они в `App.vue`.
- Ручной `innerHTML` и `escapeHtml` больше не нужны: Vue экранирует
  данные сам.
- Иконки подключаются через `BaseIcon`, пути к картинкам — через
  `assetUrl` (работает на вложенных маршрутах).
- `json-server` больше не раздаёт фронтенд: API и Vite запускаются
  отдельно.
- Bootstrap подключается из npm, локальная папка `assets/vendor`
  удалена.

## Ограничения

- JWT живёт 1 час и не обновляется; при `401` требуется повторный вход.
- `json-server` — учебный мок, а не production-бэкенд.
- Для работы приложения нужны два процесса: `npm run api` и
  `npm run dev` (или собранный `dist/` + API).
- History-роутинг требует fallback на `index.html`; Vite dev/preview
  это делают, обычный статический хостинг — нет.
- `db.json` изменяется при работе и не хранится в git; для возврата
  к исходным данным используйте `npm run reset-db`.
- Пароли демо-аккаунтов известны и предназначены только для проверки.
- Переключатель темы требует JavaScript; без JS остаётся светлая тема
  по умолчанию.
- Фотографии рецептов и SVG-заглушка не перекрашиваются темой: это
  контент, а не элемент интерфейса.

