// Фильтрация и сортировка объявлений на странице поиска

const form = document.getElementById('filter-form');
const quick = document.getElementById('quick-search');
const results = document.getElementById('results');
const empty = document.getElementById('empty');
const count = document.getElementById('results-count');
const sortSelect = document.getElementById('sort');
const range = document.getElementById('price-range');
const maxInput = document.getElementById('price-max');

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

function readFilters() {
  const data = new FormData(form);
  return {
    types: data.getAll('type'),
    rooms: data.getAll('rooms').map(Number),
    min: Number(data.get('min')) || 0,
    max: Number(data.get('max')) || Infinity,
    area: Number(data.get('area')) || 0,
    nocommission: data.has('nocommission'),
    pets: data.has('pets'),
    kids: data.has('kids'),
    furniture: data.has('furniture'),
    balcony: data.has('balcony'),
    city: quick.city.value,
    q: quick.q.value.trim().toLowerCase()
  };
}

function matches(item, f) {
  if (!f.types.includes(item.type)) return false;
  if (f.rooms.length && !f.rooms.some(r => (r === 4 ? item.rooms >= 4 : item.rooms === r))) return false;
  if (item.price < f.min || item.price > f.max) return false;
  if (item.area < f.area) return false;
  if (f.nocommission && item.commission > 0) return false;
  if (f.pets && !item.pets) return false;
  if (f.kids && !item.kids) return false;
  if (f.furniture && !item.furniture) return false;
  if (f.balcony && !item.balcony) return false;
  if (f.city && item.city !== f.city) return false;
  if (f.q) {
    const hay = `${item.district} ${item.metro} ${item.address} ${item.title}`.toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

const sorters = {
  new: (a, b) => b.posted.localeCompare(a.posted),
  cheap: (a, b) => a.price - b.price,
  expensive: (a, b) => b.price - a.price,
  area: (a, b) => b.area - a.area
};

function plural(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'объявление';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'объявления';
  return 'объявлений';
}

function render() {
  const f = readFilters();
  const list = LISTINGS.filter(item => matches(item, f)).sort(sorters[sortSelect.value]);
  const asList = document.getElementById('view-list').checked;

  results.classList.toggle('listing-row', asList);
  results.innerHTML = list.map(item =>
    `<div class="${asList ? 'col-12' : 'col-sm-6 col-xl-4'}">${listingCard(item, { row: asList })}</div>`
  ).join('');
  empty.classList.toggle('d-none', list.length > 0);
  count.textContent = `Найдено ${list.length} ${plural(list.length)}`;
  document.getElementById('search-title').textContent = f.city ? `Аренда жилья: ${f.city}` : 'Аренда жилья';
  bindFavoriteButtons(results);
}

function resetAll() {
  form.reset();
  quick.reset();
  range.value = range.max;
  history.replaceState(null, '', 'search.html');
  render();
}

range.addEventListener('input', () => { maxInput.value = range.value; render(); });
maxInput.addEventListener('input', () => { if (maxInput.value) range.value = maxInput.value; });
form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('reset', () => setTimeout(() => { range.value = range.max; render(); }));
quick.addEventListener('submit', (e) => { e.preventDefault(); render(); });
quick.city.addEventListener('change', render);
sortSelect.addEventListener('change', render);
document.querySelectorAll('[name="view"]').forEach(r => r.addEventListener('change', render));
document.getElementById('empty-reset').addEventListener('click', resetAll);
document.querySelectorAll('.pagination a').forEach(a => a.addEventListener('click', e => e.preventDefault()));

applyUrlParams();
render();
