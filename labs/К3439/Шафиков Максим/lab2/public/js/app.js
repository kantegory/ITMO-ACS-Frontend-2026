import {
  getProfile, register, login, logout, getWorkouts, getWorkout, getArticles, getArticle,
  getActivity, addPlan, removePlan, completePlan, completeWorkout, today,
} from './api.js';

const params = new URLSearchParams(location.search);
const page = document.body.dataset.page;
const workoutUrl = id => 'workout.html?id=' + encodeURIComponent(id);
const articleUrl = id => 'blog.html?id=' + encodeURIComponent(id);
const photoUrl = image => 'assets/images/' + encodeURIComponent(image) + '.webp';
const escapeHtml = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const on = (selector, event, listener) => document.querySelector(selector).addEventListener(event, listener);
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const displayDate = date => dateFormat.format(new Date(date + 'T12:00:00'));

function showError(container, error) {
  const message = document.createElement('p');
  message.className = 'form-error mt-3';
  message.setAttribute('role', 'alert');
  message.textContent = error.message;
  container.append(message);
}

function setupHeader(profile) {
  if (!profile) return;
  const actions = document.querySelector('#header-actions');
  actions.innerHTML = '<button class="btn btn-outline-secondary" type="button" id="logout"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#exit"></use></svg>Выйти</button>';
  on('#logout', 'click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    actions.querySelector('[role="alert"]')?.remove();
    try {
      await logout();
      location.assign('index.html');
    } catch (error) {
      showError(actions, error);
      button.disabled = false;
    }
  });
}

function workoutMeta(workout) {
  return `<div class="workout-meta"><span>${escapeHtml(workout.level)}</span><span>${escapeHtml(workout.minutes)} мин</span></div>`;
}

