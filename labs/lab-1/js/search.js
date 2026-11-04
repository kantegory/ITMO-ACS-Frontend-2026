// Логика страницы поиска/фильтрации ресторанов
function populateSelectOptions() {
  const cuisines = [...new Set(RESTAURANTS.map((r) => r.cuisine))].sort();
  const cities = [...new Set(RESTAURANTS.map((r) => r.city))].sort();
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

function applyFilters() {
  const name = document.getElementById("f-name").value.trim().toLowerCase();
  const cuisine = document.getElementById("f-cuisine").value;
  const city = document.getElementById("f-city").value;
  const price = document.getElementById("f-price").value;

  const filtered = RESTAURANTS.filter((r) => {
    if (name && !r.name.toLowerCase().includes(name)) return false;
    if (cuisine && r.cuisine !== cuisine) return false;
    if (city && r.city !== city) return false;
    if (price && r.price !== Number(price)) return false;
    return true;
  });

  const list = document.getElementById("restaurant-list");
  const noResults = document.getElementById("no-results");
  const count = document.getElementById("results-count");

  list.innerHTML = filtered.map(restaurantCardHtml).join("");
  noResults.classList.toggle("d-none", filtered.length > 0);
  count.textContent = `Найдено ресторанов: ${filtered.length}`;
}

document.addEventListener("DOMContentLoaded", () => {
  populateSelectOptions();
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
