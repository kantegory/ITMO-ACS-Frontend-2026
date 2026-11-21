import { api } from './api.js';

import {
    DAYS,
    TYPES,
    esc,
    status,
    showError
} from './ui.js';

export async function initProfile() {
    let [user, trainings] = await Promise.all([
        api.getCurrentUser(),
        api.getTrainings()
    ]);

    const byId = new Map(
        trainings.map(item => [item.id, item])
    );

    const list = document.querySelector('#planList');
    let saving = false;

    function render() {
        const plan = [...(user.plan || [])].sort(
            (a, b) => {
                return Object.keys(DAYS).indexOf(a.day) -
                    Object.keys(DAYS).indexOf(b.day);
            }
        );

        const done = plan.filter(
            item => item.completed
        ).length;

        const percent = plan.length
            ? Math.round(done / plan.length * 100)
            : 0;

        document.querySelector('#profileName').textContent =
            `Привет, ${user.name}!`;

        document.querySelector('#profileMeta').textContent =
            `${user.email} · Направление: ${TYPES[user.goal]}`;

        document.querySelector('#progressLabel').textContent =
            `Выполнено ${done} из ${plan.length}`;

        document.querySelector('#planProgress').style.width =
            `${percent}%`;

        document.querySelector('#progressTrack').setAttribute(
            'aria-valuenow',
            String(percent)
        );

        document.querySelector('#emptyPlan').hidden =
            plan.length !== 0;

        list.innerHTML = plan.map(item => {
            const training = byId.get(item.trainingId);

            if (!training) {
                return '';
            }

            return `
        <article class="brutal-card p-3">
          <p class="eyebrow">${DAYS[item.day]}</p>

          <h3 class="h4">
            ${esc(training.title)}
          </h3>

          <p>
            ${TYPES[training.type]}
            · ${training.minutes} мин
          </p>

          <label class="d-flex align-items-center gap-2 mb-3">
            <input
              class="form-check-input mt-0"
              type="checkbox"
              data-day="${item.day}"
              ${item.completed ? 'checked' : ''}
            >
            Занятие выполнено
          </label>

          <div class="d-flex gap-2 flex-wrap">
            <a
              class="btn btn-brutal btn-sage"
              href="session.html?id=${encodeURIComponent(training.id)}&day=${item.day}"
            >
              Начать
            </a>

            <button
              class="btn btn-brutal btn-paper"
              type="button"
              data-remove="${item.day}"
            >
              Убрать
            </button>
          </div>
        </article>
      `;
        }).join('');
    }

    async function save(update) {
        if (saving) {
            return;
        }

        saving = true;

        list.querySelectorAll(
            'input, button'
        ).forEach(control => {
            control.disabled = true;
        });

        status('Сохраняем план…');

        try {
            user = await api.updatePlan(update);
            status('План сохранён.');
        } catch (error) {
            showError(error);
        } finally {
            saving = false;
            render();
        }
    }

    list.addEventListener('change', event => {
        const checkbox = event.target.closest(
            'input[data-day]'
        );

        if (!checkbox) {
            return;
        }

        const { day } = checkbox.dataset;
        const completed = checkbox.checked;

        save(plan => {
            return plan.map(item => {
                return item.day === day
                    ? { ...item, completed }
                    : item;
            });
        });
    });

    list.addEventListener('click', event => {
        const button = event.target.closest(
            'button[data-remove]'
        );

        if (button) {
            save(plan => {
                return plan.filter(item => {
                    return item.day !== button.dataset.remove;
                });
            });
        }
    });

    render();

    document.querySelector('#profileContent').hidden = false;
    status();
}