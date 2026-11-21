const API_URL = 'http://localhost:3000';

async function getProperties() {
    const response = await fetch(`${API_URL}/properties`);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки объявлений: ${response.status}`);
    }

    return await response.json();
}

async function getPropertyById(id) {
    const response = await fetch(`${API_URL}/properties/${id}`);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки объекта: ${response.status}`);
    }

    return await response.json();
}

async function registerUser(name, email, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
    }

    return data;
}

async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Неверная почта или пароль');
    }

    return data;
}


async function sendMessage(message) {
    const response = await fetch(`${API_URL}/600/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('bluestayToken')
        },
        body: JSON.stringify(message)
    });

    if (!response.ok) {
        throw new Error(`Ошибка отправки сообщения: ${response.status}`);
    }

    return await response.json();
}


async function getMessages(userId) {
    const response = await fetch(
        `${API_URL}/messages?userId=${encodeURIComponent(userId)}`,
        {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('bluestayToken')
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Ошибка загрузки сообщений: ${response.status}`);
    }

    return await response.json();
}
