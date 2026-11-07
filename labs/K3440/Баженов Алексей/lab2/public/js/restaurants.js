const filters = document.getElementById('filters');
const results = document.getElementById('results');
const state = document.getElementById('state');

let controller = null;
let timer = null;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function restaurantCard(r) {
  return `
    <div class="col-sm-6 col-xl-4">
      <a href="restaurant.html?id=${r.id}" class="card h-100">
        <div class="ph ph-${r.photo}" role="img" aria-label="Фото ресторана ${esc(r.name)}"></div>
        <div class="card-body">
          <h2 class="h5">${esc(r.name)}</h2>
          <p class="mb-1"><span class="rating">★</span> ${r.rating.toFixed(1)} · ${'₽'.repeat(r.price)}</p>
          <p class="text-muted small mb-0">${esc(r.cuisineLabel)} кухня · ${esc(r.districtLabel)}</p>
        </div>
      </a>
    </div>`;
}

function buildQuery() {
  const params = new URLSearchParams();
  const q = filters.elements.q.value.trim();
  if (q) params.set('name_like', escapeRegExp(q));
  if (filters.elements.cuisine.value) params.set('cuisine', filters.elements.cuisine.value);
  if (filters.elements.district.value) params.set('district', filters.elements.district.value);
  if (filters.elements.price.value) params.set('price_lte', filters.elements.price.value);
  return params.toString();
}

function setState(text, isError = false) {
  state.textContent = text;
  state.classList.toggle('text-danger', isError);
  state.classList.toggle('text-muted', !isError);
}

async function load() {
  if (controller) controller.abort(); // отменяем устаревший запрос
  controller = new AbortController();
  setState('Загрузка…');
  try {
    const list = await api.get('/restaurants?' + buildQuery(), { signal: controller.signal });
    results.innerHTML = list.map(restaurantCard).join('');
    setState(list.length ? `Найдено ресторанов: ${list.length}` : 'Ничего не найдено.');
  } catch (e) {
    if (e.name === 'AbortError') return;
    results.innerHTML = '';
    setState(e.message, true);
  }
}

filters.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(load, 250); // не засыпаем сервер запросами при вводе
});
filters.addEventListener('reset', () => setTimeout(load));
filters.addEventListener('submit', (e) => e.preventDefault()); // Enter в поиске не перезагружает страницу

load();
