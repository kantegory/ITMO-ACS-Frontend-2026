// Страница ресторана: данные из /restaurants/:id, отзывы, избранное и бронирование через API

const restaurantId = Number(new URLSearchParams(window.location.search).get('id'));

const page = document.querySelector('#restaurantPage');
const pageStatus = document.querySelector('#pageStatus');
const bookingModalEl = document.querySelector('#bookingModal');
const bookingModal = bootstrap.Modal.getOrCreateInstance(bookingModalEl);
const bookingForm = document.querySelector('#bookingForm');
const quickForm = document.querySelector('#quickBookingForm');
const reviewForm = document.querySelector('#reviewForm');

let restaurant = null;
let favoriteId = null;

// ---------- Отрисовка ----------

function setField(name, value) {
  document.querySelectorAll(`[data-field="${name}"]`).forEach((el) => {
    el.textContent = value;
  });
}

function renderHeader(features) {
  const featureNames = Object.fromEntries(features.map((f) => [f.id, f.name]));

  document.title = `${restaurant.name} — Столик`;
  document.querySelector('#crumbName').textContent = restaurant.name;
  document.querySelector('#restaurantName').textContent = restaurant.name;
  document.querySelector('#bookingModalTitle').textContent = `Бронирование · ${restaurant.name}`;
  document.querySelector('#restaurantBadges').innerHTML = [restaurant.cuisine.name, ...restaurant.features.map((id) => featureNames[id])]
    .map((name) => `<span class="badge badge-soft">${escapeHtml(name)}</span>`).join('');

  setField('addressFull', `${restaurant.address} · м. ${restaurant.metro}`);
  setField('address', restaurant.address);
  setField('hours', restaurant.hours);
  setField('avgCheck', formatMoney(restaurant.avgCheck));

  const phone = document.querySelector('[data-phone-link]');
  phone.textContent = restaurant.phone;
  phone.href = `tel:${restaurant.phone.replace(/[^\d+]/g, '')}`;

  document.querySelector('#aboutText').innerHTML = restaurant.description.map((p) => `<p>${escapeHtml(p)}</p>`).join('');
  document.querySelector('#featuresList').innerHTML = [
    `Район: ${restaurant.district.name}`,
    ...restaurant.features.map((id) => featureNames[id]),
    'Оплата картой и по QR-коду',
  ].map((text) => `<li>${escapeHtml(text)}</li>`).join('');
}

function renderGallery() {
  const { gallery } = restaurant;
  document.querySelector('#galleryIndicators').innerHTML = gallery.map((_, i) => `
    <button type="button" data-bs-target="#gallery" data-bs-slide-to="${i}"${i === 0 ? ' class="active" aria-current="true"' : ''} aria-label="Фото ${i + 1} из ${gallery.length}"></button>`).join('');
  document.querySelector('#galleryInner').innerHTML = gallery.map((photo, i) => `
    <div class="carousel-item${i === 0 ? ' active' : ''}" role="group" aria-roledescription="слайд" aria-label="${i + 1} из ${gallery.length}">
      <img class="d-block w-100" src="${photo.src}" alt="${escapeHtml(photo.alt)}">
      <div class="carousel-caption"><p class="mb-0">${escapeHtml(photo.caption)}</p></div>
    </div>`).join('');
  // Для одной фотографии стрелки и точки не нужны
  document.querySelectorAll('#gallery .carousel-control-prev, #gallery .carousel-control-next, #galleryIndicators')
    .forEach((el) => el.classList.toggle('d-none', gallery.length < 2));
}

function renderMenu() {
  const categories = Map.groupBy(restaurant.menu, (item) => item.category);
  document.querySelector('#menuContainer').innerHTML = [...categories].map(([category, items], i) => `
    <section class="menu-section" aria-labelledby="menu-category-${i}">
      <h3 class="h5" id="menu-category-${i}">${escapeHtml(category)}</h3>
      <ul class="menu-list">
        ${items.map((item) => `
          <li>
            <div class="menu-item-head">
              <span class="dish-name">${escapeHtml(item.name)}${item.badge ? ` <span class="badge text-bg-light border ms-1">${escapeHtml(item.badge)}</span>` : ''}</span>
              <span class="dish-price">${formatMoney(item.price)}</span>
            </div>
            <p class="dish-desc">${escapeHtml(item.description)}</p>
          </li>`).join('')}
      </ul>
    </section>`).join('');
}

