async function renderHeader() {
    let account = null;
    const token = localStorage.getItem(SESSION_KEY);
    if (token) {
        try {
            account = await localRequest('/me');
        } catch {}
    }
    const nav = document.querySelector('header nav');
    if (!nav) return;
    nav.className = 'navbar navbar-dark bg-dark';
    const cabinet = account?.role === 'employer' ? 'employer.html' : 'profile.html';
    nav.innerHTML = `<div class="container home-nav">
<a class="navbar-brand" href="index.html">FinderJobs</a>
<div class="center-menu">
<a href="job-search.html">Вакансии</a>${account?.role === 'employer' ? '<a href="candidate-search.html">Соискатели</a><a href="my-vacancies.html">Мои вакансии</a><a href="applications.html">Отклики</a>' : ''}</div>
<div id="accountNav" class="d-flex gap-2">${
        account
            ? `<a class="btn btn-outline-light" href="${cabinet}">Мой кабинет</a>
<button class="btn btn-primary" id="logout">Выйти</button>`
            : '<a class="btn btn-outline-light" href="login.html">Войти</a><a class="btn btn-primary" href="register.html">Регистрация</a>'
    }</div>
</div>`;
    document.getElementById('logout')?.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('finderjobs-lab1-user');
        location.href = 'index.html';
    });
}
window.renderHeader = renderHeader;
document.addEventListener('DOMContentLoaded', renderHeader);
