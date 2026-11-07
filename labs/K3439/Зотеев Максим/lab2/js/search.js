// Поиск объявлений: фильтрацию выполняет сервер по параметрам запроса
import { api } from './api.js';
import { formatPrice, hideAlert, propertyPhoto, showAlert } from './ui.js';
import './nav.js';

const form = document.getElementById('filters');
const list = document.getElementById('listings');
const template = document.getElementById('cardTemplate');
const count = document.getElementById('count');
const loading = document.getElementById('loading');
const empty = document.getElementById('empty');
const error = document.getElementById('error');

function buildQuery() {
  const params = new URLSearchParams();
  if (form.type.value) params.set('type', form.type.value);
  if (form.city.value) params.set('city', form.city.value);
  if (form.priceMin.value) params.set('price_gte', form.priceMin.value);
  if (form.priceMax.value) params.set('price_lte', form.priceMax.value);
  return params;
}

function createCard(property) {
  const card = template.content.cloneNode(true);
  const field = (name) => card.querySelector(`[data-field="${name}"]`);

  Object.assign(field('photo'), propertyPhoto(property, 600));
  field('type').textContent = property.type;
  field('title').textContent = property.title;
  field('location').textContent = `${property.city}, ${property.district}`;
  field('price').textContent = `${formatPrice(property.price)} / мес`;
  field('link').href = `property.html?id=${property.id}`;

  return card;
}

async function loadProperties() {
  loading.hidden = false;
  empty.hidden = true;
  hideAlert(error);

  try {
    const properties = await api(`/properties?${buildQuery()}`);
    list.replaceChildren(...properties.map(createCard));
    count.textContent = properties.length;
    empty.hidden = properties.length > 0;
  } catch (requestError) {
    list.replaceChildren();
    count.textContent = 0;
    showAlert(error, requestError.message);
  } finally {
    loading.hidden = true;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  loadProperties();
});

// После сброса формы значения очищаются не сразу, поэтому загружаем на следующем тике
form.addEventListener('reset', () => setTimeout(loadProperties));

loadProperties();