function renderCatalog(workouts) {
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
          <img data-photo="${escapeHtml(workout.image)}" src="${photoUrl(workout.image)}" alt="" width="512" height="512" loading="lazy">
          <div class="card-body">
            <p class="category">${escapeHtml(workout.type)}</p>
            <h3><a class="stretched-link" href="${workoutUrl(workout.id)}">${escapeHtml(workout.title)}</a></h3>
            <p>${escapeHtml(workout.description)}</p>
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

function renderWorkout(workout, profile, activity) {
  const root = document.querySelector('#workout');
  const back = '<a class="back-link" href="index.html#catalog">К каталогу тренировок</a>';
  if (!workout) {
    root.innerHTML = back + '<h1>Тренировка не найдена</h1>';
    return;
  }

  document.title = workout.title + ' — Качалочка';
  const source = 'https://www.youtube.com/watch?v=' + encodeURIComponent(workout.video);
  const completed = profile && activity.completed.some(item => item.workout === workout.id && item.date === today());
  const activityActions = profile ? `
    <button type="button" id="complete" class="btn btn-primary mt-3"${completed ? ' disabled' : ''}>${completed ? 'Выполнено сегодня' : 'Отметить выполненной'}</button>
    <a class="btn btn-outline-secondary mt-3" href="account.html?plan=${encodeURIComponent(workout.id)}"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#calendar"></use></svg>Добавить в план</a>
    <p id="workout-feedback" class="muted mt-3" role="status"></p>` :
    `<a class="btn btn-outline-secondary mt-3" href="login.html?workout=${encodeURIComponent(workout.id)}">Войти, чтобы сохранить прогресс</a>`;
  root.innerHTML = `${back}
    <div class="detail-top">
      <p class="category">${escapeHtml(workout.type)}</p>
      <h1>${escapeHtml(workout.title)}</h1>
      <p class="muted">${escapeHtml(workout.description)}</p>
      ${workoutMeta(workout)}
    </div>
    <div class="detail-layout">
      <section aria-label="Видео тренировки">
        <div class="video-panel" id="video-panel">
          <img data-photo="${escapeHtml(workout.image)}" src="${photoUrl(workout.image)}" alt="" width="512" height="512">
          <button type="button" class="btn btn-primary" id="video-play"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#play"></use></svg>Смотреть тренировку</button>
        </div>
        <p class="mt-2"><a href="${source}" target="_blank" rel="noopener">Открыть видео HASfit на YouTube</a></p>
      </section>
      <section class="guide">
        <h2>Как заниматься</h2>
        <p class="muted">Инвентарь · ${escapeHtml(workout.equipment)}</p>
        <ol>${workout.steps.map(step => '<li>' + escapeHtml(step) + '</li>').join('')}</ol>
        ${activityActions}
      </section>
    </div>`;
  on('#video-play', 'click', () => {
    const frame = document.createElement('iframe');
    frame.title = 'Видео тренировки: ' + workout.title;
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(workout.video) + '?autoplay=1&cc_load_policy=1';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    document.querySelector('#video-panel').replaceChildren(frame);
    frame.focus();
  });
  if (profile) {
    on('#complete', 'click', async event => {
      const button = event.currentTarget;
      const feedback = document.querySelector('#workout-feedback');
      if (button.getAttribute('aria-disabled') === 'true') return;
      button.setAttribute('aria-disabled', 'true');
      try {
        await completeWorkout(workout.id);
        button.textContent = 'Выполнено сегодня';
        feedback.textContent = 'Тренировка добавлена в историю.';
      } catch (error) {
        feedback.textContent = error.message;
        button.removeAttribute('aria-disabled');
      }
    });
  }
}

function renderBlog(articles, article) {
  const container = document.querySelector('#blog');
  const back = '<a class="back-link" href="blog.html">К списку статей</a>';
  if (article) {
    document.title = article.title + ' — Качалочка';
    container.innerHTML = `${back}<article class="article">
      <p class="category">${escapeHtml(article.topic)}</p>
      <h1 class="mt-2">${escapeHtml(article.title)}</h1><p class="muted">${escapeHtml(article.summary)}</p>
      <img src="${photoUrl(article.image)}" alt="" width="512" height="512">
      ${article.sections.map(([heading, text]) => `<section><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(text)}</p></section>`).join('')}
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
        <div><p class="category">${escapeHtml(item.topic)}</p><h2><a href="${articleUrl(item.id)}">${escapeHtml(item.title)}</a></h2><p class="muted">${escapeHtml(item.summary)}</p></div>
      </article>`).join('')}</div>`;
}

function setupAuth(profile, workout) {
  const form = document.querySelector('#auth-form');
  const signup = form.dataset.mode === 'register';
  const destination = workout ? workoutUrl(workout.id) : 'account.html';
  const error = document.querySelector('#auth-error');
  const alternate = document.querySelector('#auth-alternate');
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    error.textContent = '';
  });
  if (workout) alternate.href += '?workout=' + encodeURIComponent(workout.id);
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
      form.elements.name.setAttribute('aria-invalid', 'true');
      form.elements.name.focus();
      return;
    }

    button.disabled = true;
    try {
      if (signup) await register({ name, email, password });
      else await login({ email, password });
      location.assign(destination);
    } catch (failure) {
      error.textContent = failure.message;
      if (failure.status === 401 || failure.status === 409) {
        const invalid = failure.status === 409 ? form.elements.email : form.elements.password;
        invalid.setAttribute('aria-invalid', 'true');
        invalid.focus();
      }
    } finally {
      button.disabled = false;
    }
  });
}

function renderAccount(profile, workouts, initialActivity) {
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

  const findWorkout = id => workouts.find(workout => workout.id === id);
  const dialog = document.querySelector('#plan-dialog');
  const form = document.querySelector('#plan-form');
  const activity = document.querySelector('#activity');
  form.elements.workout.innerHTML = workouts.map(workout => `<option value="${escapeHtml(workout.id)}">${escapeHtml(workout.title)}</option>`).join('');

  function showPlan(workout) {
    form.reset();
    form.querySelector('#plan-error').textContent = '';
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
        <button class="btn btn-outline-secondary" type="button" data-action="complete" aria-label="Выполнено — ${escapeHtml(workout.title)}" data-id="${escapeHtml(item.id)}">Выполнено</button>
        <button class="btn btn-outline-secondary" type="button" data-action="remove" aria-label="Убрать из плана — ${escapeHtml(workout.title)}" data-id="${escapeHtml(item.id)}">Убрать</button></div>` : '';
      return `<li><div><a href="${workoutUrl(workout.id)}">${escapeHtml(workout.title)}</a>
        <small><time datetime="${escapeHtml(item.date)}">${displayDate(item.date)}</time> · ${escapeHtml(workout.minutes)} мин</small></div>${actions}</li>`;
    }).join('')}</ul>`;
  }

  function refresh(data) {
    const minutes = data.completed.reduce((sum, entry) => sum + findWorkout(entry.workout).minutes, 0);
    activity.innerHTML = `
      <dl class="metrics">
        <div><dt>Выполнено</dt><dd>${data.completed.length}</dd></div>
        <div><dt>Минут занятий</dt><dd>${minutes}</dd></div>
        <div><dt>В плане</dt><dd>${data.plan.length}</dd></div>
      </dl>
      <section class="mb-5" aria-labelledby="plan-heading">
        <div class="section-bar"><h2 id="plan-heading">План тренировок</h2><button type="button" id="add-plan" class="btn btn-primary"><svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#calendar"></use></svg>Добавить в план</button></div>
        ${data.plan.length ? list(data.plan, true) : '<p class="empty">В плане пока нет тренировок.</p>'}
      </section>
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" class="mb-3">История занятий</h2>
        ${data.completed.length ? list(data.completed, false) : '<p class="empty">Здесь появятся выполненные тренировки.</p>'}
      </section>`;
  }

  const announce = message => { document.querySelector('#account-feedback').textContent = message; };
  activity.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'add-plan') {
      showPlan();
      return;
    }
    const { id, action } = button.dataset;
    button.disabled = true;
    try {
      const data = await (action === 'complete' ? completePlan(id) : removePlan(id));
      refresh(data);
      document.querySelector('#add-plan').focus();
      announce(action === 'complete' ? 'Тренировка отмечена выполненной.' : 'Тренировка убрана из плана.');
    } catch (error) {
      announce(error.message);
      button.disabled = false;
    }
  });

  on('#close-plan', 'click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const feedback = form.querySelector('#plan-error');
    feedback.textContent = '';
    submit.disabled = true;
    try {
      const data = await addPlan({ workout: form.elements.workout.value, date: form.elements.date.value });
      dialog.close();
      refresh(data);
      document.querySelector('#add-plan').focus();
      announce('Тренировка добавлена в план.');
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });

  refresh(initialActivity);
  const requested = findWorkout(params.get('plan'));
  if (requested) {
    history.replaceState(null, '', 'account.html');
    showPlan(requested);
  }
}

async function start() {
  const main = document.querySelector('main');
  main.setAttribute('aria-busy', 'true');
  try {
    const profile = await getProfile();
    setupHeader(profile);
    if (page === 'index') {
      renderCatalog(await getWorkouts());
    } else if (page === 'workout') {
      const [workout, activity] = await Promise.all([
        getWorkout(params.get('id')), profile ? getActivity() : null,
      ]);
      renderWorkout(workout, profile, activity);
    } else if (page === 'blog') {
      if (params.has('id')) renderBlog([], await getArticle(params.get('id')));
      else renderBlog(await getArticles(), null);
    } else if (page === 'account') {
      const [workouts, activity] = profile ? await Promise.all([getWorkouts(), getActivity()]) : [];
      renderAccount(profile, workouts, activity);
    } else {
      setupAuth(profile, await getWorkout(params.get('workout')));
    }
  } catch (error) {
    showError(main.querySelector('.page-content, .catalog') ?? main, error);
  } finally {
    main.removeAttribute('aria-busy');
  }
}

start();
