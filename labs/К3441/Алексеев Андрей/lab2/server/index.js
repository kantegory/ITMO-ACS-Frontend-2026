import { randomBytes, randomUUID } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';
import jwt from 'jsonwebtoken';
import { experiences, formats, industries } from '../public/js/domain.js';

const require = createRequire(import.meta.url);
const secret = process.env.JWT_SECRET || randomBytes(32).toString('hex');
// json-server-auth 2.1 exports a fixed development key. Set it before loading its handlers.
require('json-server-auth/dist/constants.js').JWT_SECRET_KEY = secret;
const auth = require('json-server-auth');

const server = jsonServer.create();
const seedFile = fileURLToPath(new URL('./db.seed.json', import.meta.url));
const dataFile = process.env.VECTOR_DATA_FILE
  ? resolve(process.env.VECTOR_DATA_FILE)
  : fileURLToPath(new URL('../.runtime/db.json', import.meta.url));
mkdirSync(dirname(dataFile), { recursive: true });
if (!existsSync(dataFile)) copyFileSync(seedFile, dataFile);

const router = jsonServer.router(dataFile);
server.db = router.db;
const pendingEmails = new Set();
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
server.use(jsonServer.defaults({ static: publicDir }));
server.use(jsonServer.bodyParser);

function fail(response, code, message) {
  return response.status(code).json({ message });
}

function accountFromToken(request) {
  const match = request.get('authorization')?.match(/^Bearer (\S+)$/i);
  if (!match) return null;
  try {
    const { sub, email } = jwt.verify(match[1], secret, { algorithms: ['HS256'] });
    return router.db.get('users').value().find(user => String(user.id) === sub && user.email === email);
  } catch {
    return null;
  }
}

function textFields(data, limits) {
  const result = {};
  for (const [field, maximum] of Object.entries(limits)) {
    const value = typeof data[field] === 'string' ? data[field].trim() : '';
    if (!value || value.length > maximum) return null;
    result[field] = value;
  }
  return result;
}

function validJob(data) {
  const fields = textFields(data, {
    title: 100, company: 80, city: 80, description: 2500, requirements: 2500
  });
  const { industry, experience, format, salaryMin, salaryMax } = data;
  if (!fields || !industries.includes(industry) || !experiences.includes(experience)
    || !formats.includes(format) || !Number.isInteger(salaryMin) || !Number.isInteger(salaryMax)
    || salaryMin < 0 || salaryMin > salaryMax || salaryMax > 100000000) return null;
  return { ...fields, industry, experience, format, salaryMin, salaryMax };
}

function protect(request, response, next) {
  const { method, path } = request;
  const body = request.body ?? {};
  if (method === 'POST' && (path === '/login' || path === '/register')) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const { password } = body;
    if (email.length > 150 || typeof password !== 'string' || !password.length || password.length > 64) {
      return fail(response, 400, 'Проверьте почту и пароль.');
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return fail(response, 400, 'Сократите пароль: в нём слишком много многобайтовых символов.');
    }
    request.body = { email, password };
    if (path === '/register') {
      const fields = textFields(body, { name: 80 });
      if (!fields || !['applicant', 'employer'].includes(body.role) || password.length < 8) {
        return fail(response, 400, 'Укажите имя, тип аккаунта и пароль от 8 символов.');
      }
      request.body = { ...request.body, name: fields.name, role: body.role };
      if (pendingEmails.has(email)) return fail(response, 409, 'Эта почта уже регистрируется.');
      pendingEmails.add(email);
      response.once('close', () => pendingEmails.delete(email));
    }
    return next();
  }

  const user = accountFromToken(request);
  if (method === 'GET' && path === '/me') {
    if (!user) return fail(response, 401, 'Войдите снова.');
    const { id, name, email, role } = user;
    return response.json({ id, name, email, role });
  }

  const route = path.match(/^\/(jobs|resumes|applications)(?:\/([a-zA-Z0-9-]+))?$/);
  if (!route) return fail(response, 404, 'Ресурс не найден.');
  const [, collection, id] = route;
  const ownJobs = collection === 'jobs' && !id && request.query.mine === '1';
  const records = router.db.get(collection).value();
  const record = id ? records.find(item => String(item.id) === id) : null;
  const jobs = collection === 'jobs';
  const reading = method === 'GET';
  request.query = {};

  if (jobs && reading && !ownJobs) {
    return id && !record ? fail(response, 404, 'Вакансия не найдена.') : next();
  }
  if (!user) return fail(response, 401, 'Войдите снова.');
  if (user.role !== (jobs ? 'employer' : 'applicant')) {
    return fail(response, 403, 'У вашего аккаунта нет доступа к этому действию.');
  }
  if (id && record?.userId !== user.id) return fail(response, 404, 'Запись не найдена.');

  if (reading && !id) {
    return response.json(records.filter(item => item.userId === user.id));
  }

  if (jobs && ((method === 'POST' && !id) || (method === 'PATCH' && id))) {
    const job = validJob(body);
    if (!job) return fail(response, 400, 'Проверьте поля вакансии и диапазон зарплаты.');
    request.body = id ? job : { ...job, id: randomUUID(), userId: user.id, createdAt: new Date().toISOString() };
    return next();
  }

  if (jobs && method === 'DELETE' && id) return next();
  if (collection === 'resumes' && ((method === 'POST' && !id) || (method === 'PATCH' && id))) {
    const resume = textFields(body, { title: 100, city: 80, skills: 250, about: 2500 });
    if (!resume) return fail(response, 400, 'Проверьте поля резюме.');
    if (!id && records.some(item => item.userId === user.id)) {
      return fail(response, 409, 'Резюме уже существует. Обновите страницу.');
    }
    request.body = id ? resume : { ...resume, userId: user.id };
    return next();
  }

  if (collection === 'applications' && method === 'POST' && !id) {
    const job = router.db.get('jobs').value().find(item => String(item.id) === String(body.jobId));
    if (!job) return fail(response, 404, 'Вакансия не найдена.');
    if (!router.db.get('resumes').value().some(resume => resume.userId === user.id)) {
      return fail(response, 409, 'Сначала заполните и сохраните резюме в кабинете.');
    }
    if (records.some(item => item.jobId === job.id && item.userId === user.id)) {
      return fail(response, 409, 'Вы уже откликнулись на эту вакансию.');
    }
    request.body = {
      userId: user.id, jobId: job.id, title: job.title, company: job.company,
      createdAt: new Date().toISOString()
    };
    return next();
  }
  return fail(response, 405, 'Действие не поддерживается.');
}

server.use('/api', protect, auth, router);
const port = Number(process.env.PORT || 3102);
server.listen(port, '127.0.0.1', () => console.log(`Вектор · http://127.0.0.1:${port}`));
