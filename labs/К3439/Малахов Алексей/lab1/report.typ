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
  #text(size: 18pt)[Лабораторная работа №1]
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

Сверстать сайт средствами HTML, CSS и Bootstrap по выбранному варианту и реализовать на JS места, где без него не обойтись (например, модальные окна). Выбран вариант 5: сервис для обмена рецептами и кулинарных блогов. Обязательные страницы: вход, регистрация, личный кабинет, поиск с фильтрацией. По варианту дополнительно нужны страница рецепта с фото, пошаговой инструкцией и видео и социальные функции: комментарии, лайки, подписки на кулинаров.

= Ход работы

== Структура проекта

Сайт называется «Вкусная лента». Это набор статических страниц, общие стили лежат в `css/style.css`, скрипты в папке `js/`.

#set text(size: 12pt)
#table(
  columns: (auto, 1fr),
  align: (left, left),
  table.header([*Файл*], [*Назначение*]),
  [`index.html`], [Главная: поиск, категории, популярные рецепты, кулинары],
  [`search.html`], [Поиск с фильтрами по типу блюда, сложности, ингредиентам, времени],
  [`recipe.html`], [Страница рецепта: фото, ингредиенты, шаги, видео, комментарии],
  [`profile.html`], [Личный кабинет: публикации, сохранённые рецепты, подписки],
  [`author.html`], [Страница кулинара с кнопкой подписки],
  [`login.html`, `register.html`], [Формы входа и регистрации],
  [`js/data.js`], [Демонстрационные данные: рецепты, авторы, комментарии],
  [`js/app.js`], [Общие функции: карточка рецепта, иконки, лайки и сохранение],
)
#set text(size: 14pt)

Данные о рецептах вынесены в отдельный файл `js/data.js`, а карточки строятся одной функцией `recipeCard()`. Так разметка карточки не дублируется на главной, в поиске, в профиле и на странице автора. В ЛР2 этот файл заменится запросами к API, а функции отрисовки останутся.

== Вёрстка и адаптивность

Каркас страниц собран на сетке Bootstrap 5.3: контейнер, ряды `row` и колонки `col-12 col-sm-6 col-lg-4`. На телефоне карточки идут в одну колонку, на планшете в две, на компьютере в три. Шапка сделана компонентом `navbar`, на узком экране меню сворачивается в кнопку-бургер. Фильтры на странице поиска на мобильном спрятаны в `collapse` и открываются кнопкой «Фильтры».

Цвета вынесены в CSS-переменные в `:root`, а кнопки Bootstrap перекрашены через их собственные переменные (`--bs-btn-bg` и другие). Иконки нарисованы как inline SVG и хранятся в объекте `ICONS`.

#figure(
  image("report-assets/01-index.png", width: 100%),
  caption: [Главная страница],
) <index>

На главной (@index) есть строка поиска, которая отправляет запрос на `search.html?q=...`, кнопки категорий и блок кулинаров.

== Поиск с фильтрацией

Все фильтры находятся в одной форме. На любое изменение формы срабатывает событие `input`, значения собираются через `FormData`, и список рецептов фильтруется заново:

```js
const found = RECIPES.filter((recipe) => {
  if (query && !recipe.title.toLowerCase().includes(query)) return false
  if (type && recipe.type !== type) return false
  if (difficulties.length && !difficulties.includes(recipe.difficulty))
    return false
  if (ingredients.some((item) => !recipe.tags.includes(item))) return false
  if (maxTime && recipe.time > maxTime) return false
  return true
})
```

По ингредиентам показываются рецепты, где есть все отмеченные продукты. Есть сортировка (популярные, быстрые, по алфавиту) и кнопка сброса. Если ничего не нашлось, выводится сообщение.

#figure(
  image("report-assets/02-search-filters.png", height: 12cm),
  caption: [Поиск: завтраки, сложность «Легко», ингредиенты «Яйца» и «Мука»],
) <search>

== Страница рецепта и социальные функции

Страница рецепта (@recipe) берёт `id` из адреса через `URLSearchParams`. На ней есть фото, ингредиенты с галочками, пронумерованные шаги (номера рисуются CSS-счётчиком), видео в теге `video`, блок автора с кнопкой подписки, лайк, сохранение и комментарии. Если рецепта с таким `id` нет, показывается «Рецепт не найден».

Лайки, сохранённые рецепты и подписки хранятся в `localStorage` как массивы `id`. Переключение сделано одной функцией:

