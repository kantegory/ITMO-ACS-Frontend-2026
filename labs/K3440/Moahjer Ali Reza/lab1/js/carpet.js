// Страница товара: описание, добавление в корзину, отзывы

let carpet = null;

function renderCarpet() {
  const size = carpet.diameter
    ? "Диаметр: " + carpet.diameter + " см"
    : "Размер: " + carpet.length + " × " + carpet.width + " см";

  document.title = carpet.title + " — CarpetShop";
  document.getElementById("carpet-image").style.backgroundColor = carpet.hex;
  document.getElementById("carpet-title").textContent = carpet.title;
  document.getElementById("carpet-category").textContent = getCategoryTitle(
    carpet.category_id,
  );
  document.getElementById("carpet-description").textContent =
    carpet.description;
  document.getElementById("carpet-price").textContent = formatPrice(
    carpet.price,
  );
  document.getElementById("carpet-rating").textContent =
    carpet.rating_avg + " (" + carpet.reviews_count + " отзывов)";
  document.getElementById("carpet-stock").textContent = carpet.stock + " шт.";

  document.getElementById("carpet-props").innerHTML =
    "<li>Форма: " +
    SHAPE_NAMES[carpet.shape] +
    "</li>" +
    "<li>" +
    size +
    "</li>" +
    "<li>Материал: " +
    carpet.material +
    "</li>" +
    "<li>Цвет: " +
    carpet.color +
    "</li>" +
    "<li>Рисунок: " +
    carpet.pattern +
    "</li>" +
    "<li>Ручная работа: " +
    (carpet.is_handmade ? "да" : "нет") +
    "</li>";

  document.getElementById("quantity").max = carpet.stock;
}

function setupCarpetPage() {
  if (!document.getElementById("carpet-title")) return;

  const id = new URLSearchParams(window.location.search).get("id");
  carpet = getCarpetById(id);

  if (!carpet) {
    document.getElementById("carpet-content").classList.add("d-none");
    document.getElementById("not-found").classList.remove("d-none");
    return;
  }

  renderCarpet();
}
setupCarpetPage();
