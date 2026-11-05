import axios from 'https://cdn.jsdelivr.net/npm/axios@1.21.0/dist/esm/axios.min.js';

const STORAGE_KEY = 'vmeste-lr2-session';

const client = axios.create({
    baseURL: '/api',
    timeout: 10000,
    responseType: 'json',
    headers: { Accept: 'application/json' }
});

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export function getSession() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY));

        return value &&
        typeof value.accessToken === 'string' &&
        value.accessToken &&
        value.userId
            ? value
            : null;
    } catch {
        return null;
    }
}

export function saveSession({ accessToken, user }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accessToken,
        userId: user.id
    }));
}

export function clearSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
}

const translations = {
    'Email already exists': 'Эта почта уже зарегистрирована.',
    'Cannot find user': 'Неверная почта или пароль.',
    'Incorrect password': 'Неверная почта или пароль.',
    'Email format is invalid': 'Проверь адрес почты.',
    'Password is too short': 'Пароль должен содержать минимум 6 символов.',
    'Email and password are required': 'Укажи почту и пароль.'
};

async function request(url, {
    method = 'GET', query = {}, body, auth = false, signal
} = {}) {
    const params = Object.fromEntries(
        Object.entries(query).filter(([, value]) =>
            value !== undefined && value !== null && value !== ''
        )
    );

    const headers = {};

    if (auth) {
        const session = getSession();

        if (!session) {
            throw new ApiError('Сначала войди в аккаунт.', 401);
        }

        headers.Authorization = `Bearer ${session.accessToken}`;
    }

    try {
        const response = await client.request({
            url,
            method,
            params,
            data: body,
            headers,
            signal
        });

        if (typeof response.data === 'string' && response.data !== '') {
            throw new ApiError(
                'Сервер вернул некорректный JSON.',
                response.status
            );
        }

        return response.data === '' ? null : response.data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (axios.isCancel(error)) {
            throw new DOMException('Запрос отменён.', 'AbortError');
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new ApiError(
                'Сервер долго не отвечает. Попробуй ещё раз.'
            );
        }

        if (!error.response) {
            throw new ApiError(
                'Не удалось связаться с сервером. Проверь, запущен ли npm start.'
            );
        }

        const { status, data } = error.response;

        if (status === 401 && auth) {
            clearSession();
        }

        const message = typeof data === 'string'
            ? data.trim()
            : data?.message;

        const fallback = {
            401: 'Сначала войди в аккаунт.',
            403: 'Нет доступа к этим данным.',
            404: 'Данные не найдены.'
        }[status] || 'Не удалось выполнить запрос.';

        throw new ApiError(
            translations[message] ||
            (typeof data?.message === 'string' ? data.message : fallback),
            status
        );
    }
}

async function getCurrentUser() {
    const session = getSession();

    if (!session) {
        throw new ApiError('Сначала войди в аккаунт.', 401);
    }

    return request(
        `/users/${encodeURIComponent(session.userId)}`,
        { auth: true }
    );
}

async function updatePlan(update) {
    const user = await getCurrentUser();

    return request(`/users/${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        auth: true,
        body: { plan: update(user.plan || []) }
    });
}

export const api = {
    login(body) {
        return request('/login', {
            method: 'POST',
            body
        });
    },

    register(body) {
        return request('/register', {
            method: 'POST',
            body
        });
    },

    getTrainings(filters = {}, { signal } = {}) {
        return request('/trainings', {
            query: {
                type: filters.type,
                level: filters.level,
                minutes_lte: filters.maxMinutes,
                q: filters.search?.trim()
            },
            signal
        });
    },

    getTraining(id) {
        return request(`/trainings/${encodeURIComponent(id)}`);
    },

    getArticles(category = '') {
        return request('/articles', {
            query: { category }
        });
    },

    getArticle(id) {
        return request(`/articles/${encodeURIComponent(id)}`);
    },

    getCurrentUser,
    updatePlan
};