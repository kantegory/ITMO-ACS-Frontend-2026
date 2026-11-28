// Страница товара: данные ковра приходят с сервера

function renderCarpet(carpet) {
  const size = carpet.diameter
    ? "Диаметр: " + carpet.diameter + " см"
    : "Размер: " + carpet.length + " × " + carpet.width + " см";

  document.title = carpet.title + " — CarpetShop";
  document.getElementById("carpet-image").style.backgroundColor = carpet.hex;
  document.getElementById("carpet-title").textContent = carpet.title;
  document.getElementById("carpet-category").textContent = carpet.category ? carpet.category.title : "";
  document.getElementById("carpet-description").textContent = carpet.description;
  document.getElementById("carpet-price").textContent = formatPrice(carpet.price);
  document.getElementById("carpet-rating").textContent =
    carpet.rating_avg + " (" + carpet.reviews_count + " отзывов)";
  document.getElementById("carpet-stock").textContent = carpet.stock + " шт.";

  document.getElementById("carpet-props").innerHTML =
    "<li>Форма: " + SHAPE_NAMES[carpet.shape] + "</li>" +
    "<li>" + size + "</li>" +
    "<li>Материал: " + escapeHtml(carpet.material) + "</li>" +
    "<li>Цвет: " + escapeHtml(carpet.color) + "</li>" +
    "<li>Рисунок: " + escapeHtml(carpet.pattern) + "</li>" +
    "<li>Ручная работа: " + (carpet.is_handmade ? "да" : "нет") + "</li>";
}

async function setupCarpetPage() {
  if (!document.getElementById("carpet-title")) return;

  const id = new URLSearchParams(window.location.search).get("id");

  try {
    renderCarpet(await getCarpet(id));
  } catch (err) {
    document.getElementById("carpet-content").classList.add("d-none");
    if (err.status === 404) {
      document.getElementById("not-found").classList.remove("d-none");
    } else {
      showMessage(err.message, "danger");
    }
  }
}

setupCarpetPage();