function reviewHtml(review, isNew = false) {
  return `
    <article class="review${isNew ? ' review-new' : ''}"${isNew ? ' tabindex="-1"' : ''}>
      <div class="d-flex align-items-center gap-3 mb-2">
        <span class="avatar avatar-sm" aria-hidden="true">${escapeHtml(getInitials(review.author))}</span>
        <div>
          <h3 class="h6 mb-0">${escapeHtml(review.author)}</h3>
          <time class="small text-muted-warm" datetime="${review.date}">${formatDate(review.date, { year: true })}</time>
        </div>
        <span class="ms-auto">${starsHtml(review.rating)}</span>
      </div>
      <p class="mb-0">${escapeHtml(review.text)}</p>
    </article>`;
}

// Рейтинг, распределение оценок и список отзывов пересчитываются из массива отзывов
function renderReviews(newReviewId) {
  const reviews = [...restaurant.reviews].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const rating = ratingOf(reviews);

  document.querySelectorAll('[data-rating-value]').forEach((el) => { el.textContent = formatRating(rating.value); });
  document.querySelectorAll('[data-reviews-count-label]').forEach((el) => { el.textContent = pluralReviews(rating.count); });
  document.querySelector('[data-rating-pill]').setAttribute('aria-label', rating.count ? `Рейтинг ${formatRating(rating.value)} из 5` : 'Рейтинга пока нет');
  document.querySelector('#ratingStars').innerHTML = starsHtml(rating.value, rating.count ? `Средняя оценка ${formatRating(rating.value)} из 5` : 'Оценок пока нет');

  // Полоски — только картинка, скринридеру отдаём ту же информацию текстом
  document.querySelector('#ratingBars').innerHTML = [5, 4, 3, 2, 1].map((stars) => {
    const percent = rating.count ? Math.round((reviews.filter((r) => r.rating === stars).length / rating.count) * 100) : 0;
    return `
      <li class="d-flex align-items-center gap-2 small">
        <span class="visually-hidden">${pluralize(stars, ['звезда', 'звезды', 'звёзд'])}: ${percent}% отзывов</span>
        <span class="text-nowrap" aria-hidden="true">${stars} ★</span>
        <div class="progress flex-grow-1" aria-hidden="true">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <span class="text-muted-warm bar-value" aria-hidden="true">${percent}%</span>
      </li>`;
  }).join('');

  document.querySelector('#reviewsList').innerHTML = reviews.length
    ? reviews.map((review) => reviewHtml(review, review.id === newReviewId)).join('')
    : '<p class="text-muted-warm">Отзывов пока нет — станьте первым!</p>';
}

// ---------- Бронирование ----------

function initBookingDates() {
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    input.min = todayISO();
    input.value = todayISO();
  });
}

function initBooking() {
  initBookingDates();

  // Быстрая форма в сайдбаре переносит выбранное в модалку
  quickForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(quickForm);
    bookingForm.elements.date.value = data.get('date');
    bookingForm.elements.guests.value = data.get('guests');
    const slot = bookingForm.querySelector(`input[name="time"][value="${data.get('time')}"]`);
    if (slot && !slot.disabled) slot.checked = true;
    bookingModal.show(quickForm.querySelector('[type="submit"]'));
  });

  // Если модалку открыли не кнопкой с data-bs-toggle (быстрая форма, ссылка #booking),
  // Bootstrap не вернёт фокус — возвращаем на кнопку, которая её открыла, или на «Забронировать»
  let returnFocusTo = null;
  bookingModalEl.addEventListener('show.bs.modal', (event) => {
    returnFocusTo = event.relatedTarget ?? document.querySelector('[data-bs-target="#bookingModal"]');
  });
  bookingModalEl.addEventListener('hidden.bs.modal', () => {
    const focusLost = document.activeElement === document.body || bookingModalEl.contains(document.activeElement);
    if (focusLost) returnFocusTo?.focus();
  });

  bookingModalEl.addEventListener('show.bs.modal', () => {
    const loggedIn = isLoggedIn();
    document.querySelector('#bookingAuthNotice').classList.toggle('d-none', loggedIn);
    bookingForm.querySelector('[type="submit"]').disabled = !loggedIn;
    if (loggedIn && !bookingForm.elements.phone.value) bookingForm.elements.phone.value = getUser().phone ?? '';
  });

  onValidSubmit(bookingForm, async (data, form) => {
    showFormError(form, '');
    try {
      const booking = await api.post('/bookings', {
        userId: getUser().id,
        restaurantId,
        date: data.get('date'),
        time: data.get('time'),
        guests: Number(data.get('guests')),
        zone: data.get('zone'),
        phone: data.get('phone'),
        comment: data.get('comment').trim(),
        remind: data.get('remind') === 'on',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });

      bookingModal.hide();
      showToast(`Столик забронирован: ${formatDate(booking.date)}, ${booking.time}, ${pluralGuests(booking.guests)}. Бронь № ${booking.id} — в разделе «Мои брони».`);
      form.reset();
      resetValidation(form);
      initBookingDates();
    } catch (error) {
      showFormError(form, error.message);
    }
  });
}

