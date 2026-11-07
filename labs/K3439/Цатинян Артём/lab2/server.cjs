const jsonServer = require("json-server");
const {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const app = jsonServer.create();
const file = process.env.DB_FILE || path.join(__dirname, "db.json");
if (!fs.existsSync(file))
  fs.copyFileSync(path.join(__dirname, "seed.json"), file);
const router = jsonServer.router(file);
const db = router.db;
const sessions = new Map();
app.use(
  jsonServer.defaults({
    static: path.join(__dirname, "public"),
    logger: false,
  }),
);
app.use(jsonServer.bodyParser);
app.get("/bootstrap.css", (req, res) =>
  res.sendFile(require.resolve("bootstrap/dist/css/bootstrap.min.css")),
);
const fail = (res, code, message) => res.status(code).json({ message });
app.post("/api/:action(register|login)", (req, res) => {
  const { name, email, password } = req.body;
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  )
    return fail(
      res,
      400,
      "Введите корректную почту и пароль от 8 до 128 символов",
    );
  const normalized = email.trim().toLowerCase();
  let user = db.get("users").find({ email: normalized }).value();
  if (req.params.action === "register") {
    if (user) return fail(res, 409, "Эта почта уже зарегистрирована");
    if (typeof name !== "string" || !name.trim() || name.length > 80)
      return fail(res, 400, "Укажите имя");
    const salt = randomBytes(16).toString("hex");
    user = {
      id: randomUUID(),
      name: name.trim(),
      email: normalized,
      salt,
      hash: scryptSync(password, salt, 64).toString("hex"),
    };
    db.get("users").push(user).write();
  } else if (
    !user ||
    !timingSafeEqual(
      Buffer.from(user.hash, "hex"),
      scryptSync(password, user.salt, 64),
    )
  )
    return fail(res, 401, "Неверная почта или пароль");
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { userId: user.id, expires: Date.now() + 86400000 });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});
app.use("/api", (req, res, next) => {
  if (req.method === "GET" && /^\/restaurants(?:\/[^/]+)?$/.test(req.path))
    return next();
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  const session = sessions.get(token);
  if (!session || session.expires < Date.now())
    return fail(res, 401, "Войдите в аккаунт");
  req.userId = session.userId;
  req.token = token;
  next();
});
app.get("/api/me", (req, res) => {
  const user = db.get("users").find({ id: req.userId }).value();
  res.json({ id: user.id, name: user.name, email: user.email });
});
app.post("/api/logout", (req, res) => {
  sessions.delete(req.token);
  res.json({ ok: true });
});
app.use("/api", (req, res, next) => {
  if (/^\/restaurants(?:\/[^/]+)?$/.test(req.path))
    return req.method === "GET"
      ? next()
      : fail(res, 403, "Каталог доступен только для чтения");
  if (!/^\/bookings(?:\/[^/]+)?$/.test(req.path))
    return fail(res, 404, "Маршрут не найден");
  const id = req.path.split("/")[2];
  const existing = id && db.get("bookings").find({ id }).value();
  if (id && (!existing || existing.userId !== req.userId))
    return fail(res, 404, "Бронь не найдена");
  if (req.method === "GET") {
    if (!id) {
      req.query = { userId: req.userId, _sort: "date,time", _order: "asc,asc" };
      req.url = "/bookings?" + new URLSearchParams(req.query);
    }
    return next();
  }
  if (req.method === "DELETE" && id) return next();
  if ((req.method !== "POST" || id) && (req.method !== "PATCH" || !id))
    return fail(res, 405, "Метод не поддерживается");
  const data = { ...existing, ...req.body };
  const restaurant = db
    .get("restaurants")
    .find({ id: String(data.restaurantId) })
    .value();
  const when = new Date(data.date + "T" + data.time + ":00");
  if (
    !restaurant ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    !["12:00", "14:00", "16:00", "18:00", "19:00", "20:00", "21:00"].includes(
      data.time,
    ) ||
    !Number.isFinite(+when) ||
    when <= new Date() ||
    !Number.isInteger(Number(data.guests)) ||
    data.guests < 1 ||
    data.guests > 8
  )
    return fail(
      res,
      400,
      "Проверьте ресторан, будущую дату, время и число гостей (1–8)",
    );
  if (
    db
      .get("bookings")
      .value()
      .some(
        (b) =>
          b.id !== id &&
          b.userId === req.userId &&
          b.date === data.date &&
          b.time === data.time,
      )
  )
    return fail(res, 409, "У вас уже есть бронь на это время");
  req.body = {
    id: id || randomUUID(),
    userId: req.userId,
    restaurantId: restaurant.id,
    date: data.date,
    time: data.time,
    guests: Number(data.guests),
  };
  next();
});
app.use("/api", router);
app.listen(Number(process.env.PORT) || 3000, "127.0.0.1", () =>
  console.log("tablely: http://localhost:" + (process.env.PORT || 3000)),
);
