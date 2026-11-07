#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 3cm, right: 1.5cm),
)

#set text(
  font: "Times New Roman",
  size: 14pt,
  lang: "ru",
)

#set par(justify: true)

#show heading: it => {
  set text(size: 14pt)
  it
  v(0.5cm)
}

#show raw.where(block: true): set text(size: 9pt)
#show raw.where(block: true): it => block(breakable: false, it)
#show figure.caption: set text(size: 12pt)

#align(center)[
  #text(weight: "bold")[
    САНКТ-ПЕТЕРБУРГСКИЙ НАЦИОНАЛЬНЫЙ\
    ИССЛЕДОВАТЕЛЬСКИЙ УНИВЕРСИТЕТ ИТМО
  ]
]

#v(4cm)

#align(center)[
  #text(size: 18pt)[*Дисциплина:* Фронт-энд разработка]
  #v(0.5cm)
  #text(size: 18pt)[Отчет]
  #v(0.5cm)
  #text(size: 18pt)[Домашняя работа №3]
]

#v(3cm)

#align(right)[
  Выполнил:
  #v(0.3cm)
  Малахов Алексей
  #v(0.3cm)
  К3439
  #v(0.8cm)
  Проверил:\
  Добряков Д. И.
]

#v(1fr)

#align(center)[
  Санкт-Петербург

  2026 г.
]

#pagebreak()

= Задача

Выполнить темизацию ранее реализованного сайта: добавить дополнительную тему. Выбран вариант «светлая и тёмная тема с ориентиром на пользовательские настройки». Дополнительно сделан переключатель на JS.

= Ход работы

Темы добавлены в сайт рецептов из ЛР2 (папка `labs/К3439/Малахов Алексей/lab2/public/`).

== CSS-переменные

Все цвета, которые раньше были записаны прямо в правилах (фон, текст, градиент баннера, бейджи, аватары, тени), вынесены в переменные в `:root` файла `css/style.css`. Правила используют только переменные:

```css
.hero {
  background: linear-gradient(
    135deg,
    var(--color-hero-from) 0%,
    var(--color-hero-to) 100%
  );
}

.badge-type {
  background-color: var(--color-badge-bg);
  color: var(--color-badge-text);
}
```

Кнопки Bootstrap перекрашены через его собственные переменные (`--bs-btn-bg`, `--bs-btn-color` и другие), поэтому они тоже меняют цвет вместе с темой.

== Тёмная тема по настройкам системы

Тёмная тема переопределяет те же переменные. Как в примере из лекции, она включается медиазапросом `prefers-color-scheme`, то есть следует настройке операционной системы без всякого JS:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-bg: #1b1714;
    --color-surface: #26211d;
    --color-text: #f3ede7;
    --color-primary: #f08a70;
    /* остальные переменные */
  }
}

:root[data-theme='dark'] {
  /* те же значения для ручного выбора */
}
```

Цвета тёмной темы подобраны с проверкой контраста: основной цвет на тёмном фоне 6,5:1, приглушённый текст 7,3:1, основной текст 13,7:1.

== Переключатель

В шапке есть кнопка с иконкой солнца или луны. Скрипт `js/theme.js` подключён в `<head>`, чтобы тема применялась до отрисовки страницы и не было вспышки светлого фона:

```js
function currentTheme() {
  return savedTheme() || (darkQuery.matches ? 'dark' : 'light')
}
```

Пока пользователь ничего не выбрал, тема следует системе (в том числе при её смене на лету через событие `change`). Выбор кнопкой сохраняется в `localStorage` и ставит атрибут `data-theme` на `<html>`, который перекрывает медиазапрос. Атрибут `data-bs-theme` переключает и компоненты Bootstrap: модальные окна, поля форм, вкладки. У кнопки есть `aria-pressed` и подсказка.

#grid(
  columns: (1fr, 1fr),
  gutter: 0.5cm,
  [#figure(image("report-assets/light-index.png", width: 100%), caption: [Светлая тема]) <light>],
  [#figure(image("report-assets/dark-index.png", width: 100%), caption: [Тёмная тема по настройке системы]) <dark>],
)

#figure(
  image("report-assets/dark-recipe.png", width: 85%),
  caption: [Страница рецепта в тёмной теме],
) <dark-recipe>

#grid(
  columns: (1.4fr, 1fr),
  gutter: 0.5cm,
  [#figure(image("report-assets/dark-login-errors.png", width: 100%), caption: [Форма с ошибками в тёмной теме]) <dark-form>],
  [#figure(image("report-assets/dark-mobile-menu.png", height: 8cm), caption: [Мобильная версия]) <dark-mobile>],
)

== Проверка

В Google Chrome (через Playwright) проверено: при светлой настройке системы открывается светлая тема (@light), при тёмной тёмная, без нажатий (@dark, @dark-recipe); кнопка переключает тему, выбор сохраняется после перезагрузки; при тёмной системе можно выбрать светлую тему. Тёмная тема проверена на формах (@dark-form) и на ширине 390 px (@dark-mobile). Lighthouse (раздел Accessibility) в тёмной теме (выбрана кнопкой, значение `theme` в `localStorage` равно `dark`) даёт 100 баллов на главной, в поиске, на странице рецепта и на входе (@lh). Сначала он нашёл недостаточный контраст серых кнопок «Сохранить», после чего у них появилась своя цветовая схема.

#figure(
  grid(
    columns: (1fr, 1fr),
    gutter: 0.3cm,
    [#image("report-assets/lighthouse-dark-index.png", width: 100%) #text(size: 9pt)[Главная]],
    [#image("report-assets/lighthouse-dark-search.png", width: 100%) #text(size: 9pt)[Поиск]],
    [#image("report-assets/lighthouse-dark-recipe.png", width: 100%) #text(size: 9pt)[Рецепт]],
    [#image("report-assets/lighthouse-dark-login.png", width: 100%) #text(size: 9pt)[Вход]],
  ),
  caption: [Lighthouse в тёмной теме],
) <lh>

= Вывод

Сайт поддерживает светлую и тёмную темы. Цвета вынесены в CSS-переменные, тёмная тема по умолчанию следует системной настройке `prefers-color-scheme`, а кнопка в шапке позволяет выбрать тему вручную и запоминает выбор. Контраст обеих тем проверен в Lighthouse.
