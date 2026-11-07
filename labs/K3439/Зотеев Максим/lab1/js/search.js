// Фильтрация карточек на странице поиска
const form = document.getElementById('filters');
const cards = document.querySelectorAll('.listing');

function applyFilters() {
  const type = form.type.value;
  const city = form.city.value;
  const priceMin = Number(form.priceMin.value) || 0;
  const priceMax = Number(form.priceMax.value) || Infinity;
  let count = 0;

  cards.forEach((card) => {
    const price = Number(card.dataset.price);
    const visible =
      (type === '' || card.dataset.type === type) &&
      (city === '' || card.dataset.city === city) &&
      price >= priceMin &&
      price <= priceMax;

    card.classList.toggle('d-none', !visible);
    if (visible) count++;
  });

  document.getElementById('count').textContent = count;
  document.getElementById('empty').classList.toggle('d-none', count > 0);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  applyFilters();
});

// После сброса формы значения очищаются не сразу, поэтому фильтруем на следующем тике
form.addEventListener('reset', () => setTimeout(applyFilters));
