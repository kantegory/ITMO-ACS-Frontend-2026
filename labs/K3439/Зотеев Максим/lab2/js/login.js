// Вход пользователя
import { api, getToken, saveSession } from './api.js';
import { formData, hideAlert, showAlert } from './ui.js';
import './nav.js';

// Возвращаем только на страницы сайта, чтобы next нельзя было подменить внешней ссылкой
function nextPage() {
  const next = new URLSearchParams(location.search).get('next');
  return /^[\w-]+\.html(\?[\w=&-]*)?$/.test(next) ? next : 'profile.html';
}

if (getToken()) location.replace(nextPage());

const form = document.getElementById('loginForm');
const error = document.getElementById('formError');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert(error);

  const { email, password, remember } = formData(form);

  try {
    const session = await api('/login', { method: 'POST', body: { email, password } });
    saveSession(session, Boolean(remember));
    location.href = nextPage();
  } catch (requestError) {
    showAlert(error, requestError.message);
  }
});
