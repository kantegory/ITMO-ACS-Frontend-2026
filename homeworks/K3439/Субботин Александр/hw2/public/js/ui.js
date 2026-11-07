// Общие функции отрисовки данных, пришедших из API

const ICONS = {
  star: '<svg class="icon icon-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  pin: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  calendar: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  users: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6"/></svg>',
  close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
};

// Всё, что ввёл пользователь (отзывы, имена, комментарии), экранируем перед вставкой в HTML
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function pluralize(n, [one, few, many]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} ${few}`;
  return `${n} ${many}`;
}

const pluralGuests = (n) => pluralize(n, ['гость', 'гостя', 'гостей']);
const pluralReviews = (n) => pluralize(n, ['отзыв', 'отзыва', 'отзывов']);

function formatMoney(value) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

function todayISO() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function formatDate(iso, { year = false } = {}) {
  const options = { day: 'numeric', month: 'long', ...(year && { year: 'numeric' }) };
  return new Date(`${iso}T00:00`).toLocaleDateString('ru-RU', options).replace(' г.', '');
}

// Рейтинг ресторана считаем по его отзывам — так он сразу меняется после нового отзыва
function ratingOf(reviews = []) {
  if (!reviews.length) return { value: 0, count: 0 };
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return { value: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

function formatRating(value) {
  return value ? value.toFixed(1) : '—';
}

// Скринридер прочитал бы «₽₽» как «рубль рубль», поэтому у значка есть текстовая альтернатива
function priceLevelHtml(level) {
  const dim = '₽'.repeat(3 - level);
  return `<span class="price-level" role="img" aria-label="Ценовой уровень ${level} из 3">${'₽'.repeat(level)}${dim ? `<span class="dim">${dim}</span>` : ''}</span>`;
}

// «~» читается как «тильда» — вслух говорим «средний чек около …»
function avgCheckHtml(value) {
  return `<span><span aria-hidden="true">~</span><span class="visually-hidden">средний чек около </span>${formatMoney(value)}</span>`;
}

function ratingLabel({ value, count }) {
  return count ? `Рейтинг ${formatRating(value)} из 5, ${pluralReviews(count)}` : 'Отзывов пока нет';
}

function starsHtml(value, label = `Оценка ${value} из 5`) {
  const star = (on) => ICONS.star.replace('icon icon-fill', `icon icon-fill ${on ? 'star-on' : 'star-off'}`);
  return `<span class="stars" role="img" aria-label="${label}">${[1, 2, 3, 4, 5].map((i) => star(i <= Math.round(value))).join('')}</span>`;
}

// Карточка ресторана для главной и поиска. r — ресторан с _expand=cuisine&_expand=district&_embed=reviews
function restaurantCardHtml(r, heading = 'h2') {
  const rating = ratingOf(r.reviews);
  return `
    <article class="card restaurant-card">
      <div class="card-cover">
        <img class="card-img-top" src="${r.image}" alt="${escapeHtml(r.imageAlt)}">
        <span class="badge badge-cuisine">${escapeHtml(r.cuisine?.name)}</span>
      </div>
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <${heading} class="card-title h5 mb-0"><a href="restaurant.html?id=${r.id}">${escapeHtml(r.name)}</a></${heading}>
          <span class="rating-pill" role="img" aria-label="${ratingLabel(rating)}">${ICONS.star}${formatRating(rating.value)}</span>
        </div>
        <ul class="meta-list mb-3">
          <li>${ICONS.pin}${escapeHtml(r.district?.name)}</li>
          <li>${priceLevelHtml(r.priceLevel)}${avgCheckHtml(r.avgCheck)}</li>
        </ul>
        <p class="card-text text-muted-warm small">${escapeHtml(r.short)}</p>
        <a class="btn btn-outline-primary mt-auto" href="restaurant.html?id=${r.id}#booking">Забронировать<span class="visually-hidden"> столик в «${escapeHtml(r.name)}»</span></a>
      </div>
    </article>`;
}

function loaderHtml(text = 'Загружаем…') {
  return `
    <div class="d-flex align-items-center gap-2 text-muted-warm py-4" role="status">
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>${text}</span>
    </div>`;
}

function errorHtml(message) {
  return `<div class="alert alert-danger" role="alert">${escapeHtml(message)}</div>`;
}
