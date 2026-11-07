// Регистрация пользователя
import { api, getToken, saveSession } from './api.js';
import { formData, hideAlert, showAlert } from './ui.js';
import './nav.js';

if (getToken()) location.replace('profile.html');

const form = document.getElementById('registerForm');
const error = document.getElementById('formError');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideAlert(error);

  const { agree, ...fields } = formData(form);
  const body = { ...fields, since: new Date().getFullYear(), notify: true };

  try {
    saveSession(await api('/register', { method: 'POST', body }));
    location.href = 'profile.html';
  } catch (requestError) {
    showAlert(error, requestError.message);
  }
});
