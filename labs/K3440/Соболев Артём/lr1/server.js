const jsonServer = require("json-server");
const auth = require("json-server-auth");
const path = require("node:path");

// Создаёт JSON Server и подключает базу данных.
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
server.db = router.db;

// Разрешает браузеру отправлять API-запросы с токеном.
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});
server.use(jsonServer.bodyParser);

// Доступ к переиспользуемым HTML-фрагментам шапки и подвала.
server.get("/partials/:filename", (req, res, next) => {
  const allowed = new Set(["site-header.html", "site-header-minimal.html", "site-footer.html"]);
  if (!allowed.has(req.params.filename)) return next();
  return res.sendFile(path.join(__dirname, "partials", req.params.filename));
});
// Раздаёт страницы и локальные ресурсы сайта.
const pages = new Set(["index", "account", "article", "blog", "history", "login", "register", "workout", "workouts"]);
server.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
server.get("/:page.html", (req, res, next) => {
  if (!pages.has(req.params.page)) return next();
  return res.sendFile(path.join(__dirname, `${req.params.page}.html`));
});
server.get("/css/:filename", (req, res) => res.sendFile(path.join(__dirname, "css", path.basename(req.params.filename))));
server.get("/js/:filename", (req, res) => res.sendFile(path.join(__dirname, "js", path.basename(req.params.filename))));
server.get("/assets/icons.svg", (req, res) => res.sendFile(path.join(__dirname, "assets", "icons.svg")));
server.get("/assets/images/:filename", (req, res) => res.sendFile(path.join(__dirname, "assets", "images", path.basename(req.params.filename))));

// Оставляет каталог тренировок и статей общедоступным только для чтения.
server.use("/api", (req, res, next) => {
  const pathname = req.path.replace(/\/$/, "");
  if (["/workouts", "/articles"].some((collection) => pathname === collection || pathname.startsWith(`${collection}/`))) {
    if (req.method === "GET") return next();
    return res.status(405).json({ message: "Эти данные доступны только для чтения." });
  }
  next();
});

// Нормализует email и применяет серверные правила регистрации.
server.use("/api", (req, res, next) => {
  const pathname = req.path.replace(/\/$/, "");
  if ((pathname === "/register" || pathname === "/login") && req.method === "POST") {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ message: "Укажите почту и пароль." });
    req.body.email = email;
    if (pathname === "/register") {
      const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
      if (!name || name.length > 60) return res.status(400).json({ message: "Имя должно содержать от 1 до 60 символов." });
      if (password.length < 9) return res.status(400).json({ message: "Пароль должен содержать не менее 9 символов." });
      req.body.name = name;
    }
  }
  next();
});

// Перенаправляет регистрацию и вход на маршруты json-server-auth.
server.use("/api", auth.rewriter({ users: 600, sessions: 640 }));
server.use("/api", auth);

// Ограничивает чтение истории своим userId и сверяет сведения о тренировке.
server.use("/api", (req, res, next) => {
  if (req.path === "/sessions" && req.method === "GET") {
    if (!req.claims || req.query.userId !== req.claims.sub) {
      return res.status(403).json({ message: "Можно просматривать только свою историю." });
    }
  }
  if (req.path === "/sessions" && req.method === "POST") {
    const workout = server.db.get("workouts").find({ id: req.body.workoutId }).value();
    if (!workout) return res.status(404).json({ message: "Тренировка не найдена." });
    req.body.title = workout.title;
    req.body.duration = workout.duration;
    req.body.completedAt = new Date().toISOString();
  }
  next();
});

// Не возвращает поле с bcrypt-хешем пароля из обычных ответов базы.
router.render = (req, res) => {
  const data = res.locals.data;
  if (data && !Array.isArray(data) && Object.hasOwn(data, "password")) {
    const { password, ...safeUser } = data;
    return res.json(safeUser);
  }
  return res.json(data);
};

// Подключает API и возвращает понятный ответ для неизвестных адресов.
server.use("/api", router);
server.use((req, res) => res.status(404).json({ message: "Страница не найдена." }));
server.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error.message);
  res.status(error.status || 500).json({ message: "Ошибка сервера." });
});

// Запускает сервер на локальном компьютере.
const port = Number(process.env.PORT) || 3000;
server.listen(port, "127.0.0.1", () => console.log(`Fitness Platform: http://127.0.0.1:${port}`));




