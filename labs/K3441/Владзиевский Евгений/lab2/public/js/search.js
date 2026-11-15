// Поиск объявлений. Фильтры и сортировка уходят на сервер параметрами запроса,
// ответ приходит из json-server. Пагинация — через _page/_limit и X-Total-Count.

const form = document.getElementById('filter-form');
const quick = document.getElementById('quick-search');
const results = document.getElementById('results');
const empty = document.getElementById('empty');
const count = document.getElementById('results-count');
const sortSelect = document.getElementById('sort');
const range = document.getElementById('price-range');
const maxInput = document.getElementById('price-max');
const pagination = document.querySelector('.pagination');

const PER_PAGE = 6;
let page = 1;

// Параметры из формы на главной: ?type=flat2&city=...&max=65
function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  if (type) {
    const base = type.replace(/\d/, '');
    form.querySelectorAll('[name="type"]').forEach(cb => { cb.checked = cb.value === base; });
    const rooms = type.match(/\d/);
    if (rooms) form.querySelector(`[name="rooms"][value="${rooms[0]}"]`).checked = true;
  }
  if (params.get('city')) quick.city.value = params.get('city');
  if (params.get('q')) quick.q.value = params.get('q');
  if (params.get('max')) {
    const max = Number(params.get('max'));
    maxInput.value = max < 1000 ? max * 1000 : max;
  }
}

const SORTS = {
  new: { _sort: 'posted', _order: 'desc' },
  cheap: { _sort: 'price', _order: 'asc' },
  expensive: { _sort: 'price', _order: 'desc' },
  area: { _sort: 'area', _order: 'desc' }
};

// Собирает параметры запроса к /api/listings из состояния формы
function buildQuery() {
  const data = new FormData(form);
  const rooms = data.getAll('rooms').map(Number);
  const params = {
    type: data.getAll('type'),
    price_gte: data.get('min') || undefined,
    price_lte: data.get('max') || undefined,
    area_gte: data.get('area') || undefined,
    city: quick.city.value || undefined,
    q: quick.q.value.trim() || undefined,
    ...SORTS[sortSelect.value],
    _page: page,
    _limit: PER_PAGE
  };

  // Логические условия json-server умеет сравнивать напрямую
  if (data.has('nocommission')) params.commission = 0;
  for (const key of ['pets', 'kids', 'furniture', 'balcony']) {
    if (data.has(key)) params[key] = true;
  }

  // Комнаты: 1–3 уходят списком значений, а «4+» — это диапазон.
  // Вместе в один запрос json-server их не соберёт, поэтому «4+»
  // обрабатывается отдельно (см. fetchListings).
  const plain = rooms.filter(r => r < 4);
  if (plain.length && !rooms.includes(4)) params.rooms = plain;
  if (rooms.includes(4) && !plain.length) params.rooms_gte = 4;

  return { params, rooms, mixedRooms: rooms.includes(4) && plain.length > 0 };
}

async function fetchListings() {
  const { params, rooms, mixedRooms } = buildQuery();

  // Редкий случай «выбраны и 2, и 4+»: json-server не выразит такое одним
  // запросом, поэтому берём всё подходящее по остальным фильтрам
  // и отбираем комнаты на клиенте.
  if (mixedRooms) {
    const { _page, _limit, ...rest } = params;
    const all = await api.getList('/listings', rest);
    const filtered = all.filter(l => rooms.some(r => (r === 4 ? l.rooms >= 4 : l.rooms === r)));
    const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    slice.total = filtered.length;
    return slice;
  }

  return api.getList('/listings', params);
}

function renderPagination(total) {
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (pages === 1) {
    pagination.innerHTML = '';
    pagination.parentElement.classList.add('d-none');
    return;
  }
  pagination.parentElement.classList.remove('d-none');
  const item = (label, target, { disabled = false, current = false, aria } = {}) => `
    <li class="page-item${current ? ' active' : ''}"${current ? ' aria-current="page"' : ''}>
      ${current
        ? `<span class="page-link">${label}<span class="visually-hidden"> (текущая страница)</span></span>`
        : `<button class="page-link" type="button" data-page="${target}"${disabled ? ' disabled' : ''}${aria ? ` aria-label="${aria}"` : ''}>${label}</button>`}
    </li>`;

  let html = item('Назад', page - 1, { disabled: page === 1 });
  for (let p = 1; p <= pages; p++) html += item(String(p), p, { current: p === page, aria: `Страница ${p}` });
  html += item('Дальше', page + 1, { disabled: page === pages });
  pagination.innerHTML = html;

  pagination.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => {
    page = Number(btn.dataset.page);
    render();
    document.getElementById('search-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
}

async function render() {
  const asList = document.getElementById('view-list').checked;
  const wrapper = asList ? 'col-12' : 'col-sm-6 col-xl-4';
  results.classList.toggle('listing-row', asList);
  results.innerHTML = skeletonCards(PER_PAGE, wrapper);
  empty.classList.add('d-none');
  count.textContent = 'Ищем…';

  let list;
  try {
    list = await fetchListings();
  } catch (e) {
    results.innerHTML = '';
    count.textContent = 'Не удалось загрузить объявления';
    reportError(e, 'search');
    return;
  }

  const total = list.total ?? list.length;
  results.innerHTML = list.map(item => `<div class="${wrapper}">${listingCard(item, { row: asList })}</div>`).join('');
  empty.classList.toggle('d-none', total > 0);
  count.textContent = `Найдено ${total} ${plural(total)}`;
  document.getElementById('search-title').textContent =
    quick.city.value ? `Аренда жилья: ${quick.city.value}` : 'Аренда жилья';
  renderPagination(total);
  bindFavoriteButtons(results);
}

// Любое изменение фильтров возвращает на первую страницу
function renderFromFirstPage() {
  page = 1;
  render();
}

function resetAll() {
  form.reset();
  quick.reset();
  range.value = range.max;
  history.replaceState(null, '', 'search.html');
  renderFromFirstPage();
}

// Поля ввода и ползунок — с задержкой, чекбоксы — сразу
const renderDebounced = debounce(renderFromFirstPage);

range.addEventListener('input', () => { maxInput.value = range.value; renderDebounced(); });
maxInput.addEventListener('input', () => { if (maxInput.value) range.value = maxInput.value; });
form.addEventListener('input', (e) => {
  if (e.target.type === 'checkbox' || e.target.type === 'radio') return; // их ловит change
  renderDebounced();
});
form.addEventListener('change', renderFromFirstPage);
form.addEventListener('reset', () => setTimeout(() => { range.value = range.max; renderFromFirstPage(); }));
quick.addEventListener('submit', (e) => { e.preventDefault(); renderFromFirstPage(); });
quick.city.addEventListener('change', renderFromFirstPage);
sortSelect.addEventListener('change', renderFromFirstPage);
document.querySelectorAll('[name="view"]').forEach(r => r.addEventListener('change', render));
document.getElementById('empty-reset').addEventListener('click', resetAll);

applyUrlParams();
render();
