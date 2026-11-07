// Поиск ресторанов: фильтрация и сортировка карточек на клиенте.
// В ЛР1 карточки уже лежат в разметке, их параметры — в data-атрибутах.

const filtersForm = document.querySelector('#filtersForm');
const list = document.querySelector('#restaurantsList');
const cards = [...list.children];
const resultsCount = document.querySelector('#resultsCount');
const emptyState = document.querySelector('#emptyState');
const activeBadge = document.querySelector('#activeFiltersBadge');

const sorters = {
  rating: (a, b) => b.dataset.rating - a.dataset.rating,
  reviews: (a, b) => b.dataset.reviews - a.dataset.reviews,
  'price-asc': (a, b) => a.dataset.check - b.dataset.check,
  'price-desc': (a, b) => b.dataset.check - a.dataset.check,
};

function readFilters() {
  const data = new FormData(filtersForm);
  return {
    query: (data.get('q') ?? '').trim().toLowerCase(),
    cuisines: data.getAll('cuisine'),
    district: data.get('district'),
    prices: data.getAll('price'),
    rating: Number(data.get('rating') ?? 0),
    features: data.getAll('feature'),
    sort: data.get('sort') ?? 'rating',
  };
}

function matches(card, filters) {
  const { name, cuisine, district, price, rating, features } = card.dataset;
  const cardFeatures = features.split(' ');

  return (!filters.query || name.includes(filters.query))
    && (!filters.cuisines.length || filters.cuisines.includes(cuisine))
    && (!filters.district || filters.district === district)
    && (!filters.prices.length || filters.prices.includes(price))
    && Number(rating) >= filters.rating
    && filters.features.every((feature) => cardFeatures.includes(feature));
}

function countActive(filters) {
  return filters.cuisines.length + filters.prices.length + filters.features.length
    + (filters.district ? 1 : 0) + (filters.rating ? 1 : 0);
}

function applyFilters() {
  const filters = readFilters();
  const visible = cards.filter((card) => matches(card, filters));

  cards.forEach((card) => card.classList.toggle('d-none', !visible.includes(card)));
  [...cards].sort(sorters[filters.sort]).forEach((card) => list.append(card));

  resultsCount.textContent = visible.length;
  emptyState.classList.toggle('d-none', visible.length > 0);

  const active = countActive(filters);
  activeBadge.textContent = active;
  activeBadge.classList.toggle('d-none', active === 0);
}

// Параметры из адресной строки: ?q=...&cuisine=...&district=... (форма на главной)
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('q')) filtersForm.elements.q.value = params.get('q');
  if (params.has('district')) filtersForm.elements.district.value = params.get('district');
  params.getAll('cuisine').forEach((cuisine) => {
    const checkbox = document.querySelector(`#cuisine-${cuisine}`);
    if (checkbox) checkbox.checked = true;
  });
}

// Поиск и сортировка вынесены из формы в тулбар и привязаны к ней атрибутом form,
// поэтому их события не всплывают до формы — слушаем весь документ.
document.addEventListener('input', (event) => {
  if (event.target.form === filtersForm) applyFilters();
});
filtersForm.addEventListener('submit', (event) => event.preventDefault());
// Во время события reset значения ещё старые, поэтому пересчитываем на следующем тике
filtersForm.addEventListener('reset', () => setTimeout(applyFilters));

applyUrlParams();
applyFilters();
