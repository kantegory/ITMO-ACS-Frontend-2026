// Личный кабинет: профиль, статистика, ближайшая бронь, избранное и уведомления — всё из API

let currentUser = null;

// Бронь со статусом «подтверждена/ожидает», дата которой уже прошла, считаем завершённой
function bookingGroup(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'completed' || booking.date < todayISO()) return 'completed';
  return 'upcoming';
}

function renderProfile(user) {
  currentUser = user;
  saveUser(user);
  renderAuthState();

  document.querySelector('#memberSince').textContent = `С нами с ${formatDate(user.createdAt, { year: true })}`;

  const form = document.querySelector('#notificationsForm');
  const notifications = user.notifications ?? {};
  form.elements.email.checked = Boolean(notifications.email);
  form.elements.sms.checked = Boolean(notifications.sms);
  form.elements.news.checked = Boolean(notifications.news);
  form.elements.remindBefore.value = String(notifications.remindBefore ?? 2);
}

function renderNextBooking(bookings) {
  const container = document.querySelector('#nextBooking');
  const next = bookings
    .filter((b) => bookingGroup(b) === 'upcoming')
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];

  if (!next) {
    container.innerHTML = '<p class="text-muted-warm mb-0">Предстоящих броней нет. <a href="search.html">Выберите ресторан</a> на вечер.</p>';
    return;
  }

  const confirmed = next.status === 'confirmed';
  container.innerHTML = `
    <div class="next-booking">
      <img src="${next.restaurant.image}" alt="" width="160" height="120">
      <div>
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <h3 class="h5 mb-0"><a href="restaurant.html?id=${next.restaurantId}">${escapeHtml(next.restaurant.name)}</a></h3>
          <span class="badge ${confirmed ? 'text-bg-success' : 'text-bg-warning'}">${confirmed ? 'Подтверждено' : 'Ожидает подтверждения'}</span>
        </div>
        <ul class="meta-list mb-3">
          <li>${ICONS.calendar}<time datetime="${next.date}T${next.time}">${formatDate(next.date, { year: true })}, ${next.time}</time></li>
          <li>${ICONS.users}${pluralGuests(next.guests)}</li>
          <li>${ICONS.pin}${escapeHtml(next.restaurant.address)}</li>
        </ul>
        <div class="d-flex flex-wrap gap-2">
          <a class="btn btn-sm btn-primary" href="restaurant.html?id=${next.restaurantId}">Страница ресторана</a>
          <a class="btn btn-sm btn-outline-primary" href="bookings.html">Управлять бронью</a>
        </div>
      </div>
    </div>`;
}

function renderFavorites(favorites, cuisines) {
  const list = document.querySelector('#favoritesList');
  const cuisineNames = Object.fromEntries(cuisines.map((c) => [c.id, c.name]));

  list.innerHTML = favorites.map(({ id, restaurant }) => `
    <div class="col" data-favorite-id="${id}">
      <article class="favorite-card">
        <img src="${restaurant.image}" alt="" width="64" height="64">
        <div class="flex-grow-1">
          <h3 class="h6 mb-1"><a href="restaurant.html?id=${restaurant.id}">${escapeHtml(restaurant.name)}</a></h3>
          <p class="small text-muted-warm mb-0">${escapeHtml(cuisineNames[restaurant.cuisineId])} · м. ${escapeHtml(restaurant.metro)}</p>
        </div>
        <button class="btn btn-sm btn-light favorite-remove" type="button" data-remove-favorite aria-label="Убрать «${escapeHtml(restaurant.name)}» из избранного">${ICONS.close}</button>
      </article>
    </div>`).join('');
  updateFavoritesCount();
}

function updateFavoritesCount() {
  const count = document.querySelector('#favoritesList').children.length;
  document.querySelector('#statFavorites').textContent = count;
  document.querySelector('#favoritesEmpty').classList.toggle('d-none', count > 0);
}

async function loadProfile() {
  const { id } = getUser();
  document.querySelector('#nextBooking').innerHTML = loaderHtml();
  document.querySelector('#favoritesList').innerHTML = `<div class="col-12">${loaderHtml()}</div>`;

  try {
    const [user, bookings, reviews, favorites, cuisines] = await Promise.all([
      api.get(`/users/${id}`),
      api.getOwnList(`/bookings?userId=${id}&_expand=restaurant`),
      api.get(`/reviews?userId=${id}`),
      api.getOwnList(`/favorites?userId=${id}&_expand=restaurant`),
      api.get('/cuisines'),
    ]);

    renderProfile(user);
    renderNextBooking(bookings);
    renderFavorites(favorites, cuisines);
    document.querySelector('#statVisits').textContent = bookings.filter((b) => bookingGroup(b) === 'completed').length;
    document.querySelector('#statReviews').textContent = reviews.length;
  } catch (error) {
    document.querySelector('#nextBooking').innerHTML = errorHtml(error.message);
    document.querySelector('#favoritesList').innerHTML = '';
  }
}

function initEditProfile() {
  const modalEl = document.querySelector('#editProfileModal');
  const form = document.querySelector('#editProfileForm');

  modalEl.addEventListener('show.bs.modal', () => {
    form.elements.name.value = currentUser.name;
    form.elements.email.value = currentUser.email;
    form.elements.phone.value = currentUser.phone ?? '';
    form.elements.birthday.value = currentUser.birthday ?? '';
    form.classList.remove('was-validated');
    showFormError(form, '');
  });

  onValidSubmit(form, async (data) => {
    try {
      const user = await api.patch(`/users/${currentUser.id}`, {
        name: data.get('name').trim(),
        email: data.get('email').trim().toLowerCase(),
        phone: data.get('phone').trim(),
        birthday: data.get('birthday'),
      });
      renderProfile(user);
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      showToast('Профиль сохранён');
    } catch (error) {
      showFormError(form, error.message);
    }
  });
}

function initFavorites() {
  document.querySelector('#favoritesList').addEventListener('click', async (event) => {
    const button = event.target.closest('[data-remove-favorite]');
    if (!button) return;

    const item = button.closest('[data-favorite-id]');
    const name = item.querySelector('h3').textContent;
    button.disabled = true;
    try {
      await api.delete(`/favorites/${item.dataset.favoriteId}`);
      item.remove();
      updateFavoritesCount();
      showToast(`«${name}» удалён из избранного`, 'secondary');
    } catch (error) {
      button.disabled = false;
      showToast(error.message, 'danger');
    }
  });
}

function initNotifications() {
  const form = document.querySelector('#notificationsForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const user = await api.patch(`/users/${currentUser.id}`, {
        notifications: {
          email: form.elements.email.checked,
          sms: form.elements.sms.checked,
          news: form.elements.news.checked,
          remindBefore: Number(form.elements.remindBefore.value),
        },
      });
      renderProfile(user);
      showToast('Настройки уведомлений сохранены');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      submit.disabled = false;
    }
  });
}

if (requireAuth()) {
  loadProfile();
  initEditProfile();
  initFavorites();
  initNotifications();
}
