// Общие скрипты для всех страниц: хранилище, шапка, избранное, уведомления.

const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* приватный режим: просто не сохраняем */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
};

function currentUser() {
  return api.user;
}

function initials(name) {
  return String(name || '').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
}

// Правая часть шапки: «Войти» или аватар с меню
function renderHeaderAuth() {
  const slot = document.querySelector('[data-auth-slot]');
  if (!slot) return;
  const user = currentUser();
  if (!user) {
    slot.innerHTML = `
      <a class="btn btn-outline-primary" href="login.html">Войти</a>
      <a class="btn btn-primary d-none d-sm-inline-block" href="register.html">Регистрация</a>`;
    return;
  }
  slot.innerHTML = `
    <div class="dropdown">
      <button class="btn d-flex align-items-center gap-2 px-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Меню пользователя ${esc(user.name)}">
        <span class="avatar" aria-hidden="true">${initials(user.name)}</span>
        <span class="d-none d-md-inline">${esc(user.name.split(' ')[0])}</span>
        <svg class="icon small" aria-hidden="true"><use href="img/sprite.svg#chevron-down"></use></svg>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="profile.html">Личный кабинет</a></li>
        <li><a class="dropdown-item" href="profile.html#favorites">Избранное</a></li>
        <li><a class="dropdown-item" href="messages.html">Сообщения и сделки</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" type="button" data-logout>Выйти</button></li>
      </ul>
    </div>`;
  slot.querySelector('[data-logout]').addEventListener('click', () => api.logout());
}

// ---------- Избранное ----------
// Хранится на сервере в коллекции favorites, доступной только своему пользователю.
// Кэш в памяти, чтобы не дёргать сервер на каждую отрисовку карточки.

let favoritesCache = null;

async function loadFavorites(force = false) {
  if (!api.isLogged) return (favoritesCache = []);
  if (favoritesCache && !force) return favoritesCache;
  try {
    favoritesCache = await api.getMine('/favorites');
  } catch (e) {
    favoritesCache = [];
  }
  return favoritesCache;
}

function favoriteOf(listingId) {
  return (favoritesCache || []).find(f => Number(f.listingId) === Number(listingId));
}

async function toggleFavorite(listingId) {
  const existing = favoriteOf(listingId);
  if (existing) {
    await api.remove('/favorites', existing.id);
    favoritesCache = favoritesCache.filter(f => f.id !== existing.id);
    return false;
  }
  const created = await api.create('/favorites', { listingId: Number(listingId), userId: api.user.id });
  favoritesCache.push(created);
  return true;
}

function paintFavoriteButton(btn) {
  const active = Boolean(favoriteOf(btn.dataset.fav));
  btn.setAttribute('aria-pressed', String(active));
  btn.innerHTML = `<svg class="icon" aria-hidden="true"><use href="img/sprite.svg#${active ? 'heart-fill' : 'heart'}"></use></svg>`;
  btn.setAttribute('aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное');
}

