const API_URL = 'http://localhost:3000';

async function api(path, options = {}) {
    const token = localStorage.getItem('spbRentToken');
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {'Content-Type': 'application/json', ...(token ? {Authorization: `Bearer ${token}`} : {}), ...options.headers}
    });
    if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
    return response.status === 204 ? null : response.json();
}
