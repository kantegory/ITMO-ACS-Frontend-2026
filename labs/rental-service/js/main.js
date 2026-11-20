// Мок обьектов
const properties = [
    { id: 1, title: "2-комн. квартира, центр", type: "apartment", city: "Москва", price: 55000,
        rooms: 2, area: 65, img: "https://fastly.picsum.photos/id/43/1280/831.jpg?hmac=glK-rQ0ppFClW-lvjk9FqEWKog07XkOxJf6Xg_cU9LI",
        desc: "Уютная квартира в центре города. Много вопросов, мало денег." },
    { id: 2, title: "Студия у метро", type: "apartment", city: "Москва", price: 32000,
        rooms: 1, area: 28, img: "https://fastly.picsum.photos/id/48/5000/3333.jpg?hmac=y3_1VDNbhii0vM_FN6wxMlvK27vFefflbUSH06z98so",
        desc: "Современная студия рядом с метро. Все еще хуже чем у других." },
    { id: 3, title: "Загородный дом", type: "house", city: "Санкт-Петербург", price: 120000,
        rooms: 4, area: 180, img: "https://fastly.picsum.photos/id/49/1280/792.jpg?hmac=NnUJy0O9-pXHLmY2loqVs2pJmgw9xzuixgYOk4ALCXU",
        desc: "Просторный дом с участком, гаражом и сауной, На фото обои." },
    { id: 4, title: "Апартаменты бизнес-класса", type: "apartment", city: "Казань", price: 75000,
        rooms: 3, area: 95, img: "https://fastly.picsum.photos/id/57/2448/3264.jpg?hmac=ewraXYesC6HuSEAJsg3Q80bXd1GyJTxekI05Xt9YjfQ",
        desc: "Как похорошела Казань при этом, ну как его там..." },
    { id: 5, title: "Таунхаус с террасой", type: "house", city: "Москва", price: 95000,
        rooms: 3, area: 140, img: "https://fastly.picsum.photos/id/69/4912/3264.jpg?hmac=Q08LW3SoOxPfaE-y8-braexxvm5PESXMCdEDqFbEhQ8",
        desc: "Современный таунхаус с террасой и парковкой, но есть ньюанс." },
    { id: 6, title: "Однокомнатная квартира", type: "apartment", city: "Екатеринбург", price: 28000,
        rooms: 1, area: 35, img: "https://fastly.picsum.photos/id/78/1584/2376.jpg?hmac=80UVSwpa9Nfcq7sQ5kxb9Z5sD2oLsbd5zkFO5ybMC4E",
        desc: "Компактная квартира с ремонтом и всей мебелью. Если со своим." }
];

// Мок чатов
const chatData = {
    1: [
        { from: 'owner', name: 'Анна (арендодатель)', text: 'Здравствуйте! Квартира свободна с 1 декабря. Готовы показать в выходные.', time: '12.11.2025 14:32' },
        { from: 'me',    text: 'Отлично! Давайте в субботу в 12:00.', time: '12.11.2025 14:40' },
        { from: 'owner', name: 'Анна (арендодатель)', text: 'Договорились 👍', time: '12.11.2025 14:41' }
    ],
    2: [
        { from: 'owner', name: 'Игорь (арендодатель)', text: 'Добрый день! Студия готова к заселению.', time: '10.11.2025 10:15' }
    ],
    3: [
        { from: 'owner', name: 'Мария (арендодатель)', text: 'Здравствуйте! Дом свободен с 1 декабря.', time: '08.11.2025 16:20' }
    ],
    5: [
        { from: 'owner', name: 'Ольга (арендодатель)', text: 'Здравствуйте! Таунхаус свободен.', time: '05.11.2025 12:00' }
    ]
};

// Утилита для показа уведомлений
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = 2000;
    toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
    document.body.appendChild(toast);
    new bootstrap.Toast(toast, { delay: 2500 }).show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// состояние авторизации
function initAuthNavbar() {
    const user = localStorage.getItem('userName');

    document.querySelectorAll('.guest-only').forEach(el => {
        el.style.display = user ? 'none' : '';
    });

    document.querySelectorAll('.auth-only').forEach(el => {
        el.style.display = user ? 'inline-flex' : '';
    });

    document.querySelectorAll('.user-name-display').forEach(el => {
        el.textContent = user || '';
    });
}

window.logout = function () {
    localStorage.removeItem('userName');
    showToast('Вы вышли из аккаунта', 'secondary');
    setTimeout(() => window.location.href = 'index.html', 600);
};

// чатикс
function renderChatMessages(propertyId) {
    const messages = chatData[propertyId] || [];
    if (!messages.length) {
        return '<p class="text-muted text-center py-3">Пока нет сообщений. Напишите первым!</p>';
    }
    return messages.map(m => `
        <div class="mb-3 p-2 rounded ${m.from === 'me' ? 'bg-primary bg-opacity-10 text-end' : 'bg-light'}">
            <strong>${m.from === 'me' ? 'Вы' : m.name}</strong>
            <p class="mb-1 small">${m.text}</p>
            <small class="text-muted">${m.time}</small>
        </div>
    `).join('');
}

function openChatFor(propertyId) {
    const modalEl = document.getElementById('chatModal');
    if (!modalEl) return;
    const p = properties.find(x => x.id === propertyId);
    if (p) {
        document.getElementById('chatModalLabel').textContent =
            'Чат — ' + p.title;
    }
    modalEl.dataset.propertyId = propertyId;
    const body = document.getElementById('chat-messages');
    body.innerHTML = renderChatMessages(propertyId);
    document.getElementById('chat-input').value = '';
    new bootstrap.Modal(modalEl).show();
    setTimeout(() => {
        body.scrollTop = body.scrollHeight;
        document.getElementById('chat-input').focus();
    }, 300);
}

