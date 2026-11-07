const savedTheme = localStorage.getItem('spbRentTheme');
const initialTheme = savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = initialTheme;

function renderThemeButton() {
    const container = document.querySelector('.navbar .container');
    if (!container || document.querySelector('#themeToggle')) return;
    const button = document.createElement('button');
    button.id = 'themeToggle'; button.type = 'button'; button.className = 'btn btn-outline-secondary ms-3';
    button.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark'));
    button.setAttribute('aria-label', 'Переключить цветовую тему');
    button.innerHTML = '<svg class="theme-icon" aria-hidden="true"><use href="img/icons.svg#icon-moon"></use></svg><span class="visually-hidden">Переключить цветовую тему</span><span class="theme-label">Тёмная тема</span>';
    button.addEventListener('click', () => {
        const dark = document.documentElement.dataset.theme !== 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('spbRentTheme', dark ? 'dark' : 'light');
        button.setAttribute('aria-pressed', String(dark));
        button.querySelector('use').setAttribute('href', `img/icons.svg#icon-${dark ? 'sun' : 'moon'}`);
        button.querySelector('.theme-label').textContent = dark ? 'Светлая тема' : 'Тёмная тема';
    });
    container.appendChild(button);
}
renderThemeButton();
