// Логика личного кабинета: данные пользователя и история бронирований
function statusBadgeClass(status) {
  if (status === "confirmed") return "status-badge-confirmed";
  if (status === "cancelled") return "status-badge-cancelled";
  return "status-badge-pending";
}

function statusLabel(status) {
  if (status === "confirmed") return "Подтверждено";
  if (status === "cancelled") return "Отменено";
  return "Ожидает";
}

function renderProfile() {
  const root = document.getElementById("profile-root");
  const user = currentUser();

  if (!user) {
    root.innerHTML = `
      <div class="alert alert-info text-center">
        Чтобы увидеть личный кабинет, пожалуйста, <a href="login.html">войдите</a> или
        <a href="register.html">зарегистрируйтесь</a>.
      </div>`;
    return;
  }

  const bookings = JSON.parse(localStorage.getItem(`tablebook_bookings_${user.email}`) || "[]");

  root.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="display-6 mb-2"></div>
            <h1 class="h5 card-title">${user.name}</h1>
            <p class="text-muted mb-0">${user.email}</p>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <h2 class="h4 mb-3">История бронирований</h2>
        <div id="bookings-list">
          ${bookings.length ? bookings.map((b) => `
            <div class="card mb-3 booking-history-item" data-id="${b.id}">
              <div class="card-body d-flex justify-content-between align-items-start">
                <div>
                  <h3 class="h6 mb-1">${b.restaurantName}</h3>
                  <p class="mb-1 text-muted">${b.date} в ${b.time} · ${b.guests} гостей</p>
                  ${b.comment ? `<p class="mb-0 small">Комментарий: ${b.comment}</p>` : ""}
                </div>
                <div class="text-end">
                  <span class="badge ${statusBadgeClass(b.status)} mb-2">${statusLabel(b.status)}</span><br>
                  ${b.status !== "cancelled" ? `<button class="btn btn-sm btn-outline-danger cancel-btn" data-id="${b.id}">Отменить</button>` : ""}
                </div>
              </div>
            </div>`).join("") : '<p class="text-muted">У вас пока нет бронирований. <a href="index.html">Найти ресторан</a></p>'}
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", () => cancelBooking(user.email, Number(btn.dataset.id)));
  });
}

function cancelBooking(email, id) {
  const key = `tablebook_bookings_${email}`;
  const bookings = JSON.parse(localStorage.getItem(key) || "[]");
  const booking = bookings.find((b) => b.id === id);
  if (booking) booking.status = "cancelled";
  localStorage.setItem(key, JSON.stringify(bookings));
  renderProfile();
}

document.addEventListener("DOMContentLoaded", renderProfile);
