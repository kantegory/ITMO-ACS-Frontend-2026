// История бронирований: список из /bookings, фильтр по статусу и отмена через PATCH

const list = document.querySelector('#bookingsList');
const emptyState = document.querySelector('#bookingsEmpty');
const cancelModal = bootstrap.Modal.getOrCreateInstance('#cancelModal');

const STATUS = {
  confirmed: { label: 'Подтверждено', badge: 'text-bg-success' },
  pending: { label: 'Ожидает подтверждения', badge: 'text-bg-warning' },
  completed: { label: 'Завершено', badge: 'text-bg-secondary' },
  cancelled: { label: 'Отменено', badge: 'text-bg-danger' },
};

let bookings = [];
let currentFilter = 'all';
let bookingToCancel = null;
let cancelTrigger = null;

// Бронь со статусом «подтверждена/ожидает», дата которой уже прошла, считаем завершённой
function bookingGroup(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'completed' || booking.date < todayISO()) return 'completed';
  return 'upcoming';
}

// Кнопки повторяются в каждой карточке, поэтому скринридеру дописываем, к какой брони они относятся
function actionsHtml(booking, group) {
  const page = `restaurant.html?id=${booking.restaurantId}`;
  const name = escapeHtml(booking.restaurant.name);
  const context = (text) => `<span class="visually-hidden"> ${text}</span>`;
  if (group === 'upcoming') {
    return `<a class="btn btn-sm btn-outline-primary" href="${page}">К ресторану${context(`«${name}»`)}</a>
      <button class="btn btn-sm btn-outline-danger" type="button" data-cancel="${booking.id}">Отменить${context(`бронь в «${name}» на ${formatDate(booking.date)}, ${booking.time}`)}</button>`;
  }
  if (group === 'completed') {
    return `<a class="btn btn-sm btn-outline-primary" href="${page}#reviews">Оставить отзыв${context(`о «${name}»`)}</a>
      <a class="btn btn-sm btn-primary" href="${page}#booking">Повторить${context(`бронь в «${name}»`)}</a>`;
  }
  return `<a class="btn btn-sm btn-outline-primary" href="${page}#booking">Забронировать снова${context(`в «${name}»`)}</a>`;
}

function bookingHtml(booking) {
  const group = bookingGroup(booking);
  const status = group === 'completed' ? STATUS.completed : STATUS[booking.status];
  return `
    <article class="booking-item" data-status="${group}" data-booking-id="${booking.id}">
      <img class="booking-thumb" src="${booking.restaurant.image}" alt="" width="96" height="96">
      <div class="booking-info">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <h2 class="h5 mb-0"><a href="restaurant.html?id=${booking.restaurantId}">${escapeHtml(booking.restaurant.name)}</a></h2>
          <span class="badge ${status.badge}">${status.label}</span>
        </div>
        <ul class="meta-list">
          <li>${ICONS.calendar}<time datetime="${booking.date}T${booking.time}">${formatDate(booking.date, { year: true })}, ${booking.time}</time></li>
          <li>${ICONS.users}${pluralGuests(booking.guests)}</li>
          <li>${ICONS.pin}${escapeHtml(booking.zone)}</li>
        </ul>
        ${booking.comment ? `<p class="small mb-0 mt-1">Пожелания: ${escapeHtml(booking.comment)}</p>` : ''}
        <p class="small text-muted-warm mb-0 mt-1">Бронь № ${booking.id}</p>
      </div>
      <div class="booking-actions">${actionsHtml(booking, group)}</div>
    </article>`;
}

function render() {
  const visible = bookings.filter((b) => currentFilter === 'all' || bookingGroup(b) === currentFilter);
  list.innerHTML = visible.map(bookingHtml).join('');
  emptyState.classList.toggle('d-none', visible.length > 0);
  document.querySelector('#bookingsStatus').textContent = `Показано бронирований: ${visible.length}`;

  document.querySelectorAll('[data-count]').forEach((badge) => {
    const key = badge.dataset.count;
    badge.textContent = key === 'all' ? bookings.length : bookings.filter((b) => bookingGroup(b) === key).length;
  });
}

async function loadBookings() {
  list.innerHTML = loaderHtml('Загружаем брони…');
  try {
    // Список сам json-server-auth не фильтрует, поэтому userId передаём явно. Сортировку по нескольким
    // полям (_sort=date,time) его проверка доступа не переваривает, поэтому время досортировываем здесь
    const data = await api.getOwnList(`/bookings?userId=${getUser().id}&_expand=restaurant&_sort=date&_order=desc`);
    bookings = data.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
    render();
  } catch (error) {
    list.innerHTML = errorHtml(error.message);
  }
}

function initFilters() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((b) => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      currentFilter = button.dataset.filter;
      render();
    });
  });
}

// Модалка открыта из JS, поэтому Bootstrap не вернёт фокус сам. Если бронь отменили, кнопки
// «Отменить» уже нет — переводим фокус на название ресторана в карточке или на фильтр
function restoreFocusAfterCancel() {
  if (document.body.contains(cancelTrigger)) {
    cancelTrigger.focus();
    return;
  }
  const card = list.querySelector(`[data-booking-id="${bookingToCancel.id}"] h2 a`);
  (card ?? document.querySelector('[data-filter].active')).focus();
}

function initCancel() {
  document.querySelector('#cancelModal').addEventListener('hidden.bs.modal', restoreFocusAfterCancel);

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cancel]');
    if (!button) return;

    bookingToCancel = bookings.find((b) => b.id === Number(button.dataset.cancel));
    cancelTrigger = button;
    document.querySelector('#cancelRestaurant').textContent = bookingToCancel.restaurant.name;
    document.querySelector('#cancelWhen').textContent = `${formatDate(bookingToCancel.date)}, ${bookingToCancel.time}`;
    cancelModal.show();
  });

  document.querySelector('#confirmCancel').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const updated = await api.patch(`/bookings/${bookingToCancel.id}`, { status: 'cancelled' });
      Object.assign(bookingToCancel, updated);
      cancelModal.hide();
      render();
      showToast('Бронирование отменено', 'secondary');
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      button.disabled = false;
    }
  });
}

if (requireAuth()) {
  initFilters();
  initCancel();
  loadBookings();
}
