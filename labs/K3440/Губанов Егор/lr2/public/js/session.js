import { api } from './api.js';

import {
    DAYS,
    esc,
    status,
    showError,
    getTrainingId
} from './ui.js';

export async function initSession() {
    const [user, training] = await Promise.all([
        api.getCurrentUser(),
        api.getTraining(getTrainingId())
    ]);

    const steps = training.steps;

    const day = new URLSearchParams(
        location.search
    ).get('day');

    const canSave =
        Object.hasOwn(DAYS, day) &&
        user.plan.some(item =>
            item.day === day &&
            item.trainingId === training.id
        );

    let index = 0;
    let remaining = steps[0].seconds;
    let interval = null;
    let deadline = 0;
    let finished = false;

    document.querySelector('#sessionTitle').textContent =
        training.title;

    document.querySelector('#sessionDetails').href =
        `training.html?id=${encodeURIComponent(training.id)}`;

    document.querySelector('#sessionSteps').innerHTML =
        steps.map(step => {
            return `<li>${esc(step.title)}</li>`;
        }).join('');

    document.querySelector('#participants').innerHTML = [
        `${user.name} (ты)`,
        ...training.participants
    ].map(name => {
        return `
      <li>
        <span class="avatar" aria-hidden="true">
          ${esc(name[0])}
        </span>
        ${esc(name)}
      </li>
    `;
    }).join('');

    function stop() {
        clearInterval(interval);
        interval = null;
    }

    function time() {
        const minutes = String(
            Math.floor(remaining / 60)
        ).padStart(2, '0');

        const seconds = String(
            remaining % 60
        ).padStart(2, '0');

        document.querySelector('#timer').textContent =
            `${minutes}:${seconds}`;
    }

    function render() {
        time();

        document.querySelector('#currentMove').textContent = finished
            ? 'Занятие завершено!'
            : steps[index].title;

        document.querySelector('#sessionSteps')
            .querySelectorAll('li')
            .forEach((item, position) => {
                const current =
                    !finished && position === index;

                item.classList.toggle(
                    'current-step',
                    current
                );

                if (current) {
                    item.setAttribute('aria-current', 'step');
                } else {
                    item.removeAttribute('aria-current');
                }
            });

        document.querySelector('#nextMove').disabled = finished;

        document.querySelector('#nextMove').textContent =
            index === steps.length - 1
                ? 'Завершить'
                : 'Следующий этап';
    }

    function next() {
        const resume = interval !== null;

        stop();

        if (index === steps.length - 1) {
            finished = true;
            remaining = 0;

            document.querySelector('#timerToggle').textContent =
                'Начать заново';

            document.querySelector('#saveResult').hidden = !canSave;
        } else {
            index += 1;
            remaining = steps[index].seconds;

            document.querySelector('#timerToggle').textContent =
                'Начать';
        }

        render();

        if (resume && !finished) {
            start();
        }
    }

    function start() {
        deadline = Date.now() + remaining * 1000;

        document.querySelector('#timerToggle').textContent = 'Пауза';

        interval = setInterval(() => {
            remaining = Math.max(
                0,
                Math.ceil((deadline - Date.now()) / 1000)
            );

            time();

            if (!remaining) {
                next();
            }
        }, 250);
    }

    document.querySelector('#timerToggle').addEventListener(
        'click',
        () => {
            if (interval !== null) {
                remaining = Math.max(
                    0,
                    Math.ceil((deadline - Date.now()) / 1000)
                );

                stop();
                time();

                document.querySelector('#timerToggle').textContent =
                    'Продолжить';

                return;
            }

            if (finished) {
                index = 0;
                remaining = steps[0].seconds;
                finished = false;

                document.querySelector('#saveResult').hidden = true;
                document.querySelector('#saveResult').disabled = false;

                status('', false, '#resultStatus');
                render();
            }

            start();
        }
    );

    document.querySelector('#nextMove').addEventListener(
        'click',
        next
    );

    document.querySelector('#saveResult').addEventListener(
        'click',
        async event => {
            const button = event.currentTarget;

            button.disabled = true;

            try {
                await api.updatePlan(plan => {
                    if (!plan.some(item =>
                        item.day === day &&
                        item.trainingId === training.id
                    )) {
                        throw new Error(
                            'Это занятие уже убрали из плана. Открой личный кабинет.'
                        );
                    }

                    return plan.map(item => {
                        return item.day === day
                            ? { ...item, completed: true }
                            : item;
                    });
                });

                status(
                    'Занятие отмечено в твоём плане.',
                    false,
                    '#resultStatus'
                );
            } catch (error) {
                showError(error, '#resultStatus');
                button.disabled = false;
            }
        }
    );

    window.addEventListener('pagehide', stop);

    render();

    document.querySelector('#sessionContent').hidden = false;
    status();
}