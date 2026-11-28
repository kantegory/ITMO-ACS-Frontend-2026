import { workouts, articles } from './content.js';
import { getProfile, register, login, logout, getActivity, updateActivity, today } from './storage.js';

const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const profile = getProfile();
const findWorkout = id => workouts.find(workout => workout.id === id);
const workoutUrl = id => 'workout.html?id=' + encodeURIComponent(id);
const articleUrl = id => 'blog.html?id=' + encodeURIComponent(id);
const photoUrl = image => 'assets/images/' + image + '.webp';
const on = (selector, event, listener) => document.querySelector(selector).addEventListener(event, listener);
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const displayDate = date => dateFormat.format(new Date(date + 'T12:00:00'));

if (profile) {
  const actions = document.querySelector('#header-actions');
  actions.innerHTML = '<button class="btn btn-outline-secondary" type="button" id="logout">Выйти</button>';
  on('#logout', 'click', () => {
    logout();
    location.assign('index.html');
  });
}

function workoutMeta(workout) {
  return `<div class="workout-meta"><span>${workout.level}</span><span>${workout.minutes} мин</span></div>`;
}

function renderCatalog() {
  const form = document.querySelector('#filters');
  const results = document.querySelector('#workouts');
  const count = document.querySelector('#result-count');
  const reset = document.querySelector('#reset-filters');
  const durationMatches = {
    short: minutes => minutes <= 15,
    medium: minutes => minutes >= 16 && minutes <= 25,
    long: minutes => minutes >= 26,
  };
  function filter() {
    const { search, type, level, duration } = Object.fromEntries(new FormData(form));
    const query = search.trim().toLocaleLowerCase('ru');
    const matches = workouts.filter(workout => {
      const searchable = [workout.title, workout.description, ...workout.steps].join(' ').toLocaleLowerCase('ru');
      return searchable.includes(query) && (!type || workout.type === type) &&
        (!level || workout.level === level) && (!duration || durationMatches[duration](workout.minutes));
    });
    reset.hidden = ![query, type, level, duration].some(Boolean);
    count.textContent = 'Найдено тренировок: ' + matches.length;
    results.innerHTML = matches.length ? matches.map(workout => `
      <div class="col-sm-6 col-lg-4">
        <article class="workout-card card">
          <a href="${workoutUrl(workout.id)}" tabindex="-1" aria-hidden="true"><img data-photo="${workout.image}" src="${photoUrl(workout.image)}" alt="" width="512" height="512" loading="lazy"></a>
          <div class="card-body">
            <p class="category">${workout.type}</p>
            <h3><a href="${workoutUrl(workout.id)}">${workout.title}</a></h3>
            <p>${workout.description}</p>
            ${workoutMeta(workout)}
          </div>
        </article>
      </div>`).join('') : '<div class="col-12"><p class="empty">По этим условиям ничего не найдено. Измените поиск или сбросьте фильтры.</p></div>';
  }
  form.addEventListener('input', filter);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', () => requestAnimationFrame(() => {
    filter();
    form.elements.search.focus();
  }));
  filter();
}

