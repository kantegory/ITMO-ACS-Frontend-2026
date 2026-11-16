
const currentPage = location.pathname.split('/').pop() || 'index.html';
const protectedPages = [
    'profile.html',
    'employer.html',
    'my-vacancies.html',
    'applications.html',
    'job-search.html',
    'candidate-search.html',
    'resume.html',
    'vacancy.html',
];
let currentUser;
const escapeHtml = (vacancy) =>
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
async function api(path, method = 'GET', body) {
    return localRequest(path, method, body);
}

function showMessage(text, type = 'danger') {
    let element = document.getElementById('message');
    if (!element) {
        element = document.createElement('div');
        element.id = 'message';
        document.querySelector('main').prepend(element);
    }
    element.className = 'alert alert-' + type;
    element.setAttribute('role', 'alert');
    element.textContent = text;
}
function render(html) {
    document.querySelector('main').innerHTML = `<div id="message" role="alert">
</div>${html}`;
}
function renderInput(name, label, vacancy = '', type = 'text') {
    return `<div class="mb-3">
<label class="form-label" for="${name}">${label}</label>
<input required class="form-control" id="${name}" name="${name}" type="${type}" value="${escapeHtml(vacancy)}" ${type === 'number' ? 'min="0"' : ''}>
</div>`;
}
function renderTextarea(name, label, vacancy = '') {
    return `<div class="mb-3">
<label class="form-label" for="${name}">${label}</label>
<textarea required class="form-control" id="${name}" name="${name}">${escapeHtml(vacancy)}</textarea>
</div>`;
}
function renderSelect(name, label, values) {
    return `<div class="mb-3">
<label for="${name}" class="form-label">${label}</label>
<select class="form-select" id="${name}" name="${name}">${values.map((vacancy) => `<option>${escapeHtml(vacancy)}</option>`).join('')}</select>
</div>`;
}
const industries = ['IT', 'Маркетинг', 'Управление'],
    experiences = ['Без опыта', 'От 1 года', 'От 3 лет'];
