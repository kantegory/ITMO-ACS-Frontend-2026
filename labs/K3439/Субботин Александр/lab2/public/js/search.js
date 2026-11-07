// Поиск ресторанов через API.
// Кухню, район, ценовой уровень, текстовый поиск и сортировку по цене делает json-server (query-параметры).
// Рейтинг считается по отзывам, поэтому фильтр/сортировка по рейтингу и особенности — на клиенте.

const filtersForm = document.querySelector('#filtersForm');
const list = document.querySelector('#restaurantsList');
const resultsCount = document.querySelector('#resultsCount');
const emptyState = document.querySelector('#emptyState');
const activeBadge = document.querySelector('#activeFiltersBadge');

let lastRequest = 0;
let debounceTimer;

function checkboxesHtml(items, name, switches = false) {
  return items.map((item) => `
    <div class="form-check${switches ? ' form-switch' : ''}">
      <input class="form-check-input" id="${name}-${item.id}" name="${name}" type="checkbox" value="${item.id}"${switches ? ' role="switch"' : ''}>
      <label class="form-check-label" for="${name}-${item.id}">${escapeHtml(item.name)}</label>
    </div>`).join('');
}

// Справочники для фильтров тоже приходят из API
async function renderFilterOptions() {
  const [cuisines, districts, features] = await Promise.all([
    api.get('/cuisines'),
    api.get('/districts'),
    api.get('/features'),
  ]);

  document.querySelector('#cuisineFilters').innerHTML = checkboxesHtml(cuisines, 'cuisine');
  document.querySelector('#featureFilters').innerHTML = checkboxesHtml(features, 'feature', true);
  document.querySelector('#filterDistrict').insertAdjacentHTML('beforeend',
    districts.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join(''));
  document.querySelectorAll('[aria-busy]').forEach((el) => el.removeAttribute('aria-busy'));
}

function readFilters() {
  const data = new FormData(filtersForm);
  return {
    q: (data.get('q') ?? '').trim(),
    cuisines: data.getAll('cuisine'),
    district: data.get('district') ?? '',
    prices: data.getAll('price'),
    rating: Number(data.get('rating') ?? 0),
    features: data.getAll('feature'),
    sort: data.get('sort') ?? 'rating',
  };
}

function buildQuery(filters) {
  const params = new URLSearchParams({ _expand: 'cuisine', _embed: 'reviews' });
  params.append('_expand', 'district');

  if (filters.q) params.set('q', filters.q);
  filters.cuisines.forEach((id) => params.append('cuisineId', id));
  if (filters.district) params.set('districtId', filters.district);
  filters.prices.forEach((level) => params.append('priceLevel', level));
  if (filters.sort === 'price-asc' || filters.sort === 'price-desc') {
    params.set('_sort', 'avgCheck');
    params.set('_order', filters.sort === 'price-asc' ? 'asc' : 'desc');
  }
  return params;
}

function applyClientFilters(restaurants, filters) {
  const result = restaurants
    .map((r) => ({ ...r, rating: ratingOf(r.reviews) }))
    .filter((r) => r.rating.value >= filters.rating)
    .filter((r) => filters.features.every((feature) => r.features.includes(feature)));

  if (filters.sort === 'rating') result.sort((a, b) => b.rating.value - a.rating.value);
  if (filters.sort === 'reviews') result.sort((a, b) => b.rating.count - a.rating.count);
  return result;
}

// Текущие фильтры попадают в адресную строку — ссылкой на поиск можно поделиться
function syncUrl(filters) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  filters.cuisines.forEach((id) => params.append('cuisine', id));
  if (filters.district) params.set('district', filters.district);
  filters.prices.forEach((level) => params.append('price', level));
  if (filters.rating) params.set('rating', filters.rating);
  filters.features.forEach((id) => params.append('feature', id));
  if (filters.sort !== 'rating') params.set('sort', filters.sort);

  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

function countActive(filters) {
  return filters.cuisines.length + filters.prices.length + filters.features.length
    + (filters.district ? 1 : 0) + (filters.rating ? 1 : 0);
}

async function loadRestaurants() {
  const filters = readFilters();
  const requestId = ++lastRequest;
  syncUrl(filters);

  const active = countActive(filters);
  activeBadge.textContent = active;
  activeBadge.classList.toggle('d-none', active === 0);
  list.setAttribute('aria-busy', 'true');

  try {
    const restaurants = await api.get(`/restaurants?${buildQuery(filters)}`);
    // Пока шёл запрос, пользователь мог поменять фильтры — старый ответ не рисуем
    if (requestId !== lastRequest) return;

    const visible = applyClientFilters(restaurants, filters);
    list.innerHTML = visible.map((r) => `<div class="col">${restaurantCardHtml(r)}</div>`).join('');
    resultsCount.textContent = visible.length;
    emptyState.classList.toggle('d-none', visible.length > 0);
  } catch (error) {
    if (requestId !== lastRequest) return;
    list.innerHTML = `<div class="col-12">${errorHtml(error.message)}</div>`;
    resultsCount.textContent = '0';
  } finally {
    if (requestId === lastRequest) list.removeAttribute('aria-busy');
  }
}

// Параметры из адресной строки: форма на главной, плитки кухонь, ссылка на поиск
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const { elements } = filtersForm;

  if (params.has('q')) elements.q.value = params.get('q');
  if (params.has('district')) elements.district.value = params.get('district');
  if (params.has('sort')) elements.sort.value = params.get('sort');
  if (params.has('rating')) {
    const radio = filtersForm.querySelector(`input[name="rating"][value="${params.get('rating')}"]`);
    if (radio) radio.checked = true;
  }
  [['cuisine', 'cuisine'], ['price', 'price'], ['feature', 'feature']].forEach(([param, name]) => {
    params.getAll(param).forEach((value) => {
      const checkbox = document.querySelector(`#${name}-${CSS.escape(value)}`);
      if (checkbox) checkbox.checked = true;
    });
  });
}

// Поиск и сортировка вынесены из формы в тулбар и привязаны к ней атрибутом form,
// поэтому их события не всплывают до формы — слушаем весь документ.
document.addEventListener('input', (event) => {
  if (event.target.form !== filtersForm) return;
  clearTimeout(debounceTimer);
  // текстовый поиск ждёт, пока пользователь допечатает, остальные фильтры — сразу
  debounceTimer = setTimeout(loadRestaurants, event.target.type === 'search' ? 350 : 0);
});
filtersForm.addEventListener('submit', (event) => event.preventDefault());
// Во время события reset значения ещё старые, поэтому пересчитываем на следующем тике
filtersForm.addEventListener('reset', () => setTimeout(loadRestaurants));

list.querySelector('[data-loader]').innerHTML = loaderHtml('Ищем рестораны…');
renderFilterOptions()
  .catch(() => {})
  .finally(() => {
    applyUrlParams();
    loadRestaurants();
  });
