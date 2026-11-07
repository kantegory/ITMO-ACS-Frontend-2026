import { api, getToken } from "./api.js";
import { showError } from "./ui.js";
import { esc } from "./utils.js";

const BOOKING_TIMES = [
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];
const DEFAULT_BOOKING_TIME = "19:00";
const MAX_GUESTS = 8;

function renderRestaurantDetails(restaurant) {
  return `
    <h2>О ресторане</h2>
    <p class="text-secondary">
      ${esc(restaurant.description)} ${esc(restaurant.address)} · Средний чек ${esc(restaurant.price)} ₽
    </p>
    <h2 class="mt-5">Популярное меню</h2>
    <div class="border-bottom py-3">${esc(restaurant.dish)}</div>
    <h2 class="mt-5">Рейтинг</h2>
    <div class="bg-white rounded-4 p-3">★ ${esc(restaurant.rating)}</div>
  `;
}
async function restaurant() {
  const form = document.querySelector("#booking-form");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "1";
  const edit = params.get("edit");
  const r = await api("/restaurants/" + encodeURIComponent(id));
  const hero = document.querySelector(".hero");
  hero.querySelector(".eyebrow").textContent = r.cuisine + " · " + r.district;
  hero.querySelector("h1").textContent = r.name;
  hero.querySelector(".lead").textContent = r.description;
  const info = document.querySelector("main section.col-lg-7");
  info.innerHTML = renderRestaurantDetails(r);
  const date = form.elements.date;
  date.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  date.value = date.min;
  form.elements.guests.innerHTML = Array.from(
    { length: MAX_GUESTS },
    (_, index) =>
      `<option value="${index + 1}" ${index === 1 ? "selected" : ""}>${index + 1}</option>`,
  ).join("");
  form.elements.time.innerHTML = BOOKING_TIMES.map(
    (t) =>
      `<option ${t === DEFAULT_BOOKING_TIME ? "selected" : ""}>${t}</option>`,
  ).join("");
  if (edit) {
    const booking = await api("/bookings/" + encodeURIComponent(edit));
    date.value = booking.date;
    form.elements.time.value = booking.time;
    form.elements.guests.value = booking.guests;
    form.querySelector("button").textContent = "Сохранить изменения";
  }
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!getToken()) {
      location.href = "login.html";
      return;
    }
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      await api(
        "/bookings" + (edit ? "/" + encodeURIComponent(edit) : ""),
        edit ? "PATCH" : "POST",
        { ...Object.fromEntries(new FormData(form)), restaurantId: id },
      );
      location.href = "profile.html";
    } catch (err) {
      showError(form, err.message);
    } finally {
      button.disabled = false;
    }
  };
}

export { restaurant };
