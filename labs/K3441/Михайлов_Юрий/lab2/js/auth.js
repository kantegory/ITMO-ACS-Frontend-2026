function updateAuthNavigation() {
    const signedIn = Boolean(localStorage.getItem('spbRentToken'));
    document.querySelectorAll('[data-auth-link]').forEach((item) => item.classList.toggle('d-none', !signedIn));
    document.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach((item) => item.classList.toggle('d-none', signedIn));
    document.querySelectorAll('[data-logout]').forEach((item) => item.classList.toggle('d-none', !signedIn));
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

for (const button of document.querySelectorAll('[data-toggle-password]')) button.addEventListener('click', () => {
    const input = document.querySelector(button.dataset.togglePassword); input.type = input.type === 'password' ? 'text' : 'password'; button.textContent = input.type === 'password' ? 'Показать' : 'Скрыть';
});

updateAuthNavigation();
