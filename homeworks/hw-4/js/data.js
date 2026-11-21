// Загрузка данных о ресторанах из мокового API и вспомогательные функции отображения
async function fetchRestaurants(filters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.set("name_like", filters.name);
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.city) params.set("city", filters.city);
  if (filters.price) params.set("price", filters.price);

  const query = params.toString();
  return apiFetch(`/restaurants${query ? `?${query}` : ""}`);
}

async function fetchRestaurantById(id) {
  try {
    return await apiFetch(`/restaurants/${id}`);
  } catch (e) {
    return null;
  }
}

function priceSymbols(level) {
  const symbols = ["$", "$$", "$$$", "$$$$"];
  return symbols[level - 1] || "$";
}

function priceLabel(level) {
  const labels = ["Бюджетно", "Средне", "Дорого", "Премиум"];
  return labels[level - 1] || "Бюджетно";
}

// Звёзды — чисто декоративная иллюстрация рейтинга, поэтому скрыты от скринридеров (aria-hidden),
// а численное значение рейтинга выводится рядом видимым и доступным текстом.
function renderStars(rating) {
  const full = Math.round(rating);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    const filled = i <= full;
    html += `<svg class="icon rating-star ${filled ? "rating-star-filled" : "rating-star-empty"}"><use href="icons/sprite.svg#icon-star"></use></svg>`;
  }
  return html;
}
