"use strict";

const api = window.TD_API;
const query = new URLSearchParams(location.search);
const restaurantId = query.get("restaurant") || query.get("id");
const restaurantUrl = restaurantId ? `restaurant.html?restaurant=${encodeURIComponent(restaurantId)}` : "index.html";
const tableUrl = restaurantId ? `tables.html?restaurant=${encodeURIComponent(restaurantId)}` : "index.html";
const cuisines = { european: "Европейская", italian: "Итальянская", georgian: "Грузинская" };
const prices = { low: "₽", medium: "₽₽", high: "₽₽₽" };

// Шапка и подвал одинаковы на всех страницах.
document.querySelector("#site-header").innerHTML = `
  <nav class="navbar navbar-expand-lg site-nav" data-bs-theme="dark" aria-label="Основная навигация">
    <div class="container">
      <a class="brand" href="index.html"><span class="brand-line"><img src="images/bat.svg" alt="">BaT</span><span class="brand-caption">Book a Table</span></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#site-menu" aria-controls="site-menu" aria-expanded="false" aria-label="Навигация"><span class="navbar-toggler-icon"></span></button>
      <div class="collapse navbar-collapse justify-content-end" id="site-menu">
        <ul class="navbar-nav gap-lg-3">
          <li class="nav-item"><a class="nav-link" href="${restaurantUrl}">О ресторане</a></li>
          <li class="nav-item"><a class="nav-link" href="${restaurantId ? restaurantUrl + "#menu" : "index.html"}">Меню</a></li>
          <li class="nav-item"><a class="nav-link" href="${tableUrl}">Бронирование</a></li>
          <li class="nav-item"><a class="nav-link" href="${api.getSession() ? "profile.html" : "login.html"}">${api.getSession() ? "Профиль" : "Войти"}</a></li>
          <li class="nav-item"><a class="btn btn-outline-primary" href="bookings.html">Моя бронь</a></li>
        </ul>
      </div>
    </div>
  </nav>`;
document.querySelector("#site-footer").innerHTML = `
  <div class="container py-4 small">
    <div class="d-flex justify-content-between flex-wrap gap-2"><span>BaT - место для неспешных встреч</span><span>Каждый день · 12:00-23:00</span></div>
    <p class="muted mt-3 mb-0">Учебный сайт с API. Реальные заявки в ресторан не отправляются.</p>
  </div>`;

function showMessage(text, retry) {
  const message = document.querySelector("#page-message");
  const button = document.querySelector("#page-retry");
  if (document.activeElement === button && !retry) document.querySelector("#main").focus();
  message.textContent = text;
  message.hidden = !text;
  button.hidden = !retry;
  button.onclick = retry || null;
}

function setPhoto(image, path, description) {
  image.src = /^(images\/[a-z-]+\.(jpg|png)$|https?:\/\/)/.test(path) ? path : "images/window.jpg";
  image.alt = description;
  image.onerror = () => { image.onerror = null; image.src = "images/window.jpg"; };
}

// Go API требует вход даже для просмотра каталога.
function requireSession() {
  if (api.getSession()) return true;
  const page = location.pathname.split("/").pop() || "index.html";
  location.replace(`login.html?returnTo=${encodeURIComponent(page + location.search + location.hash)}`);
  return false;
}

function showError(error, retry) {
  if (error.status === 401) requireSession();
  else {
    showMessage(error.message, retry);
    document.querySelector("#page-message").focus();
  }
}

function moscowDay(offset = 0) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" })
    .format(new Date(Date.now() + offset * 86400000));
}

function validateVisit(params) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date) ||
      !/^\d{2}:\d{2}$/.test(params.start) || !/^\d{2}:\d{2}$/.test(params.end)) {
    return "Укажите дату, начало и окончание визита.";
  }
  const day = new Date(`${params.date}T00:00:00Z`);
  const start = new Date(`${params.date}T${params.start}:00+03:00`);
  const end = new Date(`${params.date}T${params.end}:00+03:00`);
  if (!Number.isFinite(+day) || !Number.isFinite(+start) || !Number.isFinite(+end) ||
      day.toISOString().slice(0, 10) !== params.date) return "Укажите существующую дату и время.";
  if (start <= new Date()) return "Выберите дату и время в будущем.";
  if (params.start < "12:00" || params.end > "23:00") return "Выберите время с 12:00 до 23:00.";
  if (end <= start) return "Окончание должно быть позже начала.";
  if (!Number.isInteger(params.guests) || params.guests < 1 || params.guests > 6) return "Укажите от 1 до 6 гостей.";
  return "";
}

