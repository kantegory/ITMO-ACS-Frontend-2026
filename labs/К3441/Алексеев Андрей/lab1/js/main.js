import * as api from './api.js';
import { experiences, filterJobs, formats, industries, initials, orderJobs, salary } from './domain.js';

const byId = id => document.getElementById(id);
const user = api.currentUser();
const view = document.body.dataset.view;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function detailLink(id) {
  return `job.html?id=${encodeURIComponent(id)}`;
}

function cabinet(account) {
  return account.role === 'employer' ? 'employer.html' : 'profile.html';
}

function redirectIfUnauthorized(role) {
  if (!user || user.role !== role) {
    location.replace(user ? cabinet(user) : 'login.html');
    return true;
  }
  return false;
}

function showMessage(id, message) {
  const element = byId(id);
  element.textContent = message;
  element.hidden = !message;
}

function formData(form) {
  return Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
}

function completeFields(form, values) {
  for (const [key, value] of Object.entries(values ?? {})) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
}

function setupSelects() {
  for (const [id, values] of [['industry', industries], ['experience', experiences], ['format', formats]]) {
    const select = byId(id);
    if (select) select.append(...values.map(value => new Option(value)));
  }
}

function setupNav() {
  const accountNav = byId('account-nav');
  accountNav.innerHTML = user
    ? `<a class="btn btn-outline-primary" href="${cabinet(user)}">Мой кабинет</a>
       <button class="btn btn-outline-secondary" type="button" id="logout">Выйти</button>`
    : '<a class="btn btn-outline-primary" href="login.html">Войти</a><a class="btn btn-primary" href="register.html">Регистрация</a>';
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  for (const link of document.querySelectorAll('nav a')) {
    if (link.getAttribute('href') === currentPath) link.setAttribute('aria-current', 'page');
  }
  byId('logout')?.addEventListener('click', () => {
    api.logout();
    location.href = 'index.html';
  });
}

function jobCard(job) {
  return `<article class="panel job-card">
      <div class="d-flex align-items-start gap-3 flex-wrap">
        <span class="company-mark" aria-hidden="true">${escapeHtml(initials(job.company))}</span>
        <div class="flex-grow-1">
          <h3 class="h5 mb-1"><a href="${detailLink(job.id)}">${escapeHtml(job.title)}</a></h3>
          <p class="muted mb-2">${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
          <p class="salary mb-2">${escapeHtml(salary(job))} <span class="muted fw-normal">в месяц</span></p>
          ${jobTags(job)}
        </div>
      </div>
    </article>`;
}

function jobTags(job) {
  return `<ul class="list-unstyled d-flex flex-wrap gap-2 mb-0">
    ${[job.industry, job.experience, job.format].map(tag => `<li class="status-chip">${escapeHtml(tag)}</li>`).join('')}
  </ul>`;
}

async function catalog() {
  const search = byId('search-form');
  const filters = byId('filters');
  const jobs = await api.listJobs();

  function render() {
    const minimum = filters.elements.minimum;
    if (!minimum.checkValidity()) {
      minimum.reportValidity();
      return;
    }
    const data = { ...formData(search), ...formData(filters) };
    const matching = orderJobs(filterJobs(jobs, data), byId('sort').value);
    showMessage('result-count', `Найдено: ${matching.length}`);
    byId('job-list').innerHTML = matching.length
      ? matching.map(jobCard).join('')
      : '<p class="panel p-4 mb-0">Подходящих вакансий нет. Измените запрос или сбросьте фильтры.</p>';
  }

  search.addEventListener('submit', event => {
    event.preventDefault();
    render();
    byId('results').scrollIntoView({ block: 'start' });
  });
  search.elements.query.addEventListener('search', render);
  filters.addEventListener('change', render);
  filters.addEventListener('submit', event => {
    event.preventDefault();
    render();
  });
  filters.addEventListener('reset', () => {
    search.reset();
    byId('sort').value = 'new';
    requestAnimationFrame(render);
  });
  byId('sort').addEventListener('change', render);
  render();
}

async function jobDetail() {
  const id = new URLSearchParams(location.search).get('id');
  let job;
  try {
    if (!id) throw new Error('Вакансия не найдена.');
    job = await api.getJob(id);
  } finally {
    byId('loading').hidden = true;
  }

  document.title = `${job.title} | Вектор`;
  const detail = byId('job-detail');
  detail.innerHTML = `<header class="mb-4">
    <p class="muted mb-2">${escapeHtml(job.company)} · ${escapeHtml(job.city)}</p>
    <h1 class="h2 mb-3">${escapeHtml(job.title)}</h1>
    <p class="salary fs-5 mb-3">${escapeHtml(salary(job))} <span class="muted fw-normal">в месяц</span></p>
    ${jobTags(job)}
  </header>
  <section aria-labelledby="description-heading"><h2 class="h5" id="description-heading">Описание</h2><p class="multiline">${escapeHtml(job.description)}</p></section>
  <section aria-labelledby="requirements-heading"><h2 class="h5" id="requirements-heading">Требования</h2><p class="multiline">${escapeHtml(job.requirements)}</p></section>
  ${!user ? '<a class="btn btn-primary" href="login.html">Войти для отклика</a>' : ''}
  ${user?.role === 'applicant' ? '<button class="btn btn-primary" type="button" id="apply" disabled>Откликнуться</button>' : ''}
  <p class="mt-3 mb-0" id="application-status" role="status" hidden></p>`;
  detail.hidden = false;
  if (user?.role !== 'applicant') return;

  const button = byId('apply');
  const applications = await api.listApplications();
  const alreadyApplied = applications.some(application => String(application.jobId) === String(job.id));
  if (alreadyApplied) {
    button.textContent = 'Отклик отправлен';
    return;
  }
  button.disabled = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await api.apply(job);
      button.textContent = 'Отклик отправлен';
      byId('application-status').className = 'mt-3 mb-0 text-success';
      showMessage('application-status', 'Отклик сохранён в вашем кабинете.');
    } catch (error) {
      byId('application-status').className = 'mt-3 mb-0 text-danger';
      showMessage('application-status', error.message);
      button.disabled = false;
    }
  });
}

