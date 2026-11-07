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
  #text(size: 18pt)[Домашняя работа №4]
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

Вынести все используемые ранее SVG-иконки в общий SVG-спрайт. Если иконок не было, добавить 3–5 иконок и поместить их в спрайт.

= Ход работы

Изменения внесены в сайт рецептов из ЛР2 (папка `labs/К3439/Малахов Алексей/lab2/public/`).

== Как было

В ЛР1 иконки хранились в JS-объекте `ICONS` в виде строк с SVG-разметкой:

```js
const ICONS = {
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7 ..."/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  ...
}
```

Функция `icon()` оборачивала строку в `<svg class="icon" viewBox="0 0 24 24">` и вставляла на страницу полную копию иконки.
Так одна и та же разметка сердечка повторялась в каждой карточке рецепта.

== Спрайт

Все 10 иконок сайта перенесены в файл `assets/img/sprite.svg`. Каждая иконка оформлена как `<symbol>` со своим `id` и `viewBox` (@symbols):

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <symbol id="icon-heart" viewBox="0 0 24 24">
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7 ..."/>
  </symbol>
  <symbol id="icon-bookmark" viewBox="0 0 24 24">
    <path d="M6 3h12v18l-6-4.5L6 21z"/>
  </symbol>
  ...
</svg>
```

В спрайте: логотип (поварской колпак), сердце, закладка, часы, порции, поиск, пользователь, плюс, луна и солнце для переключателя темы. Неиспользуемая иконка комментария из старого набора удалена.

#figure(
  image("report-assets/sprite-symbols.png", width: 85%),
  caption: [Все символы спрайта],
) <symbols>

== Подключение

Теперь `icon()` вставляет только ссылку на символ через `<use>`:

```js
const SPRITE_URL = 'assets/img/sprite.svg'

function icon(name) {
  return (
    '<svg class="icon" aria-hidden="true" focusable="false">' +
    `<use href="${SPRITE_URL}#icon-${name}"></use></svg>`
  )
}
```

Внешний вид задаёт класс `.icon` в CSS: `fill: none`, `stroke: currentColor`. Свойства наследуются внутрь `<use>`, поэтому иконка берёт цвет текста кнопки и автоматически меняет его вместе с темой из ДЗ3. Файл спрайта браузер загружает один раз и берёт из кэша для всех иконок на странице.

#figure(
  image("report-assets/icons-index.png", width: 100%),
  caption: [Иконки из спрайта на главной: логотип, тема, поиск, время, порции, лайк, закладка],
) <index>

#figure(
  image("report-assets/icons-recipe.png", width: 100%),
  caption: [Иконки из спрайта на странице рецепта],
) <recipe>

== Проверка

В Google Chrome проверено, что на главной, в поиске, на странице рецепта и на входе все элементы `<use>` отрисовываются (размер больше нуля), а SVG без `<use>` на страницах не осталось. Иконка сайта во вкладке браузера (`favicon.svg`) и заглушка для рецепта без фото (`placeholder.svg`) остались отдельными файлами: браузер подключает favicon по отдельной ссылке, а заглушка выводится как картинка `<img>`, поэтому их нельзя взять из спрайта.

= Вывод

Все иконки сайта собраны в один SVG-спрайт из 10 символов и подключаются через `<use href="sprite.svg#id">`. Разметка страниц стала короче, иконки хранятся в одном месте, а их цвет управляется из CSS через `currentColor`.
