import { getSession, clearSession } from './api.js';

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
    const element = document.querySelector(selector);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.hidden = !message;
    element.classList.toggle('is-error', error);
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
        ['catalog', 'index.html', 'Занятия'],
        ['profile', 'profile.html', 'Мой план'],
        ['blog', 'blog.html', 'Блог']
    ];

    document.querySelector('#siteNav').innerHTML = links.map(
        ([key, href, title]) => {
            return `
        <a
          href="${href}"
          ${page === key
                ? 'class="active" aria-current="page"'
                : ''}
        >
          ${title}
        </a>
      `;
        }
    ).join('') + (
        getSession()
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
      `
    );

    document.querySelector('#logout')?.addEventListener('click', () => {
        clearSession();
        location.href = 'login.html';
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
          >
            <circle cx="100" cy="22" r="12"/>
            <path d="M100 36v34M100 46 64 26M100 46l36-20M100 70 72 100M100 70l28 30M42 104h116"/>
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
          >
            Подробнее
          </a>
        </div>
      </article>
    </div>
  `;
}

export function getTrainingId() {
    return new URLSearchParams(location.search).get('id') || 'pilates';
}