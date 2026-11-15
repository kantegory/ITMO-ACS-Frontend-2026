// Общие скрипты для всех страниц: состояние входа, избранное, уведомления.

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
  return storage.get('klyuchi:user', null);
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
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
      <button class="btn d-flex align-items-center gap-2 px-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <span class="avatar" aria-hidden="true">${initials(user.name)}</span>
        <span class="d-none d-md-inline">${user.name.split(' ')[0]}</span>
        <i class="bi bi-chevron-down small" aria-hidden="true"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="profile.html">Личный кабинет</a></li>
        <li><a class="dropdown-item" href="profile.html#favorites">Избранное</a></li>
        <li><a class="dropdown-item" href="messages.html">Сообщения и сделки</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" type="button" data-logout>Выйти</button></li>
      </ul>
    </div>`;
  slot.querySelector('[data-logout]').addEventListener('click', () => {
    storage.remove('klyuchi:user');
    window.location.href = 'index.html';
  });
}

// Избранное хранится в localStorage как массив id
function getFavorites() {
  return storage.get('klyuchi:favorites', []);
}

function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id); else favs.splice(idx, 1);
  storage.set('klyuchi:favorites', favs);
  return idx === -1;
}

function bindFavoriteButtons(root = document) {
  const favs = getFavorites();
  root.querySelectorAll('[data-fav]').forEach(btn => {
    const id = Number(btn.dataset.fav);
    const active = favs.includes(id);
    btn.setAttribute('aria-pressed', String(active));
    btn.innerHTML = `<i class="bi ${active ? 'bi-heart-fill' : 'bi-heart'}" aria-hidden="true"></i>`;
    btn.setAttribute('aria-label', active ? 'Убрать из избранного' : 'Добавить в избранное');
    btn.onclick = (e) => {
      e.preventDefault();
      const added = toggleFavorite(id);
      bindFavoriteButtons(root);
      showToast(added ? 'Добавили в избранное' : 'Убрали из избранного');
      document.dispatchEvent(new CustomEvent('favorites:change'));
    };
  });
}

// Карточка объявления (используется на главной, в поиске и в ЛК)
function listingCard(item, { row = false } = {}) {
  return `
    <article class="listing">
      <div class="listing-photo">
        <img src="img/${item.img}.webp" alt="${item.title}" loading="lazy" width="600" height="400">
        <button class="fav-btn" type="button" data-fav="${item.id}"></button>
        <span class="price-tag">${formatPrice(item.price)} <small>/ мес</small></span>
      </div>
      <div class="listing-body">
        <a class="listing-title" href="property.html?id=${item.id}">${item.title}</a>
        <div class="listing-meta">${item.city}, ${item.district} р-н</div>
        <div class="listing-meta"><i class="bi bi-signpost-2" aria-hidden="true"></i> ${item.metro}</div>
        ${row ? `<p class="mb-1 small text-muted-2 d-none d-md-block">${item.text.slice(0, 120)}…</p>` : ''}
        <div class="listing-facts">
          <span>${roomsLabel(item)}</span>
          <span>${item.area} м²</span>
          <span>${item.floor}</span>
          ${item.commission === 0 ? '<span class="chip">без комиссии</span>' : ''}
          ${item.pets ? '<span class="chip">можно с животными</span>' : ''}
        </div>
      </div>
    </article>`;
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
  el.className = 'toast align-items-center text-bg-dark border-0';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${text}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button></div>`;
  box.appendChild(el);
  const toast = new bootstrap.Toast(el, { delay: 2500 });
  el.addEventListener('hidden.bs.toast', () => el.remove());
  toast.show();
}

// Валидация форм Bootstrap: подсветка полей и обработчик успеха
function bindValidation(form, onValid) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    form.classList.add('was-validated');
    if (form.checkValidity()) onValid(new FormData(form));
  });
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

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAuth();
  markActiveNav();
  bindFavoriteButtons();
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
});