function renderWorkout() {
  const workout = findWorkout(params.get('id'));
  const root = document.querySelector('#workout');
  const back = '<a class="back-link" href="index.html#catalog">К каталогу тренировок</a>';
  if (!workout) {
    root.innerHTML = back + '<h1>Тренировка не найдена</h1>';
    return;
  }

  document.title = workout.title + ' — Качалочка';
  const source = 'https://www.youtube.com/watch?v=' + workout.video;
  const completed = profile && getActivity(profile).completed.some(item => item.workout === workout.id && item.date === today());
  const activityActions = profile ? `
    <button type="button" id="complete" class="btn btn-primary mt-3"${completed ? ' disabled' : ''}>${completed ? 'Выполнено сегодня' : 'Отметить выполненной'}</button>
    <a class="btn btn-outline-secondary mt-3" href="account.html?plan=${workout.id}">Добавить в план</a>
    <p id="workout-feedback" class="muted mt-3" role="status"></p>` :
    `<a class="btn btn-outline-secondary mt-3" href="login.html?workout=${workout.id}">Войти, чтобы сохранить прогресс</a>`;
  root.innerHTML = `${back}
    <div class="detail-top">
      <p class="category">${workout.type}</p>
      <h1>${workout.title}</h1>
      <p class="muted">${workout.description}</p>
      ${workoutMeta(workout)}
    </div>
    <div class="detail-layout">
      <section aria-label="Видео тренировки">
        <div class="video-panel" id="video-panel">
          <img data-photo="${workout.image}" src="${photoUrl(workout.image)}" alt="" width="512" height="512">
          <button type="button" class="btn btn-primary" id="video-play">Смотреть тренировку</button>
        </div>
        <p class="mt-2"><a href="${source}" target="_blank" rel="noopener">Открыть видео HASfit на YouTube</a></p>
      </section>
      <section class="guide">
        <h2>Как заниматься</h2>
        <p class="muted">Инвентарь · ${workout.equipment}</p>
        <ol>${workout.steps.map(step => '<li>' + step + '</li>').join('')}</ol>
        ${activityActions}
      </section>
    </div>`;
  on('#video-play', 'click', () => {
    const frame = document.createElement('iframe');
    frame.title = workout.title;
    frame.src = 'https://www.youtube-nocookie.com/embed/' + workout.video + '?autoplay=1';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    document.querySelector('#video-panel').replaceChildren(frame);
    frame.focus();
  });
  if (profile) {
    on('#complete', 'click', event => {
      updateActivity(profile, activity => {
        recordCompletion(activity, workout.id);
        activity.plan = activity.plan.filter(item => item.workout !== workout.id || item.date !== today());
      });
      event.target.disabled = true;
      event.target.textContent = 'Выполнено сегодня';
      document.querySelector('#workout-feedback').textContent = 'Тренировка добавлена в историю.';
    });
  }
}

function recordCompletion(activity, workout) {
  const date = today();
  if (!activity.completed.some(item => item.workout === workout && item.date === date)) {
    activity.completed.push({ workout, date });
  }
}

function renderBlog() {
  const container = document.querySelector('#blog');
  const article = articles.find(item => item.id === params.get('id'));
  const back = '<a class="back-link" href="blog.html">К списку статей</a>';
  if (article) {
    document.title = article.title + ' — Качалочка';
    container.innerHTML = `${back}<article class="article">
      <p class="category">${article.topic}</p>
      <h1 class="mt-2">${article.title}</h1><p class="muted">${article.summary}</p>
      <img src="${photoUrl(article.image)}" alt="" width="512" height="512">
      ${article.sections.map(([heading, text]) => `<section><h2>${heading}</h2><p>${text}</p></section>`).join('')}
    </article>`;
    return;
  }
  if (params.has('id')) {
    container.innerHTML = back + '<h1>Статья не найдена</h1>';
    return;
  }
  container.innerHTML = `<h1>Журнал</h1>
    <p class="muted">О питании, восстановлении и привычках, которые помогают заниматься регулярно.</p>
    <div class="blog-list">${articles.map(item => `
      <article class="blog-row">
        <img src="${photoUrl(item.image)}" alt="" width="512" height="512">
        <div><p class="category">${item.topic}</p><h2><a href="${articleUrl(item.id)}">${item.title}</a></h2><p class="muted">${item.summary}</p></div>
      </article>`).join('')}</div>`;
}

function setupAuth() {
  const form = document.querySelector('#auth-form');
  const signup = form.dataset.mode === 'register';
  const workout = findWorkout(params.get('workout'));
  const destination = workout ? workoutUrl(workout.id) : 'account.html';
  const error = document.querySelector('#auth-error');
  const alternate = document.querySelector('#auth-alternate');
  if (workout) alternate.href += '?workout=' + workout.id;
  if (profile) {
    location.replace(destination);
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    error.textContent = '';
    const data = new FormData(form);
    const email = data.get('email').trim().toLowerCase();
    const password = data.get('password');
    const name = data.get('name')?.trim();
    const button = form.querySelector('button[type="submit"]');
    if (signup && !name) {
      error.textContent = 'Укажите имя.';
      form.elements.name.focus();
      return;
    }

    button.disabled = true;
    try {
      const accepted = signup ? await register(name, email, password) : await login(email, password);
      if (accepted) {
        location.assign(destination);
        return;
      }
      error.textContent = signup ? 'На эту почту уже зарегистрирован аккаунт.' : 'Проверьте почту и пароль.';
    } catch {
      error.textContent = 'Не удалось сохранить или открыть профиль. Проверьте настройки хранения данных в браузере.';
    } finally {
      button.disabled = false;
    }
  });
}

