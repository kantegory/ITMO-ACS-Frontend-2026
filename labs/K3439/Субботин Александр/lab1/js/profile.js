// Личный кабинет: редактирование профиля, избранное, настройки уведомлений

function initEditProfile() {
  const modalEl = document.querySelector('#editProfileModal');
  const form = document.querySelector('#editProfileForm');

  // При открытии подставляем текущие данные пользователя
  modalEl.addEventListener('show.bs.modal', () => {
    const user = getUser() ?? {
      name: document.querySelector('#profileName').textContent,
      email: document.querySelector('[data-user-email]').textContent,
      phone: document.querySelector('[data-user-phone]').textContent,
    };
    form.elements.name.value = user.name;
    form.elements.email.value = user.email;
    form.elements.phone.value = user.phone ?? '';
    form.elements.birthday.value = user.birthday ?? '';
    form.classList.remove('was-validated');
  });

  onValidSubmit(form, (data) => {
    saveUser({
      name: data.get('name').trim(),
      email: data.get('email').trim().toLowerCase(),
      phone: data.get('phone').trim(),
      birthday: data.get('birthday'),
    });
    renderAuthState();
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    showToast('Профиль сохранён');
  });
}

function initFavorites() {
  const list = document.querySelector('#favoritesList');
  const empty = document.querySelector('#favoritesEmpty');
  const counter = document.querySelector('[data-favorites-count]');

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-favorite]');
    if (!button) return;

    const item = button.closest('[data-favorite-item]');
    const name = item.querySelector('h3').textContent;
    item.remove();

    const left = list.children.length;
    counter.textContent = left;
    empty.classList.toggle('d-none', left > 0);
    showToast(`«${name}» удалён из избранного`, 'secondary');
  });
}

function initNotifications() {
  document.querySelector('#notificationsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Настройки уведомлений сохранены');
  });
}

initEditProfile();
initFavorites();
initNotifications();
