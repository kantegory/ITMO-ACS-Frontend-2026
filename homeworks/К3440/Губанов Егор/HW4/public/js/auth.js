import { api, saveSession } from './api.js';
import { $, status, showError, returnPath } from './ui.js';

export function initAuth() {
    const form = $('#authForm');
    const register = document.body.dataset.page === 'register';
    const next = returnPath();

    const fields = [...form.querySelectorAll('input, select')];

    const descriptions = new Map(
        fields.map(field => [
            field,
            field.getAttribute('aria-describedby') || ''
        ])
    );

    let attempted = false;
    let busy = false;

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

        fields.forEach(field => {
            const invalid = attempted && !field.validity.valid;

            field.setAttribute('aria-invalid', String(invalid));

            const ids = [descriptions.get(field)];

            if (
                invalid &&
                document.getElementById(`${field.id}Error`)
            ) {
                ids.push(`${field.id}Error`);
            }

            const description = ids.filter(Boolean).join(' ');

            if (description) {
                field.setAttribute('aria-describedby', description);
            } else {
                field.removeAttribute('aria-describedby');
            }
        });
    }

    form.addEventListener('input', validate);

    form.addEventListener('submit', async event => {
        event.preventDefault();

        if (busy) return;

        attempted = true;
        validate();
        form.classList.add('was-validated');

        if (!form.checkValidity()) {
            status(
                'Проверь отмеченные поля.',
                true,
                '#formStatus'
            );

            form.querySelector(':invalid')?.focus();
            return;
        }

        const button = form.querySelector('[type="submit"]');

        busy = true;
        button.disabled = true;
        form.setAttribute('aria-busy', 'true');

        status('Отправляем данные…', false, '#formStatus');

        try {
            const body = {
                email: form.elements.email.value.trim().toLowerCase(),
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
                    'Разреши браузеру сохранять данные сайта и войди снова.'
                );
            }

            location.replace(next);
        } catch (error) {
            showError(error, '#formStatus');

            if (error.status !== 401) {
                $('#formStatus').focus();
            }
        } finally {
            busy = false;
            button.disabled = false;
            form.setAttribute('aria-busy', 'false');
        }
    });
}