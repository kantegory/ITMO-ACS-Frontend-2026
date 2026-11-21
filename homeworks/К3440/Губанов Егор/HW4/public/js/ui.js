import {
    api,
    getSession,
    clearSession,
    ApiError
} from './api.js';

export const $ = selector => {
    return document.querySelector(selector);
};

export const TYPES = {
    pilates: 'Пилатес',
    yoga: 'Йога',
    stretch: 'Растяжка',
    cardio: 'Кардио',
    strength: 'Силовая'
};

export const LEVELS = {
    beginner: 'Начальный',
    middle: 'Средний'
};

export const DAYS = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье'
};

export const esc = value => {
    return String(value).replace(
        /[&<>"']/g,
        char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char])
    );
};

export function status(
    message = '',
    error = false,
    selector = '#pageStatus'
) {
    const element = $(selector);

    if (!element) return;

    element.hidden = false;
    element.classList.toggle('is-error', error);
    element.textContent = message;
}

export function showError(
    error,
    selector = '#pageStatus'
) {
    if (error.name === 'AbortError') {
        return;
    }

    if (error.status === 401) {
        const next =
            location.pathname.split('/').pop() +
            location.search;

        location.replace(
            `login.html?next=${encodeURIComponent(next)}`
        );

        return;
    }

    status(
        error.message || 'Произошла ошибка.',
        true,
        selector
    );
}

export function returnPath() {
    const value = new URLSearchParams(
        location.search
    ).get('next') || '';

    return /^(index|training|session|profile|blog)\.html(?:\?[^#]*)?$/.test(value)
        ? value
        : 'profile.html';
}

export function renderHeader() {
    const page = document.body.dataset.page;

    const links = [
        ['catalog', 'index.html', 'Занятия', 'search'],
        ['profile', 'profile.html', 'Мой план', 'calendar'],
        ['blog', 'blog.html', 'Блог', 'book']
    ];

    const navigation = links.map(
        ([key, href, title, iconId]) => `
            <a
                href="${href}"
                class="${page === key ? 'active' : ''}"
                ${page === key ? 'aria-current="page"' : ''}
            >
                <svg
                    class="icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <use href="icons/sprite.svg#${iconId}"></use>
                </svg>
                ${title}
            </a>
        `
    ).join('');

    const authLinks = getSession()
        ? `
            <button
                class="nav-button"
                id="logout"
                type="button"
            >
                Выйти
            </button>
        `
        : `
            <a href="login.html">Войти</a>
            <a href="register.html">Регистрация</a>
        `;

    $('#siteNav').innerHTML = navigation + authLinks;

    $('#logout')?.addEventListener('click', () => {
        clearSession();
        location.href = 'login.html';
    });
}

export async function requireUser() {
    const session = getSession();

    if (!session) {
        throw new ApiError(
            'Сначала войди в аккаунт.',
            401
        );
    }

    return api(
        `/users/${encodeURIComponent(session.userId)}`,
        { auth: true }
    );
}

export async function changePlan(update) {
    const user = await requireUser();

    return api(`/users/${user.id}`, {
        method: 'PATCH',
        auth: true,
        body: {
            plan: update(user.plan || [])
        }
    });
}

export function trainingCard(item) {
    return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="brutal-card h-100">
        <div
          class="pose-art ${esc(item.type)}"
          aria-hidden="true"
        >
          <svg
                class="pose-svg"
                viewBox="0 0 200 120"
                aria-hidden="true"
                focusable="false"
            >
                <use href="icons/sprite.svg#pose"></use>
            </svg>
        </div>

        <div class="card-body d-flex flex-column">
          <p class="eyebrow">
            ${esc(TYPES[item.type])}
            · ${item.minutes} мин
          </p>

          <h2 class="h3">${esc(item.title)}</h2>

          <p>${esc(item.summary)}</p>

          <p class="small">
            Уровень: ${esc(LEVELS[item.level])}
          </p>

          <a
            class="btn btn-brutal btn-lilac mt-auto"
            href="training.html?id=${encodeURIComponent(item.id)}"
            aria-label="Подробнее о тренировке ${esc(item.title)}"
          >
            Подробнее
          </a>
        </div>
      </article>
    </div>
  `;
}

export async function loadTraining() {
    const id = new URLSearchParams(
        location.search
    ).get('id') || 'pilates';

    return api(
        `/trainings/${encodeURIComponent(id)}`
    );
}