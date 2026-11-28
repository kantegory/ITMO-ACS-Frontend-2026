import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { copyFileSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';

const file = name => fileURLToPath(new URL(name, import.meta.url));
const database = process.env.KACHALOCHKA_DB || file('./db.local.json');
try {
  copyFileSync(file('./db.json'), database, constants.COPYFILE_EXCL);
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}

const app = jsonServer.create();
const router = jsonServer.router(database);
const db = router.db;
const sessions = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;

app.use(jsonServer.defaults({ static: file('./public'), noCors: true }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api', jsonServer.bodyParser);

const publicProfile = ({ id, name, email }) => ({ id, name, email });
const fail = (res, status, message) => res.status(status).json({ message });
const hash = (password, salt) => scryptSync(password, salt, 64);
const emailAddress = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

function createSession(res, user, status) {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expires <= now) sessions.delete(token);
  }
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expires: now + sessionLifetime });
  return res.status(status).json({ token, user: publicProfile(user) });
}

app.post('/api/auth/register', (req, res) => {
  const { name, password } = req.body ?? {};
  const email = emailAddress(req.body?.email);
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 50 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return fail(res, 400, 'Укажите имя, корректную почту и пароль от 8 до 128 символов.');
  }
  if (db.get('users').find({ email }).value()) {
    return fail(res, 409, 'На эту почту уже зарегистрирован аккаунт.');
  }

  const salt = randomBytes(16).toString('hex');
  const user = { id: randomUUID(), name: name.trim(), email, salt, hash: hash(password, salt).toString('hex') };
  db.get('users').push(user).write();
  createSession(res, user, 201);
});

app.post('/api/auth/login', (req, res) => {
  const email = emailAddress(req.body?.email);
  const password = req.body?.password;
  const user = db.get('users').find({ email }).value();
  if (!user || typeof password !== 'string' || password.length > 128 ||
      !timingSafeEqual(hash(password, user.salt), Buffer.from(user.hash, 'hex'))) {
    return fail(res, 401, 'Проверьте почту и пароль.');
  }
  createSession(res, user, 200);
});

function requireUser(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer ([a-f0-9]{64})$/i)?.[1];
  const session = sessions.get(token);
  if (!session || session.expires <= Date.now()) {
    sessions.delete(token);
    return fail(res, 401, 'Войдите в аккаунт, чтобы продолжить.');
  }

  const user = db.get('users').find({ id: session.userId }).value();
  if (!user) return fail(res, 401, 'Войдите в аккаунт, чтобы продолжить.');
  res.locals.user = user;
  res.locals.token = token;
  next();
}

app.get('/api/me', requireUser, (req, res) => res.json(publicProfile(res.locals.user)));
app.post('/api/auth/logout', requireUser, (req, res) => {
  sessions.delete(res.locals.token);
  res.sendStatus(204);
});

const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
const findWorkout = id => db.get('workouts').find({ id }).value();

function findActivity(userId) {
  return db.get('activities').find({ userId }).value() ?? { userId, plan: [], completed: [] };
}

function sendActivity(res, { plan, completed }) {
  return res.json({ plan, completed });
}

function saveActivity(activity) {
  const records = db.get('activities');
  const existing = records.find({ userId: activity.userId });
  if (existing.value()) existing.assign(activity).write();
  else records.push(activity).write();
}

function markComplete(activity, workout, date) {
  if (!activity.completed.some(item => item.workout === workout && item.date === date)) {
    activity.completed.push({ workout, date });
  }
}

app.use('/api/activity', requireUser);
app.get('/api/activity', (req, res) => sendActivity(res, findActivity(res.locals.user.id)));

app.post('/api/activity/plan', (req, res) => {
  const { workout, date } = req.body ?? {};
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date) : null;
  if (!parsed || !Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== date ||
      date < today() || typeof workout !== 'string' || !findWorkout(workout)) {
    return fail(res, 400, 'Выберите тренировку и дату начиная с сегодняшней.');
  }
  const activity = findActivity(res.locals.user.id);
  if (activity.plan.some(item => item.workout === workout && item.date === date)) {
    return fail(res, 409, 'Эта тренировка уже есть в плане на выбранную дату.');
  }
  activity.plan.push({ id: randomUUID(), workout, date });
  saveActivity(activity);
  return sendActivity(res, activity);
});

function changePlan(req, res, completed) {
  const activity = findActivity(res.locals.user.id);
  const item = activity.plan.find(entry => entry.id === req.params.id);
  if (!item) return fail(res, 404, 'Тренировка в плане не найдена.');
  if (completed) markComplete(activity, item.workout, today());
  activity.plan = activity.plan.filter(entry => entry.id !== item.id);
  saveActivity(activity);
  return sendActivity(res, activity);
}

app.delete('/api/activity/plan/:id', (req, res) => changePlan(req, res, false));
app.post('/api/activity/plan/:id/complete', (req, res) => changePlan(req, res, true));

app.post('/api/activity/complete', (req, res) => {
  const workout = req.body?.workout;
  if (typeof workout !== 'string' || !findWorkout(workout)) return fail(res, 404, 'Тренировка не найдена.');
  const activity = findActivity(res.locals.user.id);
  const date = today();
  markComplete(activity, workout, date);
  activity.plan = activity.plan.filter(item => item.workout !== workout || item.date !== date);
  saveActivity(activity);
  return sendActivity(res, activity);
});

app.use('/api', (req, res, next) => {
  if (req.method === 'GET' && !Object.keys(req.query).length && /^\/(workouts|articles)(\/[^/]+)?\/?$/.test(req.path)) {
    return next();
  }
  return fail(res, 404, 'Маршрут не найден.');
}, router);

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => console.log('Качалочка: http://127.0.0.1:' + port));
