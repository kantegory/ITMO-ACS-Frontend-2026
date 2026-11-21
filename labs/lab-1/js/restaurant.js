// Логика страницы ресторана: рендер данных, табы меню/фото/отзывы, модалка бронирования
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || 1;
}

function renderRestaurant() {
  const restaurant = getRestaurantById(getIdFromUrl());
  const root = document.getElementById("restaurant-root");
  if (!restaurant) {
    root.innerHTML = '<div class="alert alert-danger">Ресторан не найден. <a href="index.html">Вернуться к поиску</a></div>';
    return;
  }

  root.innerHTML = `
    <div class="row g-4 mb-4">
      <div class="col-lg-7">
        <img src="${restaurant.img}" class="img-fluid rounded w-100" style="max-height:380px;object-fit:cover;" alt="${restaurant.name}">
      </div>
      <div class="col-lg-5">
        <h1>${restaurant.name}</h1>
        <p class="text-muted mb-1">${restaurant.cuisine} кухня · ${restaurant.city}</p>
        <p><span class="rating-stars fs-5">${renderStars(restaurant.rating)}</span> <span class="text-muted">${restaurant.rating.toFixed(1)} / 5</span></p>
        <p class="price-tag">Средний чек: ${priceSymbols(restaurant.price)}</p>
        <p>${restaurant.description}</p>
        <button class="btn btn-brand btn-lg" data-bs-toggle="modal" data-bs-target="#bookingModal">Забронировать столик</button>
      </div>
    </div>

    <ul class="nav nav-tabs" id="infoTabs" role="tablist">
      <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-menu" type="button">Меню</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-photos" type="button">Фото</button></li>
      <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-reviews" type="button">Отзывы</button></li>
    </ul>

    <div class="tab-content border border-top-0 p-4 bg-white rounded-bottom">
      <div class="tab-pane fade show active" id="tab-menu">
        <ul class="list-group">
          ${restaurant.menu.map((m) => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${m.name}</span>
              <span class="fw-semibold">${m.price} ₽</span>
            </li>`).join("")}
        </ul>
      </div>
      <div class="tab-pane fade" id="tab-photos">
        <div class="row g-3">
          ${restaurant.photos.map((p) => `
            <div class="col-md-4">
              <img src="${p}" class="menu-photo w-100" alt="Фото ${restaurant.name}">
            </div>`).join("")}
        </div>
      </div>
      <div class="tab-pane fade" id="tab-reviews">
        ${restaurant.reviews.map((rev) => `
          <div class="review-card p-3 mb-3 border">
            <div class="d-flex justify-content-between">
              <strong>${rev.author}</strong>
              <span class="rating-stars">${renderStars(rev.rating)}</span>
            </div>
            <p class="mb-0 mt-1">${rev.text}</p>
          </div>`).join("")}
      </div>
    </div>
  `;

  document.getElementById("booking-form").dataset.restaurantId = restaurant.id;
  document.getElementById("booking-form").dataset.restaurantName = restaurant.name;
}

function setupBookingModal() {
  const user = currentUser();
  const warning = document.getElementById("booking-login-warning");
  warning.classList.toggle("d-none", !!user);

  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const booking = {
      id: Date.now(),
      restaurantId: Number(form.dataset.restaurantId),
      restaurantName: form.dataset.restaurantName,
      date: document.getElementById("b-date").value,
      time: document.getElementById("b-time").value,
      guests: document.getElementById("b-guests").value,
      comment: document.getElementById("b-comment").value,
      status: "confirmed"
    };

    const user = currentUser();
    const storageKey = user ? `tablebook_bookings_${user.email}` : "tablebook_bookings_guest";
    const bookings = JSON.parse(localStorage.getItem(storageKey) || "[]");
    bookings.unshift(booking);
    localStorage.setItem(storageKey, JSON.stringify(bookings));

    bootstrap.Modal.getInstance(document.getElementById("bookingModal")).hide();
    form.reset();
    new bootstrap.Toast(document.getElementById("booking-toast")).show();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderRestaurant();
  setupBookingModal();
});
