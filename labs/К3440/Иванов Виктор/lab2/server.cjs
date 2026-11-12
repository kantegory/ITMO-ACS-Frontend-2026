const jsonServer = require('json-server');
const { randomBytes, scryptSync, timingSafeEqual, randomUUID } = require('node:crypto');
const path = require('node:path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const db = router.db;
const port = Number(process.env.PORT) || 3001;

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

function reply(res, status, payload) {
  res.status(status).json(payload);
}
function hash(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}
function currentUser(req) {
  const token = /^Bearer (.+)$/.exec(req.get('authorization') || '')?.[1];
  const session = db.get('sessions').find({ token }).value();
  return session && db.get('users').find({ id: session.userId }).value();
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}
function issueSession(user) {
  const token = randomBytes(32).toString('hex');
  db.get('sessions').push({ id: randomUUID(), userId: user.id, token }).write();
  return { token, user: publicUser(user) };
}

server.post('/auth/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return reply(res, 400, { error: 'Проверьте имя, почту и пароль от 8 символов.' });
  if (db.get('users').find({ email }).value()) return reply(res, 409, { error: 'Эта почта уже зарегистрирована.' });
  const salt = randomBytes(16).toString('hex');
  const user = { id: randomUUID(), name, email, salt, passwordHash: hash(password, salt) };
  db.get('users').push(user).write();
  reply(res, 201, issueSession(user));
});
server.post('/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = db.get('users').find({ email }).value();
  const password = String(req.body.password || '');
  const candidate = user ? hash(password, user.salt) : null;
  if (!user || !timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.passwordHash, 'hex'))) {
    return reply(res, 401, { error: 'Неверная почта или пароль.' });
  }
  reply(res, 200, issueSession(user));
});
server.get('/auth/me', (req, res) => {
  const user = currentUser(req);
  return user ? reply(res, 200, publicUser(user)) : reply(res, 401, { error: 'Нужно войти в аккаунт.' });
});
server.post('/auth/logout', (req, res) => {
  const token = /^Bearer (.+)$/.exec(req.get('authorization') || '')?.[1];
  db.get('sessions').remove({ token }).write();
  reply(res, 200, { ok: true });
});
server.get('/my-bookings', (req, res) => {
  const user = currentUser(req);
  return user ? reply(res, 200, db.get('bookings').filter({ userId: user.id }).value()) : reply(res, 401, { error: 'Нужно войти в аккаунт.' });
});
server.post('/my-bookings', (req, res) => {
  const user = currentUser(req);
  if (!user) return reply(res, 401, { error: 'Нужно войти в аккаунт.' });
  const restaurant = db.get('restaurants').find({ id: Number(req.body.restaurantId) }).value();
  const date = String(req.body.date || '');
  const time = String(req.body.time || '');
  const guests = Number(req.body.guests);
  if (!restaurant || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < new Date().toISOString().slice(0, 10) || !/^\d{2}:\d{2}$/.test(time) || !Number.isInteger(guests) || guests < 1 || guests > 6) {
    return reply(res, 400, { error: 'Проверьте дату, время и количество гостей.' });
  }
  const booking = { id: randomUUID(), userId: user.id, restaurantId: restaurant.id, restaurant: restaurant.name, date, time, guests };
  db.get('bookings').push(booking).write();
  reply(res, 201, booking);
});
server.delete('/my-bookings/:id', (req, res) => {
  const user = currentUser(req);
  if (!user) return reply(res, 401, { error: 'Нужно войти в аккаунт.' });
  const booking = db.get('bookings').find({ id: req.params.id, userId: user.id }).value();
  if (!booking) return reply(res, 404, { error: 'Бронь не найдена.' });
  db.get('bookings').remove({ id: req.params.id }).write();
  reply(res, 200, { ok: true });
});
server.use((req, res, next) => {
  if (/^\/(?:users|sessions|bookings|db)(?:\/|$)/.test(req.path) || !['GET', 'HEAD'].includes(req.method)) return reply(res, 404, { error: 'Маршрут не найден.' });
  next();
});
server.use(router);
server.listen(port, '127.0.0.1', () => console.log(`Столик: http://localhost:${port}`));
