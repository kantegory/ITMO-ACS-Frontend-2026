"use strict";

(() => {
  const api = window.TD_API;
  const page = document.body.dataset.page;

  function showMessage(text) {
    const message = document.querySelector("#account-message");
    message.textContent = text;
    message.hidden = !text;
  }

  function setBusy(element, busy) {
    element.setAttribute("aria-busy", String(busy));
    element.querySelectorAll("input, button, select").forEach((control) => {
      control.disabled = busy;
    });
  }

  function showLoadError(error, content, guest, retry) {
    content.hidden = true;
    guest.hidden = error.status !== 401;
    retry.hidden = error.status === 401;
    showMessage(error.message);
  }

  // После входа разрешен переход только на страницы нашего сайта.
  function returnDestination() {
    const requested = new URLSearchParams(location.search).get("returnTo");
    try {
      const target = new URL(requested || "profile.html", location.href);
      for (const name of ["index.html", "restaurant.html", "tables.html", "booking.html", "profile.html", "bookings.html"]) {
        const allowed = new URL(name, location.href);
        if (target.origin === allowed.origin && target.pathname === allowed.pathname) {
          return name + target.search + target.hash;
        }
      }
    } catch {
      // Некорректный адрес не мешает входу: откроется профиль.
    }
    return "profile.html";
  }

  function prepareAuth() {
    const form = document.querySelector(page === "login" ? "#login-form" : "#register-form");
    const fields = form.elements;
    const submit = form.querySelector('[type="submit"]');
    const submitLabel = submit.textContent;
    let busy = false;
    document.querySelectorAll("[data-account-link]").forEach((link) => {
      link.search = new URLSearchParams({ returnTo: returnDestination() });
    });

    function validate() {
      if (page !== "register") return;
      fields.password_confirm.setCustomValidity(
        fields.password_confirm.value === fields.password.value ? "" : "Пароли не совпадают.",
      );
      fields.full_name.setCustomValidity(fields.full_name.value.trim() ? "" : "Укажите имя и фамилию.");
      const phone = fields.phone.value.trim();
      fields.phone.setCustomValidity(
        phone && (phone.length < 6 || phone.length > 32) ? "Укажите телефон длиной от 6 до 32 символов." : "",
      );
    }

    form.addEventListener("input", validate);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (busy) return;
      validate();
      if (!form.reportValidity()) return;
      const credentials = { email: fields.email.value.trim(), password: fields.password.value };
      busy = true;
      setBusy(form, true);
      showMessage("");
      submit.textContent = page === "login" ? "Входим..." : "Создаем аккаунт...";
      try {
        if (page === "register") {
          await api.register({
            ...credentials,
            full_name: fields.full_name.value.trim(),
            phone: fields.phone.value.trim(),
          });
        } else {
          await api.login(credentials);
        }
        location.assign(returnDestination());
      } catch (error) {
        showMessage(error.message);
      } finally {
        busy = false;
        setBusy(form, false);
        submit.textContent = submitLabel;
      }
    });
  }

  function prepareProfile() {
    const content = document.querySelector("#profile-content");
    const guest = document.querySelector("#profile-guest");
    const retry = document.querySelector("#account-retry");
    const loadingText = document.querySelector("#account-loading");
    let loading = false;

    async function loadProfile() {
      if (loading) return;
      showMessage("");
      content.hidden = true;
      retry.hidden = true;
      guest.hidden = Boolean(api.getSession());
      if (!api.getSession()) return;
      loading = true;
      loadingText.hidden = false;
      try {
        const user = await api.me();
        document.querySelector("#profile-name").textContent = user.full_name;
        document.querySelector("#profile-email").textContent = user.email;
        document.querySelector("#profile-phone").textContent = user.phone || "Не указан";
        content.hidden = false;
      } catch (error) {
        showLoadError(error, content, guest, retry);
      } finally {
        loading = false;
        loadingText.hidden = true;
      }
    }

    retry.addEventListener("click", loadProfile);
    document.querySelector("#logout-button").addEventListener("click", () => {
      api.logout();
      location.assign("index.html");
    });
    loadProfile();
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Дата не указана";
    return date.toLocaleDateString("ru-RU", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow",
    });
  }

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow",
    });
  }

  function prepareBookings() {
    const content = document.querySelector("#bookings-content");
    const guest = document.querySelector("#bookings-guest");
    const retry = document.querySelector("#account-retry");
    const loadingText = document.querySelector("#account-loading");
    const list = document.querySelector("#bookings-list");
    const filter = document.querySelector("#booking-status");
    const template = document.querySelector("#booking-card");
    const modalElement = document.querySelector("#cancelBookingModal");
    const modal = new bootstrap.Modal(modalElement);
    const confirm = document.querySelector("#confirm-cancel-booking");
    const statusNames = {
      pending: "Ожидает подтверждения", confirmed: "Подтверждено",
      cancelled: "Отменено", completed: "Завершено",
    };
    let bookings = [];
    let restaurants = [];
    let tables = [];
    let pendingBooking = null;
    let lastCancelButton = null;
    let loading = false;
    let cancelling = false;

    async function loadBookings() {
      if (loading) return;
      showMessage("");
      content.hidden = true;
      retry.hidden = true;
      guest.hidden = Boolean(api.getSession());
      if (!api.getSession()) return;
      loading = true;
      loadingText.hidden = false;
      try {
        bookings = await api.bookings();
        // В брони есть только ID. Название и номер столика берем из каталога.
        restaurants = bookings.length ? await api.restaurants() : [];
        tables = [];
        for (const restaurant of restaurants) {
          if (bookings.some((booking) => booking.restaurant_id === restaurant.id)) {
            const restaurantTables = await api.tables(restaurant.id);
            tables.push(...restaurantTables);
          }
        }
        render();
        content.hidden = false;
      } catch (error) {
        showLoadError(error, content, guest, retry);
      } finally {
        loading = false;
        loadingText.hidden = true;
      }
    }

    function createCard(booking) {
      const card = template.content.firstElementChild.cloneNode(true);
      const field = (name) => card.querySelector(`[data-field="${name}"]`);
      const restaurant = restaurants.find((item) => item.id === booking.restaurant_id);
      const table = tables.find((item) => item.id === booking.table_id);
      const restaurantName = restaurant ? restaurant.name : "Ресторан недоступен";
      field("restaurant").textContent = restaurantName;
      field("status").textContent = statusNames[booking.status] || "Статус не указан";
      field("date").textContent = formatDate(booking.start_time);
      field("time").textContent = `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`;
      field("table").textContent = table ? `№ ${table.table_number}` : "Столик недоступен";
      field("guests").textContent = booking.guests_count;
      field("link").href = `restaurant.html?id=${encodeURIComponent(booking.restaurant_id)}`;
      const cancel = field("cancel");
      cancel.hidden = booking.status !== "confirmed" && booking.status !== "pending";
      cancel.addEventListener("click", () => {
        if (loading || cancelling) return;
        pendingBooking = booking;
        lastCancelButton = cancel;
        document.querySelector("#cancel-booking-description").textContent =
          `${restaurantName}, ${formatDate(booking.start_time)}, ${formatTime(booking.start_time)}.`;
        modal.show();
      });
      return card;
    }

    function render(announcement = "") {
      const visible = bookings.filter((booking) => {
        if (filter.value === "cancelled") return booking.status === "cancelled";
        if (filter.value === "upcoming") {
          return (booking.status === "confirmed" || booking.status === "pending")
            && new Date(booking.start_time) >= new Date();
        }
        return true;
      });
      list.replaceChildren(...visible.map(createCard));
      document.querySelector("#bookings-empty").hidden = visible.length > 0;
      document.querySelector("#bookings-empty-title").textContent =
        filter.value === "cancelled" ? "Отмененных бронирований нет" :
        filter.value === "upcoming" ? "Пока нет предстоящих встреч" : "Первый вечер еще впереди";
      document.querySelector("#bookings-empty-text").textContent = filter.value === "cancelled"
        ? "Если планы изменятся, отмененная бронь останется в этом разделе."
        : "Выберите ресторан и забронируйте столик. Здесь появятся детали вашей встречи.";
      document.querySelector("#bookings-feedback").textContent =
        announcement || (visible.length ? `Бронирований: ${visible.length}` : "");
    }

    filter.addEventListener("change", () => render());
    retry.addEventListener("click", loadBookings);
    confirm.addEventListener("click", async () => {
      if (!pendingBooking || cancelling) return;
      cancelling = true;
      setBusy(content, true);
      setBusy(modalElement, true);
      confirm.textContent = "Отменяем...";
      showMessage("");
      try {
        await api.cancelBooking(pendingBooking.id);
        // DELETE отвечает без тела, поэтому заново получаем историю с сервера.
        bookings = await api.bookings();
        render("Бронирование отменено. Оно сохранено в истории.");
      } catch (error) {
        showLoadError(error, content, guest, retry);
      } finally {
        cancelling = false;
        pendingBooking = null;
        setBusy(content, false);
        setBusy(modalElement, false);
        confirm.textContent = "Да, отменить";
        modal.hide();
      }
    });
    modalElement.addEventListener("hide.bs.modal", (event) => {
      if (cancelling) event.preventDefault();
    });
    modalElement.addEventListener("hidden.bs.modal", () => {
      pendingBooking = null;
      if (lastCancelButton && lastCancelButton.isConnected && !content.hidden) {
        lastCancelButton.focus();
      } else if (!content.hidden) filter.focus();
      else if (!guest.hidden) guest.querySelector("a").focus();
    });
    loadBookings();
  }

  if (page === "login" || page === "register") prepareAuth();
  if (page === "profile") prepareProfile();
  if (page === "bookings") prepareBookings();
})();
