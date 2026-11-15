// Личный кабинет. Страница только для своих: без токена уходим на вход.

if (api.requireLogin()) init();

const STATUS_VIEW = {
  active: ['status-ok', 'Договор действует'],
  new: ['status-info', 'Новая заявка'],
  confirmed: ['status-ok', 'Подтверждена']
};

function fillUser(user) {
  document.querySelector('[data-user-name]').textContent = user.name;
  document.querySelector('[data-user-email]').textContent = user.email;
  document.querySelector('[data-user-initials]').textContent = initials(user.name);
  document.querySelector('[data-user-since]').textContent = monthYear(user.since, { of: true });
  document.querySelector('[data-verified]').classList.toggle('d-none', !user.verified);
  document.getElementById('set-name').value = user.name;
  document.getElementById('set-email').value = user.email;
  document.getElementById('set-phone').value = user.phone || '';
}

// ---------- Я снимаю ----------
function renderCurrentRental(rental, listing) {
  const box = document.getElementById('rent-current');
  if (!rental) {
    box.innerHTML = '<div class="empty-state"><h3 class="fs-5">Сейчас вы ничего не снимаете</h3><p class="text-muted-2">Загляните в поиск — там 12 вариантов.</p><a class="btn btn-primary" href="search.html">Перейти к поиску</a></div>';
    return;
  }
  const percent = Math.round(rental.monthsDone / rental.monthsTotal * 100);
  const total = rental.price + (rental.utilities || 0);
  box.innerHTML = `
    <article class="rent-card mb-4">
      <img src="img/${esc(listing.img)}.webp" alt="${esc(listing.title)}" width="520" height="347">
      <div class="rent-card-body">
        <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
          <h3 class="m-0"><a href="property.html?id=${listing.id}" class="text-reset text-decoration-none">${esc(listing.title)}</a></h3>
          <span class="status status-ok">Договор действует</span>
        </div>
        <p class="text-muted-2 mb-3">${esc(listing.city)}, ${esc(listing.address)}</p>
        <div class="row g-3 mb-3">
          <div class="col-6 col-md-3"><div class="small text-muted-2">Плата</div><div class="fw-semibold">${formatPrice(rental.price)}</div></div>
          <div class="col-6 col-md-3"><div class="small text-muted-2">Следующий платёж</div><div class="fw-semibold">${esc(rental.nextPayment)}</div></div>
          <div class="col-6 col-md-3"><div class="small text-muted-2">Депозит у сервиса</div><div class="fw-semibold">${formatPrice(rental.deposit)}</div></div>
          <div class="col-6 col-md-3"><div class="small text-muted-2">Договор до</div><div class="fw-semibold">${esc(rental.until)}</div></div>
        </div>
        <div class="mb-1 d-flex justify-content-between small"><span>Прожито ${rental.monthsDone} из ${rental.monthsTotal} месяцев</span><span>${percent}%</span></div>
        <div class="progress mb-3" role="progressbar" aria-label="Срок договора" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width: ${percent}%"></div></div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#payModal"
                  data-pay-rent="${rental.price}" data-pay-utilities="${rental.utilities || 0}" data-pay-total="${total}">Оплатить ноябрь</button>
          <a class="btn btn-outline-secondary" href="messages.html">Написать владельцу</a>
          <button class="btn btn-outline-secondary" type="button" data-toast="Договор скачан в формате PDF">Скачать договор</button>
        </div>
      </div>
    </article>`;
}