function visitPayload(params) {
  return {
    restaurant_id: restaurantId,
    start_time: new Date(`${params.date}T${params.start}:00+03:00`).toISOString(),
    end_time: new Date(`${params.date}T${params.end}:00+03:00`).toISOString(),
    guests_count: params.guests,
  };
}

// Каталог: запрос с фильтрами -> копии HTML-карточки -> текст из ответа.
const searchForm = document.querySelector("#restaurant-search");
if (searchForm) {
  const list = document.querySelector("#restaurant-results");
  const count = document.querySelector("#restaurant-count");
  const empty = document.querySelector("#no-restaurants");
  let requestNumber = 0;
  for (const name of ["city", "cuisine_type", "price_category"]) {
    if (query.has(name)) searchForm.elements[name].value = query.get(name);
  }
  async function loadRestaurants() {
    if (!requireSession()) return;
    const currentRequest = ++requestNumber;
    const filters = Object.fromEntries(new FormData(searchForm));
    history.replaceState(null, "", `index.html${queryString(filters)}`);
    list.replaceChildren();
    list.setAttribute("aria-busy", "true");
    empty.hidden = true;
    count.textContent = "Загружаем рестораны...";
    showMessage("");
    try {
      const restaurants = await api.restaurants(filters);
      if (currentRequest !== requestNumber) return;
      for (const restaurant of restaurants) {
        const card = document.querySelector("#restaurant-card").content.cloneNode(true);
        setPhoto(card.querySelector("img"), restaurant.photos?.[0], `Интерьер ${restaurant.name}`);
        card.querySelector("h3").textContent = restaurant.name;
        card.querySelector(".card-meta").textContent = `${restaurant.city} · ${cuisines[restaurant.cuisine_type] || restaurant.cuisine_type} · ${prices[restaurant.price_category]}`;
        card.querySelector(".description").textContent = restaurant.description;
        card.querySelector(".small-copy").textContent = restaurant.address;
        card.querySelector("a").href = `restaurant.html?restaurant=${encodeURIComponent(restaurant.id)}`;
        card.querySelector("a").setAttribute("aria-label", `О ресторане ${restaurant.name}`);
        list.append(card);
      }
      count.textContent = `Найдено ресторанов: ${restaurants.length}`;
      empty.hidden = restaurants.length > 0;
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      count.textContent = "Список не загружен";
      showError(error, loadRestaurants);
    } finally {
      if (currentRequest === requestNumber) list.setAttribute("aria-busy", "false");
    }
  }
  searchForm.addEventListener("submit", (event) => { event.preventDefault(); loadRestaurants(); });
  searchForm.addEventListener("reset", () => {
    if (empty.contains(document.activeElement)) searchForm.querySelector("button").focus();
    setTimeout(loadRestaurants, 0);
  });
  loadRestaurants();
}

