import { api } from './api.js';

import {
    TYPES,
    LEVELS,
    DAYS,
    esc,
    status,
    showError,
    trainingCard,
    getTrainingId
} from './ui.js';

export async function initCatalog() {
    const form = document.querySelector('#filters');

    let version = 0;
    let debounce;

    async function load() {
        const current = ++version;
        status('Загружаем занятия…');

        document.querySelector('#trainingList').setAttribute(
            'aria-busy',
            'true'
        );

        try {
            const items = await api.getTrainings({
                type: form.elements.type.value,
                level: form.elements.level.value,
                maxMinutes: form.elements.duration.value,
                search: form.elements.search.value
            });

            if (current !== version) {
                return;
            }

            document.querySelector('#trainingList').innerHTML =
                items.map(trainingCard).join('');

            document.querySelector('#resultsCount').textContent =
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
                document.querySelector('#trainingList').setAttribute(
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
    const training = await api.getTraining(getTrainingId());

    document.title =
        `${training.title} — Вместе`;

    document.querySelector('#trainingTitle').textContent =
        training.title;

    document.querySelector('#trainingMeta').textContent =
        `${TYPES[training.type]} · ` +
        `${LEVELS[training.level]} уровень · ` +
        `${training.minutes} мин`;

    document.querySelector('#trainingDescription').textContent =
        training.description;

    document.querySelector('#trainingSteps').innerHTML =
        training.steps.map(step => {
            return `
        <li>
          ${esc(step.title)}
          — ${step.seconds / 60} мин
        </li>
      `;
        }).join('');

    document.querySelector('#equipment').innerHTML =
        training.equipment.map(item => {
            return `<li>${esc(item)}</li>`;
        }).join('');

    if (/^[\w-]{11}$/.test(training.videoId)) {
        document.querySelector('#trainingVideo').src =
            'https://www.youtube-nocookie.com/embed/' +
            training.videoId;

        document.querySelector('#trainingVideo').title =
            `${training.title}: видео тренировки`;

        document.querySelector('#videoLink').href =
            'https://www.youtube.com/watch?v=' +
            training.videoId;
    }

    document.querySelector('#videoAuthor').textContent =
        `Автор видео: ${training.videoAuthor}`;

    document.querySelector('#openSession').href =
        `session.html?id=${encodeURIComponent(training.id)}`;

    document.querySelector('#planDay').innerHTML =
        Object.entries(DAYS).map(([key, name]) => {
            return `
        <option value="${key}">
          ${name}
        </option>
      `;
        }).join('');

    document.querySelector('#trainingContent').hidden = false;
    status();

    document.querySelector('#planForm').addEventListener(
        'submit',
        async event => {
            event.preventDefault();

            const button =
                event.currentTarget.querySelector('button');

            const day = document.querySelector('#planDay').value;

            button.disabled = true;

            try {
                await api.updatePlan(plan => {
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
            }
        }
    );
}