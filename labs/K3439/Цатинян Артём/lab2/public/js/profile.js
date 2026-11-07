import { api, tokenKey, getToken } from "./api.js";
import { showError } from "./ui.js";
import { esc } from "./utils.js";
function renderBooking(booking, restaurants) {
  const restaurant = restaurants.find(
    (item) => item.id === booking.restaurantId,
  );
  const past = new Date(`${booking.date}T${booking.time}`) < new Date();
  const editUrl = `restaurant.html?id=${encodeURIComponent(booking.restaurantId)}&edit=${encodeURIComponent(booking.id)}`;
  return `
    <article class="bg-white rounded-4 p-4 shadow-sm my-3">
      <p class="eyebrow">${past ? "Прошедший визит" : "Ближайшая бронь"}</p>
      <h2>${esc(restaurant?.name || "Ресторан")}</h2>
      <p class="text-secondary">${esc(booking.date)} · ${esc(booking.time)} · Гостей: ${esc(booking.guests)} · ${esc(restaurant?.address)}</p>
      ${
        past
          ? ""
          : `<a class="btn btn-outline-dark" href="${editUrl}">Изменить бронь</a>
        <button class="btn btn-outline-danger" data-cancel="${esc(booking.id)}">Отменить</button>`
      }
    </article>`;
}

async function profile() {
  const title = document.querySelector("[data-user-name]");
  if (!title) return;
  if (!getToken()) {
    location.href = "login.html";
    return;
  }
  const [user, bookings, restaurants] = await Promise.all([
    api("/me"),
    api("/bookings"),
    api("/restaurants"),
  ]);
  title.textContent = "Привет, " + user.name;
  const main = title.parentElement;
  main.querySelector(".row").remove();
  main.querySelector("h2.mt-5").remove();
  main.querySelector(".bg-white.rounded-4.p-3.mt-3").remove();
  const logout = document.createElement("button");
  logout.className = "btn btn-outline-dark mt-3";
  logout.textContent = "Выйти";
  logout.onclick = async () => {
    try {
      await api("/logout", "POST", {});
    } catch {}
    sessionStorage.removeItem(tokenKey);
    location.href = "index.html";
  };
  main.append(logout);
  const section = document.createElement("section");
  section.className = "mt-4";
  section.innerHTML = `
    <h2>Мои бронирования</h2>
    ${
      bookings.length
        ? bookings
            .map((booking) => renderBooking(booking, restaurants))
            .join("")
        : '<div class="bg-white rounded-4 p-4">Пока нет бронирований. <a href="index.html">Выбрать ресторан</a></div>'
    }
  `;
  main.append(section);
  section.querySelectorAll("[data-cancel]").forEach(
    (button) =>
      (button.onclick = async () => {
        if (!confirm("Отменить бронирование?")) return;
        button.disabled = true;
        try {
          await api(
            "/bookings/" + encodeURIComponent(button.dataset.cancel),
            "DELETE",
          );
          location.reload();
        } catch (err) {
          showError(section, err.message);
          button.disabled = false;
        }
      }),
  );
}

export { profile };
