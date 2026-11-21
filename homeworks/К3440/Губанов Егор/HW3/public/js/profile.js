import { api } from './api.js';

import {
    $,
    DAYS,
    TYPES,
    esc,
    status,
    showError,
    requireUser,
    changePlan
} from './ui.js';

export async function initProfile() {
    let [user, trainings] = await Promise.all([
        requireUser(),
        api('/trainings')
    ]);

    const byId = new Map(
        trainings.map(item => [item.id, item])
    );

    const list = $('#planList');
    let saving = false;

    function render() {
        const plan = [...(user.plan || [])].sort((a, b) =>
            Object.keys(DAYS).indexOf(a.day) -
            Object.keys(DAYS).indexOf(b.day)
        );

        const done = plan.filter(item => item.completed).length;

        const percent = plan.length
            ? Math.round(done / plan.length * 100)
            : 0;

        $('#profileName').textContent = `Привет, ${user.name}!`;

        $('#profileMeta').textContent =
            `${user.email} · Направление: ${TYPES[user.goal]}`;

        $('#progressLabel').textContent =
            `Выполнено ${done} из ${plan.length}`;

        $('#planProgress').style.width = `${percent}%`;

        $('#progressTrack').removeAttribute('aria-label');

        $('#progressTrack').setAttribute(
            'aria-labelledby',
            'planTitle progressLabel'
        );

        $('#progressTrack').setAttribute(
            'aria-valuenow',
            String(percent)
        );

        $('#progressTrack').setAttribute(
            'aria-valuetext',
            `${done} из ${plan.length} занятий, ${percent}%`
        );

        $('#emptyPlan').hidden = plan.length !== 0;

        list.innerHTML = plan.map(item => {
            const training = byId.get(item.trainingId);

            if (!training) return '';

            const context = esc(
                `${training.title}, ${DAYS[item.day]}`
            );

            return `
        <article
          class="brutal-card p-3"
          aria-labelledby="plan-title-${item.day}"
        >
          <p class="eyebrow">${DAYS[item.day]}</p>

          <h3 id="plan-title-${item.day}" class="h4">
            ${esc(training.title)}
          </h3>

          <p>
            ${TYPES[training.type]} · ${training.minutes} мин
          </p>

          <label class="d-flex align-items-center gap-2 mb-3">
            <input
              id="plan-${item.day}"
              class="form-check-input mt-0"
              type="checkbox"
              data-day="${item.day}"
              aria-label="Занятие выполнено: ${context}"
              ${item.completed ? 'checked' : ''}
            >
            Занятие выполнено
          </label>

          <div class="d-flex gap-2 flex-wrap">
            <a
              id="start-${item.day}"
              class="btn btn-brutal btn-sage"
              href="session.html?id=${encodeURIComponent(training.id)}&amp;day=${item.day}"
              aria-label="Начать тренировку ${context}"
            >
              Начать
            </a>

            <button
              id="remove-${item.day}"
              class="btn btn-brutal btn-paper"
              type="button"
              data-remove="${item.day}"
              aria-label="Убрать из плана: ${context}"
            >
              Убрать
            </button>
          </div>
        </article>
      `;
        }).join('');
        list.querySelectorAll('button[data-remove]').forEach(button => {
            button.addEventListener('click', () => {
                save(plan => plan.filter(
                    item => item.day !== button.dataset.remove
                ));
            });
        });
    }

    async function save(update) {
        if (saving) return;

        saving = true;

        const activeId = document.activeElement?.id;

        list.setAttribute('aria-busy', 'true');

        list.querySelectorAll('input, button').forEach(control => {
            control.disabled = true;
        });

        status('Сохраняем план…');

        try {
            user = await changePlan(update);
            status('План сохранён.');
        } catch (error) {
            showError(error);
        } finally {
            const focused = document.activeElement;

            const focusId = list.contains(focused)
                ? focused.id
                : focused === document.body
                    ? activeId
                    : '';

            saving = false;
            render();

            list.setAttribute('aria-busy', 'false');

            if (focusId) {
                (
                    document.getElementById(focusId) ||
                    $('#chooseTraining')
                )?.focus();
            }
        }
    }

    list.addEventListener('change', event => {
        const checkbox = event.target.closest('input[data-day]');

        if (!checkbox) return;

        const { day } = checkbox.dataset;
        const completed = checkbox.checked;

        save(plan => plan.map(item =>
            item.day === day
                ? { ...item, completed }
                : item
        ));
    });

    render();

    list.setAttribute('aria-busy', 'false');
    $('#profileContent').hidden = false;

    status();
}