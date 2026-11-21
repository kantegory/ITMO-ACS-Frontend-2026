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
      <a class="card h-100 restaurant-card text-decoration-none text-reset" href="restaurant.html?id=${r.id}"
        aria-label="${r.name}, ${r.cuisine} кухня, ${r.city}, рейтинг ${r.rating.toFixed(1)} из 5, ${priceLabel(r.price)}">
        <img src="${r.img}" class="card-img-top" alt="" aria-hidden="true">
        <div class="card-body">
          <h3 class="card-title h5">${r.name}</h3>
          <p class="card-text text-muted mb-1"><svg class="icon" aria-hidden="true"><use href="icons/sprite.svg#icon-pin"></use></svg> ${r.cuisine} · ${r.city}</p>
          <p class="card-text">
            <span class="rating-stars" aria-hidden="true">${renderStars(r.rating)}</span>
            <span class="text-muted">${r.rating.toFixed(1)}</span>
            <span class="price-tag float-end">${priceSymbols(r.price)}</span>
          </p>
        </div>
      </a>
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