function bindFavoriteButtons(root = document) {
  root.querySelectorAll('[data-fav]').forEach(btn => {
    paintFavoriteButton(btn);
    btn.onclick = async (e) => {
      e.preventDefault();
      if (!api.isLogged) {
        showToast('Войдите, чтобы сохранять объявления в избранное');
        return;
      }
      btn.disabled = true;
      try {
        const added = await toggleFavorite(btn.dataset.fav);
        document.querySelectorAll(`[data-fav="${btn.dataset.fav}"]`).forEach(paintFavoriteButton);
        showToast(added ? 'Добавили в избранное' : 'Убрали из избранного');
        document.dispatchEvent(new CustomEvent('favorites:change'));
      } catch (err) {
        reportError(err, 'favorites');
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// Карточка объявления (используется на главной, в поиске и в ЛК)
function listingCard(item, { row = false } = {}) {
  return `
    <article class="listing">
      <div class="listing-photo">
        <img src="img/${esc(item.img)}.webp" alt="${esc(item.title)}" loading="lazy" width="600" height="400">
        <button class="fav-btn" type="button" data-fav="${item.id}"></button>
        <span class="price-tag">${formatPrice(item.price)} <small>/ мес</small></span>
      </div>
      <div class="listing-body">
        <a class="listing-title" href="property.html?id=${item.id}">${esc(item.title)}</a>
        <div class="listing-meta">${esc(item.city)}, ${esc(item.district)} р-н</div>
        <div class="listing-meta"><svg class="icon" aria-hidden="true"><use href="img/sprite.svg#signpost-2"></use></svg> ${esc(item.metro)}</div>
        ${row ? `<p class="mb-1 small text-muted-2 d-none d-md-block">${esc(item.text.slice(0, 120))}…</p>` : ''}
        <div class="listing-facts">
          <span>${roomsLabel(item)}</span>
          <span>${item.area} м²</span>
          <span>${esc(item.floor)}</span>
          ${item.commission === 0 ? '<span class="chip">без комиссии</span>' : ''}
          ${item.pets ? '<span class="chip">можно с животными</span>' : ''}
        </div>
      </div>
    </article>`;
}

// Заглушки-скелетоны, пока идёт запрос
function skeletonCards(count = 6, wrapper = 'col-sm-6 col-lg-4') {
  return Array.from({ length: count }, () =>
    `<div class="${wrapper}"><div class="listing listing-skeleton" aria-hidden="true">
      <div class="listing-photo"></div>
      <div class="listing-body"><span class="sk sk-title"></span><span class="sk sk-line"></span><span class="sk sk-line short"></span></div>
    </div></div>`).join('');
}

// Всплывающие уведомления Bootstrap Toast
function showToast(text) {
  let box = document.querySelector('.toast-container');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = 'toast align-items-center app-toast border-0';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(text)}</div>
    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button></div>`;
  box.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 2800 });
  el.addEventListener('hidden.bs.toast', () => el.remove());
  toast.show();
}

// Валидация форм Bootstrap: подсветка полей и обработчик успеха.
// Текст ошибки связывается с полем через aria-describedby, иначе скринридер его не прочитает.
let errorIdCounter = 0;

function linkErrorMessages(form) {
  form.querySelectorAll('.invalid-feedback').forEach(msg => {
    const field = msg.parentElement.querySelector('input, select, textarea')
      || msg.previousElementSibling?.querySelector?.('input, select, textarea')
      || msg.parentElement.parentElement.querySelector('input, select, textarea');
    if (!field) return;
    if (!msg.id) msg.id = `err-${++errorIdCounter}`;
    const described = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!described.includes(msg.id)) {
      described.push(msg.id);
      field.setAttribute('aria-describedby', described.join(' '));
    }
  });
}

function markInvalidFields(form) {
  form.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.willValidate) field.setAttribute('aria-invalid', String(!field.checkValidity()));
  });
}

// Блокирует кнопку на время запроса, чтобы форму не отправили дважды
async function withPending(form, fn) {
  const button = form.querySelector('[type="submit"]');
  const label = button?.innerHTML;
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Отправляем…';
  }
  try {
    await fn();
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = label;
    }
  }
}

function bindValidation(form, onValid) {
  linkErrorMessages(form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');
    markInvalidFields(form);
    if (form.checkValidity()) {
      onValid(new FormData(form));
      return;
    }
    // Переводим фокус на первое поле с ошибкой, чтобы ошибку было слышно и видно
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) firstInvalid.focus();
  });
  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    form.querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
  });
}

// Счётчик непрочитанных в шапке. Для гостя его нет вовсе.
async function loadNavUnread() {
  const badge = document.querySelector('[data-nav-unread]');
  if (!badge || !api.isLogged) return;
  try {
    const dialogs = await api.getMine('/dialogs');
    const unread = dialogs.reduce((sum, d) => sum + (d.unread || 0), 0);
    badge.querySelector('[data-nav-unread-count]').textContent = unread;
    badge.classList.toggle('d-none', unread === 0);
  } catch (e) { /* счётчик не критичен */ }
}

// Откладывает вызов: пока пользователь печатает в поле цены,
// нет смысла отправлять запрос на каждую нажатую клавишу
function debounce(fn, ms = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Подсветка текущего пункта меню
function markActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-header .nav-link').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  renderHeaderAuth();
  markActiveNav();
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
  await loadFavorites();
  bindFavoriteButtons();
  loadNavUnread();
});