// Страница ресторана: каркас и вкладки находятся в HTML.
const restaurantContent = document.querySelector("#restaurant-content");
if (restaurantContent) {
  function syncTab() {
    const id = location.hash === "#reviews" ? "#reviews-tab" : "#menu-tab";
    bootstrap.Tab.getOrCreateInstance(document.querySelector(id)).show();
  }
  window.addEventListener("hashchange", syncTab);
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
    tab.addEventListener("click", () => history.replaceState(null, "", tab.dataset.bsTarget));
  });
  async function loadRestaurant() {
    if (!requireSession()) return;
    if (!restaurantId) { location.replace("index.html"); return; }
    restaurantContent.hidden = true;
    showMessage("Загружаем ресторан...");
    try {
      const restaurant = await api.restaurant(restaurantId);
      const menu = await api.menu(restaurantId);
      const reviews = await api.reviews(restaurantId);
      restaurant.cuisine = cuisines[restaurant.cuisine_type] || restaurant.cuisine_type;
      restaurant.price = prices[restaurant.price_category];
      document.querySelectorAll("[data-restaurant-field]").forEach((element) => {
        if (element.tagName !== "IMG") element.textContent = restaurant[element.dataset.restaurantField];
      });
      document.querySelectorAll(".gallery img").forEach((image, index) => {
        setPhoto(image, restaurant.photos?.[index], `Интерьер ${restaurant.name}`);
      });
      document.querySelector("#reserve-table").href = tableUrl;
      const menuList = document.querySelector("#menu-list");
      menuList.textContent = menu.length ? "" : "Меню пока не добавлено.";
      for (const item of menu) {
        const row = document.querySelector("#menu-item").content.cloneNode(true);
        row.querySelector("h3").textContent = item.name;
        row.querySelector("p").textContent = item.description + (item.is_available ? "" : " Сейчас недоступно.");
        row.querySelector("strong").textContent = `${item.price} ₽`;
        menuList.append(row);
      }
      const reviewsList = document.querySelector("#reviews-list");
      reviewsList.textContent = reviews.length ? "" : "Отзывов пока нет.";
      for (const review of reviews) {
        const row = document.querySelector("#review-item").content.cloneNode(true);
        row.querySelector("strong").textContent = review.author_name || "Гость ресторана";
        row.querySelector(".rating").textContent = `${review.rating} / 5`;
        row.querySelector("p").textContent = review.text;
        reviewsList.append(row);
      }
      restaurantContent.hidden = false;
      showMessage("");
      syncTab();
    } catch (error) {
      showError(error, loadRestaurant);
    }
  }
  loadRestaurant();
}

const tableForm = document.querySelector("#table-search");
if (tableForm) {
  const list = document.querySelector("#table-results");
  const count = document.querySelector("#table-count");
  const empty = document.querySelector("#no-tables");
  let requestNumber = 0;
  tableForm.elements.date.min = moscowDay();
  tableForm.elements.date.value = query.get("date") || moscowDay(1);
  for (const name of ["start", "end", "guests"]) {
    if (query.has(name)) tableForm.elements[name].value = query.get(name);
  }
  async function loadTables() {
    if (!requireSession()) return;
    if (!restaurantId) { location.replace("index.html"); return; }
    const currentRequest = ++requestNumber;
    const params = Object.fromEntries(new FormData(tableForm));
    params.guests = Number(params.guests);
    params.restaurant = restaurantId;
    list.replaceChildren();
    empty.hidden = true;
    const error = validateVisit(params);
    showMessage(error);
    if (error) {
      list.setAttribute("aria-busy", "false");
      count.textContent = "Проверьте параметры визита";
      document.querySelector("#page-message").focus();
      return;
    }
    history.replaceState(null, "", `tables.html${queryString(params)}`);
    count.textContent = "Проверяем свободные столики...";
    list.setAttribute("aria-busy", "true");
    try {
      const restaurant = await api.restaurant(restaurantId);
      const tables = await api.tables(restaurantId);
      const visit = visitPayload(params);
      const availableTables = [];
      // Бэкенд проверяет доступность одного столика за запрос.
      for (const table of tables) {
        if (table.seats_count < params.guests) continue;
        const available = await api.availability(restaurantId, table.id, visit.start_time, visit.end_time);
        if (currentRequest !== requestNumber) return;
        if (available) availableTables.push(table);
      }
      if (currentRequest !== requestNumber) return;
      const label = document.querySelector("#table-restaurant");
      label.textContent = `Ресторан: ${restaurant.name}`;
      label.hidden = false;
      for (const table of availableTables) {
        const card = document.querySelector("#table-card").content.cloneNode(true);
        setPhoto(card.querySelector("img"), restaurant.photos?.[(table.table_number - 1) % 3], `Интерьер ${restaurant.name}`);
        card.querySelector("h3").textContent = `Столик № ${table.table_number}`;
        card.querySelector(".description").textContent = "Фото интерьера ресторана";
        card.querySelector(".capacity").textContent = `До ${table.seats_count} гостей`;
        card.querySelector("a").href = `booking.html${queryString({ ...params, table: table.id })}`;
        card.querySelector("a").setAttribute("aria-label", `Забронировать столик № ${table.table_number}`);
        list.append(card);
      }
      count.textContent = `Вариантов столиков: ${availableTables.length}`;
      empty.hidden = availableTables.length > 0;
    } catch (error) {
      if (currentRequest !== requestNumber) return;
      count.textContent = "Столики не загружены";
      showError(error, loadTables);
    } finally {
      if (currentRequest === requestNumber) list.setAttribute("aria-busy", "false");
    }
  }
  tableForm.addEventListener("submit", (event) => { event.preventDefault(); loadTables(); });
  // Старые результаты не должны оставаться после изменения параметров поиска.
  tableForm.addEventListener("input", () => {
    const { start, end } = tableForm.elements;
    end.setCustomValidity(start.value && end.value && end.value <= start.value
      ? "Окончание должно быть позже начала." : "");
    requestNumber++;
    list.replaceChildren();
    list.setAttribute("aria-busy", "false");
    empty.hidden = true;
    count.textContent = "Нажмите «Найти столик», чтобы обновить список";
    showMessage("");
  });
  loadTables();
}

