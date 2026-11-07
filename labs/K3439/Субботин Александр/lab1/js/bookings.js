// История бронирований: брони из localStorage, фильтр по статусу и отмена

const BOOKINGS_KEY = 'stolik-bookings';

const list = document.querySelector('#bookingsList');
const emptyState = document.querySelector('#bookingsEmpty');
const template = document.querySelector('#bookingTemplate');
const cancelModalEl = document.querySelector('#cancelModal');
const cancelModal = bootstrap.Modal.getOrCreateInstance(cancelModalEl);
let currentFilter = 'all';
let bookingToCancel = null;

function getStoredBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function pluralGuests(n) {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} гость`;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} гостя`;
  return `${n} гостей`;
}

function formatWhen(date, time) {
  const day = new Date(`${date}T00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${day.replace(' г.', '')}, ${time}`;
}

// Брони, сделанные на странице ресторана, добавляем в начало списка
function renderStoredBookings() {
  getStoredBookings().forEach((booking) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const [, guests, zone] = item.querySelectorAll('.meta-list li');

    item.dataset.status = booking.status;
    item.dataset.bookingId = booking.id;
    item.dataset.stored = 'true';
    item.querySelector('.booking-thumb').src = booking.image;
    item.querySelector('[data-booking-name]').textContent = booking.restaurant;
    const when = item.querySelector('[data-booking-when]');
    when.dateTime = `${booking.date}T${booking.time}`;
    when.textContent = formatWhen(booking.date, booking.time);
    guests.lastChild.textContent = pluralGuests(booking.guests);
    zone.lastChild.textContent = booking.zone;
    item.querySelector('.booking-info p').textContent = `Бронь № ${String(booking.id).slice(-5)}`;

    if (booking.status === 'cancelled') markCancelled(item);
    list.prepend(item);
  });
}

function updateCounts() {
  const items = [...list.children];
  document.querySelectorAll('[data-count]').forEach((badge) => {
    const key = badge.dataset.count;
    badge.textContent = key === 'all' ? items.length : items.filter((item) => item.dataset.status === key).length;
  });
}

function applyFilter() {
  let visible = 0;
  [...list.children].forEach((item) => {
    const show = currentFilter === 'all' || item.dataset.status === currentFilter;
    item.classList.toggle('d-none', !show);
    if (show) visible += 1;
  });
  emptyState.classList.toggle('d-none', visible > 0);
}

function initFilters() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('active', b === button));
      currentFilter = button.dataset.filter;
      applyFilter();
    });
  });
}

function markCancelled(item) {
  item.dataset.status = 'cancelled';
  const badge = item.querySelector('[data-booking-status]');
  badge.className = 'badge text-bg-danger';
  badge.textContent = 'Отменено';
  item.querySelector('[data-booking-actions]').innerHTML = '<a class="btn btn-sm btn-outline-primary" href="restaurant.html#booking">Забронировать снова</a>';
}

function initCancel() {
  list.addEventListener('click', (event) => {
    if (!event.target.closest('[data-cancel]')) return;

    bookingToCancel = event.target.closest('.booking-item');
    document.querySelector('#cancelRestaurant').textContent = bookingToCancel.querySelector('[data-booking-name]').textContent;
    document.querySelector('#cancelWhen').textContent = bookingToCancel.querySelector('[data-booking-when]').textContent;
    cancelModal.show();
  });

  document.querySelector('#confirmCancel').addEventListener('click', () => {
    markCancelled(bookingToCancel);

    if (bookingToCancel.dataset.stored) {
      const id = Number(bookingToCancel.dataset.bookingId);
      const bookings = getStoredBookings().map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b));
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    }

    cancelModal.hide();
    updateCounts();
    applyFilter();
    showToast('Бронирование отменено', 'secondary');
  });
}

renderStoredBookings();
updateCounts();
initFilters();
initCancel();
applyFilter();
