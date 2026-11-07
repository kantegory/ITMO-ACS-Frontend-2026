// Шапка сайта: показываем кнопки гостя или пользователя
import { clearSession, getUser } from './api.js';

const user = getUser();

document.getElementById(user ? 'userActions' : 'guestActions').hidden = false;

if (user) {
  document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('logout').addEventListener('click', () => {
    clearSession();
    location.href = 'index.html';
  });
}
