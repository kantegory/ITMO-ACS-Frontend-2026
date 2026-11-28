// Страница каталога: поиск и фильтрация (фильтры уходят на сервер в query-параметрах)

const SORT_OPTIONS = {
  price_asc: { _sort: "price", _order: "asc" },
  price_desc: { _sort: "price", _order: "desc" },
  rating: { _sort: "rating_avg", _order: "desc" },
};

// _like в json-server работает через регулярное выражение, поэтому спецсимволы экранируем
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fillCategories() {
  const select = document.getElementById("f-category");
  try {
    const categories = await getCategories();
    categories.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = c.title;
      select.appendChild(option);
    });
  } catch (err) {
    showMessage(err.message, "danger");
  }
}

// собираем только заполненные фильтры
function getParams() {
  const params = {};

  const text = document.getElementById("f-text").value.trim();
  const category = document.getElementById("f-category").value;
  const shape = document.getElementById("f-shape").value;
  const material = document.getElementById("f-material").value.trim();
  const color = document.getElementById("f-color").value.trim();
  const priceMin = document.getElementById("f-price-min").value;
  const priceMax = document.getElementById("f-price-max").value;
  const sort = document.getElementById("f-sort").value;

  if (text) params.title_like = escapeRegExp(text);
  if (category) params.categoryId = category;
  if (shape) params.shape = shape;
  if (material) params.material_like = escapeRegExp(material);
  if (color) params.color_like = escapeRegExp(color);
  if (priceMin) params.price_gte = priceMin;
  if (priceMax) params.price_lte = priceMax;
  if (document.getElementById("f-handmade").checked) params.is_handmade = "true";
  if (sort) Object.assign(params, SORT_OPTIONS[sort]);

  return params;
}

function showCarpets(list) {
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
      '<div class="carpet-img" style="background-color:' + c.hex + '"></div>' +
      '<div class="card-body">' +
      '<h5 class="card-title"><a href="carpet.html?id=' + c.id + '" class="text-decoration-none">' +
      escapeHtml(c.title) + "</a></h5>" +
      '<p class="mb-1 text-muted">' + (c.category ? escapeHtml(c.category.title) : "") + "</p>" +
      '<p class="mb-1">' + SHAPE_NAMES[c.shape] + ", " + escapeHtml(c.material) + ", " + escapeHtml(c.color) + "</p>" +
      '<p class="mb-1">Рейтинг: ' + c.rating_avg + " (" + c.reviews_count + ")</p>" +
      "<p><strong>" + formatPrice(c.price) + "</strong></p>" +
      "</div></div>";
    box.appendChild(col);
  });
}

async function loadCarpets() {
  document.getElementById("total").textContent = "Загрузка...";
  try {
    const list = await getCarpets(getParams());
    document.getElementById("message").className = "";
    document.getElementById("message").textContent = "";
    showCarpets(list);
  } catch (err) {
    document.getElementById("total").textContent = "";
    showMessage(err.message, "danger");
  }
}

function setupSearch() {
  const form = document.getElementById("filter-form");
  if (!form) return;

  fillCategories();
  loadCarpets();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    loadCarpets();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    form.reset();
    loadCarpets();
  });
}

setupSearch();