function bindForm(id, handler) {
    document.getElementById(id).addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = e.currentTarget.querySelector('[type=submit]');
        button.disabled = true;
        try {
            await handler(new FormData(e.currentTarget));
        } catch (error) {
            showMessage(error.message);
        } finally {
            button.disabled = false;
        }
    });
}
async function setupAuthForm() {
    const isRegistration = currentPage === 'register.html',
        id = isRegistration ? 'registerForm' : 'loginForm',
        form = document.getElementById(id);
    if (!form) return;
    form.password.minLength = 4;
    bindForm(id, async (formData) => {
        if (isRegistration && formData.get('password') !== formData.get('passwordConfirm'))
            throw Error('Пароли не совпадают.');
        const body = {
            email: formData.get('email').trim(),
            password: formData.get('password'),
        };
        if (isRegistration)
            Object.assign(body, {
                firstname: formData.get('firstName').trim(),
                lastname: formData.get('lastName').trim(),
                role: formData.get('role'),
            });
        const result = await api(isRegistration ? '/register' : '/login', 'POST', body);
        localStorage.setItem(SESSION_KEY, result.accessToken);
        localStorage.setItem('finderjobs-lab1-user', JSON.stringify(result.user));
        const next = new URLSearchParams(location.search).get('next');
        location.href =
            next && /^vacancy\.html\?id=[a-zA-Z0-9%_-]+$/.test(next)
                ? next
                : result.user.role === 'employer'
                  ? 'employer.html'
                  : 'profile.html';
    });
}
function renderVacancyCard(vacancy) {
    return `<div class="col-12 col-md-6 col-lg-4">
<article class="card h-100 p-4">
<h2 class="h4">${escapeHtml(vacancy.title)}</h2>
<p>${escapeHtml(vacancy.companyName)}</p>
<p>${Number(vacancy.salary).toLocaleString('ru-RU')} ₽</p>
<p>${escapeHtml(vacancy.industry)} · ${escapeHtml(vacancy.experience)}</p>
<a class="btn btn-outline-primary mt-auto" href="vacancy.html?id=${encodeURIComponent(vacancy.id)}">Подробнее</a>
</article>
</div>`;
}
async function renderVacancySearch() {
    render(`<h1>Поиск вакансий</h1>
<form id="search" class="card p-4 my-4">${renderInput('query', 'Название вакансии')}${renderSelect('industry', 'Отрасль', ['Все отрасли', ...industries])}${renderInput('salary', 'Минимальная зарплата', 0, 'number')}${renderSelect('experience', 'Опыт', ['Любой опыт', ...experiences])}<button type="submit" class="btn btn-primary">Найти</button>
</form>
<p id="count" role="status">
</p>
<div class="row g-3" id="results">
</div>`);
    document.getElementById('query').required = false;
    async function load(formData) {
        const params = new URLSearchParams({
            salary_gte: formData?.get('salary') || 0,
        });
        if (formData?.get('industry') && formData.get('industry') !== 'Все отрасли')
            params.set('industry', formData.get('industry'));
        if (formData?.get('experience') && formData.get('experience') !== 'Любой опыт')
            params.set('experience', formData.get('experience'));
        let [vacancies, companies] = await Promise.all([
            api('/vacancies?' + params),
            api('/companies'),
        ]);
        const searchText = formData?.get('query').trim().toLowerCase() || '';
        vacancies = vacancies.filter((vacancy) =>
            [
                vacancy.title,
                vacancy.description,
                vacancy.companyName,
                companies.find((company) => String(company.id) === String(vacancy.companyId))?.name,
                ...(vacancy.requirements || []),
            ]
                .join(' ')
                .toLowerCase()
                .includes(searchText),
        );
        document.getElementById('count').textContent = vacancies.length
            ? 'Найдено: ' + vacancies.length
            : 'Ничего не найдено.';
        document.getElementById('results').innerHTML = vacancies
            .map((vacancy) =>
                renderVacancyCard({
                    ...vacancy,
                    companyName:
                        vacancy.companyName ||
                        companies.find(
                            (company) => String(company.id) === String(vacancy.companyId),
                        )?.name,
                }),
            )
            .join('');
    }
    bindForm('search', load);
    document.getElementById('query').value = new URLSearchParams(location.search).get('q') || '';
    await load(new FormData(document.getElementById('search')));
}
async function renderVacancyDetails() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) throw Error('Откройте вакансию через поиск.');
    const vacancy = await api('/vacancies/' + encodeURIComponent(id)),
        companies = await api('/companies');
    render(`<article class="card p-4">
<h1>${escapeHtml(vacancy.title)}</h1>
<p>${escapeHtml(vacancy.companyName || companies.find((company) => String(company.id) === String(vacancy.companyId))?.name)}</p>
<p>${Number(vacancy.salary).toLocaleString('ru-RU')} ₽ · ${escapeHtml(vacancy.industry)} · ${escapeHtml(vacancy.experience)}</p>
<h2 class="h4">Описание</h2>
<p>${escapeHtml(vacancy.description)}</p>
<h2 class="h4">Требования</h2>
<ul>${(vacancy.requirements || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>${currentUser.role === 'candidate' ? '<button id="apply" class="btn btn-primary">Откликнуться</button>' : currentUser.role === 'employer' && String(vacancy.userId) === String(currentUser.id) ? '<a class="btn btn-primary" href="my-vacancies.html?edit=' + encodeURIComponent(vacancy.id) + '">Редактировать</a>' : ''}</article>`);
    document.getElementById('apply')?.addEventListener('click', async (e) => {
        e.target.disabled = true;
        try {
            await api('/applications', 'POST', {
                vacancyId: vacancy.id,
            });
            showMessage('Отклик отправлен.', 'success');
        } catch (error) {
            showMessage(error.message);
            e.target.disabled = false;
        }
    });
}
async function renderCandidateProfile() {
    const resumes = await api('/resumes'),
        resume = resumes[0] || {},
        applications = await api('/applications');
    const [vacancies, companies] = await Promise.all([api('/vacancies'), api('/companies')]);
    const applicationList = applications
        .map((application) => {
            const vacancy = vacancies.find((v) => String(v.id) === String(application.vacancyId));
            const company =
                vacancy?.companyName ||
                companies.find((c) => String(c.id) === String(vacancy?.companyId))?.name ||
                '';
            return `<article class="card p-3 mb-2">${vacancy ? `<a class="h5" href="vacancy.html?id=${encodeURIComponent(application.vacancyId)}">${escapeHtml(vacancy.title)}</a>` : '<h3 class="h5">Вакансия больше не доступна</h3>'}<p class="mb-1">${escapeHtml(company)}</p>
<p class="mb-0">Статус: ${escapeHtml(application.status)}</p>
</article>`;
        })
        .join('');
    render(`<h1>Личный кабинет</h1>
<p>${escapeHtml(currentUser.firstname)} ${escapeHtml(currentUser.lastname)} · ${escapeHtml(currentUser.email)}</p>
<section class="card p-4">
<h2>Моё резюме</h2>
<form id="resume">${renderInput('title', 'Желаемая должность', resume.title)}${renderInput('city', 'Город', resume.city)}${renderInput('salary', 'Желаемая зарплата', resume.salary || 0, 'number')}${renderTextarea('skills', 'Навыки', resume.skills)}${renderTextarea('education', 'Образование', resume.education)}${renderTextarea('experience', 'Опыт работы', resume.experience)}<button type="submit" class="btn btn-primary">Сохранить резюме</button>
</form>
</section>
<h2 class="mt-4">Мои отклики</h2>${applicationList}${applications.length ? '' : '<p>Откликов пока нет.</p>'}`);
    bindForm('resume', async (formData) => {
        const payload = Object.fromEntries(formData);
        payload.salary = Number(payload.salary);
        payload.candidateName = currentUser.firstname + ' ' + currentUser.lastname;
        await api(
            '/resumes' + (resume.id ? '/' + encodeURIComponent(resume.id) : ''),
            resume.id ? 'PUT' : 'POST',
            payload,
        );
        await renderCandidateProfile();
        showMessage('Резюме сохранено.', 'success');
    });
}
async function renderVacancyEditor() {
    const [vacancies, applications] = await Promise.all([
        api('/vacancies?userId=' + encodeURIComponent(currentUser.id)),
        api('/applications'),
    ]);
    render(`<h1>Кабинет работодателя</h1>
<p>${escapeHtml(currentUser.firstname)} ${escapeHtml(currentUser.lastname)}</p>
<section class="card p-4">
<h2>Добавить или изменить вакансию</h2>
<form id="editor">
<input name="id" type="hidden">${renderInput('title', 'Название')}${renderInput('companyName', 'Компания')}${renderInput('salary', 'Зарплата', 0, 'number')}${renderSelect('industry', 'Отрасль', industries)}${renderSelect('experience', 'Опыт', experiences)}${renderTextarea('description', 'Описание')}${renderTextarea('requirements', 'Требования (каждое с новой строки)')}<button type="submit" class="btn btn-primary">Сохранить вакансию</button> <button type="reset" class="btn btn-secondary">Очистить</button>
</form>
</section>
<div class="d-flex gap-2 mt-4">
<a class="btn btn-outline-primary" href="my-vacancies.html">Мои вакансии</a>
<a class="btn btn-outline-primary" href="applications.html">Отклики</a>
</div>`);
    bindForm('editor', async (formData) => {
        const payload = Object.fromEntries(formData),
            id = payload.id;
        delete payload.id;
        payload.salary = Number(payload.salary);
        payload.requirements = payload.requirements
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        await api(
            '/vacancies' + (id ? '/' + encodeURIComponent(id) : ''),
            id ? 'PUT' : 'POST',
            payload,
        );
        if (currentPage === 'my-vacancies.html') {
            history.replaceState(null, '', 'my-vacancies.html');
            await renderMyVacancies();
        } else {
            await renderVacancyEditor();
        }
        showMessage('Вакансия сохранена.', 'success');
    });
    const editId = new URLSearchParams(location.search).get('edit');
    if (editId) {
        const vacancy = vacancies.find((v) => String(v.id) === editId);
        if (vacancy) {
            const form = document.getElementById('editor');
            for (const fieldName of [
                'id',
                'title',
                'companyName',
                'salary',
                'industry',
                'experience',
                'description',
                'requirements',
            ])
                form.elements[fieldName].value = Array.isArray(vacancy[fieldName])
                    ? vacancy[fieldName].join('\n')
                    : (vacancy[fieldName] ?? '');
        }
    }
    document.querySelectorAll('[data-edit]').forEach(
        (button) =>
            (button.onclick = () => {
                const vacancy = vacancies.find((v) => String(v.id) === button.dataset.edit),
                    form = document.getElementById('editor');
                for (const fieldName of [
                    'id',
                    'title',
                    'companyName',
                    'salary',
                    'industry',
                    'experience',
                    'description',
                    'requirements',
                ])
                    form.elements[fieldName].value = Array.isArray(vacancy[fieldName])
                        ? vacancy[fieldName].join('\n')
                        : (vacancy[fieldName] ?? '');
                form.scrollIntoView({
                    behavior: 'smooth',
                });
            }),
    );
    document.querySelectorAll('[data-delete]').forEach(
        (button) =>
            (button.onclick = async () => {
                if (!confirm('Удалить вакансию?')) return;
                try {
                    await api('/vacancies/' + encodeURIComponent(button.dataset.delete), 'DELETE');
                    await renderVacancyEditor();
                    showMessage('Вакансия удалена.', 'success');
                } catch (error) {
                    showMessage(error.message);
                }
            }),
    );
}
function renderEmployerTabs() {
    return '<nav class="d-flex flex-wrap gap-2 mb-4" aria-label="Кабинет работодателя"><a class="btn btn-outline-primary" href="my-vacancies.html">Мои вакансии</a><a class="btn btn-outline-primary" href="applications.html">Отклики</a><a class="btn btn-primary" href="employer.html">Добавить вакансию</a></nav>';
}
async function renderMyVacancies() {
    if (new URLSearchParams(location.search).has('edit')) {
        await renderVacancyEditor();
        document.querySelector('main h1').textContent = 'Редактирование вакансии';
        return;
    }
    const vacancies = await api('/vacancies?userId=' + encodeURIComponent(currentUser.id));
    render(`${renderEmployerTabs()}<h1 class="mb-4">Мои вакансии</h1>
<div class="row g-3">${vacancies
        .map(
            (vacancy) => `<div class="col-12 col-md-6 col-lg-4">
<article class="card h-100 p-4">
<h2 class="h5">
<a href="vacancy.html?id=${encodeURIComponent(vacancy.id)}">${escapeHtml(vacancy.title)}</a>
</h2>
<p>${escapeHtml(vacancy.companyName || 'Компания')}</p>
<p>${Number(vacancy.salary).toLocaleString('ru-RU')} ₽ · ${escapeHtml(vacancy.experience)}</p>
<p class="small text-secondary">${escapeHtml(vacancy.industry)}</p>
<div class="d-flex flex-wrap gap-2 mt-auto">
<a class="btn btn-outline-primary" href="my-vacancies.html?edit=${encodeURIComponent(vacancy.id)}">Изменить</a>
<button class="btn btn-outline-danger" data-remove="${escapeHtml(vacancy.id)}">Удалить</button>
</div>
</article>
</div>`,
        )
        .join('')}</div>${vacancies.length ? '' : '<p>Вы ещё не разместили вакансии.</p>'}`);
    document.querySelectorAll('[data-remove]').forEach(
        (button) =>
            (button.onclick = async () => {
                if (!confirm('Удалить вакансию?')) return;
                try {
                    await api('/vacancies/' + encodeURIComponent(button.dataset.remove), 'DELETE');
                    await renderMyVacancies();
                    showMessage('Вакансия удалена.', 'success');
                } catch (e) {
                    showMessage(e.message);
                }
            }),
    );
}
async function renderApplications() {
    const [applications, vacancies, resumes] = await Promise.all([
        api('/applications'),
        api('/vacancies'),
        api('/resumes'),
    ]);
    render(
        `${renderEmployerTabs()}<h1 class="mb-4">Отклики на вакансии</h1>${applications
            .map((application) => {
                const vacancy = vacancies.find(
                    (v) => String(v.id) === String(application.vacancyId),
                );
                const response = resumes.find(
                    (r) => String(r.userId) === String(application.userId),
                );
                return `<article class="card p-4 mb-3">
<h2 class="h5">${vacancy ? `<a href="vacancy.html?id=${encodeURIComponent(vacancy.id)}">${escapeHtml(vacancy.title)}</a>` : 'Вакансия удалена'}</h2>
<p class="mb-2">Соискатель: ${response ? `<a href="resume.html?id=${encodeURIComponent(response.id)}">${escapeHtml(application.candidateName)}</a>` : escapeHtml(application.candidateName) + ' (резюме недоступно)'}</p>
<p class="mb-1">Статус: ${escapeHtml(application.status)}</p>
<p class="small text-secondary mb-0">${escapeHtml(new Date(application.createdAt).toLocaleDateString('ru-RU'))}</p>
</article>`;
            })
            .join('')}${applications.length ? '' : '<p>Откликов пока нет.</p>'}`,
    );
}
async function renderResumeDetails() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) throw Error('Выберите соискателя в списке.');
    const resume = await api('/resumes/' + encodeURIComponent(id));
    document.title = resume.candidateName + ' - резюме - FinderJobs';
    render(`<a class="d-inline-block mb-3" href="candidate-search.html">← Все соискатели</a>
<article class="card p-4">
<h1>${escapeHtml(resume.candidateName)}</h1>
<h2 class="h4">${escapeHtml(resume.title)}</h2>
<p>${escapeHtml(resume.city)}</p>
<p>
<strong>Желаемая зарплата:</strong> ${Number(resume.salary || 0).toLocaleString('ru-RU')} ₽</p>
<hr>
<h2 class="h5">Навыки</h2>
<p class="resume-text">${escapeHtml(resume.skills)}</p>
<h2 class="h5">Образование</h2>
<p class="resume-text">${escapeHtml(resume.education)}</p>
<h2 class="h5">Опыт работы</h2>
<p class="resume-text">${escapeHtml(resume.experience)}</p>
</article>`);
}
async function renderCandidateSearch() {
    const resumes = await api('/resumes');
    render(`<h1>Поиск сотрудников</h1>${renderInput('query', 'Должность или навык')}<div class="row g-3" id="results">
</div>`);
    const draw = () => {
        const searchText = document.getElementById('query').value.toLowerCase();
        document.getElementById('results').innerHTML =
            resumes
                .filter((response) =>
                    (response.title + ' ' + response.skills).toLowerCase().includes(searchText),
                )
                .map(
                    (response) => `<div class="col-12 col-md-6">
<article class="card p-4">
<h2 class="h4">
<a href="resume.html?id=${encodeURIComponent(response.id)}">${escapeHtml(response.candidateName)}</a>
</h2>
<p>${escapeHtml(response.title)} · ${escapeHtml(response.city)}</p>
<p>Навыки: ${escapeHtml(response.skills)}</p>
<p>Образование: ${escapeHtml(response.education)}</p>
<p>Опыт: ${escapeHtml(response.experience)}</p>
</article>
</div>`,
                )
                .join('') || '<p>Резюме не найдены.</p>';
    };
    document.getElementById('query').oninput = draw;
    draw();
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!protectedPages.includes(currentPage)) {
            await setupAuthForm();
            return;
        }
        if (currentPage === 'job-search.html' && !localStorage.getItem(SESSION_KEY)) {
            await renderVacancySearch();
            return;
        }
        if (!localStorage.getItem(SESSION_KEY)) {
            location.replace('login.html');
            return;
        }
        currentUser = await api('/me');
        if (
            ([
                'employer.html',
                'my-vacancies.html',
                'applications.html',
                'candidate-search.html',
                'resume.html',
            ].includes(currentPage) &&
                currentUser.role !== 'employer') ||
            (currentPage === 'profile.html' && currentUser.role !== 'candidate')
        ) {
            location.replace(currentUser.role === 'employer' ? 'employer.html' : 'profile.html');
            return;
        }
        await window.renderHeader();
        await {
            'profile.html': renderCandidateProfile,
            'employer.html': renderVacancyEditor,
            'my-vacancies.html': renderMyVacancies,
            'applications.html': renderApplications,
            'job-search.html': renderVacancySearch,
            'vacancy.html': renderVacancyDetails,
            'candidate-search.html': renderCandidateSearch,
            'resume.html': renderResumeDetails,
        }[currentPage]();
    } catch (error) {
        showMessage(error.message || 'Сервер недоступен. Запустите npm start.');
    }
});
