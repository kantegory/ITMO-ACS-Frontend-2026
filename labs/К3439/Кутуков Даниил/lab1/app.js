import { cuisines, districts, formatDate, formatPrice, historyByDate, priceOptions, times, today } from './catalog.js';
import { enhance } from './enhance.js';
import { icon } from './icons.js';
import { service } from './service.js';

const find = id => document.getElementById(id);
const page = document.body.dataset.page;
const params = new URLSearchParams(location.search);
const restaurantLink = id => './restaurant.html?id=' + encodeURIComponent(id);
const localTarget = location.pathname.split('/').pop() + location.search;
const loginLink = target => './login.html?next=' + encodeURIComponent(target);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function setError(element, message = '') {
  element.textContent = message;
  element.hidden = !message;
}

function options(element, values) {
  for (const value of values) element.add(new Option(value.label ?? value, value.value ?? value));
}

function protectedUser() {
  const user = service.currentUser();
  if (!user) location.replace(loginLink(localTarget));
  return user;
}

function renderCard(restaurant) {
  return `<div class="col"><article class="restaurant-card panel">
    <img src="./assets/${encodeURIComponent(restaurant.image)}" alt="${escapeHtml(restaurant.imageAlt)}" width="760" height="507" loading="lazy">
    <div class="card-body">
      <div class="card-title-row"><h3><a class="stretched-link" href="${restaurantLink(restaurant.id)}">${escapeHtml(restaurant.name)}</a></h3><span class="rating">${icon('star')} <span class="visually-hidden">Оценка из 5 </span>${restaurant.rating.toFixed(1).replace('.', ',')}</span></div>
      <p class="card-meta">${escapeHtml(restaurant.cuisine)} · ${escapeHtml(restaurant.district)} район</p>
      <p class="card-price">${formatPrice(restaurant.price)} / человек</p>
    </div></article></div>`;
}

async function searchPage() {
  const form = find('filters');
  const list = find('restaurant-list');
  const status = find('catalog-status');
  options(find('cuisine'), cuisines);
  options(find('district'), districts);
  options(find('price'), priceOptions);
  let latest = 0;
  async function update() {
    const request = ++latest;
    const filters = Object.fromEntries(new FormData(form));
    list.setAttribute('aria-busy', 'true');
    try {
      const items = await service.list(filters);
      if (request !== latest) return;
      list.innerHTML = items.length ? items.map(renderCard).join('') :
        '<p class="panel empty-state">Попробуйте изменить запрос или сбросить фильтры.</p>';
      status.textContent = items.length ? 'Найдено: ' + items.length : 'Ресторанов не найдено';
    } catch (error) {
      if (request !== latest) return;
      list.replaceChildren();
      status.textContent = error.message;
    } finally {
      if (request === latest) list.removeAttribute('aria-busy');
    }
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  form.addEventListener('reset', () => setTimeout(update));
  await update();
}

function renderDetail(item) {
  return `<div class="detail-top">
      <div>
        <p class="location">${icon('pin')} ${escapeHtml(item.district)} район</p>
        <h1>${escapeHtml(item.name)}</h1>
        <p class="rating">${icon('star')} <span class="visually-hidden">Оценка из 5 </span>${item.rating.toFixed(1).replace('.', ',')} <span class="muted">· отзывов: ${item.reviewCount}</span></p>
        <p>${escapeHtml(item.summary)}</p>
        <p class="muted">${escapeHtml(item.address)} · ${escapeHtml(item.hours)}<br>Средний чек: ${formatPrice(item.price)}</p>
        <button type="button" class="btn btn-primary" id="open-booking">${icon('calendar')} Забронировать столик</button>
      </div>
      <img src="./assets/${encodeURIComponent(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="760" height="507">
    </div>
    <section class="detail-section" aria-labelledby="photos-title"><h2 id="photos-title">Фото</h2>
      <div class="detail-photos row g-3"><div class="col-sm-6"><img src="./assets/menu.jpg" alt="Пример подачи блюда с зеленью и овощами" width="760" height="507" loading="lazy"></div><div class="col-sm-6"><img src="./assets/room.jpg" alt="Пример сервировки стола" width="760" height="507" loading="lazy"></div></div>
    </section>
    <section class="detail-section" aria-labelledby="menu-title"><h2 id="menu-title">Меню</h2><ul class="menu-list">${item.menu.map(dish => `<li><span>${escapeHtml(dish.name)}</span><strong>${formatPrice(dish.price)}</strong></li>`).join('')}</ul></section>
    <section class="detail-section" aria-labelledby="reviews-title"><h2 id="reviews-title">Отзывы</h2><ul class="review-list">${item.reviews.map(review => `<li class="panel"><strong>${escapeHtml(review.author)}</strong> <span class="rating">${icon('star')} ${review.rating} из 5</span><blockquote>${escapeHtml(review.text)}</blockquote></li>`).join('')}</ul></section>`;
}

async function restaurantPage() {
  const status = find('restaurant-status');
  const item = await service.getRestaurant(params.get('id'));
  if (!item) {
    status.outerHTML = '<h1>Ресторан не найден</h1>';
    return;
  }
  status.hidden = true;
  document.title = item.name + ' · Столик';
  find('restaurant-detail').innerHTML = renderDetail(item);
  const dialog = find('booking-dialog');
  const form = find('booking-form');
  const error = find('booking-error');
  options(find('time'), times);
  find('date').min = today();
  find('date').value = today();
  find('open-booking').addEventListener('click', () => {
    if (!protectedUser()) return;
    setError(error);
    dialog.showModal();
  });
  find('close-booking').addEventListener('click', () => dialog.close());
  onSubmit(form, error, async ({ date, time, guests }) => {
    await service.book({ restaurantId: item.id, date, time, guests: Number(guests) });
    location.assign('./history.html?created=1');
  });
}

function onSubmit(form, error, action) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter ?? form.querySelector('button[type="submit"]');
    const data = Object.fromEntries(new FormData(form));
    setError(error);
    button.disabled = true;
    try { await action(data); } catch (failure) {
      if (failure.status === 401 && page === 'restaurant') {
        location.assign(loginLink(localTarget));
        return;
      }
      setError(error, failure.message);
      if (error.hasAttribute('tabindex')) error.focus();
    } finally { button.disabled = false; }
  });
}

