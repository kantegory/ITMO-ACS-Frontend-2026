const loginLink = document.querySelector('a.nav-link[href="login.html"]');
if (loginLink && Auth.isLoggedIn()) {
  loginLink.textContent = 'Выйти';
  loginLink.setAttribute('href', '#');
  loginLink.addEventListener('click', (event) => {
    event.preventDefault();
    Auth.clear();
    location.href = 'index.html';
  });
}
