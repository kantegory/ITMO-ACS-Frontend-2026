
/* Данные недвижимости */

const properties = {
    1: {
        title: 'Уютная квартира в центре',
        location: 'Санкт-Петербург, Центральный район',
        price: 65000,
        area: '54 м²',
        rooms: '2',
        floor: '4 из 7',
        term: 'От 11 месяцев',
        owner: 'Елена Петрова',
        description: 'Уютная двухкомнатная квартира в центре Санкт-Петербурга. В квартире есть мебель, бытовая техника и всё необходимое для проживания. Рядом находятся магазины, кафе и остановки общественного транспорта.',
        conditions: [
            'Залог: 65 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 11 месяцев',
            'Без домашних животных'
        ],
        images: [
            'images/property-1-1.webp',
            'images/property-1-2.webp',
            'images/property-1-3.webp'
        ]
    },
    2: {
        title: 'Светлая студия',
        location: 'Москва, Хамовники',
        price: 48000,
        area: '32 м²',
        rooms: 'Студия',
        floor: '5 из 9',
        term: 'От 6 месяцев',
        owner: 'Анна Смирнова',
        description: 'Светлая студия в спокойном районе Москвы. В квартире есть необходимая мебель и бытовая техника. Рядом находятся магазины, кафе и остановки общественного транспорта. Подойдёт для одного человека или пары.',
        conditions: [
            'Залог: 48 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 6 месяцев',
            'Курение в квартире запрещено'
        ],
        images: [
            'images/property-2-1.webp',
            'images/property-2-2.webp',
            'images/property-2-3.webp'
        ]
    },
    3: {
        title: 'Просторная квартира с видом',
        location: 'Казань, Вахитовский район',
        price: 55000,
        area: '72 м²',
        rooms: '3',
        floor: '8 из 12',
        term: 'От 6 месяцев',
        owner: 'Дмитрий Волков',
        description: 'Просторная квартира с большими окнами и красивым видом на город. Есть отдельная кухня, гостиная и две спальни. В шаговой доступности магазины, школы и общественный транспорт.',
        conditions: [
            'Залог: 55 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 6 месяцев',
            'Можно с детьми'
        ],
        images: [
            'images/property-3-1.webp',
            'images/property-3-2.webp',
            'images/property-3-3.webp'
        ]
    },
    4: {
        title: 'Небольшая квартира у метро',
        location: 'Санкт-Петербург, Приморский район',
        price: 39000,
        area: '38 м²',
        rooms: '1',
        floor: '3 из 9',
        term: 'От 6 месяцев',
        owner: 'Ольга Иванова',
        description: 'Небольшая квартира в тихом жилом районе. Рядом метро, продуктовые магазины и парк. В квартире есть кухня, стиральная машина и необходимая мебель.',
        conditions: [
            'Залог: 39 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 6 месяцев',
            'Без курения'
        ],
        images: [
            'images/property-4-1.webp',
            'images/property-4-2.webp',
            'images/property-4-3.webp'
        ]
    },
    5: {
        title: 'Загородный дом с террасой',
        location: 'Москва, Новая Москва',
        price: 95000,
        area: '140 м²',
        rooms: '4',
        floor: '2 этажа',
        term: 'От 12 месяцев',
        owner: 'Алексей Морозов',
        description: 'Просторный загородный дом с террасой и небольшим участком. В доме есть кухня, гостиная, три спальни и два санузла. Подойдёт для семьи, которая предпочитает спокойную жизнь за городом.',
        conditions: [
            'Залог: 95 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 12 месяцев',
            'Можно с детьми и домашними животными'
        ],
        images: [
            'images/property-5-1.webp',
            'images/property-5-2.webp',
            'images/property-5-3.webp'
        ]
    },
    6: {
        title: 'Студия рядом с парком',
        location: 'Казань, Советский район',
        price: 32000,
        area: '28 м²',
        rooms: 'Студия',
        floor: '6 из 10',
        term: 'От 6 месяцев',
        owner: 'Мария Кузнецова',
        description: 'Компактная студия рядом с парком. В квартире есть мебель, кухонная зона и бытовая техника. Подойдёт для одного человека. Недалеко находятся магазины и остановки общественного транспорта.',
        conditions: [
            'Залог: 32 000 ₽',
            'Коммунальные услуги оплачиваются отдельно',
            'Минимальный срок аренды: 6 месяцев',
            'Без домашних животных'
        ],
        images: [
            'images/property-6-1.webp',
            'images/property-6-2.webp',
            'images/property-6-3.webp'
        ]
    }
};

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}


