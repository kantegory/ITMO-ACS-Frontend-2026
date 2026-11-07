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
  #text(size: 18pt)[Домашняя работа №2]
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

Улучшить доступность ранее реализованного сайта: добавить необходимые HTML-атрибуты ко всему контенту на странице и проверить результат инструментами Dev Tools браузера Firefox и сервисом Google Lighthouse.

= Ход работы

Изменения внесены в сайт рецептов из ЛР2 (папка `labs/К3439/Малахов Алексей/lab2/public/`), отдельной копии сайта для домашней работы нет.

== Исходное состояние

Lighthouse (раздел Accessibility) до изменений давал 93–96 баллов из 100. На всех страницах не хватало контраста: белый текст на кнопках основного цвета `#c8553d` (4,35:1 при норме 4,5:1), ссылки этого цвета на светлом фоне (4,19:1) и белые инициалы в аватарах на оранжевом фоне (2,02:1). На странице поиска после заголовка `h1` сразу шли заголовки карточек `h3` (@before).

#figure(
  image("report-assets/lighthouse-before-search.png", width: 85%),
  caption: [Lighthouse до изменений, страница поиска: 93 балла],
) <before>

== Что сделано

*Контраст.* Основной цвет затемнён до `#b3452f` (5,51:1 на белом), аватары переделаны на тёмный текст на светлом фоне (6,3:1), а у кнопок-переключателей своя цветовая схема вместо серой `btn-outline-secondary` из Bootstrap.

*Структура и навигация.*
- В начало каждой страницы добавлена ссылка «Перейти к содержимому», видимая только при фокусе с клавиатуры (@skip). Она ведёт на `<main id="main" tabindex="-1">`.
- У меню `aria-label="Основное меню"`, у блока типов блюд `<nav aria-label="Типы блюд">`, у формы фильтров `role="search"` и `aria-label`.
- Исправлен порядок заголовков: на странице поиска и во вкладках личного кабинета добавлены заголовки `h2` с классом `visually-hidden`.
- Для заметного фокуса добавлен стиль `:focus-visible` (обводка 3 px), а для пользователей с настройкой «уменьшить движение» отключена анимация карточек (`prefers-reduced-motion`).

*Состояния и динамика.*
- Кнопки «Нравится», «Сохранить» и «Подписаться» сообщают состояние через `aria-pressed`, у лайка `aria-label` с названием рецепта и числом отметок.
- Счётчик результатов поиска, список комментариев и статистика профиля объявляются скринридером (`aria-live="polite"`, `role="status"`).
- Декоративные иконки и аватары с инициалами скрыты атрибутом `aria-hidden="true"`, у видео есть `aria-label` с названием рецепта.

*Формы.* У каждого поля текст ошибки связан с полем через `aria-describedby`. При отправке функция `validateForm` выставляет `aria-invalid` и переводит фокус на первое неверное поле, а сообщение сервера получает фокус и `role="alert"` (@form).

```js
form.querySelectorAll('input, select, textarea').forEach((field) => {
  field.setAttribute('aria-invalid', String(!field.checkValidity()))
})
const valid = form.checkValidity()
if (!valid) form.querySelector(':invalid').focus()
```

#grid(
  columns: (1fr, 1fr),
  gutter: 0.5cm,
  [#figure(image("report-assets/skip-link.png", width: 100%), caption: [Ссылка «Перейти к содержимому» после нажатия Tab]) <skip>],
  [#figure(image("report-assets/form-errors.png", width: 100%), caption: [Ошибки формы: фокус на первом неверном поле]) <form>],
)

== Проверка в Lighthouse

После изменений все 7 страниц получили 100 баллов: главная, поиск, рецепт, страница кулинара, вход, регистрация и личный кабинет (его проверял уже вошедший пользователь). Lighthouse 12.8.2 запускался из командной строки в Google Chrome под macOS в светлой теме. Результаты по всем страницам на @after.

#figure(
  grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 0.3cm,
    [#image("report-assets/lighthouse-after-index.png", width: 100%) #text(size: 9pt)[Главная]],
    [#image("report-assets/lighthouse-after-search.png", width: 100%) #text(size: 9pt)[Поиск]],
    [#image("report-assets/lighthouse-after-recipe.png", width: 100%) #text(size: 9pt)[Рецепт]],
    [#image("report-assets/lighthouse-after-author.png", width: 100%) #text(size: 9pt)[Кулинар]],
    [#image("report-assets/lighthouse-after-login.png", width: 100%) #text(size: 9pt)[Вход]],
    [#image("report-assets/lighthouse-after-register.png", width: 100%) #text(size: 9pt)[Регистрация]],
    [#image("report-assets/lighthouse-after-profile.png", width: 100%) #text(size: 9pt)[Личный кабинет]],
  ),
  caption: [Lighthouse после изменений, все 7 страниц],
) <after>

== Проверка в Firefox

В Firefox на вкладке «Доступность» инструментов разработчика запускалась проверка «Все проблемы». На главной странице проблем не найдено (@ff-index).

#figure(
  image("report-assets/firefox-index.jpg", width: 100%),
  caption: [Firefox, главная страница: проблем не найдено],
) <ff-index>

На странице рецепта остались замечания, связанные с видео (@ff-recipe). Сам элемент `video` распознаётся как группа с подписью «Видео: Тыквенный суп-карри» (её задаёт добавленный `aria-label`), но Firefox помечает его предупреждением keyboard: элемент получает фокус, а роль у него не интерактивная. Остальные замечания (слайдеры Position и Volume без текстовой подписи и безымянные служебные элементы) относятся к стандартным элементам управления, которые браузер рисует для `<video controls>`. Эти замечания не исправлены: для этого нужно отказаться от стандартного плеера и сделать свои кнопки управления.

#figure(
  image("report-assets/firefox-recipe.jpg", width: 100%),
  caption: [Firefox, страница рецепта: замечания к видео],
) <ff-recipe>

= Вывод

Доступность сайта рецептов улучшена: исправлен контраст цветов, добавлены ориентиры и подписи (`aria-label`, `nav`, `role="search"`), состояния кнопок (`aria-pressed`), живые области (`aria-live`), связь полей с ошибками (`aria-describedby`, `aria-invalid`), ссылка для пропуска меню и видимый фокус. Lighthouse даёт 100 баллов на всех страницах вместо 93–96, проверка Firefox на главной ошибок не находит, а на странице рецепта остаются замечания к видео со стандартными элементами управления.
