import { api } from "./api.js";
import { showError } from "./ui.js";
import { esc } from "./utils.js";
const RESTAURANT_PHOTOS = [
  "photo-1515003197210-e0cd71810b5f",
  "photo-1579871494447-9811cf80d66c",
  "photo-1547592180-85f173990554",
  "photo-1512621776951-a57141f2eefd",
  "photo-1513104890138-7c749659a591",
  "photo-1544025162-d76694265947",
];

function renderRestaurantCard(restaurant) {
  const photo =
    RESTAURANT_PHOTOS[(Number(restaurant.id) - 1) % RESTAURANT_PHOTOS.length];
  const imageUrl = `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=900&q=80`;
  return `
    <article class="col-md-6 col-xl-4 restaurant">
      <div class="restaurant-card">
        <img src="${imageUrl}" alt="">
        <div class="p-3">
          <div class="d-flex justify-content-between">
            <h3>${esc(restaurant.name)}</h3>
            <span class="rating"><svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#star"></use></svg> <span class="visually-hidden">Рейтинг: </span>${esc(restaurant.rating)}</span>
          </div>
          <p>${esc(restaurant.cuisine)} · ${esc(restaurant.district)} · ${esc(restaurant.price)} ₽</p>
          <a class="stretched-link" href="restaurant.html?id=${encodeURIComponent(restaurant.id)}" aria-label="Открыть ресторан ${esc(restaurant.name)}">Открыть ресторан</a>
        </div>
      </div>
    </article>`;
}

async function catalog() {
  const list = document.querySelector("#catalog");
  if (!list) return;
  const restaurants = await api("/restaurants");
  const district = document.querySelector("#district");
  district.innerHTML =
    '<option value="">Любой район</option>' +
    [...new Set(restaurants.map((r) => r.district))]
      .map((d) => "<option>" + esc(d) + "</option>")
      .join("");
  const filters = document.querySelector("#filters");
  filters.innerHTML = ["Все", ...new Set(restaurants.map((r) => r.cuisine))]
    .map(
      (v, i) =>
        '<button type="button" class="filter' +
        (!i ? " active" : "") +
        '" data-filter="' +
        esc(i ? v : "") +
        '">' +
        esc(v) +
        "</button>",
    )
    .join("");
  let cuisine = "";
  filters.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("active")),
    );
  });
  async function render() {
    const q = new URLSearchParams();
    if (cuisine) q.set("cuisine", cuisine);
    if (district.value) q.set("district", district.value);
    const data = await api("/restaurants?" + q);
    list.innerHTML = data.length
      ? data.map(renderRestaurantCard).join("")
      : "<p>Рестораны не найдены. Попробуйте другие фильтры.</p>";
    document.querySelector("#catalog-status").textContent = data.length
      ? `Найдено ресторанов: ${data.length}`
      : "Рестораны не найдены";
  }
  filters.onclick = (e) => {
    const button = e.target.closest("[data-filter]");
    if (!button) return;
    cuisine = button.dataset.filter;
    const previous = filters.querySelector(".active");
    previous?.classList.remove("active");
    previous?.setAttribute("aria-pressed", "false");
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    render().catch((err) => showError(list.parentElement, err.message));
  };
  district.onchange = () =>
    render().catch((err) => showError(list.parentElement, err.message));
  document.querySelector("#searchForm").onsubmit = (e) => {
    e.preventDefault();
    list.scrollIntoView({ behavior: "smooth" });
  };
  await render();
}

export { catalog };