/* Фильтрация каталога */

document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');

    if (!filterForm) {
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const cityFilter = document.getElementById('cityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const propertyItems = document.querySelectorAll('.property-item');
    const resultsCount = document.getElementById('resultsCount');
    const emptyMessage = document.getElementById('emptyMessage');

    function filterProperties() {
        const search = searchInput.value.trim().toLowerCase();
        const city = cityFilter.value;
        const type = typeFilter.value;
        const maxPrice = priceFilter.value === ''
            ? Infinity
            : Number(priceFilter.value);

        let visibleCount = 0;

        propertyItems.forEach(function (item) {
            const title = item.dataset.title.toLowerCase();
            const location = item.dataset.location.toLowerCase();
            const itemCity = item.dataset.city;
            const itemType = item.dataset.type;
            const price = Number(item.dataset.price);

            const matchesSearch =
                title.includes(search) ||
                location.includes(search) ||
                itemCity.toLowerCase().includes(search);

            const matchesCity = !city || itemCity === city;
            const matchesType = !type || itemType === type;
            const matchesPrice = price <= maxPrice;

            const isVisible =
                matchesSearch &&
                matchesCity &&
                matchesType &&
                matchesPrice;

            item.classList.toggle('d-none', !isVisible);

            if (isVisible) {
                visibleCount++;
            }
        });

        resultsCount.textContent = 'Найдено: ' + visibleCount;
        emptyMessage.classList.toggle('d-none', visibleCount !== 0);
    }

    filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        filterProperties();
    });

    filterForm.addEventListener('reset', function () {
        setTimeout(filterProperties, 0);
    });

    filterProperties();
});


/* Демонстрационная регистрация и вход без сервера */

async function hashDemoPassword(password, salt) {
    const bytes = new TextEncoder().encode(salt + ':' + password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = 'alert alert-' + type;
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const message = document.getElementById('registerMessage');

            if (!name || !email || password.length < 6) {
                showMessage(message, 'Заполните все поля. Пароль должен содержать не менее 6 символов.', 'danger');
                return;
            }

            if (password !== confirmPassword) {
                showMessage(message, 'Пароли не совпадают.', 'danger');
                return;
            }

            if (!window.crypto || !crypto.subtle) {
                showMessage(message, 'Для демонстрационной регистрации откройте сайт через localhost.', 'danger');
                return;
            }

            const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
            const passwordHash = await hashDemoPassword(password, salt);

            const user = { name, email, salt, passwordHash };
            localStorage.setItem('bluestayUser', JSON.stringify(user));
            sessionStorage.setItem('bluestayLoggedIn', 'true');
            window.location.href = 'profile.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const message = document.getElementById('loginMessage');
            const savedUser = JSON.parse(
                localStorage.getItem('bluestayUser') || 'null'
            );

            if (!savedUser || savedUser.email.toLowerCase() !== email.toLowerCase()) {
                showMessage(message, 'Неверная почта или пароль.', 'danger');
                return;
            }

            if (!savedUser.passwordHash || !savedUser.salt) {
                showMessage(message, 'Для новой версии демонстрации зарегистрируйтесь заново.', 'warning');
                return;
            }

            if (!window.crypto || !crypto.subtle) {
                showMessage(message, 'Для входа откройте сайт через localhost.', 'danger');
                return;
            }

            const passwordHash = await hashDemoPassword(password, savedUser.salt);
            if (passwordHash !== savedUser.passwordHash) {
                showMessage(message, 'Неверная почта или пароль.', 'danger');
                return;
            }

            sessionStorage.setItem('bluestayLoggedIn', 'true');
            window.location.href = 'profile.html';
        });
    }
});


/* Личный кабинет */

document.addEventListener('DOMContentLoaded', function () {
    const profileName = document.getElementById('profileName');

    if (!profileName) {
        return;
    }

    const savedUser = JSON.parse(
        localStorage.getItem('bluestayUser') || 'null'
    );

    const isLoggedIn =
        sessionStorage.getItem('bluestayLoggedIn') === 'true';

    if (!savedUser || !isLoggedIn) {
        window.location.replace('login.html');
        return;
    }

    profileName.textContent = savedUser.name;
    document.getElementById('profileEmail').textContent = savedUser.email;

    document.getElementById('logoutButton').addEventListener('click', function () {
        sessionStorage.removeItem('bluestayLoggedIn');
        window.location.replace('login.html');
    });
});


