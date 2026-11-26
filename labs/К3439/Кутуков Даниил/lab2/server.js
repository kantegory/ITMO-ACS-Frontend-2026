import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import jsonServer from 'json-server';
import { filterRestaurants, restaurants, validateBooking } from '../lab1/catalog.js';

const here = path => fileURLToPath(new URL(path, import.meta.url));
const app = jsonServer.create();
const database = process.env.STOLIK_DB ? resolve(process.env.STOLIK_DB) : here('./db.json');
if (!existsSync(database)) writeFileSync(database, JSON.stringify({ restaurants, users: [], bookings: [] }, null, 2));
const router = jsonServer.router(database);
const db = router.db;
const sessions = new Map();
const sessionAge = 12 * 60 * 60 * 1000;

app.use('/api', jsonServer.bodyParser, (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

const fail = (res, status, message) => res.status(status).json({ message });
const publicUser = ({ id, name, email }) => ({ id, name, email });
const normalize = value => typeof value === 'string' ? value.trim() : '';
const emailOf = value => normalize(value).toLowerCase();

function beginSession(res, account, status) {
  for (const [token, session] of sessions) {
    if (session.expires <= Date.now()) sessions.delete(token);
  }
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: account.id, expires: Date.now() + sessionAge });
  return res.status(status).json({ token, user: publicUser(account) });
}

function requireUser(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  const session = sessions.get(token);
  if (!session || session.expires <= Date.now()) {
    sessions.delete(token);
    return fail(res, 401, 'Войдите, чтобы продолжить.');
  }
  req.token = token;
  req.userId = session.userId;
  next();
}

app.post('/api/register', (req, res) => {
  const name = normalize(req.body.name);
  const email = emailOf(req.body.email);
  const { password } = req.body;
  if (!name || name.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(res, 400, 'Укажите имя и корректный адрес электронной почты.');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 64) {
    return fail(res, 400, 'Пароль должен содержать от 8 до 64 символов.');
  }
  if (db.get('users').find({ email }).value()) {
    return fail(res, 409, 'На этот адрес уже зарегистрирован аккаунт.');
  }
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const account = { id: randomUUID(), name, email, salt, hash };
  db.get('users').push(account).write();
  return beginSession(res, account, 201);
});

app.post('/api/login', (req, res) => {
  const account = db.get('users').find({ email: emailOf(req.body.email) }).value();
  const { password } = req.body;
  if (!account || typeof password !== 'string' || password.length > 64 ||
      !timingSafeEqual(scryptSync(password, account.salt, 64), Buffer.from(account.hash, 'hex'))) {
    return fail(res, 401, 'Проверьте электронную почту и пароль.');
  }
  return beginSession(res, account, 200);
});

app.post('/api/logout', requireUser, (req, res) => {
  sessions.delete(req.token);
  res.json({ success: true });
});

app.get('/api/restaurants', (req, res) => {
  const filters = Object.fromEntries(['query', 'cuisine', 'district', 'price'].map(key => [key, normalize(req.query[key])]));
  res.json(filterRestaurants(db.get('restaurants').value(), filters));
});

app.get('/api/bookings', requireUser, (req, res) => {
  res.json(db.get('bookings').filter({ userId: req.userId }).value());
});

app.post('/api/bookings', requireUser, (req, res) => {
  const { restaurantId, date, time, guests } = req.body;
  if (!Number.isInteger(restaurantId) || !db.get('restaurants').find({ id: restaurantId }).value()) {
    return fail(res, 404, 'Ресторан не найден.');
  }
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(res, 400, 'Укажите дату бронирования.');
  try { validateBooking({ date, time, guests }); }
  catch (error) { return fail(res, 400, error.message); }
  const details = { userId: req.userId, restaurantId, date, time, cancelled: false };
  if (db.get('bookings').find(details).value()) return fail(res, 409, 'У вас уже есть бронь на это время.');
  const booking = { id: randomUUID(), guests, ...details };
  db.get('bookings').push(booking).write();
  res.status(201).json(booking);
});

app.patch('/api/bookings/:id', requireUser, (req, res) => {
  const entry = db.get('bookings').find({ id: req.params.id, userId: req.userId });
  const booking = entry.value();
  if (!booking) return fail(res, 404, 'Бронь не найдена.');
  if (booking.cancelled) return res.json(booking);
  if (new Date(booking.date + 'T' + booking.time) <= new Date()) {
    return fail(res, 409, 'Это бронирование уже завершилось.');
  }
  res.json(entry.assign({ cancelled: true }).write());
});

app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && /^\/restaurants\/\d+$/.test(req.path)) return router(req, res, next);
  return fail(res, 404, 'Ресурс не найден.');
});

const labRoot = here('../lab1/');
const homeRoot = here('../../../../homeworks/К3439/Кутуков Даниил/');
const stages = [
  ['hw2', 2],
  ['hw3', 3],
  ['hw4', 4],
];

function serveFrontend(location, stage) {
  const at = path => location + path;
  app.get(at('/service.js'), (req, res) => res.sendFile(here('./api-client.js')));
  app.get(at('/remote-service.js'), (req, res) => res.sendFile(here('./remote-service.js')));
  if (stage >= 2) {
    app.get(at('/enhance.js'), (req, res) => res.sendFile(resolve(homeRoot, 'hw' + stage, 'enhance.js')));
    for (const [folder, number] of stages.filter(([, number]) => number <= stage)) {
      app.use(at('/' + folder), express.static(resolve(homeRoot, folder)));
    }
    if (stage >= 4) {
      app.get(at('/icons.js'), (req, res) => res.sendFile(resolve(homeRoot, 'hw4/icons.js')));
      app.get(at('/sprite.svg'), (req, res) => res.sendFile(resolve(homeRoot, 'hw4/sprite.svg')));
    }
  }
  app.use(location || '/', express.static(labRoot));
}

for (const [folder, stage] of stages) serveFrontend('/' + folder, stage);
serveFrontend('', 1);

const port = Number(process.env.PORT || 3000);
app.listen(port, '127.0.0.1', () => console.log('Столик · http://localhost:' + port));
