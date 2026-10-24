// Подключает чаты, сообщения и сделки через API.
function setupActivityPage() {
  const currentUser = getCurrentUser();
  const token = localStorage.getItem('accessToken');
  const chatList = document.getElementById('chatList');
  const chatHistory = document.getElementById('chatHistory');
  const messageForm = document.getElementById('messageForm');
  const dealsList = document.getElementById('dealsList');
  let chats = [];
  let bookings = [];
  let activeChat = null;
  let activeMessages = [];

  if (!messageForm) return;

  // Форматирует цену с разделителями и знаком рубля.
  function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
  }

  // Форматирует дату для карточек и разделителей в сообщениях.
  function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Форматирует время сообщения.
  function formatTime(date) {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Возвращает текст и цвет для статуса сделки.
  function getStatusData(status) {
    const statuses = {
      pending: { text: 'Ожидает подтверждения', className: 'badge-orange' },
      active: { text: 'Активно', className: 'badge-green' },
      completed: { text: 'Завершено', className: 'badge-gray' },
      canceled: { text: 'Отменено', className: 'badge-red' },
    };

    return statuses[status] || statuses.pending;
  }

  // Создаёт список чатов из данных db.json.
  function renderChatList() {
    chatList.querySelectorAll('.chat-item, .chat-list-message').forEach((item) => item.remove());

    if (!chats.length) {
      const message = document.createElement('p');
      message.className = 'chat-list-message rs-muted p-3';
      message.textContent = 'У вас пока нет чатов.';
      chatList.appendChild(message);
      return;
    }

    chats.forEach((chat) => {
      const button = document.createElement('button');
      button.className = `chat-item${activeChat?.id === chat.id ? ' active' : ''}`;
      button.type = 'button';
      button.dataset.chatId = chat.id;
      button.innerHTML = `
        <img src="${chat.listing.image}" alt="" />
        <span class="chat-item-content">
          <span class="chat-item-meta">
            <strong>${chat.personName}</strong>
            <small>${chat.lastTime || ''}</small>
          </span>
          <span class="chat-property d-block">${chat.listing.title}</span>
          <span class="chat-preview d-block">${chat.lastMessage || 'Сообщений пока нет'}</span>
        </span>
      `;
      button.addEventListener('click', () => selectChat(chat));
      chatList.appendChild(button);
    });
  }

  // Загружает сообщения выбранного чата и обновляет его заголовок.
  async function selectChat(chat) {
    activeChat = chat;
    renderChatList();
    document.getElementById('chatPerson').textContent = chat.personName;
    document.getElementById('chatProperty').textContent = chat.listing.title;
    document.getElementById('chatImage').src = chat.listing.image;
    document.getElementById('chatListingLink').href = `listing.html?id=${chat.listing.id}`;
    chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Загрузка сообщений...</div>';

    try {
      activeMessages = await getMessages(chat.id, token);
      renderMessages();
      document.getElementById('messageInput').disabled = false;
      messageForm.querySelector('button').disabled = false;
    } catch (error) {
      console.error(error);
      chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Не удалось загрузить сообщения.</div>';
    }
  }

  // Показывает сообщения выбранного чата в хронологическом порядке.
  function renderMessages() {
    chatHistory.replaceChildren();
    let previousDate = '';

    if (!activeMessages.length) {
      chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Напишите первое сообщение.</div>';
      return;
    }

    activeMessages.forEach((message) => {
      const messageDate = formatDate(message.createdAt);

      if (messageDate !== previousDate) {
        const date = document.createElement('div');
        date.className = 'text-center rs-muted rs-small';
        date.textContent = messageDate;
        chatHistory.appendChild(date);
        previousDate = messageDate;
      }

      const element = document.createElement('div');

      if (message.type === 'event') {
        element.className = 'text-center rs-muted rs-small';
        element.textContent = message.text;
      } else {
        element.className = `message ${Number(message.senderId) === Number(currentUser.id) ? 'out' : 'in'}`;
        const body = document.createElement('div');
        const time = document.createElement('div');
        body.textContent = message.text;
        time.className = 'message-time';
        time.textContent = formatTime(message.createdAt);
        element.append(body, time);
      }

      chatHistory.appendChild(element);
    });

    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  // Показывает сделки, соответствующие выбранному фильтру.
  function applyDealFilter(filter) {
    dealsList.querySelectorAll('.deal-card').forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.status !== filter;
    });
  }

  // Создаёт карточки сделок из массива bookings.
  function renderDeals() {
    const userDeals = bookings.filter((booking) => (
      Number(booking.userId) === Number(currentUser.id)
      || Number(booking.listing?.userId) === Number(currentUser.id)
    ));
    dealsList.replaceChildren();
    document.getElementById('dealsCount').textContent = `Всего сделок: ${userDeals.length}`;

    if (!userDeals.length) {
      dealsList.innerHTML = '<p class="rs-muted">У вас пока нет сделок.</p>';
      return;
    }

    userDeals.forEach((booking) => {
      const listing = booking.listing;
      if (!listing) return;

      const status = getStatusData(booking.status);
      const isOwner = Number(listing.userId) === Number(currentUser.id);
      const modeText = listing.mode === 'DAILY' ? 'Посуточное бронирование' : 'Помесячная аренда';
      const relatedChat = chats.find((chat) => Number(chat.listingId) === Number(listing.id));
      const card = document.createElement('article');
      card.className = 'rs-card deal-card';
      card.dataset.status = booking.status;
      card.dataset.bookingId = booking.id;
      card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" />
        <div>
          <div class="d-flex gap-2">
            <span class="rs-badge badge-gray">${isOwner ? 'Владелец' : 'Арендатор'}</span>
            <span class="rs-small rs-muted">${modeText}</span>
          </div>
          <h3>${listing.title}</h3>
          <div>${formatDate(booking.startDate)} — ${formatDate(booking.endDate)}</div>
          <strong class="fs-5 d-block mt-2">${formatPrice(booking.total)}</strong>
          <div class="rs-muted rs-small">Создано ${formatDate(booking.createdAt)}</div>
        </div>
        <div class="deal-actions">
          <span class="rs-badge ${status.className}">${status.text}</span>
          <a class="btn btn-outline-primary" href="listing.html?id=${listing.id}">Открыть объект</a>
          ${relatedChat ? '<button class="btn btn-link text-decoration-none" type="button" data-open-chat>Перейти в чат</button>' : ''}
          ${booking.status === 'pending' ? '<button class="btn btn-outline-danger" type="button" data-cancel-deal>Отменить</button>' : ''}
        </div>
      `;

      card.querySelector('[data-open-chat]')?.addEventListener('click', () => openChatTab(relatedChat));
      card.querySelector('[data-cancel-deal]')?.addEventListener('click', (event) => cancelDeal(booking, event.currentTarget));
      dealsList.appendChild(card);
    });

    const activeFilter = document.querySelector('[data-deal-filter].active').dataset.dealFilter;
    applyDealFilter(activeFilter);
  }

  // Открывает вкладку сообщений и выбирает чат нужного объявления.
  function openChatTab(chat) {
    bootstrap.Tab.getOrCreateInstance(document.querySelector('[data-bs-target="#messages"]')).show();
    selectChat(chat);
    document.querySelector('.messages-shell').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Отправляет PATCH и сохраняет отменённый статус сделки в db.json.
  async function cancelDeal(booking, button) {
    button.disabled = true;

    try {
      const updatedBooking = await updateBooking(booking.id, { status: 'canceled' }, token);
      const index = bookings.findIndex((item) => Number(item.id) === Number(booking.id));
      bookings[index] = { ...bookings[index], ...updatedBooking };
      renderDeals();
      showMessage('Заявка отменена');
    } catch (error) {
      console.error(error);
      button.disabled = false;
      showMessage('Не удалось отменить заявку');
    }
  }

  // Загружает чаты и сделки авторизованного пользователя.
  async function loadActivityData() {
    chatList.querySelectorAll('.chat-item').forEach((item) => item.remove());
    chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Загрузка чатов...</div>';
    dealsList.innerHTML = '<p class="rs-muted">Загрузка сделок...</p>';

    if (!currentUser || !token) {
      showMessage('Сначала войдите в аккаунт');
      chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Для просмотра чатов необходимо войти.</div>';
      dealsList.innerHTML = '<p class="rs-muted">Для просмотра сделок необходимо войти.</p>';
      return;
    }

    try {
      const result = await Promise.all([
        getChats(currentUser.id, token),
        getBookings(token),
      ]);
      chats = result[0];
      bookings = result[1];
      renderChatList();
      renderDeals();
      if (chats.length) {
        selectChat(chats[0]);
      } else {
        chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">У вас пока нет чатов.</div>';
      }
    } catch (error) {
      console.error(error);
      chatHistory.innerHTML = '<div class="text-center rs-muted rs-small">Не удалось загрузить чаты.</div>';
      dealsList.innerHTML = '<p class="rs-muted">Не удалось загрузить сделки.</p>';
    }
  }

  // Отправляет новое сообщение и добавляет ответ сервера в историю.
  messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !activeChat) return;

    const submitButton = messageForm.querySelector('button');
    submitButton.disabled = true;

    try {
      const newMessage = await createMessage({
        userId: currentUser.id,
        chatId: activeChat.id,
        senderId: currentUser.id,
        text,
        createdAt: new Date().toISOString(),
      }, token);
      activeMessages.push(newMessage);
      activeChat.lastMessage = `Вы: ${text}`;
      activeChat.lastTime = formatTime(newMessage.createdAt);

      try {
        await updateChat(activeChat.id, {
          lastMessage: activeChat.lastMessage,
          lastTime: activeChat.lastTime,
        }, token);
      } catch (error) {
        console.error('Не удалось обновить описание чата', error);
      }

      input.value = '';
      renderMessages();
      renderChatList();
      showMessage('Сообщение отправлено');
    } catch (error) {
      console.error(error);
      showMessage('Не удалось отправить сообщение');
    } finally {
      submitButton.disabled = false;
    }
  });

  document.querySelectorAll('[data-deal-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-deal-filter]').forEach((item) => {
        item.classList.remove('active', 'btn-primary');
        item.classList.add('btn-outline-primary');
      });
      button.classList.add('active', 'btn-primary');
      button.classList.remove('btn-outline-primary');
      applyDealFilter(button.dataset.dealFilter);
    });
  });

  document.querySelector('.chat-search input')?.addEventListener('input', (event) => {
    const searchText = event.target.value.toLowerCase();
    chatList.querySelectorAll('.chat-item').forEach((item) => {
      item.hidden = !item.textContent.toLowerCase().includes(searchText);
    });
  });

  document.getElementById('messageInput').disabled = true;
  messageForm.querySelector('button').disabled = true;
  loadActivityData();
}

document.addEventListener('DOMContentLoaded', setupActivityPage);
