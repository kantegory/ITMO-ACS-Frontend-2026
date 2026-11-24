# ДЗ2 — доступность (a11y)

Улучшение доступности сайта VICE BITES (на базе ЛР2).

## Запуск

```bash
cd "homeworks/К3441/Бочарников Максим/hw2"
npm install
npm start
```

API: `http://127.0.0.1:3000`  
Фронт: Live Server на эту папку.

Демо: `max@vice.bites` / `password123`

## Что улучшено

- skip-link «Перейти к содержимому»
- видимый `:focus-visible`, `prefers-reduced-motion`
- контраст текста в футере и `.text-muted`
- `aria-label` / `aria-pressed` / `aria-live` / `aria-required`
- осмысленные `alt` у картинок
- формы: `label`, `autocomplete`, `role="alert"`
- видео-заглушка доступна с клавиатуры (Enter/Space)

## Проверка

1. Firefox → DevTools → Accessibility  
2. Chrome → Lighthouse → Accessibility  
