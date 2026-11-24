import { seedJobs } from './seed.js';

const prefix = 'vector-lab1:';

function read(key, fallback) {
  return JSON.parse(localStorage.getItem(prefix + key) ?? JSON.stringify(fallback));
}

function write(key, value) {
  localStorage.setItem(prefix + key, JSON.stringify(value));
  return value;
}

async function passwordHash(password, salt) {
  const bytes = new TextEncoder().encode(password);
  const key = await crypto.subtle.importKey('raw', bytes, 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256'
  }, key, 256);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function startSession(account) {
  const { hash, salt, ...user } = account;
  localStorage.setItem(prefix + 'session', user.id);
  return user;
}

export function currentUser() {
  const id = localStorage.getItem(prefix + 'session');
  const account = read('accounts', []).find(user => user.id === id);
  if (!account) return null;
  const { hash, salt, ...user } = account;
  return user;
}

export function logout() {
  localStorage.removeItem(prefix + 'session');
}

function requireRole(role) {
  const user = currentUser();
  if (user?.role !== role) throw new Error('Войдите в аккаунт с подходящей ролью.');
  return user;
}

export async function register({ name, email, password, role }) {
  const salt = crypto.randomUUID();
  const hash = await passwordHash(password, salt);
  const accounts = read('accounts', []);
  if (accounts.some(user => user.email === email)) throw new Error('Аккаунт с такой почтой уже существует.');
  const account = { id: crypto.randomUUID(), name, email, role, salt, hash };
  write('accounts', [...accounts, account]);
  return startSession(account);
}

export async function login({ email, password }) {
  const account = read('accounts', []).find(user => user.email === email);
  if (!account || await passwordHash(password, account.salt) !== account.hash) {
    throw new Error('Проверьте почту и пароль.');
  }
  return startSession(account);
}

export async function listJobs() {
  return read('jobs', seedJobs);
}

export async function getJob(id) {
  const job = (await listJobs()).find(item => String(item.id) === String(id));
  if (!job) throw new Error('Вакансия не найдена.');
  return job;
}

export async function ownJobs() {
  const user = requireRole('employer');
  return (await listJobs()).filter(job => job.userId === user.id);
}

export async function saveJob(data, id) {
  const user = requireRole('employer');
  const jobs = await listJobs();
  if (id) {
    const original = jobs.find(job => String(job.id) === String(id) && job.userId === user.id);
    if (!original) throw new Error('Вакансия не найдена.');
    return write('jobs', jobs.map(job => job === original ? { ...original, ...data } : job));
  }
  return write('jobs', [
    ...jobs, { ...data, id: crypto.randomUUID(), userId: user.id, createdAt: new Date().toISOString() }
  ]);
}

export async function deleteJob(id) {
  const user = requireRole('employer');
  return write('jobs', (await listJobs()).filter(job => !(String(job.id) === String(id) && job.userId === user.id)));
}

export async function getResume() {
  const user = requireRole('applicant');
  return read('resumes', {})[user.id] ?? null;
}

export async function saveResume(data) {
  const user = requireRole('applicant');
  const resumes = read('resumes', {});
  return write('resumes', { ...resumes, [user.id]: data });
}

export async function listApplications() {
  const user = requireRole('applicant');
  return read('applications', []).filter(application => application.userId === user.id);
}

export async function apply(job) {
  const user = requireRole('applicant');
  const applications = read('applications', []);
  if (!await getResume()) throw new Error('Сначала заполните и сохраните резюме в кабинете.');
  if (applications.some(item => item.userId === user.id && String(item.jobId) === String(job.id))) {
    throw new Error('Вы уже откликнулись на эту вакансию.');
  }
  return write('applications', [...applications, {
    userId: user.id, jobId: job.id, title: job.title, company: job.company, createdAt: new Date().toISOString()
  }]);
}