const bookingForm = document.querySelector("#booking-form");
if (bookingForm) {
  const button = document.querySelector("#booking-submit");
  const content = document.querySelector("#booking-content");
  const invalid = document.querySelector("#booking-invalid");
  const params = Object.fromEntries(query);
  params.guests = Number(params.guests);
  let selectedTable;
  let restaurant;
  async function loadBooking() {
    if (!requireSession()) return;
    content.hidden = true;
    invalid.hidden = true;
    button.disabled = true;
    showMessage("Загружаем параметры брони...");
    try {
      const validation = validateVisit(params);
      if (validation || !restaurantId || !params.table) {
        invalid.hidden = false;
        invalid.querySelector("a").href = tableUrl;
        showMessage(validation);
        return;
      }
      restaurant = await api.restaurant(restaurantId);
      selectedTable = await api.table(restaurantId, params.table);
      if (!selectedTable || params.guests > selectedTable.seats_count) {
        invalid.hidden = false;
        invalid.querySelector("a").href = tableUrl;
        showMessage("Выберите столик для указанного числа гостей.");
        return;
      }
      setPhoto(document.querySelector("#summary-photo"), restaurant.photos?.[(selectedTable.table_number - 1) % 3], `Интерьер ${restaurant.name}`);
      document.querySelector("#summary-table").textContent = `Столик № ${selectedTable.table_number}`;
      document.querySelector("#summary-restaurant").textContent = `Ваше место · ${restaurant.name}`;
      document.querySelectorAll("[data-summary]").forEach((element) => {
        element.textContent = params[element.dataset.summary];
      });
      document.querySelector("#booking-guests").value = params.guests;
      document.querySelector("#change-table").href = `tables.html${queryString({ restaurant: restaurantId, date: params.date, start: params.start, end: params.end, guests: params.guests })}`;
      content.hidden = false;
      showMessage("");
      const user = await api.me();
      bookingForm.elements.full_name.value = user.full_name;
      bookingForm.elements.email.value = user.email;
      bookingForm.elements.phone.value = user.phone || "Не указан";
      button.disabled = false;
    } catch (error) {
      showError(error, loadBooking);
    }
  }
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    const validation = validateVisit(params);
    if (validation) {
      showMessage(validation);
      document.querySelector("#page-message").focus();
      return;
    }
    button.disabled = true;
    button.textContent = "Сохраняем бронь...";
    bookingForm.setAttribute("aria-busy", "true");
    showMessage("");
    try {
      await api.createBooking({ ...visitPayload(params), table_id: selectedTable.id });
      button.textContent = "Бронь сохранена";
      document.querySelector("#success-details").textContent = `${restaurant.name} · столик № ${selectedTable.table_number} · ${params.date}, ${params.start}-${params.end}`;
      bootstrap.Modal.getOrCreateInstance(document.querySelector("#booking-success")).show();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Забронировать";
      showError(error);
    } finally {
      bookingForm.setAttribute("aria-busy", "false");
    }
  });
  document.querySelector("#booking-success").addEventListener("hidden.bs.modal", () => {
    document.querySelector("#change-table").focus();
  });
  loadBooking();
}
