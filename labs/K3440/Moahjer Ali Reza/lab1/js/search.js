// Страница каталога: поиск и фильтрация

function fillCategories() {
  const select = document.getElementById("f-category");
  CATEGORIES.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.title;
    select.appendChild(option);
  });
}

function getFilters() {
  return {
    text: document.getElementById("f-text").value.trim().toLowerCase(),
    category: document.getElementById("f-category").value,
    shape: document.getElementById("f-shape").value,
    material: document.getElementById("f-material").value.trim().toLowerCase(),
    color: document.getElementById("f-color").value.trim().toLowerCase(),
    priceMin: document.getElementById("f-price-min").value,
    priceMax: document.getElementById("f-price-max").value,
    handmade: document.getElementById("f-handmade").checked,
    sort: document.getElementById("f-sort").value,
  };
}

function filterCarpets(f) {
  let result = CARPETS.filter((c) => {
    if (f.text && !c.title.toLowerCase().includes(f.text)) return false;
    if (f.category && c.category_id !== Number(f.category)) return false;
    if (f.shape && c.shape !== f.shape) return false;
    if (f.material && !c.material.toLowerCase().includes(f.material))
      return false;
    if (f.color && !c.color.toLowerCase().includes(f.color)) return false;
    if (f.priceMin && c.price < Number(f.priceMin)) return false;
    if (f.priceMax && c.price > Number(f.priceMax)) return false;
    if (f.handmade && !c.is_handmade) return false;
    return true;
  });

  if (f.sort === "price_asc") result.sort((a, b) => a.price - b.price);
  if (f.sort === "price_desc") result.sort((a, b) => b.price - a.price);
  if (f.sort === "rating") result.sort((a, b) => b.rating_avg - a.rating_avg);

  return result;
}

function renderCarpets() {
  const list = filterCarpets(getFilters());
  const box = document.getElementById("carpets");
  document.getElementById("total").textContent = "Найдено: " + list.length;
  box.innerHTML = "";

  if (list.length === 0) {
    box.innerHTML = "<p>Ничего не найдено</p>";
    return;
  }

  list.forEach((c) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-4 mb-4";
    col.innerHTML =
      '<div class="card h-100">' +
      '<div class="carpet-img" style="background-color:' +
      c.hex +
      '"></div>' +
      '<div class="card-body">' +
      '<h5 class="card-title"><a href="carpet.html?id=' +
      c.id +
      '" class="text-decoration-none">' +
      c.title +
      "</a></h5>" +
      '<p class="mb-1 text-muted">' +
      getCategoryTitle(c.category_id) +
      "</p>" +
      '<p class="mb-1">' +
      SHAPE_NAMES[c.shape] +
      ", " +
      c.material +
      ", " +
      c.color +
      "</p>" +
      '<p class="mb-1">Рейтинг: ' +
      c.rating_avg +
      " (" +
      c.reviews_count +
      ")</p>" +
      "<p><strong>" +
      formatPrice(c.price) +
      "</strong></p>" +
      "</div>";
    box.appendChild(col);
  });
}

function setupSearch() {
  const form = document.getElementById("filter-form");
  if (!form) return;

  fillCategories();
  renderCarpets();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    renderCarpets();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    form.reset();
    renderCarpets();
  });
}

setupSearch();
