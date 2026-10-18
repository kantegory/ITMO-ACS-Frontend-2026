"use strict";

// Общая навигация повторяется на всех восьми страницах.
document.querySelector("#site-header").innerHTML = `
  <nav class="navbar navbar-expand-md site-nav">
    <div class="container">
      <a class="brand" href="index.html">Тихий двор</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
        data-bs-target="#navigation" aria-controls="navigation" aria-expanded="false"
        aria-label="Открыть меню"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse justify-content-end" id="navigation">
        <div class="navbar-nav gap-3">
          <a class="nav-link" href="index.html">Рестораны</a>
          <a class="nav-link" href="tables.html">Бронирование</a>
          <a class="nav-link" href="profile.html">Профиль</a>
          <a class="btn btn-outline-primary" href="bookings.html">Мои брони</a>
        </div>
      </div>
    </div>
  </nav>`;
document.querySelector("#site-footer").innerHTML = `
  <div class="container d-flex justify-content-between gap-3 flex-wrap py-4 small">
    <span>Тихий двор - место для неспешных встреч</span>
    <span>Каждый день · 12:00-23:00</span>
  </div>`;

// Три учебных ресторана. Это данные для показа, запросов к серверу здесь нет.
const restaurants = {
  "quiet-yard": {
    name: "Тихий двор", city: "Санкт-Петербург", address: "Литейный проспект, 28",
    cuisine: "Европейская кухня", price: "₽₽", photo: "images/window.png",
    description: "Мягкий свет и тихий двор за окном. Здесь удобно встретиться за ужином.",
  },
  "yard-petrograd": {
    name: "Двор на Петроградской", city: "Санкт-Петербург", address: "Большой проспект П.С., 42",
    cuisine: "Итальянская кухня", price: "₽₽₽", photo: "images/hall.png",
    description: "Итальянская кухня и большой стол для друзей в центре города.",
  },
  "yard-moscow": {
    name: "Московский двор", city: "Москва", address: "Покровка, 18",
    cuisine: "Грузинская кухня", price: "₽", photo: "images/alcove.png",
    description: "Небольшой зал, грузинская кухня и неспешные разговоры за общим столом.",
  },
};
const tables = {
  1: { name: "Столик у окна", photo: "images/window.png", seats: 2 },
  2: { name: "Столик в зале", photo: "images/hall.png", seats: 4 },
  3: { name: "Тихая ниша", photo: "images/alcove.png", seats: 4 },
};
const params = new URLSearchParams(location.search);
// Неизвестный id в адресе заменяем первым рестораном.
const restaurantId = Object.hasOwn(restaurants, params.get("restaurant"))
  ? params.get("restaurant") : "quiet-yard";
const restaurant = restaurants[restaurantId];

// Фильтры скрывают готовые HTML-карточки, а не создают страницу заново.
const restaurantSearch = document.querySelector("#restaurant-search");
if (restaurantSearch) {
  function filterRestaurants() {
    const city = restaurantSearch.elements.city.value;
    const cuisine = restaurantSearch.elements.cuisine.value;
    const price = restaurantSearch.elements.price.value;
    let count = 0;
    document.querySelectorAll(".restaurant-card").forEach((card) => {
      const matchesCity = city === "" || city === card.dataset.city;
      const matchesCuisine = cuisine === "" || cuisine === card.dataset.cuisine;
      const matchesPrice = price === "" || price === card.dataset.price;
      card.hidden = !(matchesCity && matchesCuisine && matchesPrice);
      if (!card.hidden) count++;
    });
    document.querySelector("#restaurant-count").textContent = `Найдено ресторанов: ${count}`;
    document.querySelector("#no-restaurants").hidden = count > 0;
  }
  restaurantSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    filterRestaurants();
  });
  restaurantSearch.addEventListener("reset", () => {
    restaurantSearch.querySelectorAll("select").forEach((select) => { select.value = ""; });
    filterRestaurants();
  });
  filterRestaurants();
}

