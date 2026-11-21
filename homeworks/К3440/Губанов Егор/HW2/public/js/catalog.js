import { api } from './api.js';

import {
    $,
    TYPES,
    LEVELS,
    DAYS,
    esc,
    status,
    showError,
    trainingCard,
    loadTraining,
    changePlan
} from './ui.js';

export async function initCatalog() {
    const form = $('#filters');

    let version = 0;
    let debounce;

    async function load() {
        const current = ++version;
        const query = new URLSearchParams();

        if (form.elements.type.value) {
            query.set(
                'type',
                form.elements.type.value
            );
        }

        if (form.elements.level.value) {
            query.set(
                'level',
                form.elements.level.value
            );
        }

        if (form.elements.duration.value) {
            query.set(
                'minutes_lte',
                form.elements.duration.value
            );
        }

        if (form.elements.search.value.trim()) {
            query.set(
                'q',
                form.elements.search.value.trim()
            );
        }

        status('Загружаем занятия…');

        $('#trainingList').setAttribute(
            'aria-busy',
            'true'
        );

        try {
            const items = await api(
                `/trainings?${query}`
            );

            if (current !== version) {
                return;
            }

            $('#trainingList').innerHTML =
                items.map(trainingCard).join('');

            $('#resultsCount').textContent =
                `Найдено занятий: ${items.length}`;

            status(
                items.length
                    ? ''
                    : 'Таких занятий пока нет. Измени фильтры.'
            );
        } catch (error) {
            if (current === version) {
                showError(error);
            }
        } finally {
            if (current === version) {
                $('#trainingList').setAttribute(
                    'aria-busy',
                    'false'
                );
            }
        }
    }

    form.addEventListener('input', event => {
        clearTimeout(debounce);

        debounce = setTimeout(
            load,
            event.target.name === 'search' ? 250 : 0
        );
    });

    form.addEventListener('submit', event => {
        event.preventDefault();
        clearTimeout(debounce);
        load();
    });

    await load();
}

export async function initTraining() {
    const training = await loadTraining();

    document.title =
        `${training.title} — Вместе`;

    $('#trainingTitle').textContent =
        training.title;

    $('#trainingMeta').textContent =
        `${TYPES[training.type]} · ` +
        `${LEVELS[training.level]} уровень · ` +
        `${training.minutes} мин`;

    $('#trainingDescription').textContent =
        training.description;

    $('#trainingSteps').innerHTML =
        training.steps.map(step => {
            return `
        <li>
          ${esc(step.title)}
          — ${step.seconds / 60} мин
        </li>
      `;
        }).join('');

    $('#equipment').innerHTML =
        training.equipment.map(item => {
            return `<li>${esc(item)}</li>`;
        }).join('');

    if (/^[\w-]{11}$/.test(training.videoId)) {
        $('#trainingVideo').src =
            'https://www.youtube-nocookie.com/embed/' +
            training.videoId;

        $('#trainingVideo').title =
            `${training.title}: видео тренировки`;

        $('#videoLink').href =
            'https://www.youtube.com/watch?v=' +
            training.videoId;
    }

    $('#videoAuthor').textContent =
        `Автор видео: ${training.videoAuthor}`;

    $('#openSession').href =
        `session.html?id=${encodeURIComponent(training.id)}`;

    $('#planDay').innerHTML =
        Object.entries(DAYS).map(([key, name]) => {
            return `
        <option value="${key}">
          ${name}
        </option>
      `;
        }).join('');

    $('#trainingContent').hidden = false;
    status();

    $('#planForm').addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            const button =
                event.currentTarget.querySelector('button');

            const day = $('#planDay').value;

            const restoreFocus = document.activeElement === button;

            button.disabled = true;

            try {
                await changePlan(plan => {
                    const previous = plan.find(item =>
                        item.day === day &&
                        item.trainingId === training.id
                    );

                    return [
                        ...plan.filter(item => item.day !== day),
                        previous || {
                            day,
                            trainingId: training.id,
                            completed: false
                        }
                    ];
                });

                status(
                    `План сохранён: ${DAYS[day]}.`,
                    false,
                    '#planStatus'
                );
            } catch (error) {
                showError(error, '#planStatus');
            } finally {
                button.disabled = false;

                if (
                    restoreFocus &&
                    document.activeElement === document.body
                ) {
                    button.focus();
                }
            }
        }
    );
}