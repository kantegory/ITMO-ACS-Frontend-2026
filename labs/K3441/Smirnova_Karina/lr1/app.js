document.addEventListener('DOMContentLoaded', () => {
  // Bootstrap Toast API: https://getbootstrap.com/docs/6.0/components/toasts/
  const toastElement = document.getElementById('appToast');
  const showToast = (message) => {
    if (!toastElement || !window.bootstrap) return;
    toastElement.querySelector('.toast-body').textContent = message;
    bootstrap.Toast.getOrCreateInstance(toastElement).show();
  };

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      button.setAttribute('aria-label', input.type === 'password' ? 'Показать пароль' : 'Скрыть пароль');
    });
  });

  document.querySelectorAll('.needs-validation').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const password = form.querySelector('#registerPassword');
      const repeat = form.querySelector('#repeatPassword');
      if (password && repeat) repeat.setCustomValidity(password.value === repeat.value ? '' : 'Пароли не совпадают');
      form.classList.add('was-validated');
      if (!form.checkValidity()) return;

      // Bootstrap Modal API: https://getbootstrap.com/docs/5.3/components/modal/
      const modalId = form.dataset.successModal;
      if (modalId) bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId)).show();
      else if (form.dataset.redirect) window.location.href = form.dataset.redirect;
    });
  });

  const modeButtons = document.querySelectorAll('[data-rent-mode]');
  modeButtons.forEach((button) => button.addEventListener('click', () => {
    modeButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.property-card').forEach((card) => {
      card.hidden = card.dataset.mode !== button.dataset.rentMode;
    });
    const visible = [...document.querySelectorAll('.property-card')].filter((card) => !card.hidden).length;
    const count = document.getElementById('resultsCount');
    if (count) count.textContent = `Найдено ${visible} объекта`;
  }));

  const listingGrid = document.getElementById('listingGrid');
  const propertyCards = listingGrid ? [...listingGrid.querySelectorAll('.property-card')] : [];
  propertyCards.forEach((card, index) => { card.dataset.originalIndex = index; });
  const sortPropertyCards = (order) => {
    if (!listingGrid) return;
    const sortedCards = [...propertyCards].sort((first, second) => {
      if (order === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
      if (order === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
      return Number(first.dataset.originalIndex) - Number(second.dataset.originalIndex);
    });
    sortedCards.forEach((card) => listingGrid.appendChild(card));
  };
  document.getElementById('sortOrder')?.addEventListener('change', (event) => {
    sortPropertyCards(event.target.value);
  });

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const type = document.getElementById('houseType').value;
      const location = document.getElementById('location').value.trim().toLowerCase();
      const min = Number(document.getElementById('priceMin').value || 0);
      const max = Number(document.getElementById('priceMax').value || Infinity);
      let visible = 0;
      document.querySelectorAll('.property-card').forEach((card) => {
        const matches = (!type || card.dataset.type === type)
          && (!location || card.dataset.location.includes(location))
          && Number(card.dataset.price) >= min
          && Number(card.dataset.price) <= max
          && card.dataset.mode === document.querySelector('[data-rent-mode].active').dataset.rentMode;
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      document.getElementById('resultsCount').textContent = `Найдено ${visible} объекта`;
      document.getElementById('emptyResults').hidden = visible !== 0;
    });
    document.getElementById('resetFilters')?.addEventListener('click', () => {
      searchForm.reset();
      document.getElementById('sortOrder').value = 'recommended';
      sortPropertyCards('recommended');
      document.querySelector('[data-rent-mode="DAILY"]').click();
      document.getElementById('emptyResults').hidden = true;
    });
  }

  const listingRoot = document.querySelector('[data-listing-page]');
  if (listingRoot) {
    const monthly = new URLSearchParams(location.search).get('mode') === 'monthly';
    document.querySelectorAll('[data-daily]').forEach((node) => node.hidden = monthly);
    document.querySelectorAll('[data-monthly]').forEach((node) => node.hidden = !monthly);
    if (monthly) {
      document.title = 'Квартира у набережной — RentSpace';
      document.querySelectorAll('[data-listing-title]').forEach((node) => node.textContent = 'Квартира у набережной');
      document.querySelector('[data-listing-address]').textContent = 'Санкт-Петербург, наб. реки Фонтанки, 54';
      document.querySelector('[data-listing-main]').src = 'assets/flat-river.png';
      document.getElementById('galleryFirstImage').src = 'assets/flat-river.png';
    }

    const start = document.getElementById('startDate');
    const end = document.getElementById('endDate');
    const recalculate = () => {
      if (!start?.value || !end?.value) return;
      const nights = Math.max(0, Math.round((new Date(end.value) - new Date(start.value)) / 86400000));
      const total = nights * 4500;
      document.querySelectorAll('[data-night-count]').forEach((node) => node.textContent = nights);
      document.querySelectorAll('[data-booking-total]').forEach((node) => node.textContent = `${total.toLocaleString('ru-RU')} ₽`);
    };
    start?.addEventListener('change', recalculate);
    end?.addEventListener('change', recalculate);
    document.getElementById('confirmBooking')?.addEventListener('click', () => {
      bootstrap.Modal.getInstance(document.getElementById('bookingModal'))?.hide();
      showToast('Заявка на бронирование успешно отправлена');
    });
    document.getElementById('contactOwner')?.addEventListener('click', () => {
      if (document.querySelector('#communicationChat')?.checked) location.href = 'activity.html';
      else showToast('Обращение создано. Владелец увидит ваш номер телефона.');
    });
  }

  // Bootstrap Carousel API: https://getbootstrap.com/docs/6.0/components/carousel/
  document.querySelectorAll('[data-gallery-index]').forEach((trigger) => trigger.addEventListener('click', () => {
    const carousel = document.getElementById('galleryCarousel');
    if (carousel && window.bootstrap) {
      bootstrap.Carousel.getOrCreateInstance(carousel, { interval: false, ride: false }).to(Number(trigger.dataset.galleryIndex));
    }
  }));

  document.getElementById('profileForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    document.getElementById('profileName').textContent = document.getElementById('profileNameInput').value;
    bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
    showToast('Данные профиля сохранены');
  });
  document.querySelectorAll('[data-hide-listing]').forEach((button) => button.addEventListener('click', () => {
    const badge = button.closest('.owner-card').querySelector('.status-badge');
    const isActive = badge.textContent.trim() === 'Активно';
    badge.className = `rs-badge ${isActive ? 'badge-gray' : 'badge-green'} status-badge`;
    badge.textContent = isActive ? 'Неактивно' : 'Активно';
    button.textContent = isActive ? 'Показать объявление' : 'Скрыть объявление';
    button.setAttribute('aria-pressed', String(isActive));
    showToast(isActive ? 'Объявление скрыто' : 'Объявление снова опубликовано');
  }));

  const chatMessages = {
    centre: [
      { type: 'date', text: '18 октября 2026' },
      { type: 'out', text: 'Здравствуйте! Хочу забронировать квартиру с 22 по 25 октября. Подскажите, эти даты свободны?', time: '15:35 ✓✓' },
      { type: 'in', text: 'Здравствуйте, Алексей! Спасибо за интерес к квартире. Проверю даты и скоро отвечу вам.', time: '15:42' },
      { type: 'out', text: 'Спасибо! Заявку на 3 ночи уже отправил.', time: '15:43 ✓✓' },
      { type: 'event', text: 'Заявка на 22–25 октября · 13 500 ₽ · Ожидает подтверждения' },
    ],
    river: [
      { type: 'date', text: '18 октября 2026' },
      { type: 'in', text: 'Да, можно договориться о просмотре.', time: '14:10' },
    ],
    house: [
      { type: 'date', text: '18 октября 2026' },
      { type: 'in', text: 'Здравствуйте! Интересует аренда дома.', time: '12:30' },
    ],
    garden: [
      { type: 'date', text: '17 октября 2026' },
      { type: 'in', text: 'Буду ждать вас 28 октября.', time: 'Вчера' },
    ],
  };
  let activeChatId = document.querySelector('.chat-item.active')?.dataset.chatId || 'centre';
  const renderChatHistory = () => {
    const history = document.getElementById('chatHistory');
    if (!history) return;
    history.replaceChildren();
    (chatMessages[activeChatId] || []).forEach((message) => {
      const element = document.createElement('div');
      if (message.type === 'date' || message.type === 'event') {
        element.className = 'text-center rs-muted rs-small';
        element.textContent = message.text;
      } else {
        element.className = `message ${message.type}`;
        const body = document.createElement('div');
        body.textContent = message.text;
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = message.time;
        element.append(body, time);
      }
      history.appendChild(element);
    });
    history.scrollTop = history.scrollHeight;
  };

  document.querySelectorAll('.chat-item').forEach((item) => item.addEventListener('click', () => {
    document.querySelectorAll('.chat-item').forEach((chat) => chat.classList.remove('active'));
    item.classList.add('active');
    activeChatId = item.dataset.chatId;
    document.getElementById('chatPerson').textContent = item.dataset.person;
    document.getElementById('chatProperty').textContent = item.dataset.property;
    document.getElementById('chatImage').src = item.querySelector('img').src;
    item.querySelector('.rs-badge')?.remove();
    renderChatHistory();
  }));
  document.getElementById('messageForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !chatMessages[activeChatId]) return;
    chatMessages[activeChatId].push({ type: 'out', text, time: 'только что ✓' });
    const activeChat = document.querySelector(`.chat-item[data-chat-id="${activeChatId}"]`);
    if (activeChat) activeChat.querySelector('.chat-preview').textContent = `Вы: ${text}`;
    input.value = '';
    renderChatHistory();
    showToast('Сообщение отправлено');
  });
  renderChatHistory();

  document.querySelectorAll('[data-deal-filter]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-deal-filter]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.dealFilter;
    document.querySelectorAll('.deal-card').forEach((card) => card.hidden = filter !== 'all' && card.dataset.status !== filter);
  }));

  // Bootstrap Tab API: https://getbootstrap.com/docs/6.0/components/tab/
  document.querySelectorAll('a[href="#messages"]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    const messagesTab = document.querySelector('[data-bs-target="#messages"]');
    if (messagesTab) bootstrap.Tab.getOrCreateInstance(messagesTab).show();
    document.querySelector('.messages-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
});