// Данные выбранного ресторана подставляются в существующие элементы HTML.
document.querySelectorAll("[data-restaurant-field]").forEach((element) => {
  const value = restaurant[element.dataset.restaurantField];
  if (element.tagName === "IMG") element.src = value;
  else element.textContent = value;
});
const reserveLink = document.querySelector("#reserve-table");
if (reserveLink) reserveLink.href = `tables.html?restaurant=${restaurantId}`;

const tableSearch = document.querySelector("#table-search");
if (tableSearch) {
  const date = tableSearch.elements.date;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  date.min = `${year}-${month}-${day}`;
  function validVisit() {
    const end = tableSearch.elements.end;
    end.setCustomValidity(end.value <= tableSearch.elements.start.value
      ? "Окончание должно быть позже начала" : "");
    return tableSearch.reportValidity();
  }
  function filterTables() {
    let count = 0;
    document.querySelectorAll("[data-table-card]").forEach((card) => {
      card.hidden = Number(card.dataset.seats) < Number(tableSearch.elements.guests.value);
      if (!card.hidden) count++;
    });
    document.querySelector("#table-count").textContent = `Вариантов столиков: ${count}`;
    document.querySelector("#no-tables").hidden = count > 0;
  }
  tableSearch.addEventListener("input", () => tableSearch.elements.end.setCustomValidity(""));
  tableSearch.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validVisit()) filterTables();
  });
  tableSearch.elements.guests.addEventListener("change", filterTables);
  document.querySelectorAll("[data-table]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!validVisit()) return;
      const query = new URLSearchParams(new FormData(tableSearch));
      query.set("table", button.dataset.table);
      query.set("restaurant", restaurantId);
      location.href = `booking.html?${query}`;
    });
  });
  filterTables();
}

const bookingForm = document.querySelector("#booking-form");
if (bookingForm) {
  const table = tables[params.get("table")];
  const guests = Number(params.get("guests"));
  const validGuests = table && guests >= 1 && guests <= table.seats;
  const validTime = params.get("start") && params.get("end") > params.get("start");
  const hasSelection = params.get("date") && validGuests && validTime;
  document.querySelector("#change-table").href = `tables.html?restaurant=${restaurantId}`;
  document.querySelector("#booking-content").hidden = !hasSelection;
  document.querySelector("#booking-invalid").hidden = Boolean(hasSelection);
  if (hasSelection) {
    document.querySelector("#summary-photo").src = table.photo;
    document.querySelector("#summary-table").textContent = table.name;
    ["date", "start", "end", "guests"].forEach((key) => {
      document.querySelector(`[data-summary="${key}"]`).textContent = params.get(key);
    });
    bookingForm.elements.guests.value = params.get("guests");

  }
  const modal = new bootstrap.Modal(document.querySelector("#booking-success"));
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    modal.show();
  });
}

// В ЛР1 формы демонстрационные: проверяют поля, но не создают учетную запись.
document.querySelectorAll("[data-demo-form]").forEach((form) => {
  form.addEventListener("input", () => {
    const confirmation = form.elements.password_confirm;
    if (confirmation) confirmation.setCustomValidity("");
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const confirmation = form.elements.password_confirm;
    if (confirmation) {
      confirmation.setCustomValidity(confirmation.value === form.elements.password.value
        ? "" : "Пароли должны совпадать");
      if (!form.reportValidity()) return;
    }
    form.querySelector("[data-feedback]").textContent = form.dataset.message;
  });
});

const statusFilter = document.querySelector("[data-status-filter]");
if (statusFilter) {
  function filterBookings() {
    document.querySelectorAll("[data-booking-status]").forEach((card) => {
      card.hidden = statusFilter.value !== "all" && card.dataset.bookingStatus !== statusFilter.value;
    });
  }
  statusFilter.addEventListener("change", filterBookings);
  document.querySelectorAll("[data-cancel-booking]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-booking-status]");
      card.dataset.bookingStatus = "cancelled";
      card.querySelector("[data-status-label]").textContent = "Отменено";
      button.remove();
      filterBookings();
      document.querySelector("#bookings-feedback").textContent = "Демонстрационная бронь отменена.";
    });
  });
}
