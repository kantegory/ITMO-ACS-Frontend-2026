// Логика личного кабинета: данные пользователя и история бронирований из API
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

async function renderProfile() {
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

  let bookings = [];
  try {
    bookings = await apiFetch("/bookings");
  } catch (err) {
    // json-server-auth возвращает ошибку вместо [] когда у владельца ещё нет записей
    if (!/owner id/.test(err.message)) {
      root.innerHTML = '<div class="alert alert-danger">Не удалось загрузить бронирования. Проверьте, что запущен мок-сервер API, и попробуйте войти снова.</div>';
      return;
    }
  }

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
    btn.addEventListener("click", () => cancelBooking(Number(btn.dataset.id)));
  });
}

async function cancelBooking(id) {
  try {
    await apiFetch(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" })
    });
    renderProfile();
  } catch (err) {
    alert("Не удалось отменить бронирование.");
  }
}

document.addEventListener("DOMContentLoaded", renderProfile);