function renderPastRentals(rows, listingById) {
  document.getElementById('rent-past').innerHTML = rows.length
    ? rows.map(r => {
      const l = listingById.get(r.listingId);
      return `<tr>
        <td class="ps-3">${esc(l ? l.title : 'Объект')}</td>
        <td>${esc(r.period)}</td>
        <td>${formatPrice(r.price)}</td>
        <td>${r.depositReturned ? '<span class="status status-ok">Возвращён</span>' : '<span class="status status-warn">Ждём</span>'}</td>
        <td class="pe-3">${r.rating
          ? `<svg class="icon text-warning" aria-hidden="true"><use href="img/sprite.svg#star-fill"></use></svg> ${r.rating}`
          : '<button class="btn btn-sm btn-outline-primary" type="button" data-toast="Форма отзыва появится позже">Оставить</button>'}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="5" class="text-center text-muted-2 py-4">Раньше вы ничего не снимали</td></tr>';
}

// ---------- Я сдаю ----------
function renderMyListings(rows) {
  document.getElementById('my-listings').innerHTML = rows.length
    ? rows.map(l => `<tr>
        <td class="ps-3"><div class="d-flex align-items-center gap-2">
          <img src="img/${esc(l.img)}.webp" alt="" width="72" height="48" class="rounded" style="object-fit:cover">
          <div><a href="property.html?id=${l.id}">${esc(l.title)}</a><div class="small text-muted-2">${esc(l.city)}, ${esc(l.district)} р-н</div></div>
        </div></td>
        <td><span class="status status-info">Опубликовано</span></td>
        <td>${formatPrice(l.price)}</td>
        <td class="pe-3 text-end">
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Действия с объявлением «${esc(l.title)}»"><svg class="icon" aria-hidden="true"><use href="img/sprite.svg#three-dots"></use></svg></button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="property.html?id=${l.id}">Открыть объявление</a></li>
              <li><button class="dropdown-item" type="button" data-raise="${l.id}">Поднять в поиске</button></li>
              <li><button class="dropdown-item text-danger" type="button" data-unpublish="${l.id}">Снять с публикации</button></li>
            </ul>
          </div>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="4" class="text-center text-muted-2 py-4">У вас пока нет объявлений</td></tr>';

  // Поднять в поиске — настоящий PATCH: меняем дату публикации
  document.querySelectorAll('[data-raise]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await api.update('/listings', btn.dataset.raise, { posted: new Date().toISOString().slice(0, 10) });
      showToast('Объявление поднято в поиске');
      loadLandlord();
    } catch (e) { reportError(e, 'raise'); }
  }));

  // Снять с публикации — настоящий DELETE
  document.querySelectorAll('[data-unpublish]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Снять объявление с публикации? Его больше не будет в поиске.')) return;
    try {
      await api.remove('/listings', btn.dataset.unpublish);
      showToast('Объявление снято с публикации');
      loadLandlord();
    } catch (e) { reportError(e, 'unpublish'); }
  }));
}

function renderRequests(rows, listingById) {
  document.getElementById('requests').innerHTML = rows.length
    ? rows.map(r => {
      const l = listingById.get(r.listingId);
      const when = new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      const [cls, label] = STATUS_VIEW[r.status] || ['status-info', r.status];
      return `<div class="col-md-6">
        <article class="panel h-100">
          <div class="d-flex gap-3 align-items-center mb-2">
            <span class="avatar" aria-hidden="true">${initials(r.name)}</span>
            <div><strong>${esc(r.name)}</strong><div class="small text-muted-2">${esc(l ? l.title : 'объект')}, ${when} в ${esc(r.time)}</div></div>
          </div>
          <p class="mb-3">${esc(r.comment)}</p>
          <div class="d-flex gap-2 align-items-center">
            ${r.status === 'new'
              ? `<button class="btn btn-primary btn-sm" type="button" data-confirm="${r.id}">Подтвердить</button>
                 <button class="btn btn-outline-secondary btn-sm" type="button" data-toast="Предложили другое время">Другое время</button>`
              : `<span class="status ${cls}">${label}</span>`}
          </div>
        </article>
      </div>`;
    }).join('')
    : '<div class="col-12"><p class="text-muted-2">Заявок на просмотр пока нет.</p></div>';

  document.querySelectorAll('[data-confirm]').forEach(btn => btn.addEventListener('click', async () => {
    try {
      await api.update('/requests', btn.dataset.confirm, { status: 'confirmed' });
      showToast('Просмотр подтверждён');
      loadLandlord();
    } catch (e) { reportError(e, 'confirm'); }
  }));
}

// ---------- Избранное ----------
async function renderFavorites() {
  const list = document.getElementById('fav-list');
  list.innerHTML = skeletonCards(3);
  try {
    const favs = await api.getMine('/favorites', { _expand: 'listing' });
    const items = favs.map(f => f.listing).filter(Boolean);
    list.innerHTML = items.map(l => `<div class="col-sm-6 col-lg-4">${listingCard(l)}</div>`).join('');
    document.getElementById('fav-empty').classList.toggle('d-none', items.length > 0);
    document.querySelector('[data-fav-count]').textContent = items.length;
    bindFavoriteButtons(list);
  } catch (e) {
    list.innerHTML = '';
    reportError(e, 'favorites');
  }
}

// ---------- Загрузка вкладок ----------
let listingById = new Map();

async function loadTenant() {
  const rentals = await api.getMine('/rentals', { _expand: 'listing' });
  rentals.forEach(r => r.listing && listingById.set(r.listingId, r.listing));
  const current = rentals.find(r => r.status === 'active');
  renderCurrentRental(current, current?.listing);
  renderPastRentals(rentals.filter(r => r.status === 'past'), listingById);
}

