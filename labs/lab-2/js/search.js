// Логика страницы поиска/фильтрации ресторанов через API
function populateSelectOptions(restaurants) {
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine))].sort();
  const cities = [...new Set(restaurants.map((r) => r.city))].sort();
  const cuisineSelect = document.getElementById("f-cuisine");
  const citySelect = document.getElementById("f-city");

  cuisines.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    cuisineSelect.appendChild(opt);
  });

  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });
}

function restaurantCardHtml(r) {
  return `
    <div class="col-md-6 col-xl-4">
      <div class="card h-100 restaurant-card" onclick="window.location.href='restaurant.html?id=${r.id}'">
        <img src="${r.img}" class="card-img-top" alt="${r.name}">
        <div class="card-body">
          <h5 class="card-title">${r.name}</h5>
          <p class="card-text text-muted mb-1">${r.cuisine} · ${r.city}</p>
          <p class="card-text">
            <span class="rating-stars">${renderStars(r.rating)}</span>
            <span class="text-muted">${r.rating.toFixed(1)}</span>
            <span class="price-tag float-end">${priceSymbols(r.price)}</span>
          </p>
        </div>
      </div>
    </div>`;
}

async function applyFilters() {
  const filters = {
    name: document.getElementById("f-name").value.trim(),
    cuisine: document.getElementById("f-cuisine").value,
    city: document.getElementById("f-city").value,
    price: document.getElementById("f-price").value
  };

  const list = document.getElementById("restaurant-list");
  const noResults = document.getElementById("no-results");
  const count = document.getElementById("results-count");

  try {
    const filtered = await fetchRestaurants(filters);
    list.innerHTML = filtered.map(restaurantCardHtml).join("");
    noResults.classList.toggle("d-none", filtered.length > 0);
    count.textContent = `Найдено ресторанов: ${filtered.length}`;
  } catch (err) {
    list.innerHTML = "";
    count.textContent = "";
    noResults.textContent = "Не удалось загрузить рестораны. Проверьте, что запущен мок-сервер API.";
    noResults.classList.remove("d-none");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const all = await fetchRestaurants().catch(() => []);
  populateSelectOptions(all);
  applyFilters();

  document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
  });

  document.getElementById("f-reset").addEventListener("click", () => {
    document.getElementById("filter-form").reset();
    applyFilters();
  });
});
