const STORAGE_KEY = 'vmeste-lr2-session';

export function getSession() {
    try {
        const value = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return value &&
        typeof value.accessToken === 'string' &&
        value.userId
            ? value
            : null;
    } catch {
        return null;
    }
}

export function saveSession({ accessToken, user }) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            accessToken,
            userId: user.id
        })
    );
}

export function clearSession() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
}

export class ApiError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.status = status;
    }
}

const translations = {
    'Email already exists':
        'Эта почта уже зарегистрирована.',
    'Cannot find user':
        'Неверная почта или пароль.',
    'Incorrect password':
        'Неверная почта или пароль.',
    'Email format is invalid':
        'Проверь адрес почты.',
    'Password is too short':
        'Пароль должен содержать минимум 6 символов.',
    'Email and password are required':
        'Укажи почту и пароль.'
};

export async function api(
    path,
    {
        method = 'GET',
        body,
        auth = false,
        signal
    } = {}
) {
    const headers = {
        Accept: 'application/json'
    };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (auth) {
        const session = getSession();

        if (!session) {
            throw new ApiError(
                'Сначала войди в аккаунт.',
                401
            );
        }

        headers.Authorization =
            `Bearer ${session.accessToken}`;
    }

    let response;

    try {
        response = await fetch(`/api${path}`, {
            method,
            headers,
            signal,
            cache: 'no-store',
            body: body === undefined
                ? undefined
                : JSON.stringify(body)
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }

        throw new ApiError(
            'Не удалось связаться с сервером. Проверь, запущен ли npm start.'
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        if (response.status === 401 && auth) {
            clearSession();
        }

        const raw = typeof data === 'string'
            ? data
            : data?.message;

        const fallback = response.status === 404
            ? 'Данные не найдены.'
            : response.status === 403
                ? 'Нет доступа к этим данным.'
                : 'Не удалось выполнить запрос.';

        throw new ApiError(
            translations[raw] ||
            (data?.message ? raw : fallback),
            response.status
        );
    }

    return data;
}