/* Страница выбранной недвижимости */

document.addEventListener('DOMContentLoaded', function () {
    const propertyTitle = document.getElementById('propertyTitle');

    if (!propertyTitle) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '2';
    const property = properties[id];

    if (!property) {
        window.location.replace('catalog.html');
        return;
    }

    document.title = property.title + ' — BlueStay';

    propertyTitle.textContent = property.title;
    document.getElementById('propertyLocation').textContent = property.location;
    document.getElementById('propertyPrice').textContent =
        formatPrice(property.price) + ' / мес.';

    document.getElementById('propertyArea').textContent = property.area;
    document.getElementById('propertyRooms').textContent = property.rooms;
    document.getElementById('propertyFloor').textContent = property.floor;
    document.getElementById('propertyTerm').textContent = property.term;
    document.getElementById('propertyDescription').textContent = property.description;
    document.getElementById('propertyOwner').textContent = property.owner;

    document.getElementById('propertyMainImage').src = property.images[0];
    document.getElementById('propertyImage2').src = property.images[1];
    document.getElementById('propertyImage3').src = property.images[2];

    const conditionsList = document.getElementById('propertyConditions');

    const priceItem = document.createElement('li');
    priceItem.textContent = 'Стоимость: ' + formatPrice(property.price) + ' в месяц';
    conditionsList.appendChild(priceItem);

    property.conditions.forEach(function (condition) {
        const item = document.createElement('li');
        item.textContent = condition;
        conditionsList.appendChild(item);
    });

    document.getElementById('contactOwnerText').textContent =
        'Ваше сообщение получит ' + property.owner + '.';

    const contactForm = document.getElementById('contactForm');
    const savedUser = JSON.parse(
        localStorage.getItem('bluestayUser') || 'null'
    );

    if (savedUser) {
        document.getElementById('contactName').value = savedUser.name;
    }

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const messageText = document.getElementById('contactMessage').value.trim();

        if (!name || !messageText) {
            return;
        }

        const isLoggedIn =
            sessionStorage.getItem('bluestayLoggedIn') === 'true';

        if (!savedUser || !isLoggedIn) {
            alert('Для отправки сообщения необходимо войти в аккаунт.');
            return;
        }

        const messages = JSON.parse(
            localStorage.getItem('bluestayMessages') || '[]'
        );

        messages.push({
            property: property.title,
            owner: property.owner,
            sender: name,
            text: messageText,
            date: new Date().toLocaleString('ru-RU')
        });

        localStorage.setItem('bluestayMessages', JSON.stringify(messages));

        document.getElementById('contactResult').classList.remove('d-none');
        contactForm.querySelector('button[type="submit"]').disabled = true;
    });
});


/* История сообщений */

document.addEventListener('DOMContentLoaded', function () {
    const messagesList = document.getElementById('messagesList');
    const emptyMessages = document.getElementById('emptyMessages');

    if (!messagesList) {
        return;
    }

    const messages = JSON.parse(
        localStorage.getItem('bluestayMessages') || '[]'
    );

    if (messages.length === 0) {
        emptyMessages.classList.remove('d-none');
        return;
    }

    messages.slice().reverse().forEach(function (message) {
        const card = document.createElement('div');
        card.className = 'message-card';

        const title = document.createElement('h3');
        title.textContent = message.property;

        const owner = document.createElement('p');
        owner.className = 'property-location mb-1';
        owner.textContent = 'Владелец: ' + message.owner;

        const date = document.createElement('span');
        date.className = 'message-date';
        date.textContent = message.date;

        const text = document.createElement('p');
        text.className = 'message-text';
        text.textContent = message.text;

        card.append(title, owner, date, text);
        messagesList.appendChild(card);
    });
});


/* Кнопка входа и выхода в шапке */

document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector(
        '.site-header a[href="login.html"]'
    );

    if (!loginButton) {
        return;
    }

    const isLoggedIn =
        sessionStorage.getItem('bluestayLoggedIn') === 'true';

    if (isLoggedIn) {
        loginButton.textContent = 'Выйти';
        loginButton.href = '#';

        loginButton.addEventListener('click', function (event) {
            event.preventDefault();
            sessionStorage.removeItem('bluestayLoggedIn');
            window.location.href = 'index.html';
        });
    }
});