async function loadLandlord() {
  const [mine, requests] = await Promise.all([
    api.getList('/listings', { userId: api.user.id }),
    api.getMine('/requests', { _expand: 'listing' })
  ]);
  mine.forEach(l => listingById.set(l.id, l));
  requests.forEach(r => r.listing && listingById.set(r.listingId, r.listing));
  renderMyListings(mine);
  renderRequests(requests, listingById);
  document.querySelector('[data-listing-count]').textContent = mine.length;
  const income = mine.reduce((sum, l) => sum + l.price, 0) * 12;
  document.querySelector('[data-income]').textContent = formatPrice(income);
}

// ---------- Формы ----------
function bindForms() {
  const settingsForm = document.getElementById('settings-form');
  bindValidation(settingsForm, () => withPending(settingsForm, async () => {
    try {
      const updated = await api.update('/users', api.user.id, {
        name: document.getElementById('set-name').value.trim(),
        email: document.getElementById('set-email').value.trim().toLowerCase(),
        phone: document.getElementById('set-phone').value.trim()
      });
      const { password, ...safe } = updated;
      storage.set('klyuchi:user', safe);
      renderHeaderAuth();
      fillUser(safe);
      showToast('Изменения сохранены');
    } catch (e) {
      reportError(e, 'settings');
    }
  }));

  const listingForm = document.getElementById('listing-form');
  bindValidation(listingForm, (data) => withPending(listingForm, async () => {
    try {
      const typeMap = { 'Квартира': 'flat', 'Студия': 'studio', 'Комната': 'room', 'Дом': 'house' };
      const rooms = Number(data.get('rooms'));
      const price = Number(data.get('price'));
      await api.create('/listings', {
        userId: api.user.id,
        type: typeMap[data.get('type')] || 'flat',
        rooms, area: Number(data.get('area')), price,
        deposit: price, commission: 0,
        city: data.get('city'), district: '—', metro: '—',
        address: data.get('address').trim(),
        title: data.get('title').trim(),
        text: data.get('text').trim() || 'Описание появится позже.',
        floor: '—', built: new Date().getFullYear(),
        img: 'flat-1', photos: ['flat-1'],
        pets: data.has('pets'), kids: data.has('kids'),
        furniture: true, balcony: false,
        lat: 59.9343, lng: 30.3351,
        posted: new Date().toISOString().slice(0, 10)
      });
      bootstrap.Modal.getInstance(document.getElementById('newListingModal')).hide();
      listingForm.reset();
      listingForm.classList.remove('was-validated');
      showToast('Объявление опубликовано');
      loadLandlord();
      bootstrap.Tab.getOrCreateInstance(document.getElementById('tab-landlord')).show();
    } catch (e) {
      reportError(e, 'new-listing');
    }
  }));

  // Кнопки-заглушки показывают уведомление
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toast]');
    if (btn) showToast(btn.dataset.toast);
  });

  // Сумма в окне оплаты берётся из текущей аренды
  document.getElementById('payModal').addEventListener('show.bs.modal', (e) => {
    const src = e.relatedTarget;
    if (!src) return;
    const rent = Number(src.dataset.payRent), util = Number(src.dataset.payUtilities), total = Number(src.dataset.payTotal);
    document.querySelector('[data-pay-rent]').textContent = formatPrice(rent);
    document.querySelector('[data-pay-util]').textContent = formatPrice(util);
    document.querySelectorAll('[data-pay-total]').forEach(el => { el.textContent = formatPrice(total); });
    document.querySelector('[data-pay-button]').dataset.toast = `Оплата ${formatPrice(total)} прошла`;
  });
}

function bindTabs() {
  const tabByHash = { '#landlord': 'tab-landlord', '#favorites': 'tab-favorites', '#settings': 'tab-settings' };
  if (tabByHash[location.hash]) {
    bootstrap.Tab.getOrCreateInstance(document.getElementById(tabByHash[location.hash])).show();
  }
  document.querySelectorAll('.profile-tabs [data-bs-toggle="tab"]').forEach(btn => {
    btn.addEventListener('shown.bs.tab', () => {
      const hash = Object.keys(tabByHash).find(h => tabByHash[h] === btn.id) || '';
      history.replaceState(null, '', `profile.html${hash}`);
    });
  });
}

async function init() {
  document.addEventListener('DOMContentLoaded', async () => {
    fillUser(api.user);
    bindTabs();
    bindForms();
    document.addEventListener('favorites:change', renderFavorites);
    try {
      await Promise.all([loadTenant(), loadLandlord(), renderFavorites()]);
    } catch (e) {
      reportError(e, 'profile');
    }
  });
}