// ---------- Избранное ----------

function setFavoriteState(active) {
  const button = document.querySelector('[data-favorite]');
  button.setAttribute('aria-pressed', String(active));
  button.classList.toggle('active', active);
  button.querySelector('[data-favorite-label]').textContent = active ? 'В избранном' : 'В избранное';
}

async function initFavorite() {
  const button = document.querySelector('[data-favorite]');

  if (isLoggedIn()) {
    const [favorite] = await api.getOwnList(`/favorites?userId=${getUser().id}&restaurantId=${restaurantId}`);
    favoriteId = favorite?.id ?? null;
    setFavoriteState(Boolean(favoriteId));
  }

  button.addEventListener('click', async () => {
    if (!requireAuth()) return;
    button.disabled = true;
    try {
      if (favoriteId) {
        await api.delete(`/favorites/${favoriteId}`);
        favoriteId = null;
        showToast('Ресторан удалён из избранного', 'secondary');
      } else {
        const favorite = await api.post('/favorites', { userId: getUser().id, restaurantId });
        favoriteId = favorite.id;
        showToast('Ресторан добавлен в избранное');
      }
      setFavoriteState(Boolean(favoriteId));
    } catch (error) {
      showToast(error.message, 'danger');
    } finally {
      button.disabled = false;
    }
  });
}

// ---------- Отзывы ----------

function initReviewForm() {
  const loggedIn = isLoggedIn();
  document.querySelector('#reviewAuthNotice').classList.toggle('d-none', loggedIn);
  document.querySelector('#reviewFormToggle').classList.toggle('d-none', !loggedIn);

  onValidSubmit(reviewForm, async (data, form) => {
    showFormError(form, '');
    try {
      const user = getUser();
      const review = await api.post('/reviews', {
        restaurantId,
        userId: user.id,
        author: user.name,
        rating: Number(data.get('rating')),
        text: data.get('text').trim(),
        date: todayISO(),
      });

      restaurant.reviews.push(review);
      renderReviews(review.id);
      form.reset();
      resetValidation(form);
      bootstrap.Collapse.getOrCreateInstance('#reviewFormWrap', { toggle: false }).hide();
      showToast('Спасибо! Отзыв опубликован.');
      // Форма свернулась вместе с кнопкой в фокусе — показываем пользователю его отзыв
      document.querySelector('.review-new').focus();
    } catch (error) {
      showFormError(form, error.message);
    }
  });

  // Ссылка «N отзывов» в шапке открывает вкладку отзывов
  document.querySelector('[data-open-tab]').addEventListener('click', (event) => {
    event.preventDefault();
    const tab = document.querySelector(event.currentTarget.dataset.openTab);
    bootstrap.Tab.getOrCreateInstance(tab).show();
    tab.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    // Фокус — на открытую панель, чтобы следующий Tab шёл по отзывам, а не по шапке
    document.querySelector(tab.dataset.bsTarget).focus({ preventScroll: true });
  });
}

// ---------- Загрузка ----------

async function loadRestaurant() {
  if (!restaurantId) {
    window.location.replace('search.html');
    return;
  }

  // Ссылки «Войти» возвращают на эту же страницу
  document.querySelectorAll('[data-login-link]').forEach((link) => {
    link.href = `login.html?next=${encodeURIComponent(`restaurant.html?id=${restaurantId}`)}`;
  });

  pageStatus.innerHTML = loaderHtml('Загружаем ресторан…');
  let features;
  try {
    [restaurant, features] = await Promise.all([
      api.get(`/restaurants/${restaurantId}?_expand=cuisine&_expand=district&_embed=menu&_embed=reviews`),
      api.get('/features'),
    ]);
  } catch (error) {
    const message = error.status === 404 ? 'Такого ресторана нет. Возможно, ссылка устарела.' : error.message;
    pageStatus.innerHTML = `${errorHtml(message)}<a class="btn btn-primary" href="search.html">Все рестораны</a>`;
    return;
  }

  pageStatus.innerHTML = '';
  page.classList.remove('d-none');
  renderHeader(features);
  renderGallery();
  renderMenu();
  renderReviews();
  initBooking();
  initReviewForm();
  initFavorite().catch((error) => showToast(error.message, 'danger'));

  // Кнопки «Забронировать» ведут на restaurant.html?id=N#booking — сразу открываем модалку,
  // а «Оставить отзыв» из истории броней — на #reviews
  if (window.location.hash === '#booking') bookingModal.show();
  if (window.location.hash === '#reviews') bootstrap.Tab.getOrCreateInstance('#reviews-tab').show();
}

loadRestaurant();
