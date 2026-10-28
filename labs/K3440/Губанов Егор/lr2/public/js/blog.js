import { api } from './api.js';

import {
    $,
    esc,
    status,
    showError
} from './ui.js';

export async function initBlog() {
    let version = 0;
    let articleVersion = 0;

    const categories = {
        yoga: 'Йога',
        food: 'Питание',
        recovery: 'Восстановление'
    };

    async function load(category = '') {
        const current = ++version;

        status('Загружаем статьи…');

        try {
            const query = new URLSearchParams(
                category ? { category } : {}
            );

            const articles = await api(
                `/articles?${query}`
            );

            if (current !== version) {
                return;
            }

            $('#articleList').innerHTML =
                articles.map(article => {
                    return `
            <div class="col-12 col-md-6 col-xl-4">
              <article class="brutal-card h-100 p-4 d-flex flex-column">
                <p class="eyebrow">
                  ${esc(categories[article.category])}
                </p>

                <h2 class="h3">
                  ${esc(article.title)}
                </h2>

                <p>${esc(article.summary)}</p>

                <button
                  class="btn btn-brutal btn-lilac mt-auto"
                  type="button"
                  data-article="${esc(article.id)}"
                >
                  Читать статью
                </button>
              </article>
            </div>
          `;
                }).join('');

            status(
                articles.length
                    ? ''
                    : 'В этой категории пока нет статей.'
            );
        } catch (error) {
            if (current === version) {
                showError(error);
            }
        }
    }

    $('#blogFilters').addEventListener(
        'click',
        event => {
            const button = event.target.closest(
                'button[data-category]'
            );

            if (!button) {
                return;
            }

            $('#blogFilters')
                .querySelectorAll('button')
                .forEach(item => {
                    item.classList.toggle(
                        'active',
                        item === button
                    );

                    item.setAttribute(
                        'aria-pressed',
                        String(item === button)
                    );
                });

            load(button.dataset.category);
        }
    );

    $('#articleModal').addEventListener(
        'hidden.bs.modal',
        () => {
            articleVersion += 1;
        }
    );

    $('#articleList').addEventListener(
        'click',
        async event => {
            const button = event.target.closest(
                'button[data-article]'
            );

            if (!button) {
                return;
            }

            const current = ++articleVersion;

            $('#articleTitle').textContent =
                'Загружаем статью…';

            $('#articleBody').textContent = '';

            try {
                if (!globalThis.bootstrap) {
                    throw new Error(
                        'Не загрузился Bootstrap. Проверь интернет и обнови страницу.'
                    );
                }

                bootstrap.Modal
                    .getOrCreateInstance($('#articleModal'))
                    .show();

                const article = await api(
                    `/articles/${encodeURIComponent(button.dataset.article)}`
                );

                if (current !== articleVersion) {
                    return;
                }

                $('#articleTitle').textContent =
                    article.title;

                $('#articleBody').innerHTML =
                    article.sections.map(section => {
                        return `
              <h3 class="h5">
                ${esc(section.heading)}
              </h3>
              <p>${esc(section.text)}</p>
            `;
                    }).join('');
            } catch (error) {
                if (current === articleVersion) {
                    $('#articleTitle').textContent =
                        'Не удалось открыть статью';

                    $('#articleBody').textContent =
                        error.message;

                    showError(error);
                }
            }
        }
    );

    await load();
}