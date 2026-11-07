// Страница ресторана: бронирование, избранное и отзывы

const BOOKINGS_KEY = 'stolik-bookings';
const RESTAURANT_NAME = 'Траттория «Нонна»';

const bookingModalEl = document.querySelector('#bookingModal');
const bookingModal = bootstrap.Modal.getOrCreateInstance(bookingModalEl);
const bookingForm = document.querySelector('#bookingForm');
const quickForm = document.querySelector('#quickBookingForm');

function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatDate(iso) {
  return new Date(`${iso}T00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function pluralGuests(count) {
  const n = Number(count);
  if (n % 10 === 1 && n % 100 !== 11) return `${n} гость`;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} гостя`;
  return `${n} гостей`;
}

function initDates() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = todayISO();
    input.value = todayISO();
  });
}

// Быстрая форма в сайдбаре переносит выбранное в модалку
function initQuickBooking() {
  quickForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(quickForm);

    bookingForm.elements.date.value = data.get('date');
    bookingForm.elements.guests.value = data.get('guests');
    const slot = bookingForm.querySelector(`input[name="time"][value="${data.get('time')}"]`);
    if (slot && !slot.disabled) slot.checked = true;

    bookingModal.show();
  });
}

function initBookingForm() {
  // Подставляем данные вошедшего пользователя
  bookingModalEl.addEventListener('show.bs.modal', () => {
    const user = getUser();
    if (!user) return;
    if (!bookingForm.elements.name.value) bookingForm.elements.name.value = user.name;
    if (!bookingForm.elements.phone.value) bookingForm.elements.phone.value = user.phone ?? '';
  });

  onValidSubmit(bookingForm, (data, form) => {
    const booking = {
      id: Date.now(),
      restaurant: RESTAURANT_NAME,
      image: 'img/italian.svg',
      date: data.get('date'),
      time: data.get('time'),
      guests: Number(data.get('guests')),
      zone: data.get('zone'),
      status: 'upcoming',
    };

    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]');
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...bookings]));

    bookingModal.hide();
    showToast(`Столик забронирован: ${formatDate(booking.date)}, ${booking.time}, ${pluralGuests(booking.guests)}. Бронь появилась в «Моих бронях».`);

    form.reset();
    form.classList.remove('was-validated');
    initDates();
  });
}

function initFavorite() {
  const button = document.querySelector('[data-favorite]');
  const label = button.querySelector('[data-favorite-label]');

  button.addEventListener('click', () => {
    const isActive = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(isActive));
    button.classList.toggle('active', isActive);
    label.textContent = isActive ? 'В избранном' : 'В избранное';
    showToast(isActive ? 'Ресторан добавлен в избранное' : 'Ресторан удалён из избранного', 'secondary');
  });
}

function renderStars(value) {
  const star = (on) => `<svg class="icon icon-fill ${on ? 'star-on' : 'star-off'}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  return `<span class="stars" title="${value} из 5">${[1, 2, 3, 4, 5].map((i) => star(i <= value)).join('')}</span>`;
}

function initReviews() {
  const form = document.querySelector('#reviewForm');
  const list = document.querySelector('#reviewsList');
  const counters = document.querySelectorAll('#reviewsCount, #reviewsCountLink');

  const user = getUser();
  if (user) form.elements.name.value = user.name;

  onValidSubmit(form, (data) => {
    const review = document.createElement('article');
    review.className = 'review review-new';
    review.innerHTML = `
      <div class="d-flex align-items-center gap-3 mb-2">
        <span class="avatar avatar-sm"></span>
        <div>
          <h3 class="h6 mb-0"></h3>
          <time class="small text-muted-warm" datetime="${todayISO()}">${formatDate(todayISO())}</time>
        </div>
        <span class="ms-auto">${renderStars(Number(data.get('rating')))}</span>
      </div>
      <p class="mb-0"></p>`;
    // Пользовательский текст вставляем через textContent, чтобы не допустить XSS
    review.querySelector('.avatar').textContent = getInitials(data.get('name'));
    review.querySelector('h3').textContent = data.get('name');
    review.querySelector('p').textContent = data.get('text');
    list.prepend(review);

    counters.forEach((el) => { el.textContent = Number(el.textContent) + 1; });

    form.reset();
    form.classList.remove('was-validated');
    if (user) form.elements.name.value = user.name;
    bootstrap.Collapse.getOrCreateInstance('#reviewFormWrap', { toggle: false }).hide();
    showToast('Спасибо! Отзыв опубликован.');
  });

  // Ссылка «N отзывов» в шапке открывает вкладку отзывов
  document.querySelector('[data-open-tab]').addEventListener('click', (event) => {
    event.preventDefault();
    const tab = document.querySelector(event.currentTarget.dataset.openTab);
    bootstrap.Tab.getOrCreateInstance(tab).show();
    tab.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

initDates();
initQuickBooking();
initBookingForm();
initFavorite();
initReviews();

// Кнопки «Забронировать» в карточках ведут на restaurant.html#booking — сразу открываем модалку
if (window.location.hash === '#booking') {
  bookingModal.show();
}
