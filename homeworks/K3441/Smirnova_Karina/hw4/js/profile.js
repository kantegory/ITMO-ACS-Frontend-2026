// Подключает сохранение профиля, загрузку аренд и управление объявлениями через API.
function setupProfilePage() {
  const currentUser = getCurrentUser();
  const token = localStorage.getItem('accessToken');
  const profileForm = document.getElementById('profileForm');
  const rentalList = document.getElementById('rentalList');
  const ownerListings = document.getElementById('ownerListings');
  let userListings = [];
  let userBookings = [];

  if (!profileForm) return;

  // Форматирует цену с пробелами и знаком рубля.
  function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
  }

  // Форматирует дату из базы в привычном русском виде.
  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Возвращает подпись и цвет статуса бронирования.
  function getBookingStatus(status) {
    const statuses = {
      pending: { text: 'Ожидает подтверждения', className: 'badge-orange' },
      active: { text: 'Подтверждено', className: 'badge-green' },
      completed: { text: 'Завершено', className: 'badge-gray' },
      canceled: { text: 'Отменено', className: 'badge-red' },
    };

    return statuses[status] || statuses.pending;
  }

  // Рисует аренды текущего пользователя из массива bookings.
  function renderRentals() {
    const rentals = userBookings.filter((booking) => Number(booking.userId) === Number(currentUser.id));
    rentalList.replaceChildren();

    document.getElementById('activeRentalsCount').textContent = rentals.filter((item) => item.status === 'active').length;
    document.getElementById('pendingBookingsCount').textContent = rentals.filter((item) => item.status === 'pending').length;
    document.getElementById('rentingSummary').textContent = rentals.length
      ? `Всего аренд: ${rentals.length}`
      : 'У вас пока нет аренд.';

    rentals.forEach((booking) => {
      const listing = booking.listing;
      if (!listing) return;

      const status = getBookingStatus(booking.status);
      const card = document.createElement('article');
      card.className = 'rs-card rental-card';
      card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" />
        <div>
          <span class="rs-badge ${status.className}">${status.text}</span>
          <h3>${listing.title}</h3>
          <div class="rs-muted rs-small">${listing.location}, ${listing.address}</div>
          <div class="mt-2">${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}</div>
          <strong class="d-block fs-5 mt-1">${formatPrice(booking.total)}</strong>
        </div>
        <div class="rental-actions">
          <a class="btn btn-outline-primary" href="listing.html?id=${listing.id}" aria-label="Подробнее об объекте «${listing.title}»">Подробнее</a>
          <a class="btn btn-link text-decoration-none" href="activity.html">
            <svg class="icon icon--fill" aria-hidden="true" focusable="false"><use href="assets/sprite.svg#chat-dots"></use></svg>
            &nbsp; Написать владельцу
          </a>
        </div>
      `;
      rentalList.appendChild(card);
    });
    rentalList.setAttribute('aria-busy', 'false');
  }

  // Рисует объявления текущего пользователя и кнопки изменения видимости.
  function renderOwnerListings() {
    ownerListings.replaceChildren();
    document.getElementById('ownedListingsCount').textContent = userListings.length;
    document.getElementById('ownedListingsTitle').textContent = `Мои объявления · ${userListings.length}`;

    if (!userListings.length) {
      const message = document.createElement('p');
      message.className = 'rs-muted';
      message.textContent = 'У вас пока нет объявлений.';
      ownerListings.appendChild(message);
      ownerListings.setAttribute('aria-busy', 'false');
      return;
    }

    userListings.forEach((listing) => {
      const incomingCount = userBookings.filter((booking) => (
        Number(booking.listingId) === Number(listing.id) && booking.status === 'pending'
      )).length;
      const priceUnit = listing.mode === 'DAILY' ? 'ночь' : 'месяц';
      const modeText = listing.mode === 'DAILY' ? 'Посуточно' : 'Помесячно';
      const card = document.createElement('article');
      card.className = 'rs-card owner-card';
      card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" />
        <div class="owner-body">
          <div class="d-flex gap-2">
            <span class="rs-badge ${listing.active ? 'badge-green' : 'badge-gray'} status-badge">
              ${listing.active ? 'Активно' : 'Неактивно'}
            </span>
            <span class="rs-badge badge-blue">${modeText}</span>
          </div>
          <h3 class="fs-5 mt-3">${listing.title}</h3>
          <p class="rs-muted">${listing.location}, ${listing.address}</p>
          <div class="fs-4 fw-bold mb-2">${formatPrice(listing.price)} / ${priceUnit}</div>
          <div class="rs-muted rs-small mb-3">Входящих заявок: ${incomingCount}</div>
          <div class="d-flex gap-2">
            <a class="btn btn-outline-primary flex-fill" href="listing.html?id=${listing.id}" aria-label="Посмотреть объект «${listing.title}»">Посмотреть</a>
            <button class="btn btn-outline-primary flex-fill" type="button" aria-label="Редактировать объект «${listing.title}»">Редактировать</button>
          </div>
          <button class="btn btn-link w-100 mt-2 text-decoration-none" type="button" data-listing-id="${listing.id}">
            ${listing.active ? 'Скрыть объявление' : 'Показать объявление'}
          </button>
        </div>
      `;
      ownerListings.appendChild(card);
    });

    ownerListings.querySelectorAll('[data-listing-id]').forEach((button) => {
      button.addEventListener('click', () => changeListingVisibility(button));
    });
    ownerListings.setAttribute('aria-busy', 'false');
  }

  // Отправляет новое значение active в db.json и обновляет карточку.
  async function changeListingVisibility(button) {
    const listing = userListings.find((item) => Number(item.id) === Number(button.dataset.listingId));
    if (!listing) return;

    button.disabled = true;

    try {
      const updatedListing = await updateListing(listing.id, { active: !listing.active }, token);
      const index = userListings.findIndex((item) => Number(item.id) === Number(listing.id));
      userListings[index] = updatedListing;
      renderOwnerListings();
      showMessage(updatedListing.active ? 'Объявление снова опубликовано' : 'Объявление скрыто');
      ownerListings.querySelector(`[data-listing-id="${listing.id}"]`)?.focus();
    } catch (error) {
      console.error(error);
      button.disabled = false;
      showMessage('Не удалось изменить объявление');
    }
  }

  // Загружает объявления и сделки авторизованного пользователя.
  async function loadProfileData() {
    rentalList.innerHTML = '<p class="rs-muted">Загрузка аренд...</p>';
    ownerListings.innerHTML = '<p class="rs-muted">Загрузка объявлений...</p>';
    rentalList.setAttribute('aria-busy', 'true');
    ownerListings.setAttribute('aria-busy', 'true');

    if (!currentUser || !token) {
      showMessage('Сначала войдите в аккаунт');
      document.getElementById('rentingSummary').textContent = 'Для просмотра аренд необходимо войти.';
      ownerListings.innerHTML = '<p class="rs-muted">Для просмотра объявлений необходимо войти.</p>';
      rentalList.setAttribute('aria-busy', 'false');
      ownerListings.setAttribute('aria-busy', 'false');
      return;
    }

    try {
      const result = await Promise.all([
        getUserListings(currentUser.id),
        getBookings(token),
      ]);
      userListings = result[0];
      userBookings = result[1];
      renderRentals();
      renderOwnerListings();
    } catch (error) {
      console.error(error);
      document.getElementById('rentingSummary').textContent = 'Не удалось загрузить аренды.';
      ownerListings.innerHTML = '<p class="rs-muted">Не удалось загрузить объявления.</p>';
      rentalList.setAttribute('aria-busy', 'false');
      ownerListings.setAttribute('aria-busy', 'false');
    }
  }

  // Сохраняет изменённые имя, почту и телефон в базе.
  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser || !token) return;

    profileForm.querySelectorAll('input').forEach((input) => {
      input.setAttribute('aria-invalid', String(!input.checkValidity()));
    });
    const firstInvalid = profileForm.querySelector('input:invalid');
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submitButton = profileForm.querySelector('[type="submit"]');
    submitButton.disabled = true;

    try {
      const updatedUser = await updateUser(currentUser.id, {
        name: document.getElementById('profileNameInput').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
      }, token);

      const savedUser = { ...currentUser, ...updatedUser };
      delete savedUser.password;
      localStorage.setItem('currentUser', JSON.stringify(savedUser));
      renderCurrentUser(savedUser);
      bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
      showMessage('Данные профиля сохранены');
    } catch (error) {
      console.error(error);
      showMessage('Не удалось сохранить профиль');
    } finally {
      submitButton.disabled = false;
    }
  });

  loadProfileData();
}

document.addEventListener('DOMContentLoaded', setupProfilePage);
