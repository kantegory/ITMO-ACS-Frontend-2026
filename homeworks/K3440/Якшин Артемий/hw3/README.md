# ДЗ3. CSS-переменные и темизация

Сайт «Поварёшка» с двумя темами: светлой и тёмной.

- Все цвета заданы CSS-переменными в `css/themes/light.css` и `css/themes/dark.css`.
- `dark.css` подключён с `media="(prefers-color-scheme: dark)"`, поэтому по умолчанию тема берётся из настроек системы.
- Переключатель в шапке («Светлая / Тёмная / Как в системе») — `js/theme.js`: меняет атрибут `media` у `dark.css`,
  ставит `data-bs-theme` для компонентов Bootstrap и запоминает выбор в `localStorage`.

## Запуск

```bash
npm install
npm start
```

Сайт: <http://localhost:3000>, демо-аккаунт `demo@povaryoshka.ru` / `povar2026`.
