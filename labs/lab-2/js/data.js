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

function renderStars(rating) {
  const full = Math.round(rating);
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += i <= full ? "★" : "☆";
  }
  return html;
}
