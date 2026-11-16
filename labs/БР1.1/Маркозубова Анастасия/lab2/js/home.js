const homeApi = 'http://127.0.0.1:3000';
const safe = (vacancy) =>
    String(vacancy ?? '').replace(
        /[&<>"']/g,
        (company) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[company],
    );
async function home() {
    let currentUser = null;
    const token = localStorage.getItem('accessToken');
    if (token) {
        try {
            const response = await fetch(homeApi + '/me', {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            });
            if (response.ok) currentUser = await response.json();
            else if (response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('currentUser');
            }
        } catch {}
    }
    const target = 'job-search.html';
    document.getElementById('findWork').href = target;
    document.getElementById('allJobs').href = target;
    document.getElementById('postJob').href = currentUser
        ? currentUser.role === 'employer'
            ? 'employer.html'
            : 'profile.html'
        : 'register.html';
    try {
        const headers = token
            ? {
                  Authorization: 'Bearer ' + token,
              }
            : {};
        const responses = await Promise.all([
            fetch(homeApi + '/vacancies', {
                headers,
            }),
            fetch(homeApi + '/companies', {
                headers,
            }),
        ]);
        if (responses.some((response) => !response.ok))
            throw Error('Не удалось загрузить вакансии.');
        const [vacancies, companies] = await Promise.all(
            responses.map((response) => response.json()),
        );
        document.getElementById('vacancyCount').textContent = vacancies.length;
        document.getElementById('homeVacancies').innerHTML =
            vacancies
                .slice(0, 9)
                .map((vacancy) => {
                    const company =
                        vacancy.companyName ||
                        companies.find((c) => String(c.id) === String(vacancy.companyId))?.name ||
                        'Компания';
                    const link = currentUser
                        ? 'vacancy.html?id=' + encodeURIComponent(vacancy.id)
                        : 'login.html?next=' + encodeURIComponent('vacancy.html?id=' + vacancy.id);
                    return `<div class="col-12 col-md-6 col-lg-4">
<article class="card vacancy-preview h-100">
<h3 class="h5">${safe(vacancy.title)}</h3>
<p class="small text-secondary">${safe(company)}</p>
<strong class="salary">от ${Number(vacancy.salary).toLocaleString('ru-RU')} ₽</strong>
<p class="small text-secondary my-2">${safe(vacancy.industry)} · ${safe(vacancy.experience)}</p>
<p class="vacancy-description">${safe(vacancy.description)}</p>
<a class="btn btn-outline-primary mt-auto" href="${link}">Подробнее</a>
</article>
</div>`;
                })
                .join('') || '<p>Вакансий пока нет.</p>';
    } catch (e) {
        document.getElementById('vacancyCount').textContent = '—';
        document.getElementById('homeVacancies').innerHTML =
            `<p role="alert">${safe(e.message)} Перезапустите сервер.</p>`;
    }
}
home();
