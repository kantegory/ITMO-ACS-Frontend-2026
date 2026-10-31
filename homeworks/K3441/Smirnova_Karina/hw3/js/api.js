// Создаём один экземпляр Axios с общим адресом мокового API.
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
});

// Регистрирует нового пользователя и возвращает ответ сервера.
async function registerUser(userData) {
  const response = await api.post('/register', userData);
  return response.data;
}

// Выполняет вход по почте и паролю и возвращает токен с данными пользователя.
async function loginUser(email, password) {
  const response = await api.post('/login', { email, password });
  return response.data;
}

// Получает объявления с учётом выбранных фильтров и сортировки.
async function getListings(filters = {}) {
  const params = {
    active: true,
    mode: filters.mode,
    type: filters.type || undefined,
    location_like: filters.location || undefined,
    price_gte: filters.min || undefined,
    price_lte: filters.max || undefined,
  };

  if (filters.sort === 'price-asc') {
    params._sort = 'price';
    params._order = 'asc';
  }

  if (filters.sort === 'price-desc') {
    params._sort = 'price';
    params._order = 'desc';
  }

  const response = await api.get('/listings', { params });
  return response.data;
}

// Получает одно объявление по его идентификатору.
async function getListing(id) {
  const response = await api.get(`/listings/${id}`);
  return response.data;
}

// Создаёт бронирование и явно передаёт JWT-токен в заголовке запроса.
async function createBooking(bookingData, token) {
  const response = await api.post('/bookings', bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Обновляет данные авторизованного пользователя.
async function updateUser(id, userData, token) {
  const response = await api.patch(`/users/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Получает объявления, которые принадлежат выбранному пользователю.
async function getUserListings(userId) {
  const response = await api.get('/listings', {
    params: { userId },
  });

  return response.data;
}

// Изменяет данные объявления, например его видимость в поиске.
async function updateListing(id, listingData, token) {
  const response = await api.patch(`/listings/${id}`, listingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Получает сделки пользователя вместе с данными объявлений.
async function getBookings(token) {
  const response = await api.get('/bookings', {
    params: { _expand: 'listing' },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Изменяет статус выбранной сделки.
async function updateBooking(id, bookingData, token) {
  const response = await api.patch(`/bookings/${id}`, bookingData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Получает чаты пользователя вместе с данными объявлений.
async function getChats(userId, token) {
  const response = await api.get('/chats', {
    params: {
      userId,
      _expand: 'listing',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Обновляет краткую информацию о последнем сообщении в чате.
async function updateChat(id, chatData, token) {
  const response = await api.patch(`/chats/${id}`, chatData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Получает все сообщения выбранного чата по времени отправки.
async function getMessages(chatId, token) {
  const response = await api.get('/messages', {
    params: {
      chatId,
      _sort: 'createdAt',
      _order: 'asc',
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Сохраняет новое сообщение в базе.
async function createMessage(messageData, token) {
  const response = await api.post('/messages', messageData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
