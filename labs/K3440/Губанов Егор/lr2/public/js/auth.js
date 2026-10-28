import {
    api,
    saveSession
} from './api.js';

import {
    $,
    status,
    showError,
    returnPath
} from './ui.js';

export function initAuth() {
    const form = $('#authForm');

    const register =
        document.body.dataset.page === 'register';

    const next = returnPath();

    $('#otherAuth').href =
        `${register ? 'login' : 'register'}.html` +
        `?next=${encodeURIComponent(next)}`;

    function validate() {
        if (register) {
            form.elements.name.setCustomValidity(
                form.elements.name.value.trim()
                    ? ''
                    : 'Укажи имя.'
            );

            form.elements.confirmPassword.setCustomValidity(
                form.elements.password.value ===
                form.elements.confirmPassword.value
                    ? ''
                    : 'Пароли должны совпадать.'
            );
        }
    }

    form.addEventListener('input', validate);

    form.addEventListener('submit', async event => {
        event.preventDefault();

        validate();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            return;
        }

        const button = form.querySelector(
            '[type="submit"]'
        );

        button.disabled = true;

        status(
            'Отправляем данные…',
            false,
            '#formStatus'
        );

        try {
            const body = {
                email: form.elements.email.value
                    .trim()
                    .toLowerCase(),
                password: form.elements.password.value
            };

            if (register) {
                Object.assign(body, {
                    name: form.elements.name.value.trim(),
                    goal: form.elements.goal.value
                });
            }

            const result = await api(
                register ? '/register' : '/login',
                {
                    method: 'POST',
                    body
                }
            );

            try {
                saveSession(result);
            } catch {
                throw new Error(
                    'Браузер не разрешил сохранить вход. Разреши локальное хранилище и войди снова.'
                );
            }

            location.replace(next);
        } catch (error) {
            showError(error, '#formStatus');
        } finally {
            button.disabled = false;
        }
    });
}