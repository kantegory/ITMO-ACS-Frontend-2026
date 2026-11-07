const params = new URLSearchParams(location.search);
const restaurantId = params.get('id');

const stateBox = document.getElementById('state');
const content = document.getElementById('content');

function setState(text, isError = false) {
  stateBox.textContent = text;
  stateBox.classList.toggle('text-danger', isError);
  stateBox.classList.toggle('text-muted', !isError);
}

function render(r, reviews) {
  document.title = `${r.name} — Столик`;
  document.getElementById('rName').textContent = r.name;
  document.getElementById('rMeta').innerHTML =
    `<span class="rating">★</span> ${r.rating.toFixed(1)} · ${'₽'.repeat(r.price)} · ${esc(r.cuisineLabel)} кухня · ${esc(r.districtLabel)}`;
  document.getElementById('rPhotos').innerHTML = r.photos
    .map((p) => `<div class="col-4"><div class="ph ph-${p.photo}" role="img" aria-label="${esc(p.label)}"></div></div>`)
    .join('');
  document.getElementById('rAbout').textContent = `${r.description} Адрес: ${r.address}. Работаем ежедневно ${r.hours}.`;
  document.getElementById('rMenu').innerHTML = r.menu
    .map((m) => `<li class="list-group-item d-flex justify-content-between"><span>${esc(m.name)}</span><span>${m.price} ₽</span></li>`)
    .join('');
  document.getElementById('rReviews').innerHTML = reviews.length
    ? reviews
        .map((v) => `<div class="card card-body mb-2"><strong>${esc(v.author)} <span class="rating">${'★'.repeat(v.rating)}</span></strong>${esc(v.text)}</div>`)
        .join('')
    : '<p class="text-muted">Отзывов пока нет.</p>';
}

async function load() {
  if (!restaurantId) {
    setState('Ресторан не выбран. Вернитесь к списку.', true);
    return;
  }
  try {
    const [restaurant, reviews] = await Promise.all([
      api.get(`/restaurants/${encodeURIComponent(restaurantId)}`),
      api.get(`/reviews?restaurantId=${encodeURIComponent(restaurantId)}`),
    ]);
    render(restaurant, reviews);
    stateBox.hidden = true;
    content.hidden = false;
  } catch (e) {
    setState(e.status === 404 ? 'Ресторан не найден.' : e.message, true);
  }
}

const bookingForm = document.getElementById('bookingForm');
const bookingAlert = document.getElementById('bookingAlert');
const dateInput = document.getElementById('date');
dateInput.min = new Date().toISOString().slice(0, 10); // нельзя бронировать в прошлом

function showBookingAlert(html) {
  bookingAlert.innerHTML = html;
  bookingAlert.hidden = false;
}

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  bookingAlert.hidden = true;

  if (!Auth.isLoggedIn()) {
    const next = encodeURIComponent(`restaurant.html?id=${restaurantId}`);
    showBookingAlert(`Чтобы забронировать столик, <a href="login.html?next=${next}" class="text-decoration-underline">войдите</a> или <a href="register.html" class="text-decoration-underline">зарегистрируйтесь</a>.`);
    return;
  }

  const button = bookingForm.querySelector('button.btn-accent');
  button.disabled = true;
  try {
    await api.post('/bookings', {
      userId: Auth.user().id,
      restaurantId: Number(restaurantId),
      date: dateInput.value,
      time: document.getElementById('time').value,
      guests: Number(document.getElementById('guests').value),
      status: 'pending',
    });
    location.href = 'bookings.html';
  } catch (e) {
    const next = encodeURIComponent(`restaurant.html?id=${restaurantId}`);
    showBookingAlert(e.status === 401
      ? `${esc(e.message)}. <a href="login.html?next=${next}" class="text-decoration-underline">Войти</a>`
      : esc(e.message));
    button.disabled = false;
  }
});

load();