function authPage() {
  const next = params.get('next') ?? '';
  const target = /^(index|restaurant|account|history)\.html(\?[^#]*)?$/.test(next) ? next : 'account.html';
  if (service.currentUser()) {
    location.replace('./' + target);
    return;
  }
  if (next) find('auth-alternate').search = new URLSearchParams({ next: target }).toString();
  onSubmit(find('auth-form'), find('form-error'), async data => {
    if (page === 'register' && !data.name.trim()) throw new Error('Введите ваше имя.');
    await service[page](data);
    location.assign('./' + target);
  });
}

function accountPage() {
  const user = protectedUser();
  if (!user) return;
  find('profile-name').textContent = user.name;
  find('profile-email').textContent = user.email;
  find('profile-data').hidden = false;
  find('account-actions').hidden = false;
  find('logout').addEventListener('click', async () => {
    try { await service.logout(); }
    catch (error) { find('account-status').textContent = error.message; }
    finally { location.assign('./index.html'); }
  });
}

async function historyPage() {
  if (!protectedUser()) return;
  const list = find('booking-list');
  const status = find('history-status');
  const [bookings, restaurants] = await Promise.all([service.getBookings(), service.list({})]);
  const restaurantNames = new Map(restaurants.map(item => [item.id, item.name]));
  if (!bookings.length) {
    status.textContent = 'Здесь появятся ваши бронирования.';
    return;
  }
  status.textContent = params.has('created') ? 'Столик забронирован.' : '';
  for (const booking of historyByDate(bookings)) {
    const title = restaurantNames.get(booking.restaurantId) ?? 'Ресторан';
    const canCancel = !booking.cancelled && new Date(booking.date + 'T' + booking.time) > new Date();
    const item = document.createElement('li');
    item.className = 'panel';
    item.innerHTML = `<div><h2><a href="${restaurantLink(booking.restaurantId)}">${escapeHtml(title)}</a></h2><p class="muted mb-0">${formatDate(booking.date)}, ${escapeHtml(booking.time)} · гостей: ${booking.guests}</p></div>
      <div class="action-row"><span class="booking-status">${booking.cancelled ? 'Отменено' : canCancel ? 'Подтверждено' : 'Завершено'}</span>
      ${canCancel ? '<button type="button" class="btn btn-outline-primary">Отменить бронь</button>' : ''}</div>`;
    item.querySelector('button')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await service.cancel(booking.id);
        item.querySelector('.booking-status').textContent = 'Отменено';
        status.textContent = 'Бронь отменена.';
        button.remove();
        if (status.hasAttribute('tabindex')) status.focus();
      } catch (error) {
        status.textContent = error.message;
        button.disabled = false;
      }
    });
    list.append(item);
  }
}

async function start() {
  const account = find('account-link');
  if (service.currentUser()) {
    account.href = './account.html';
    account.querySelector('span').textContent = 'Кабинет';
  }
  const current = { search: 'index', history: 'history', account: 'account', login: 'login' }[page];
  if (current) document.querySelector('.site-header a[href="./' + current + '.html"]:not(.wordmark)')?.setAttribute('aria-current', 'page');
  enhance();
  try {
    await ({ search: searchPage, restaurant: restaurantPage, login: authPage, register: authPage, account: accountPage, history: historyPage }[page])();
  } catch (error) {
    if (error.status === 401 && (page === 'account' || page === 'history')) {
      location.replace(loginLink(localTarget));
      return;
    }
    const status = find(page + '-status');
    if (status) { status.hidden = false; status.textContent = error.message; }
    else console.error(error);
  }
}

start();