function renderAccount() {
  const root = document.querySelector('#account');
  if (!profile) {
    root.innerHTML = `<h1>Личный кабинет</h1><p class="muted">Войдите, чтобы составить план и посмотреть историю тренировок.</p>
      <a href="login.html" class="btn btn-primary">Войти</a>
      <a href="register.html" class="btn btn-outline-secondary">Создать аккаунт</a>`;
    return;
  }

  root.innerHTML = `
    <div class="account-top"><div><h1>Личный кабинет</h1><p class="muted mb-0" id="profile-name"></p></div></div>
    <div id="activity"></div>
    <p id="account-feedback" class="muted" role="status"></p>`;
  document.querySelector('#profile-name').textContent = profile.name;

  const dialog = document.querySelector('#plan-dialog');
  const form = document.querySelector('#plan-form');
  const activity = document.querySelector('#activity');
  form.elements.workout.innerHTML = workouts.map(workout => `<option value="${workout.id}">${workout.title}</option>`).join('');

  function showPlan(workout) {
    form.reset();
    form.elements.date.min = today();
    form.elements.date.value = today();
    if (workout) form.elements.workout.value = workout.id;
    dialog.showModal();
  }

  function list(items, isPlan) {
    const sorted = [...items].sort((a, b) => isPlan ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
    return `<ul class="activity-list">${sorted.map(item => {
      const workout = findWorkout(item.workout);
      const actions = isPlan ? `<div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-secondary" type="button" data-action="complete" data-id="${item.id}">Выполнено</button>
        <button class="btn btn-outline-secondary" type="button" data-action="remove" data-id="${item.id}">Убрать</button></div>` : '';
      return `<li><div><a href="${workoutUrl(workout.id)}">${workout.title}</a>
        <small><time datetime="${item.date}">${displayDate(item.date)}</time> · ${workout.minutes} мин</small></div>${actions}</li>`;
    }).join('')}</ul>`;
  }

  function refresh(data = getActivity(profile)) {
    const minutes = data.completed.reduce((sum, entry) => sum + findWorkout(entry.workout).minutes, 0);
    activity.innerHTML = `
      <dl class="metrics">
        <div><dt>Выполнено</dt><dd>${data.completed.length}</dd></div>
        <div><dt>Минут занятий</dt><dd>${minutes}</dd></div>
        <div><dt>В плане</dt><dd>${data.plan.length}</dd></div>
      </dl>
      <section class="mb-5" aria-labelledby="plan-heading">
        <div class="section-bar"><h2 id="plan-heading">План тренировок</h2><button type="button" id="add-plan" class="btn btn-primary">Добавить в план</button></div>
        ${data.plan.length ? list(data.plan, true) : '<p class="empty">В плане пока нет тренировок.</p>'}
      </section>
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" class="mb-3">История занятий</h2>
        ${data.completed.length ? list(data.completed, false) : '<p class="empty">Здесь появятся выполненные тренировки.</p>'}
      </section>`;
  }

  const announce = message => { document.querySelector('#account-feedback').textContent = message; };
  activity.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'add-plan') {
      showPlan();
      return;
    }
    const { id, action } = button.dataset;
    const data = updateActivity(profile, current => {
      const item = current.plan.find(entry => entry.id === id);
      if (!item) return;
      if (action === 'complete') recordCompletion(current, item.workout);
      current.plan = current.plan.filter(entry => entry.id !== id);
    });
    refresh(data);
    document.querySelector('#add-plan').focus();
    announce(action === 'complete' ? 'Тренировка отмечена выполненной.' : 'Тренировка убрана из плана.');
  });

  on('#close-plan', 'click', () => dialog.close());
  form.addEventListener('submit', event => {
    event.preventDefault();
    const workout = form.elements.workout.value;
    const date = form.elements.date.value;
    let duplicate = false;
    const data = updateActivity(profile, current => {
      duplicate = current.plan.some(item => item.workout === workout && item.date === date);
      if (!duplicate) current.plan.push({ id: crypto.randomUUID(), workout, date });
    });
    dialog.close();
    refresh(data);
    document.querySelector('#add-plan').focus();
    announce(duplicate ? 'Эта тренировка уже есть в плане на выбранную дату.' : 'Тренировка добавлена в план.');
  });

  refresh();
  const requested = findWorkout(params.get('plan'));
  if (requested) {
    history.replaceState(null, '', 'account.html');
    showPlan(requested);
  }
}

if (page === 'index') renderCatalog();
if (page === 'workout') renderWorkout();
if (page === 'blog') renderBlog();
if (page === 'account') renderAccount();
if (page === 'login' || page === 'register') setupAuth();
