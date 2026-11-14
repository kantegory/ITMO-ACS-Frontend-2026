/**
 * server/index.js — моковый API RecipeHub.
 *
 * Стек:
 *  - json-server 0.17 — REST поверх db.json;
 *  - json-server-auth — JWT-авторизация и проверка прав.
 *
 * Начиная с ЛР3 фронтенд собирается Vite и запускается отдельно
 * (`npm run dev`), поэтому этот сервер отвечает только за API.
 * CORS у json-server включён по умолчанию.
 *
 * Права задаются в нотации json-server-auth (как у Unix):
 *   первая цифра — права владельца ресурса,
 *   вторая      — авторизованных пользователей,
 *   третья      — гостей.
 * 4 — чтение, 2 — запись. Сумма: 6 — чтение и запись.
 *
 * Для всех коллекций выбран режим 644:
 *   владелец может писать, читать могут все.
 * Владелец определяется по полю userId (для коллекции users — по id).
 */

const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');
const auth = require('json-server-auth');

const ROOT = path.join(__dirname, '..');
const DB_FILE = path.join(ROOT, 'db.json');
const SEED_FILE = path.join(ROOT, 'db.seed.json');
const PORT = Number(process.env.PORT) || 3000;

// На свежем клоне db.json отсутствует (он в .gitignore), поэтому
// создаём рабочую базу из эталонного seed-файла.
if (!fs.existsSync(DB_FILE)) {
  fs.copyFileSync(SEED_FILE, DB_FILE);
  console.log(`Создана база данных из ${SEED_FILE}`);
}

/** Рекурсивно убирает поле password из ответов API. */
function stripPasswords(value) {
  if (Array.isArray(value)) {
    return value.map(stripPasswords);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== 'password')
        .map(([key, item]) => [key, stripPasswords(item)]),
    );
  }
  return value;
}

const app = jsonServer.create();
const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults({
  // Раздаём только public/ (иконки и заглушки), чтобы не отдавать
  // исходники фронтенда с API-сервера.
  static: path.join(ROOT, 'public'),
  logger: true,
});

// json-server-auth проверяет владение ресурсом по полю userId,
// поэтому ему нужен доступ к базе.
app.db = router.db;

// Не отдаём наружу bcrypt-хэши паролей.
router.render = (req, res) => {
  res.jsonp(stripPasswords(res.locals.data));
};

app.use(middlewares);

// Правила доступа к коллекциям (см. комментарий в начале файла).
app.use(
  auth.rewriter({
    users: 644,
    recipes: 644,
    comments: 644,
    likes: 644,
    bookmarks: 644,
    subscriptions: 644,
  }),
);

app.use(auth);
app.use(router);

app.listen(PORT, () => {
  console.log(`RecipeHub API запущен: http://localhost:${PORT}`);
  console.log(`База данных: ${DB_FILE}`);
});
