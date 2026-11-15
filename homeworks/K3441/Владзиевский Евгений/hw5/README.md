# Домашняя работа 5. npm и первый проект на Vue

Студент: Владзиевский Евгений, группа K3441

Приложение в папке `keys-vue-start/`. Вариант тот же, что и во всём курсе, — сервис аренды «Ключи», поэтому данные и вид карточек взяты из ЛР1. В ЛР3 на Vue переедет весь сайт, здесь задача проще: разобраться с npm и с основами компонентного подхода.

## Запуск

```bash
cd keys-vue-start
npm install
npm run dev
```

Откроется `http://localhost:5173`.

## Как выглядит

![Приложение целиком](screenshots/app.jpg)

Поиск по названию и району, одно объявление в избранном:

![Фильтр и избранное](screenshots/filtered.jpg)

Когда под условия ничего не подходит:

![Пустое состояние](screenshots/empty.jpg)

## Команды npm, которые понадобились

| Команда | Что делает |
|---|---|
| `npm create vite@latest keys-vue-start -- --template vue` | создаёт заготовку проекта на Vue |
| `npm install` | ставит зависимости из `package.json` в `node_modules` |
| `npm install vue` | добавляет пакет в `dependencies` |
| `npm install -D vite` | добавляет пакет в `devDependencies` — нужен только при разработке |
| `npm run dev` | запускает Vite с горячей перезагрузкой |
| `npm run build` | собирает продакшен-сборку в `dist/` |
| `npm run preview` | поднимает локальный сервер поверх собранного `dist/` |
| `npm ls` | показывает дерево установленных пакетов |
| `npm outdated` | показывает, какие пакеты обновились |

Что важно было понять про файлы:

- **`package.json`** — список зависимостей и команд. Он коммитится.
- **`package-lock.json`** — точные версии всего дерева зависимостей. Тоже коммитится, иначе у разных людей соберутся разные версии.
- **`node_modules/`** — сами пакеты. В репозиторий не кладётся, он в `.gitignore` и восстанавливается командой `npm install`.
- Разница `dependencies` и `devDependencies`: первое нужно самому приложению (`vue`), второе — только при сборке (`vite`, `@vitejs/plugin-vue`).

Сборка проекта:

```
dist/index.html                  0.41 kB │ gzip:  0.29 kB
dist/assets/index-B9gprR4G.css   3.77 kB │ gzip:  1.27 kB
dist/assets/index-BBzhbBIt.js   76.48 kB │ gzip: 30.15 kB
✓ built in 378ms
```

## Из чего состоит приложение

```
src/
├── main.js                       точка входа
├── App.vue                       состояние и вся логика фильтра
├── style.css                     общие стили и переменные
├── data/listings.js              шесть объявлений из ЛР1
└── components/
    ├── TheHeader.vue             шапка со счётчиком избранного
    ├── FilterPanel.vue           поиск, тип жилья, цена
    ├── ListingList.vue           список или сообщение «ничего нет»
    ├── ListingCard.vue           карточка объявления
    └── StatBadge.vue             маленькая плашка со слотом
```

Данные идут сверху вниз пропсами, события — снизу вверх. Состояние живёт в `App.vue`, дочерние компоненты его не меняют, а сообщают о том, что произошло.

```
App.vue
 ├── TheHeader        ← :favorites-count
 ├── FilterPanel      ↔ v-model:query / :type / :max-price, → @reset
 └── ListingList      ← :listings, :favorites   → @toggle-favorite
      └── ListingCard ← :listing, :is-favorite  → @toggle-favorite
           └── StatBadge (слот)
```

## Что из Vue разобрал

**`ref` — реактивное значение.** Меняем `.value`, шаблон перерисовывается сам:

```js
const query = ref('');
const favorites = ref([]);
```

**`computed` — производное значение.** Пересчитывается, только когда меняется то, от чего он зависит:

```js
const visibleListings = computed(() => allListings.filter((listing) => {
  if (type.value !== 'all' && listing.type !== type.value) return false;
  if (listing.price > maxPrice.value) return false;
  if (!query.value) return true;
  const haystack = `${listing.title} ${listing.district} ${listing.city}`.toLowerCase();
  return haystack.includes(query.value.toLowerCase());
}));
```

**Пропсы — вход компонента.** С типами и значениями по умолчанию:

```js
const props = defineProps({
  listing: { type: Object, required: true },
  isFavorite: { type: Boolean, default: false }
});
```

**События — выход компонента.** Карточка не лезет в чужое состояние, а говорит, что на неё нажали:

```js
const emit = defineEmits(['toggle-favorite']);
// …
@click="emit('toggle-favorite', listing.id)"
```

**`defineModel` — двусторонняя связь.** Родитель пишет `v-model:query="query"`, внутри это обычная изменяемая ссылка. Под капотом те же пропс и `emit('update:query')`, просто без ручной писанины:

```js
const query = defineModel('query', { type: String, default: '' });
```

**`v-for` и `v-if`.** Список и пустое состояние:

```vue
<p v-if="listings.length === 0" class="empty">По этим условиям ничего нет…</p>

<div v-else class="grid">
  <ListingCard v-for="listing in listings" :key="listing.id" :listing="listing" />
</div>
```

`:key` обязателен: по нему Vue понимает, какой элемент списка какому соответствует, и не перерисовывает всё подряд.

**Слоты.** `StatBadge` не знает, что в нём напишут:

```vue
<StatBadge tone="accent">без комиссии</StatBadge>
```

**Хук жизненного цикла и `watch`.** Избранное читается из `localStorage` при появлении компонента и сохраняется при каждом изменении:

```js
onMounted(() => {
  favorites.value = JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
});

watch(favorites, (value) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(value));
}, { deep: true });
```

**`scoped`-стили.** У каждого компонента свой блок `<style scoped>`: класс `.title` в карточке не конфликтует с `.title` где-то ещё. Это то же самое, о чём была лекция про изоляцию стилей, только делает всё сборщик.

## Что оказалось неочевидным

**Модификаторы у `v-model`.** У ползунка цены значение приходит строкой, и сравнение `listing.price > maxPrice` врало бы. Помогает `v-model.number`, а у поля поиска — `v-model.trim`.

**Мутировать массив в `ref` можно, но лучше не надо.** Вместо `push` и `splice` избранное пересобирается заново:

```js
favorites.value = favorites.value.includes(id)
  ? favorites.value.filter((item) => item !== id)
  : [...favorites.value, id];
```

Так `watch` точно сработает, и не нужно думать, какие методы массива Vue отслеживает.

**Картинки.** Лежат в `public/img/`, а не в `src/assets/`: путь в них собирается на лету (`img/${listing.img}.webp`), и сборщик такой путь не распознаёт. Всё, что из `public`, копируется в сборку как есть.
