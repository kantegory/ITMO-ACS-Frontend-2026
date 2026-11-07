function updateAuthNavigation() {
    const signedIn = Boolean(localStorage.getItem('spbRentToken'));
    document.querySelectorAll('[data-auth-link]').forEach((item) => item.classList.toggle('d-none', !signedIn));
    document.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach((item) => item.classList.toggle('d-none', signedIn));
    document.querySelectorAll('[data-logout]').forEach((item) => item.classList.toggle('d-none', !signedIn));
}

function addNavIcon(link, symbol) {
    if (!link || link.querySelector('.nav-icon')) return;
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('nav-icon'); icon.setAttribute('viewBox', '0 0 24 24'); icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `img/icons.svg#icon-${symbol}`); icon.appendChild(use);
    link.prepend(icon);
}

function addNavigationIcons() {
    document.querySelectorAll('.navbar .brand').forEach((link) => addNavIcon(link, 'home'));
    document.querySelectorAll('.navbar a[href="search.html"], .navbar a[href="index.html"].nav-link').forEach((link) => addNavIcon(link, 'search'));
    document.querySelectorAll('.navbar a[href="account.html"], .navbar a[data-auth-link]').forEach((link) => addNavIcon(link, 'user'));
}

document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault(); localStorage.removeItem('spbRentToken'); localStorage.removeItem('spbRentUser'); window.location.href = 'index.html';
}));

document.querySelector('#registerForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const session = await api('/register', {method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target)))});
        localStorage.setItem('spbRentUser', JSON.stringify(session.user)); localStorage.setItem('spbRentToken', session.accessToken); location.href = 'account.html';
    } catch (error) { alert(`${error.message}. Проверьте, что JSON Server запущен.`); }
});

document.querySelector('#loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const session = await api('/login', {method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target)))});
        localStorage.setItem('spbRentUser', JSON.stringify(session.user)); localStorage.setItem('spbRentToken', session.accessToken); location.href = 'account.html';
    } catch { alert('Проверьте email и пароль'); }
});

for (const button of document.querySelectorAll('[data-toggle-password]')) {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
        const input = document.querySelector(button.dataset.togglePassword);
        input.type = input.type === 'password' ? 'text' : 'password';
        button.textContent = input.type === 'password' ? 'Показать' : 'Скрыть';
        button.setAttribute('aria-pressed', String(input.type === 'text'));
    });
}

updateAuthNavigation();
addNavigationIcons();