function bindForm(form, action, errorId) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    showMessage(errorId, '');
    try {
      await action(formData(form));
    } catch (error) {
      showMessage(errorId, error.message);
    } finally {
      button.disabled = false;
    }
  });
}

function auth() {
  if (user) {
    location.replace(cabinet(user));
    return;
  }
  const form = byId('auth-form');
  bindForm(form, async data => {
    const password = form.elements.password.value;
    const account = await api[view]({ ...data, email: data.email.toLowerCase(), password });
    location.href = cabinet(account);
  }, 'error');
}

async function profile() {
  if (redirectIfUnauthorized('applicant')) return;
  byId('profile-user').textContent = `${user.name} · ${user.email}`;
  const form = byId('resume-form');
  const [resume, applications] = await Promise.all([api.getResume(), api.listApplications()]);
  completeFields(form, resume);
  form.querySelector('button').disabled = false;
  bindForm(form, async data => {
    showMessage('resume-status', '');
    if (Object.values(data).some(value => !value)) throw new Error('Заполните все поля резюме.');
    await api.saveResume(data);
    showMessage('resume-status', 'Резюме сохранено.');
  }, 'error');
  byId('applications').innerHTML = applications.length
    ? `<ul class="list-group list-group-flush">${[...applications].reverse().map(item =>
        `<li class="list-group-item px-0"><strong>${escapeHtml(item.title)}</strong><br><span class="muted">${escapeHtml(item.company)} · ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span></li>`
      ).join('')}</ul>`
    : '<p class="muted mb-0">У вас пока нет откликов. <a href="index.html">Посмотреть вакансии</a>.</p>';
}

async function employer() {
  if (redirectIfUnauthorized('employer')) return;
  byId('profile-user').textContent = `${user.name} · ${user.email}`;
  const form = byId('job-form');
  const ownList = byId('own-jobs');
  let editing = null;
  let jobs = [];

  function setEditor(job = null) {
    editing = job ? job.id : null;
    form.reset();
    completeFields(form, job);
    byId('cancel-edit').hidden = !job;
    byId('editor-heading').textContent = job ? 'Редактирование вакансии' : 'Новая вакансия';
    byId('publish').textContent = job ? 'Сохранить' : 'Опубликовать';
    showMessage('editor-error', '');
  }

  async function render() {
    jobs = orderJobs(await api.ownJobs(), 'new');
    ownList.innerHTML = jobs.length
      ? `<ul class="list-group list-group-flush">${jobs.map(job => `<li class="list-group-item px-0 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <a href="${detailLink(job.id)}">${escapeHtml(job.title)}</a>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-primary" type="button" data-edit="${escapeHtml(job.id)}">Изменить</button>
            <button class="btn btn-sm btn-outline-danger" type="button" data-delete="${escapeHtml(job.id)}">Удалить</button>
          </div></li>`).join('')}</ul>`
      : '<p class="muted mb-0">Вы ещё не опубликовали вакансии.</p>';
  }

  byId('cancel-edit').addEventListener('click', () => setEditor());
  ownList.addEventListener('click', async event => {
    const button = event.target.closest('button[data-edit], button[data-delete]');
    if (!button) return;
    if (button.dataset.edit) {
      setEditor(jobs.find(job => String(job.id) === button.dataset.edit));
      form.elements.title.focus();
    } else if (window.confirm('Удалить эту вакансию?')) {
      button.disabled = true;
      try {
        await api.deleteJob(button.dataset.delete);
        if (String(editing) === button.dataset.delete) setEditor();
        await render();
        showMessage('job-status', 'Вакансия удалена.');
      } catch (error) {
        showMessage('error', error.message);
        button.disabled = false;
      }
    }
  });
  bindForm(form, async data => {
    const job = { ...data, salaryMin: Number(data.salaryMin), salaryMax: Number(data.salaryMax) };
    if (Object.values(data).some(value => !value)) throw new Error('Заполните все поля вакансии.');
    if (job.salaryMin > job.salaryMax) throw new Error('Верхняя граница зарплаты должна быть не ниже нижней.');
    await api.saveJob(job, editing);
    const message = editing ? 'Изменения сохранены.' : 'Вакансия опубликована.';
    setEditor();
    await render();
    showMessage('job-status', message);
  }, 'editor-error');
  await render();
  byId('publish').disabled = false;
}

setupNav();
setupSelects();
const pages = { catalog, job: jobDetail, login: auth, register: auth, profile, employer };
try {
  await pages[view]();
} catch (error) {
  if (view === 'catalog') showMessage('result-count', '');
  showMessage('error', error.message);
}
