// Логика страницы ресторана: рендер данных из API, табы меню/фото/отзывы, модалка бронирования
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || 1;
}

async function renderRestaurant() {
  const restaurant = await fetchRestaurantById(getIdFromUrl());
  const root = document.getElementById("restaurant-root");
  if (!restaurant) {
    root.innerHTML = '<div class="alert alert-danger" role="alert">Ресторан не найден. <a href="index.html">Вернуться к поиску</a></div>';
    return;
  }

  root.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <img src="${restaurant.img}" class="img-fluid rounded w-100" style="max-height:380px;object-fit:cover;" alt="Интерьер ресторана «${restaurant.name}»">
      </div>
      <div class="col-lg-5">
        <h1>${restaurant.name}</h1>
        <p class="text-muted mb-1"><svg class="icon" aria-hidden="true"><use href="icons/sprite.svg#icon-pin"></use></svg> ${restaurant.cuisine} кухня · ${restaurant.city}</p>
        <p>
          <span class="rating-stars fs-5" aria-hidden="true">${renderStars(restaurant.rating)}</span>
          <span class="text-muted">Рейтинг: ${restaurant.rating.toFixed(1)} из 5</span>
        </p>
        <p class="price-tag">Средний чек: <span aria-label="${priceLabel(restaurant.price)}">${priceSymbols(restaurant.price)}</span></p>
        <p>${restaurant.description}</p>
        <button class="btn btn-brand btn-lg" data-bs-toggle="modal" data-bs-target="#bookingModal">Забронировать столик</button>
      </div>
    </div>

    <ul class="nav nav-tabs" id="infoTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="tab-menu-btn" data-bs-toggle="tab" data-bs-target="#tab-menu" type="button"
          role="tab" aria-controls="tab-menu" aria-selected="true">Меню</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-photos-btn" data-bs-toggle="tab" data-bs-target="#tab-photos" type="button"
          role="tab" aria-controls="tab-photos" aria-selected="false">Фото</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-reviews-btn" data-bs-toggle="tab" data-bs-target="#tab-reviews" type="button"
          role="tab" aria-controls="tab-reviews" aria-selected="false">Отзывы</button>
      </li>
    </ul>

    <div class="tab-content border border-top-0 p-4 bg-white rounded-bottom">
      <div class="tab-pane fade show active" id="tab-menu" role="tabpanel" aria-labelledby="tab-menu-btn" tabindex="0">
        <ul class="list-group">
          ${restaurant.menu.map((m) => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${m.name}</span>
              <span class="fw-semibold">${m.price} ₽</span>
            </li>`).join("")}
        </ul>
      </div>
      <div class="tab-pane fade" id="tab-photos" role="tabpanel" aria-labelledby="tab-photos-btn" tabindex="0">
        <div class="row g-3">
          ${restaurant.photos.map((p, i) => `
            <div class="col-md-4">
              <img src="${p}" class="menu-photo w-100" alt="Фото ${i + 1} интерьера и блюд ресторана «${restaurant.name}»">
            </div>`).join("")}
        </div>
      </div>
      <div class="tab-pane fade" id="tab-reviews" role="tabpanel" aria-labelledby="tab-reviews-btn" tabindex="0">
        ${restaurant.reviews.map((rev) => `
          <div class="review-card p-3 mb-3 border">
            <div class="d-flex justify-content-between">
              <strong>${rev.author}</strong>
              <span class="rating-stars" aria-label="Оценка: ${rev.rating} из 5">${renderStars(rev.rating)}</span>
            </div>
            <p class="mb-0 mt-1">${rev.text}</p>
          </div>`).join("")}
      </div>
    </div>
  `;

  document.querySelectorAll('#infoTabs button[data-bs-toggle="tab"]').forEach((btn) => {
    btn.addEventListener("shown.bs.tab", (e) => {
      document.querySelectorAll('#infoTabs button[data-bs-toggle="tab"]').forEach((b) => {
        b.setAttribute("aria-selected", b === e.target ? "true" : "false");
      });
    });
  });

  document.getElementById("booking-form").dataset.restaurantId = restaurant.id;
  document.getElementById("booking-form").dataset.restaurantName = restaurant.name;
}

function setupBookingModal() {
  const user = currentUser();
  const warning = document.getElementById("booking-login-warning");
  const submitBtn = document.getElementById("booking-submit");
  warning.classList.toggle("d-none", !!user);
  submitBtn.disabled = !user;

  document.getElementById("booking-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser()) {
      window.location.href = "login.html";
      return;
    }

    const form = e.target;
    const errorBox = document.getElementById("booking-error");
    errorBox.classList.add("d-none");

    const booking = {
      restaurantId: Number(form.dataset.restaurantId),
      restaurantName: form.dataset.restaurantName,
      date: document.getElementById("b-date").value,
      time: document.getElementById("b-time").value,
      guests: document.getElementById("b-guests").value,
      comment: document.getElementById("b-comment").value,
      status: "confirmed",
      userId: currentUser().id
    };

    try {
      await apiFetch("/bookings", { method: "POST", body: JSON.stringify(booking) });
      bootstrap.Modal.getInstance(document.getElementById("bookingModal")).hide();
      form.reset();
      new bootstrap.Toast(document.getElementById("booking-toast")).show();
    } catch (err) {
      errorBox.textContent = "Не удалось создать бронирование. Попробуйте войти в аккаунт снова.";
      errorBox.classList.remove("d-none");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await renderRestaurant();
  setupBookingModal();
});