```js
function toggleStored(key, id) {
  const list = getStored(key)
  const index = list.indexOf(id)
  if (index === -1) {
    list.push(id)
  } else {
    list.splice(index, 1)
  }
  localStorage.setItem(key, JSON.stringify(list))
  return index === -1
}
```

Кнопки лайка и сохранения обрабатываются делегированием: один обработчик `click` на `document` ловит нажатия по `.btn-like` и `.btn-save` на всех страницах, в том числе по карточкам, созданным позже.

#figure(
  image("report-assets/04-recipe.png", height: 13.5cm),
  caption: [Страница рецепта после лайка, подписки и нового комментария],
) <recipe>

== Личный кабинет и модальные окна

В личном кабинете три вкладки Bootstrap (`nav-tabs`): мои публикации, сохранённые рецепты и подписки. Через модальные окна можно отредактировать профиль и добавить новый рецепт (@validation). Формы проверяются встроенной HTML-валидацией (`required`, `minlength`, `min`/`max`), а стили ошибок даёт класс `was-validated` Bootstrap. Встроенная проверка считает строку из пробелов заполненной, поэтому перед ней текстовые поля проверяются ещё и после `trim()`:

```js
const TEXT_FIELDS = 'input[type=text], input[type=password], textarea'

function checkBlank(field) {
  if (field.dataset.noTrim !== undefined) return
  const value = field.type === 'password' ? field.value : field.value.trim()
  const blank = field.required && !field.value.trim()
  field.setCustomValidity(blank || value.length < field.minLength ? 'empty' : '')
}

function validateForm(form) {
  form.querySelectorAll(TEXT_FIELDS).forEach(checkBlank)
  form.classList.add('was-validated')
  return form.checkValidity()
}
```

Эта функция используется во всех формах сайта: вход, регистрация, комментарий, профиль, новый рецепт.

Новый рецепт попадает в «Мои публикации» (@profile) и открывается на странице рецепта. Пока сервера нет, он сохраняется в `localStorage`.

#figure(
  image("report-assets/06-new-recipe-validation.png", width: 90%),
  caption: [Модальное окно нового рецепта: незаполненные поля подсвечены],
) <validation>

#figure(
  image("report-assets/07-profile-published.png", width: 90%),
  caption: [Личный кабинет с опубликованным рецептом],
) <profile>

На странице кулинара (@author) видны его рецепты и кнопка подписки. После подписки счётчик увеличивается, а автор появляется во вкладке «Подписки» личного кабинета.

#figure(
  image("report-assets/08-author.png", width: 90%),
  caption: [Страница кулинара после подписки],
) <author>

== Вход и регистрация

Формы входа и регистрации проверяют email, длину пароля, совпадение паролей (через `setCustomValidity`) и согласие с правилами (@register). При корректном заполнении выполняется переход в личный кабинет. Настоящей авторизации в ЛР1 нет, потому что нет сервера: она будет сделана в ЛР2 через JSON Server.

#figure(
  image("report-assets/09-register-validation.png", width: 80%),
  caption: [Регистрация: неверный email и несовпадающие пароли],
) <register>

== Мобильная версия

#grid(
  columns: (1fr, 1fr),
  gutter: 0.6cm,
  [#figure(image("report-assets/11-mobile-menu.png", height: 9.5cm), caption: [Открытое меню на ширине 390 px]) <mobile-menu>],
  [#figure(image("report-assets/12-mobile-filters.png", height: 9.5cm), caption: [Фильтры на ширине 390 px]) <mobile-filters>],
)

На ширине 390 px меню сворачивается (@mobile-menu), фильтры открываются по кнопке (@mobile-filters), горизонтальной прокрутки нет.

== Проверка

Сайт запускался через `python3 -m http.server`, проверка шла в Google Chrome под macOS (через Playwright). Пройденные сценарии: поиск с главной, комбинации фильтров, пустой результат, сброс и сортировка, лайк, сохранение, подписка, комментарий с валидацией, несуществующий рецепт, создание рецепта и редактирование профиля в модальных окнах, валидация входа и регистрации, мобильное меню и фильтры. Ошибок JavaScript в консоли не было.

= Вывод

Сверстан сайт сервиса рецептов из семи страниц на Bootstrap 5 с адаптивной сеткой. Все обязательные страницы (вход, регистрация, личный кабинет, поиск с фильтрами) и страницы по варианту (рецепт с фото, шагами и видео, страница кулинара) реализованы. На JS сделаны фильтрация, модальные окна с валидацией форм, лайки, сохранение, подписки и комментарии. Состояние хранится в `localStorage`, а данные вынесены в отдельный файл, чтобы в следующей работе подключить их к API.
