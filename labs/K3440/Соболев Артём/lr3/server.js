import jsonServer from "json-server";
import auth from "json-server-auth";
import path from "node:path";
import fs from "node:fs";

// Создаёт JSON Server и подключает базу данных.
const server = jsonServer.create();
const dbPath =
  process.env.DB_FILE || path.join(import.meta.dirname, "server", "db.json");
if (!fs.existsSync(dbPath))
  fs.copyFileSync(
    path.join(import.meta.dirname, "server", "seed.json"),
    dbPath,
  );
const router = jsonServer.router(dbPath);
server.db = router.db;

server.use(
  jsonServer.defaults({
    logger: false,
    static: path.join(import.meta.dirname, "public"),
  }),
);
server.use(jsonServer.bodyParser);

server.use(["/api/workouts", "/api/articles"], (req, res, next) => {
  if (req.method === "GET") return next();
  res.status(405).json({ message: "Эти данные доступны только для чтения." });
});

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

server.post(["/api/login", "/api/register"], (req, res, next) => {
  const { password } = req.body;
  const email = cleanText(req.body.email).toLowerCase();
  if (!email || typeof password !== "string" || !password)
    return res.status(400).json({ message: "Укажите почту и пароль." });

  req.body.email = email;
  if (req.path.toLowerCase().startsWith("/api/login")) return next();

  const name = cleanText(req.body.name);
  if (!name || name.length > 60)
    return res
      .status(400)
      .json({ message: "Имя должно содержать от 1 до 60 символов." });
  if (password.length < 9)
    return res
      .status(400)
      .json({ message: "Пароль должен содержать не менее 9 символов." });

  req.body.name = name;
  next();
});

// Перенаправляет регистрацию и вход на маршруты json-server-auth.
server.use("/api", auth.rewriter({ users: 600, sessions: 640 }));
server.use("/api", auth);

server.get("/api/sessions", (req, res, next) => {
  if (req.claims && req.query.userId === req.claims.sub) return next();
  res.status(403).json({ message: "Можно просматривать только свою историю." });
});

server.post("/api/sessions", (req, res, next) => {
  const workout = server.db
    .get("workouts")
    .find({ id: req.body.workoutId })
    .value();
  if (!workout)
    return res.status(404).json({ message: "Тренировка не найдена." });

  Object.assign(req.body, {
    title: workout.title,
    duration: workout.duration,
    completedAt: new Date().toISOString(),
  });
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
server.use((req, res) =>
  res.status(404).json({ message: "Страница не найдена." }),
);
server.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error.message);
  res.status(error.status || 500).json({ message: "Ошибка сервера." });
});

// Запускает сервер на локальном компьютере.
const port = Number(process.env.PORT) || 3001;
server.listen(port, "127.0.0.1", () =>
  console.log(`Fitness Platform: http://127.0.0.1:${port}`),
);
