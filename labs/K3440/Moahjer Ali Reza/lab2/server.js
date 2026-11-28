// Мок-сервер на json-server + простая авторизация по токену.
// Данные лежат в db.json, запуск: npm start

const jsonServer = require("json-server");
const crypto = require("crypto");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ---------- вспомогательные функции ----------

// пользователь без пароля (пароль наружу не отдаём)
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

function createToken(user) {
  const token = crypto.randomBytes(24).toString("hex");
  router.db.get("sessions").insert({ token: token, userId: user.id }).write();
  return token;
}

function getToken(req) {
  return (req.headers.authorization || "").replace("Bearer ", "");
}

function getUserByToken(req) {
  const token = getToken(req);
  const session = router.db.get("sessions").find({ token: token }).value();
  if (!session) return null;
  return router.db.get("users").find({ id: session.userId }).value() || null;
}

// проверка токена: если токена нет или он неверный — 401
function requireAuth(req, res, next) {
  const user = getUserByToken(req);
  if (!user) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }
  req.user = user;
  next();
}

// ---------- авторизация ----------

server.post("/auth/register", (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Заполните имя, email и пароль" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Пароль должен быть не короче 8 символов" });
  }

  const exists = router.db
    .get("users")
    .find((u) => u.email.toLowerCase() === email.toLowerCase())
    .value();
  if (exists) {
    return res.status(409).json({ message: "Пользователь с таким email уже зарегистрирован" });
  }

  const user = router.db
    .get("users")
    .insert({ name: name, email: email, phone: phone || "", password: password })
    .write();

  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = router.db
    .get("users")
    .find((u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password)
    .value();
  if (!user) {
    return res.status(401).json({ message: "Неверный email или пароль" });
  }

  res.json({ token: createToken(user), user: publicUser(user) });
});

server.post("/auth/logout", requireAuth, (req, res) => {
  router.db.get("sessions").remove({ token: getToken(req) }).write();
  res.status(204).end();
});

// ---------- профиль текущего пользователя ----------

server.get("/auth/me", requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

server.patch("/auth/me", requireAuth, (req, res) => {
  const { name, phone } = req.body;

  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ message: "Имя не может быть пустым" });
  }

  const changes = {};
  if (name !== undefined) changes.name = name;
  if (phone !== undefined) changes.phone = phone;

  const user = router.db.get("users").find({ id: req.user.id }).assign(changes).write();
  res.json(publicUser(user));
});

server.delete("/auth/me", requireAuth, (req, res) => {
  router.db.get("sessions").remove({ userId: req.user.id }).write();
  router.db.get("users").remove({ id: req.user.id }).write();
  res.status(204).end();
});

// ---------- защита остальных данных ----------

// списки пользователей и сессий наружу не отдаём
server.use(["/users", "/sessions"], (req, res) => {
  res.status(404).json({ message: "Не найдено" });
});

// каталог доступен только для чтения
server.use(["/carpets", "/categories"], (req, res, next) => {
  if (req.method !== "GET") {
    return res.status(403).json({ message: "Каталог доступен только для чтения" });
  }
  next();
});

server.use(router);

server.listen(PORT, () => {
  console.log("CarpetShop API: http://localhost:" + PORT);
});
