/* Состояние авторизации */

function isAuthenticated() {
    return Boolean(
        localStorage.getItem('bluestayToken') &&
        localStorage.getItem('bluestayUser')
    );
}

function logoutUser() {
    localStorage.removeItem('bluestayToken');
    localStorage.removeItem('bluestayUser');
    sessionStorage.removeItem('bluestayLoggedIn');
}

/* Форматирование стоимости недвижимости */

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}


/* Каталог недвижимости: загрузка из API и фильтрация */

document.addEventListener('DOMContentLoaded', async function () {
    const filterForm = document.getElementById('filterForm');

    if (!filterForm) {
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const cityFilter = document.getElementById('cityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const propertyList = document.getElementById('propertyList');
    const resultsCount = document.getElementById('resultsCount');
    const emptyMessage = document.getElementById('emptyMessage');

    let catalogProperties = [];

    function getPropertyType(property) {
        const title = property.title.toLowerCase();

        if (title.includes('студия')) return 'Студия';
        if (title.includes('дом')) return 'Дом';
        return 'Квартира';
    }

    function renderProperties(items) {
        propertyList.replaceChildren();

        items.forEach(function (property) {
            const column = document.createElement('div');
            column.className = 'col-md-6 col-lg-4 property-item';

            const card = document.createElement('div');
            card.className = 'property-card';

            const img = document.createElement('img');
            img.className = 'property-image';
            img.src = property.images[0];
            img.alt = property.title;

            const info = document.createElement('div');
            info.className = 'property-info';

            const title = document.createElement('h3');
            title.textContent = property.title;

            const location = document.createElement('p');
            location.className = 'property-location';
            location.textContent = property.location;

            const price = document.createElement('p');
            price.className = 'property-price';
            price.textContent =
                Number(property.price).toLocaleString('ru-RU') + ' ₽ / мес.';

            const link = document.createElement('a');
            link.className = 'btn btn-outline-primary';
            link.href = `property.html?id=${property.id}`;
            link.textContent = 'Подробнее';

            info.append(title, location, price, link);
            card.append(img, info);
            column.append(card);
            propertyList.append(column);
        });
    }

    function filterProperties() {
        const search = searchInput.value.trim().toLowerCase();
        const city = cityFilter.value;
        const type = typeFilter.value;
        const maxPrice = priceFilter.value === ''
            ? Infinity
            : Number(priceFilter.value);

        const filtered = catalogProperties.filter(function (property) {
            const location = property.location.toLowerCase();
            const title = property.title.toLowerCase();

            return (
                (title.includes(search) || location.includes(search)) &&
                (!city || property.location.startsWith(city)) &&
                (!type || getPropertyType(property) === type) &&
                Number(property.price) <= maxPrice
            );
        });

        renderProperties(filtered);
        resultsCount.textContent = 'Найдено: ' + filtered.length;
        emptyMessage.classList.toggle('d-none', filtered.length !== 0);
    }

    filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        filterProperties();
    });

    filterForm.addEventListener('reset', function () {
        setTimeout(filterProperties, 0);
    });

    propertyList.replaceChildren();
    resultsCount.textContent = 'Загрузка объявлений...';

    try {
        catalogProperties = await getProperties();
        filterProperties();
    } catch (error) {
        console.error('Ошибка API:', error);
        resultsCount.textContent = 'Не удалось загрузить объявления';
        emptyMessage.classList.add('d-none');
    }
});


/* Регистрация и авторизация через API */

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = 'alert alert-' + type;
    }

    function saveAuthData(data) {
        localStorage.setItem('bluestayToken', data.accessToken);
        localStorage.setItem('bluestayUser', JSON.stringify(data.user));

        sessionStorage.removeItem('bluestayLoggedIn');
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
                showMessage(
                    message,
                    'Заполните все поля. Пароль должен содержать не менее 6 символов.',
                    'danger'
                );
                return;
            }

            if (password !== confirmPassword) {
                showMessage(message, 'Пароли не совпадают.', 'danger');
                return;
            }

            try {
                const data = await registerUser(name, email, password);
                saveAuthData(data);
                window.location.href = 'profile.html';
            } catch (error) {
                showMessage(message, error.message, 'danger');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const message = document.getElementById('loginMessage');

            try {
                const data = await loginUser(email, password);
                saveAuthData(data);
                window.location.href = 'profile.html';
            } catch (error) {
                showMessage(message, error.message, 'danger');
            }
        });
    }
});

/* Личный кабинет */

document.addEventListener('DOMContentLoaded', function () {
    const profileName = document.getElementById('profileName');

    if (!profileName) {
        return;
    }

    if (!isAuthenticated()) {
        window.location.replace('login.html');
        return;
    }

    const savedUser = JSON.parse(
        localStorage.getItem('bluestayUser')
    );

    profileName.textContent = savedUser.name;
    document.getElementById('profileEmail').textContent = savedUser.email;

    document.getElementById('logoutButton').addEventListener('click', function () {
        logoutUser();
        window.location.replace('login.html');
    });
});

/* Страница выбранной недвижимости: загрузка через API */

document.addEventListener('DOMContentLoaded', async function () {
    const propertyTitle = document.getElementById('propertyTitle');

    if (!propertyTitle) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || '2';

    let property;

    try {
        propertyTitle.textContent = 'Загрузка объявления...';
        property = await getPropertyById(id);
    } catch (error) {
        console.error('Ошибка загрузки недвижимости:', error);
        propertyTitle.textContent = 'Не удалось загрузить объявление';
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
    conditionsList.replaceChildren();

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

    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('contactName').value.trim();
        const messageText = document.getElementById('contactMessage').value.trim();

        if (!name || !messageText) {
            return;
        }

        if (!isAuthenticated()) {
            alert('Для отправки сообщения необходимо войти в аккаунт.');
            return;
        }

        const savedUser = JSON.parse(
            localStorage.getItem('bluestayUser')
        );

        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            await sendMessage({
                userId: savedUser.id,
                propertyId: property.id,
                property: property.title,
                owner: property.owner,
                sender: name,
                text: messageText,
                date: new Date().toLocaleString('ru-RU')
            });

            document.getElementById('contactResult').classList.remove('d-none');
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            alert('Не удалось отправить сообщение. Попробуйте ещё раз.');
            submitButton.disabled = false;
        }
    });
});



/* История сообщений */

document.addEventListener('DOMContentLoaded', async function () {
    const messagesList = document.getElementById('messagesList');
    const emptyMessages = document.getElementById('emptyMessages');

    if (!messagesList) {
        return;
    }

    if (!isAuthenticated()) {
        window.location.replace('login.html');
        return;
    }

    const savedUser = JSON.parse(
        localStorage.getItem('bluestayUser')
    );

    messagesList.textContent = 'Загрузка сообщений...';

    try {
        const messages = await getMessages(savedUser.id);

        messagesList.replaceChildren();

        if (messages.length === 0) {
            emptyMessages.classList.remove('d-none');
            return;
        }

        emptyMessages.classList.add('d-none');

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
    } catch (error) {
        console.error('Ошибка загрузки сообщений:', error);
        messagesList.textContent =
            'Не удалось загрузить сообщения. Попробуйте обновить страницу.';
    }
});



/* Кнопка входа и выхода в шапке */

document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector(
        '.site-header a[href="login.html"]'
    );

    if (!loginButton) {
        return;
    }

    if (isAuthenticated()) {
        loginButton.textContent = 'Выйти';
        loginButton.href = '#';

        loginButton.addEventListener('click', function (event) {
            event.preventDefault();
            logoutUser();
            window.location.href = 'index.html';
        });
    }
});
