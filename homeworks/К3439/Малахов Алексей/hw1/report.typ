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

#show raw.where(block: true): set text(size: 10pt)
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
  #text(size: 18pt)[Домашняя работа №1]
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

Пройти три обучающие игры:
- Flexbox Froggy (https://flexboxfroggy.com/\#ru), все 24 уровня;
- CSS Grid Garden (https://cssgridgarden.com/\#ru), все 28 уровней;
- Learn Git Branching (https://learngitbranching.js.org/?locale=ru_RU): первые 4 урока раздела «Основы» и все уроки по удалённым репозиториям.

= Ход работы

== Flexbox Froggy

Игра учит раскладке элементов во flex-контейнере. В каждом уровне нужно дописать CSS для `#pond`, чтобы лягушки оказались на кувшинках своего цвета. По ходу уровней используются свойства:

- `justify-content`: выравнивание по главной оси (`flex-start`, `flex-end`, `center`, `space-between`, `space-around`);
- `align-items` и `align-self`: выравнивание по поперечной оси, для всех элементов или для одного;
- `flex-direction`: направление главной оси (`row`, `row-reverse`, `column`, `column-reverse`);
- `order`: порядок отдельного элемента;
- `flex-wrap`, сокращение `flex-flow` и `align-content`: перенос на несколько строк и распределение строк.

Пример решения последнего, 24-го уровня:

```css
#pond {
  display: flex;
  flex-flow: column-reverse wrap-reverse;
  justify-content: center;
  align-content: space-between;
}
```

Все 24 уровня пройдены, в списке уровней все отмечены как решённые (@froggy).

#figure(
  image("report-assets/froggy-levels.png", width: 100%),
  caption: [Flexbox Froggy: экран победы и список из 24 пройденных уровней],
) <froggy>

== CSS Grid Garden

Игра посвящена CSS Grid: нужно полить морковь и не задеть сорняки, размещая элемент `#water` (или `#poison`) в сетке 5×5. Пройденные темы:

- `grid-column-start`, `grid-column-end`, `grid-row-start`: номер линии сетки, в том числе отрицательный (отсчёт справа) и ключевое слово `span`;
- сокращения `grid-column`, `grid-row` и `grid-area` (`начало-строки / начало-столбца / конец-строки / конец-столбца`);
- `order` для элементов сетки;
- `grid-template-columns`, `grid-template-rows` и сокращение `grid-template`: проценты, пиксели, `em`, функция `repeat()` и единица `fr`.

Решение последнего, 28-го уровня (дорожка 50 px снизу и 20% сорняков слева):

```css
#garden {
  display: grid;
  grid-template: 1fr 50px / 20% 80%;
}
```

Все 28 уровней пройдены, игра показывает экран победы (@garden).

#figure(
  image("report-assets/garden-levels.png", width: 100%),
  caption: [Grid Garden: экран победы после 28-го уровня],
) <garden>

== Learn Git Branching

Команды вводятся во встроенный терминал игры, а дерево коммитов рисуется справа. Уровень засчитывается, когда дерево совпадает с целевым.

Раздел «Основы», «Введение» (4 урока): `git commit`, создание веток (`git branch`, `git checkout`), слияние `git merge` и перебазирование `git rebase`. Пример решения 4-го урока:

```bash
git branch bugFix
git checkout bugFix
git commit
git checkout main
git commit
git checkout bugFix
git rebase main
```

Вкладка «Удаленные репозитории», 16 уроков в двух разделах:
- «Push & Pull»: `git clone`, удалённые ветки `o/main`, `git fetch`, `git pull`, `git push`, `git pull --rebase` при расходящейся истории, работа с заблокированной веткой `main` через отдельную ветку;
- «Через origin к звёздам»: слияние нескольких веток перед `push`, отслеживание удалённой ветки (`git checkout -b side o/main`), аргументы `git push origin <источник>:<назначение>`, `git fetch` и `git pull` с аргументами, пустой источник (`git push origin :foo` удаляет удалённую ветку, `git fetch origin :bar` создаёт локальную).

Например, в уроке «Аргументы для pull» коммиты забираются сразу в нужные локальные ветки:

```bash
git pull origin C3:foo
git pull origin C2:side
```

Все 4 урока введения (@lgb-main) и все 16 уроков по удалённым репозиториям (@lgb-remote) отмечены как пройденные. Звезда означает, что решение не длиннее эталонного, галочка, что уровень пройден, но за большее число команд.

#figure(
  image("report-assets/lgb-levels-main.png", width: 100%),
  caption: [Learn Git Branching: пройдены 4 урока раздела «Введение»],
) <lgb-main>

#figure(
  image("report-assets/lgb-levels-remote.png", width: 100%),
  caption: [Learn Git Branching: пройдены все уроки по удалённым репозиториям],
) <lgb-remote>

Прохождение выполнялось в браузере Google Chrome под macOS, 26.10.2026.

= Вывод

Пройдены все уровни Flexbox Froggy и CSS Grid Garden, а также первые 4 урока и все 16 уроков по удалённым репозиториям в Learn Git Branching. Закреплены свойства flex-раскладки (выравнивание по осям, направление, перенос, порядок), размещение элементов в CSS Grid по линиям и областям, задание размеров колонок и строк через `fr` и `repeat()`. В git отработаны ветвление, `merge` и `rebase`, работа с удалённым репозиторием: `clone`, `fetch`, `pull`, `push` и их аргументы.