function initChatHandlers() {
    const sendBtn = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const modalEl = document.getElementById('chatModal');
    if (!sendBtn || !chatInput || !modalEl) return;

    const send = () => {
        const pid = Number(modalEl.dataset.propertyId);
        const text = chatInput.value.trim();
        if (!text || !pid) return;
        if (!chatData[pid]) chatData[pid] = [];
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const time = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        chatData[pid].push({ from: 'me', text, time });
        const body = document.getElementById('chat-messages');
        body.innerHTML = renderChatMessages(pid);
        body.scrollTop = body.scrollHeight;
        chatInput.value = '';
    };

    sendBtn.onclick = send;
    chatInput.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); send(); } };
}

// поиск
function initSearchPage() {
    const container = document.getElementById('property-list');
    if (!container) return;

    const filters = {
        query: document.getElementById('search-query'), // <-- Новое поле поиска в навбаре
        type: document.getElementById('filter-type'),
        city: document.getElementById('filter-city'),
        price: document.getElementById('filter-price'),
        priceValue: document.getElementById('filter-price-value')
    };

    filters.price.addEventListener('input', () => {
        filters.priceValue.textContent = Number(filters.price.value).toLocaleString('ru-RU') + ' ₽';
    });

    function render() {
        const q = (filters.query.value || '').toLowerCase().trim(); // <-- Текст из поиска
        const type = filters.type.value;
        const city = filters.city.value;
        const maxPrice = Number(filters.price.value) || Infinity;

        const list = properties.filter(p => {
            const matchQuery = !q || p.title.toLowerCase().includes(q); // <-- Фильтр по названию
            const matchType = !type || p.type === type;
            const matchCity = !city || p.city === city;
            const matchPrice = p.price <= maxPrice;

            return matchQuery && matchType && matchCity && matchPrice;
        });

        if (!list.length) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">
        <h5>Ничего не найдено 😔</h5><p>Попробуйте изменить параметры поиска.</p></div>`;
            return;
        }

        container.innerHTML = list.map(p => `
      <div class="col-md-6 col-lg-4">
        <div class="card property-card h-100">
          <img src="${p.img}" alt="${p.title}">
          <div class="card-body d-flex flex-column">
            <h6 class="card-title">${p.title}</h6>
            <p class="text-muted small mb-2">
              <i class="bi bi-geo-alt"></i> ${p.city} • ${p.rooms} комн. • ${p.area} м²
            </p>
            <div class="mt-auto d-flex justify-content-between align-items-center">
              <span class="price-tag">${p.price.toLocaleString('ru-RU')} ₽/мес</span>
              <a href="property.html?id=${p.id}" class="btn btn-sm btn-outline-primary">Подробнее</a>
            </div>
          </div>
        </div>
      </div>`).join('');
    }

    // Слушатели: инпут ввода срабатывает при наборе текста
    filters.query.addEventListener('input', render);
    [filters.type, filters.city].forEach(el => el.addEventListener('change', render));
    filters.price.addEventListener('input', render);

    document.getElementById('btn-reset').addEventListener('click', () => {
        filters.query.value = ''; // <-- Очищаем и поле поиска
        filters.type.value = '';
        filters.city.value = '';
        filters.price.value = 200000;
        filters.priceValue.textContent = '200 000 ₽';
        render();
    });

    render();
}

// логин
function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        localStorage.setItem('userName', form.email.value.split('@')[0]);
        showToast('Вы успешно вошли!');
        setTimeout(() => window.location.href = 'cabinet.html', 800);
    });
}

// рега
function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (form.password.value !== form.password2.value) {
            showToast('Пароли не совпадают', 'danger');
            return;
        }
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        localStorage.setItem('userName', form.name.value);
        showToast('Регистрация прошла успешно!');
        setTimeout(() => window.location.href = 'cabinet.html', 800);
    });
}

// лк
function initCabinetPage() {
    const greeting = document.getElementById('user-greeting');
    if (!greeting) return;

    const name = localStorage.getItem('userName') || 'Гость';
    greeting.textContent = name;
    document.getElementById('avatar-letter').textContent = name.charAt(0).toUpperCase();

    document.querySelectorAll('[data-chat]').forEach(btn => {
        btn.addEventListener('click', () => openChatFor(Number(btn.dataset.chat)));
    });
}

// страница обьекта
function initPropertyPage() {
    const titleEl = document.getElementById('prop-title');
    if (!titleEl) return;

    const id = Number(new URLSearchParams(location.search).get('id')) || 1;
    const p = properties.find(x => x.id === id) || properties[0];

    document.title = p.title + ' — Аренда жилья';
    titleEl.textContent = p.title;
    document.getElementById('prop-price').textContent = p.price.toLocaleString('ru-RU') + ' ₽/мес';
    document.getElementById('prop-city').textContent = p.city;
    document.getElementById('prop-rooms').textContent = p.rooms + ' комн.';
    document.getElementById('prop-area').textContent = p.area + ' м²';
    document.getElementById('prop-desc').textContent = p.desc;
    document.getElementById('main-photo').src = p.img;

    document.getElementById('btn-chat').addEventListener('click', () => openChatFor(p.id));
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthNavbar();
    initSearchPage();
    initLoginPage();
    initRegisterPage();
    initCabinetPage();
    initPropertyPage();
    initChatHandlers();
});